
import jwt from "jsonwebtoken";
import Author from "../models/Author.js";

const generateToken = (author) =>
  jwt.sign(
    { id: author._id.toString(), role: author.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Author.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Public registration must never grant admin privileges.
    const author = await Author.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "author",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: generateToken(author),
      user: {
        id: author._id,
        name: author.name,
        email: author.email,
        role: author.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to register right now",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const author = await Author.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!author || !(await author.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(author),
      user: {
        id: author._id,
        name: author.name,
        email: author.email,
        role: author.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to log in right now",
    });
  }
};
