
import "dotenv/config";
import fs from "node:fs";
import mongoose from "mongoose";

import { connectDB } from "./src/config/db.js";
import Author from "./src/models/Author.js";
import Book from "./src/models/Book.js";

const DEMO_PASSWORD = "BookLeafDemo@2026";

const statusMap = {
  "Published & Live": "Published & Live",
  "In Production - Cover Design": "In Production - Cover Design",
  "In Production - Typesetting": "In Production - Typesetting",
};

const seedData = async () => {
  try {
    const rawData = fs.readFileSync(
      "./bookleaf_sample_data.json",
      "utf8"
    );

    const data = JSON.parse(rawData);

    if (!Array.isArray(data.authors)) {
      throw new Error("Dataset must contain an authors array");
    }

    const expectedBooks = data.authors.reduce(
      (total, author) => total + (author.books?.length || 0),
      0
    );

    console.log(
      `Importing ${data.authors.length} authors and ${expectedBooks} books...`
    );

    await connectDB();

    let authorsCreated = 0;
    let booksCreated = 0;

    for (const sourceAuthor of data.authors) {
      let author = await Author.findOne({
        email: sourceAuthor.email.toLowerCase(),
      });

      if (!author) {
        author = new Author({
          name: sourceAuthor.name,
          email: sourceAuthor.email,
          password: DEMO_PASSWORD,
          role: "author",
          phone: sourceAuthor.phone || "",
          city: sourceAuthor.city || "",
          joinedDate: sourceAuthor.joined_date
            ? new Date(sourceAuthor.joined_date)
            : undefined,
        });

        await author.save();
        authorsCreated++;
      } else {
        author.name = sourceAuthor.name;
        author.phone = sourceAuthor.phone || "";
        author.city = sourceAuthor.city || "";
        author.joinedDate = sourceAuthor.joined_date
          ? new Date(sourceAuthor.joined_date)
          : undefined;

        // Preserve existing password and role.
        await author.save();
      }

      for (const sourceBook of sourceAuthor.books || []) {
        const bookData = {
          bookId: sourceBook.book_id,
          author: author._id,
          title: sourceBook.title,
          isbn: sourceBook.isbn || "",
          genre: sourceBook.genre || "",
          publicationDate: sourceBook.publication_date
            ? new Date(sourceBook.publication_date)
            : null,
          status:
            statusMap[sourceBook.status] || sourceBook.status,
          mrp: sourceBook.mrp,
          copiesSold: sourceBook.total_copies_sold ?? 0,
          royalties: sourceBook.total_royalty_earned ?? 0,
          authorRoyaltyPerCopy:
            sourceBook.author_royalty_per_copy ?? null,
          royaltyPaid: sourceBook.royalty_paid ?? 0,
          royaltyPending: sourceBook.royalty_pending ?? 0,
          lastRoyaltyPayoutDate:
            sourceBook.last_royalty_payout_date
              ? new Date(sourceBook.last_royalty_payout_date)
              : null,
          printPartner: sourceBook.print_partner ?? null,
          availableOn: sourceBook.available_on ?? [],
        };

        const result = await Book.updateOne(
          { bookId: sourceBook.book_id },
          { $set: bookData },
          { upsert: true, runValidators: true }
        );

        if (result.upsertedCount > 0) {
          booksCreated++;
        }
      }
    }

    console.log("Dataset import completed.");
    console.log(`New authors created: ${authorsCreated}`);
    console.log(`New books created: ${booksCreated}`);
    console.log(`Authors in dataset: ${data.authors.length}`);
    console.log(`Books in dataset: ${expectedBooks}`);
  } catch (error) {
    console.error("Dataset import failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
