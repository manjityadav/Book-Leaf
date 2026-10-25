
import Book from "../models/Book.js";

export const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({
      author: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Get books error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
    });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch book",
    });
  }
};
