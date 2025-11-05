import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  requestedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired'],
    default: 'pending'
  },
  message: String,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  respondedAt: Date,
  responseMessage: String
}, {
  timestamps: true
});

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

export default SwapRequest;
