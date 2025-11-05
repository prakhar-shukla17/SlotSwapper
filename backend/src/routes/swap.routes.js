import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createSwapRequest,
  getSentSwapRequests,
  getReceivedSwapRequests,
  getSwapRequest,
  respondToSwapRequest,
  cancelSwapRequest,
  getSwappableSlots,
  
} from '../controllers/swap.controller.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);



// Get all swappable slots from other users
router.get('/swappable-slots', getSwappableSlots);

// Create a new swap request
router.post('/', createSwapRequest);

// Get all sent swap requests for the logged-in user
router.get('/sent', getSentSwapRequests);

// Get all received swap requests for the logged-in user
router.get('/received', getReceivedSwapRequests);

// Get a specific swap request by ID
router.get('/:id', getSwapRequest);

// Respond to a swap request (accept/reject)
router.patch('/:requestId/respond', respondToSwapRequest);

// Cancel a swap request (only requester can cancel)
router.delete('/:id', cancelSwapRequest);

export default router;
