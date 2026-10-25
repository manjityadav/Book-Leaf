
import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { connectDB } from "./src/config/db.js";
import Author from "./src/models/Author.js";
import Ticket from "./src/models/Ticket.js";

import authRoutes from "./src/routes/authRoutes.js";
import { protect } from "./src/middleware/Auth.js";
import bookRoutes from "./src/routes/bookRoutes.js";
import ticketRoutes from "./src/routes/tikcetRoutes.js";
import replyRoutes from "./src/routes/replyRoutes.js";
import adminTicketRoutes from "./src/routes/adminTicketRoutes.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BookLeaf Support API is running",
  });
});

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tickets", replyRoutes);
app.use("/api/admin/tickets", adminTicketRoutes);

app.get("/api/auth/me", protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"],
  },
});

app.set("io", io);

// Authenticate every Socket.IO connection using JWT.
io.use(async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    if (typeof token !== "string" || !token.trim()) {
      return next(new Error("Authentication required"));
    }

    // Also accept a token prefixed with "Bearer ".
    token = token.replace(/^Bearer\s+/i, "").trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !mongoose.isValidObjectId(decoded.id)) {
      return next(new Error("Invalid authentication token"));
    }

    // Load the current account and role from the database.
    const user = await Author.findById(decoded.id);

    if (!user) {
      return next(new Error("User account not found"));
    }

    socket.data.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    next(new Error("Invalid or expired authentication token"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;

  console.log(`Authenticated socket connected: ${socket.id}`);

  // Admins receive admin-room events.
  if (user.role === "admin") {
    socket.join("admins");
  }

  io.on("connection", (socket) => {
  const user = socket.data.user;

  console.log(`Authenticated socket connected: ${socket.id}`);

  // Admins receive admin-room events.
  if (user.role === "admin") {
    socket.join("admins");
  }

  // Join a ticket room only after checking access.
  socket.on("ticket:join", async (ticketId, callback) => {
    const respond =
      typeof callback === "function" ? callback : () => {};

    try {
      if (
        typeof ticketId !== "string" ||
        !mongoose.isValidObjectId(ticketId)
      ) {
        return respond({
          success: false,
          message: "Invalid ticket ID",
        });
      }

      const ticket = await Ticket.findById(ticketId).select("author");

      if (!ticket) {
        return respond({
          success: false,
          message: "Ticket not found",
        });
      }

      const isAdmin = user.role === "admin";
      const isOwner = ticket.author.toString() === user.id;

      if (!isAdmin && !isOwner) {
        return respond({
          success: false,
          message: "You cannot access this ticket",
        });
      }

      socket.join(`ticket:${ticketId}`);

      return respond({
        success: true,
        message: "Joined ticket room",
      });
    } catch (error) {
      console.error("Ticket room join failed:", error.message);

      return respond({
        success: false,
        message: "Unable to join ticket room",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});


  // Join a ticket room only after checking access.
  socket.on("ticket:join", async (ticketId, callback) => {
    const respond =
      typeof callback === "function" ? callback : () => {};

    try {
      if (
        typeof ticketId !== "string" ||
        !mongoose.isValidObjectId(ticketId)
      ) {
        return respond({
          success: false,
          message: "Invalid ticket ID",
        });
      }

      const ticket = await Ticket.findById(ticketId).select("author");

      if (!ticket) {
        return respond({
          success: false,
          message: "Ticket not found",
        });
      }

      const isAdmin = user.role === "admin";
      const isOwner = ticket.author.toString() === user.id;

      if (!isAdmin && !isOwner) {
        return respond({
          success: false,
          message: "You cannot access this ticket",
        });
      }

      socket.join(`ticket:${ticketId}`);

      return respond({
        success: true,
        message: "Joined ticket room",
      });
    } catch (error) {
      console.error("Ticket room join failed:", error.message);

      return respond({
        success: false,
        message: "Unable to join ticket room",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
