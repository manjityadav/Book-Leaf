
import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import TicketReply from "../models/TicketReply.js";

export const addReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    if (message.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Reply cannot exceed 5000 characters",
      });
    }

    if (!mongoose.isValidObjectId(req.params.ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Authors can reply only to their own tickets.
    if (
      req.user.role !== "admin" &&
      ticket.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot reply to this ticket",
      });
    }

    const reply = await TicketReply.create({
      ticket: ticket._id,
      sender: req.user._id,
      message: message.trim(),
      isPrivate: false,
    });

    if (
      req.user.role !== "admin" &&
      ticket.status === "Waiting for Author"
    ) {
      ticket.status = "Open";
      await ticket.save();
    }

    // Notify clients in this ticket's room.
    const io = req.app.get("io");

    if (io) {
      io.to(`ticket:${ticket._id}`).emit("ticket:replied", {
        ticketId: ticket._id,
        reply: {
          _id: reply._id,
          sender: req.user._id,
          message: reply.message,
          createdAt: reply.createdAt,
        },
        status: ticket.status,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Reply added successfully",
      reply,
    });
  } catch (error) {
    console.error("Add reply error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add reply",
    });
  }
};

export const getReplies = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      ticket.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot view this ticket",
      });
    }

    // Private replies must never be visible to authors.
    const filter = {
      ticket: ticket._id,
      ...(req.user.role === "admin" ? {} : { isPrivate: false }),
    };

    const replies = await TicketReply.find(filter)
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: replies.length,
      replies,
    });
  } catch (error) {
    console.error("Get replies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch replies",
    });
  }
};
