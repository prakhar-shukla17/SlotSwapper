import Event from '../models/Event.js';
import AppError from '../utils/appError.js';
import { getIO } from '../socket.js';

//  validate time format and order
const validateEventTimes = (startTime, endTime) => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
    throw new AppError('End time must be after start time', 400);
  }
};

//  overlapping events
const checkForOverlaps = async (userId, date, startTime, endTime, excludeId = null) => {
  const query = {
    user: userId,
    date: new Date(date),
    $or: [
      // New event starts during an existing event
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      // New event ends during an existing event
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      // New event completely contains an existing event
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await Event.findOne(query);
};

export const createEvent = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      date, 
      startTime, 
      endTime, 
      status = 'busy',
      location, 
      isRecurring = false, 
      recurringPattern = null 
    } = req.body;

    // Validate required fields
    if (!title || !date || !startTime || !endTime) {
      return next(new AppError('Title, date, start time, and end time are required', 400));
    }

    // Validate time format and order
    validateEventTimes(startTime, endTime);

    // Check for overlapping events
    const overlappingEvent = await checkForOverlaps(
      req.user.id, 
      date, 
      startTime, 
      endTime
    );

    if (overlappingEvent) {
      return next(new AppError('You already have an event scheduled during this time', 400));
    }
    
    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      status,
      user: req.user.id,
      location,
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : null
    });

    getIO().emit('events:created', {
      event,
      userId: req.user.id,
    });

    res.status(201).json({
      message: 'Event created successfully',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = { user: req.user.id };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const events = await Event.find(query).sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      message: 'Events retrieved successfully',
      results: events.length,
      data: {
        events
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }

    res.status(200).json({
      message: 'Event retrieved successfully',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      date, 
      startTime, 
      endTime, 
      status, 
      location, 
      isRecurring, 
      recurringPattern 
    } = req.body;

    // Find the event first
    const event = await Event.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }

    // If updating times, validate them
    if (startTime || endTime) {
      const newStartTime = startTime || event.startTime;
      const newEndTime = endTime || event.endTime;
      validateEventTimes(newStartTime, newEndTime);

      // Check for overlapping events (excluding current event)
      const overlappingEvent = await checkForOverlaps(
        req.user.id,
        date || event.date,
        newStartTime,
        newEndTime,
        event._id
      );

      if (overlappingEvent) {
        return next(new AppError('You already have an event scheduled during this time', 400));
      }
    }

    // Update event fields
    event.title = title !== undefined ? title : event.title;
    event.description = description !== undefined ? description : event.description;
    event.date = date ? new Date(date) : event.date;
    event.startTime = startTime || event.startTime;
    event.endTime = endTime || event.endTime;
    event.status = status || event.status;
    event.location = location !== undefined ? location : event.location;
    
    if (isRecurring !== undefined) {
      event.isRecurring = isRecurring;
      event.recurringPattern = isRecurring ? (recurringPattern || event.recurringPattern) : null;
    }

    await event.save();

    getIO().emit('events:updated', {
      event,
      userId: req.user.id,
    });

    res.status(200).json({
      message: 'Event updated successfully',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }

    getIO().emit('events:deleted', {
      eventId: event._id,
      userId: req.user.id,
    });

    res.status(204).json({
      message: 'Event deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};



export const updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!event) {
      return next(new AppError('No event found with that ID or you are not authorized', 404));
    }

    // Validate the status
    if (!['busy', 'swappable', 'swap_pending'].includes(status)) {
      return next(new AppError('Invalid status. Must be one of: busy, swappable, swap_pending', 400));
    }

    // Update the status
    event.status = status;
    await event.save();

    getIO().emit('events:statusChanged', {
      event,
      userId: req.user.id,
    });

    res.status(200).json({
      status: 'success',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};
