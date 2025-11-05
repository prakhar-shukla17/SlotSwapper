import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: String,  // Format: "HH:MM" (24-hour format)
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/  // Validates HH:MM format
  },
  endTime: {
    type: String,  // Format: "HH:MM" (24-hour format)
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/  // Validates HH:MM format
  },
  status: {
    type: String,
    enum: ['busy', 'swappable', 'swap_pending'],
    default: 'busy'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: String,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    default: null
  }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
