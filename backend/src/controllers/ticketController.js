import Ticket from "../models/Ticket.js";
import { classifyTicket } from "../services/aiService.js";


export const createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    if (
      subject.trim().length > 200 ||
      description.trim().length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject or description exceeds the allowed length",
      });
    }

    const aiResult = await classifyTicket(
      subject.trim(),
      description.trim()
    );

    const ticket = await Ticket.create({
      author: req.user._id,
      subject: subject.trim(),
      description: description.trim(),
      category: aiResult.category,
      priority: aiResult.priority,
      aiReasoning: aiResult.reasoning,
    });

    // Notify admins only.
    const io = req.app.get("io");

    if (io) {
      io.to("admins").emit("ticket:created", {
        ticketId: ticket._id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        author: ticket.author,
        createdAt: ticket.createdAt,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Support ticket created",
      ticket,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create support ticket",
    });
  }
};


export const getMyTickets = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = { author: req.user._id };

    if (status) filter.status = status;
    if (category) filter.category = category;

    const tickets = await Ticket.find(filter).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
};
