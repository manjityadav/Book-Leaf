
import { Router } from "express";
import { protect, adminOnly } from "../middleware/Auth.js";
import {
  getAllTickets,
  updateTicket,
  addPrivateNote,
  generateTicketDraft
} from "../controllers/adminTicketController.js";


const router = Router();

router.use(protect, adminOnly);

router.get("/", getAllTickets);
router.patch("/:ticketId", updateTicket);
router.post("/:ticketId/notes", addPrivateNote);
router.post("/:ticketId/draft", generateTicketDraft);


export default router;
