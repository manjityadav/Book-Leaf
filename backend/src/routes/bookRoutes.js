
import { Router } from "express";
import { protect } from "../middleware/Auth.js";
import {
  getMyBooks,
  getBookById,
} from "../controllers/bookController.js";

const router = Router();

router.use(protect);

router.get("/", getMyBooks);
router.get("/:id", getBookById);

export default router;
