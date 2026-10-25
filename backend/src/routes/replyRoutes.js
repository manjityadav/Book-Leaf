
import { Router } from "express";
import { protect } from "../middleware/Auth.js";
import {
  addReply,
  getReplies,
} from "../controllers/replyController.js";

const router = Router();

router.use(protect);

router.post("/:ticketId/replies", addReply);
router.get("/:ticketId/replies", getReplies);

export default router;
