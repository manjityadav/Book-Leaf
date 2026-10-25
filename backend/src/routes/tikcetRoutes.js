
import { Router } from "express";
import { protect } from "../middleware/Auth.js";
import {
  createTicket,
  getMyTickets,
} from "../controllers/ticketController.js";

const router = Router();

router.use(protect);

router.post("/", createTicket);
router.get("/", getMyTickets);

export default router;
