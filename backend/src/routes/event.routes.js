import express from 'express';
import { 
  createEvent, 
  getEvents, 
  getEvent, 
  updateEvent, 
  deleteEvent,
  updateEventStatus
} from '../controllers/event.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes for event management
router.route('/')
  .post(createEvent)
  .get(getEvents);


router.route('/:id')
  .get(getEvent)
  .patch(updateEvent)
  .delete(deleteEvent);


router.patch('/:id/status', updateEventStatus);
export default router;
