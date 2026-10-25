
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: String,
    genre: String,
    publicationDate: Date,
    status: {
      type: String,
      enum: [
        "draft",
        "in-production",
        "published",
        "on-hold",
        "Published & Live",
        "In Production - Cover Design",
        "In Production - Typesetting",
      ],
      default: "draft",
    },
    mrp: {
      type: Number,
      min: 0,
      default: 0,
    },
    copiesSold: {
      type: Number,
      min: 0,
      default: 0,
    },
    royalties: {
      type: Number,
      min: 0,
      default: 0,
    },
    authorRoyaltyPerCopy: {
      type: Number,
      min: 0,
      default: null,
    },
    royaltyPaid: {
      type: Number,
      min: 0,
      default: 0,
    },
    royaltyPending: {
      type: Number,
      min: 0,
      default: 0,
    },
    lastRoyaltyPayoutDate: {
      type: Date,
      default: null,
    },
    printPartner: {
      type: String,
      default: null,
    },
    availableOn: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
