
import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import { draftTicketResponse } from "../services/responseService.js";

const categories = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const priorities = ["Critical", "High", "Medium", "Low"];

const statuses = [
  "Open",
  "In Progress",
  "Waiting for Author",
  "Resolved",
  "Closed",
];

export const getAllTickets = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const filter = {};

    if (status) {
      if (!statuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
      filter.status = status;
    }

    if (category) {
      if (!categories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
      filter.category = category;
    }

    if (priority) {
      if (!priorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority",
        });
      }
      filter.priority = priority;
    }

    if (search?.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { subject: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(filter)
      .populate("author", "name email")
      .populate("assignedTo", "name email")
      .sort({ updatedAt: -1 })
      .limit(200);

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Admin ticket list error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
};



export const updateTicket = async (req, res) => {
  try {
    const { status, priority, category, assignedTo } = req.body;

    if (!mongoose.isValidObjectId(req.params.ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const updates = {};

    if (status !== undefined) {
      if (!statuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
      updates.status = status;
    }

    if (priority !== undefined) {
      if (!priorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority",
        });
      }
      updates.priority = priority;
    }

    if (category !== undefined) {
      if (!categories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
      updates.category = category;
    }

    if (assignedTo !== undefined) {
      if (
        assignedTo !== null &&
        !mongoose.isValidObjectId(assignedTo)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid assignee ID",
        });
      }

      if (assignedTo !== null) {
        const Author = (await import("../models/Author.js")).default;

        const assignee = await Author.findOne({
          _id: assignedTo,
          role: "admin",
        });

        if (!assignee) {
          return res.status(400).json({
            success: false,
            message: "Assignee must be an admin account",
          });
        }
      }

      updates.assignedTo = assignedTo;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid field to update",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    )
      .populate("author", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Notify only admins and this ticket's author.
    const io = req.app.get("io");

    if (io) {
      const eventData = {
        ticketId: ticket._id,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        assignedTo: ticket.assignedTo?._id ?? null,
        updatedAt: ticket.updatedAt,
      };

      io.to("admins").emit("ticket:updated", eventData);

      io.to(`author:${ticket.author._id}`).emit(
        "ticket:updated",
        eventData
      );
    }

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    console.error("Admin ticket update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update ticket",
    });
  }
};




export const addPrivateNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    if (content.trim().length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Note cannot exceed 3000 characters",
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

    ticket.privateNotes.push({
      author: req.user._id,
      content: content.trim(),
    });

    await ticket.save();

    return res.status(201).json({
      success: true,
      message: "Private note added",
      note: ticket.privateNotes[ticket.privateNotes.length - 1],
    });
  } catch (error) {
    console.error("Add private note error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add private note",
    });
  }
};


export const generateTicketDraft = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const result = await draftTicketResponse({
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
    });

    if (!result.success) {
      return res.status(503).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "AI response draft generated",
      draft: result.draft,
    });
  } catch (error) {
    console.error("Generate ticket draft error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate ticket draft",
    });
  }
};
