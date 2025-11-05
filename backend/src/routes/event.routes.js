import express from 'express';
import { 
  createEvent, 
  getEvents, 
  getEvent, 
  updateEvent, 
  deleteEvent,
  getEventsByStatus
} from '../controllers/event.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes for event management
router.route('/')
  .post(createEvent)
  .get(getEvents);

router.route('/status/:status')
  .get(getEventsByStatus);

router.route('/:id')
  .get(getEvent)
  .patch(updateEvent)
  .delete(deleteEvent);

export default router;
