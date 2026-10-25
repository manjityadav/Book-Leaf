
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Author from "./src/models/Author.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: node makeAdmin.js your-email@example.com");
  process.exitCode = 1;
} else {
  try {
    await connectDB();

    const result = await Author.updateOne(
      { email },
      { $set: { role: "admin" } }
    );

    if (result.matchedCount === 0) {
      console.log("No account found with that email.");
    } else {
      console.log(`Admin access granted to ${email}`);
    }
  } catch (error) {
    console.error("Failed to grant admin access:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
