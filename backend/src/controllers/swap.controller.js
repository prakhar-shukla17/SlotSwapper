import SwapRequest from '../models/SwapRequest.js';
import Event from '../models/Event.js';
import AppError from '../utils/AppError.js';
import mongoose from 'mongoose';
import { getIO } from '../socket.js';





// Get all swappable slots from other users
export const getSwappableSlots = async (req, res, next) => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Find future events that are swappable and not owned by the current user
    const events = await Event.find({
      user: { $ne: req.user.id },
      status: 'swappable',
      $or: [
        { date: { $gt: now } },
        { 
          date: { $lte: now },
          startTime: { $gt: currentTime }
        }
      ]
    })
    .populate('user', 'name email')
    .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: { slots: events }
    });
  } catch (error) {
    next(error);
  }
};






// Create a new swap request
export const createSwapRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { requestedEventId, message } = req.body;
    const requester = req.user.id;

    // 1) Get the requested event and verify it exists and is swappable
    const requestedEvent = await Event.findOne({
      _id: requestedEventId,
      status: 'swappable',
      user: { $ne: requester } // Can't request your own slot
    }).session(session);

    if (!requestedEvent) {
      throw new AppError('The requested slot is your own slot', 400);
    }

    // 2) Get the requester's event that they want to swap
    const requesterEvent = await Event.findOne({
      _id: req.body.requesterEventId,
      user: requester,
      status: 'swappable'
    }).session(session);

    if (!requesterEvent) {
      throw new AppError('Your selected slot is not available for swap', 400);
    }

    // 3) Check if there's already a pending request for these events
    const existingRequest = await SwapRequest.findOne({
      $or: [
        { requesterEvent: requesterEvent._id, requestedEvent: requestedEvent._id },
        { requesterEvent: requestedEvent._id, requestedEvent: requesterEvent._id }
      ],
      status: 'pending'
    }).session(session);

    if (existingRequest) {
      throw new AppError('A swap request already exists for these slots', 400);
    }

    // 4) Update both events to swap_pending status
    requesterEvent.status = 'swap_pending';
    requestedEvent.status = 'swap_pending';
    await Promise.all([
      requesterEvent.save({ session }),
      requestedEvent.save({ session })
    ]);

    // 5) Create the swap request
    const swapRequest = await SwapRequest.create([{
      requester,
      requestedTo: requestedEvent.user,
      requesterEvent: requesterEvent._id,
      requestedEvent: requestedEvent._id,
      message
    }], { session });

    const requesterEventData = requesterEvent.toObject();
    const requestedEventData = requestedEvent.toObject();
    const swapRequestId = swapRequest[0]._id;

    await session.commitTransaction();
    session.endSession();

    const populatedSwapRequest = await SwapRequest.findById(swapRequestId)
      .populate('requester', 'name email')
      .populate('requestedTo', 'name email')
      .populate('requesterEvent', 'title date startTime endTime')
      .populate('requestedEvent', 'title date startTime endTime');

    const io = getIO();
    io.emit('events:statusChanged', {
      event: requesterEventData,
      userId: requester.toString(),
    });
    io.emit('events:statusChanged', {
      event: requestedEventData,
      userId: requestedEvent.user.toString(),
    });

    io.to(requestedEvent.user.toString()).emit('swaps:new', {
      swapRequest: populatedSwapRequest,
      actorId: requester.toString(),
    });

    res.status(201).json({
      status: 'success',
      data: { swapRequest: populatedSwapRequest }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};





// Get sent swap requests
export const getSentSwapRequests = async (req, res, next) => {
  try {
    const sentRequests = await SwapRequest.find({ requester: req.user.id })
      .populate('requester', 'name email')
      .populate('requestedTo', 'name email')
      .populate('requesterEvent', 'title date startTime endTime')
      .populate('requestedEvent', 'title date startTime endTime')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: sentRequests.length,
      data: { swapRequests: sentRequests }
    });
  } catch (error) {
    next(error);
  }
};

// Get received swap requests
export const getReceivedSwapRequests = async (req, res, next) => {
  try {
    const receivedRequests = await SwapRequest.find({ requestedTo: req.user.id })
      .populate('requester', 'name email')
      .populate('requestedTo', 'name email')
      .populate('requesterEvent', 'title date startTime endTime')
      .populate('requestedEvent', 'title date startTime endTime')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: receivedRequests.length,
      data: { swapRequests: receivedRequests }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific swap request
export const getSwapRequest = async (req, res, next) => {
  try {
    const swapRequest = await SwapRequest.findOne({
      _id: req.params.id,
      $or: [
        { requester: req.user.id },
        { requestedTo: req.user.id }
      ]
    })
    .populate('requester', 'name email')
    .populate('requestedTo', 'name email')
    .populate('requesterEvent', 'title description date startTime endTime location')
    .populate('requestedEvent', 'title description date startTime endTime location');

    if (!swapRequest) {
      return next(new AppError('No swap request found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { swapRequest }
    });
  } catch (error) {
    next(error);
  }
};

// Respond to a swap request
export const respondToSwapRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { accepted, message } = req.body;
    const userId = req.user.id;
    console.log(requestId)

    // 1) Find the swap request and populate the event details
    const swapRequest = await SwapRequest.findOne({
      _id: requestId,
      $or: [
        { requestedTo: userId },
        { requester: userId }
      ],
      status: 'pending'
    })
    .populate('requesterEvent')
    .populate('requestedEvent')
    .session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('No pending swap request found with that ID or you are not authorized', 404));
    }

    // 2) Update the swap request status and response
    const status = accepted ? 'accepted' : 'rejected';
    swapRequest.status = status;
    swapRequest.respondedAt = new Date();
    if (message) swapRequest.responseMessage = message;

    // 3) Handle the events based on the response
    if (accepted) {
      // Swap only the scheduling details between the events while keeping their metadata intact
      const requesterSchedule = {
        date: swapRequest.requesterEvent.date,
        startTime: swapRequest.requesterEvent.startTime,
        endTime: swapRequest.requesterEvent.endTime
      };

      swapRequest.requesterEvent.date = swapRequest.requestedEvent.date;
      swapRequest.requesterEvent.startTime = swapRequest.requestedEvent.startTime;
      swapRequest.requesterEvent.endTime = swapRequest.requestedEvent.endTime;

      swapRequest.requestedEvent.date = requesterSchedule.date;
      swapRequest.requestedEvent.startTime = requesterSchedule.startTime;
      swapRequest.requestedEvent.endTime = requesterSchedule.endTime;

      // Set both events back to busy
      swapRequest.requesterEvent.status = 'busy';
      swapRequest.requestedEvent.status = 'busy';

      // Expire other pending requests for these events
      await SwapRequest.updateMany(
        {
          _id: { $ne: swapRequest._id },
          $or: [
            { requesterEvent: { $in: [swapRequest.requesterEvent._id, swapRequest.requestedEvent._id] } },
            { requestedEvent: { $in: [swapRequest.requesterEvent._id, swapRequest.requestedEvent._id] } }
          ],
          status: 'pending'
        },
        { 
          status: 'expired',
          respondedAt: Date.now(),
          responseMessage: 'This request has been automatically expired due to another accepted swap.'
        },
        { session }
      );
    } else {
      // If rejected, set both events back to swappable
      swapRequest.requesterEvent.status = 'swappable';
      swapRequest.requestedEvent.status = 'swappable';
    }

    // 4) Save all changes in a transaction
    await Promise.all([
      swapRequest.save({ session }),
      swapRequest.requesterEvent.save({ session }),
      swapRequest.requestedEvent.save({ session })
    ]);

    const requesterEventData = swapRequest.requesterEvent.toObject();
    const requestedEventData = swapRequest.requestedEvent.toObject();
    const swapRequestId = swapRequest._id;
    const targetStatus = swapRequest.status;

    await session.commitTransaction();
    session.endSession();

    const populatedSwapRequest = await SwapRequest.findById(swapRequestId)
      .populate('requester', 'name email')
      .populate('requestedTo', 'name email')
      .populate('requesterEvent', 'title date startTime endTime')
      .populate('requestedEvent', 'title date startTime endTime');

    const io = getIO();
    io.emit('events:statusChanged', {
      event: requesterEventData,
      userId: swapRequest.requester.toString(),
    });
    io.emit('events:statusChanged', {
      event: requestedEventData,
      userId: swapRequest.requestedTo.toString(),
    });

    const payload = {
      swapRequest: populatedSwapRequest,
      action: targetStatus,
      actorId: userId.toString(),
    };

    io.to(swapRequest.requester.toString()).emit('swaps:updated', payload);
    io.to(swapRequest.requestedTo.toString()).emit('swaps:updated', payload);

    res.status(200).json({
      status: 'success',
      data: { swapRequest: populatedSwapRequest }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// Cancel a swap request
export const cancelSwapRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const swapRequest = await SwapRequest.findOne({
      _id: req.params.id,
      requester: req.user.id,
      status: 'pending'
    })
      .populate('requesterEvent')
      .populate('requestedEvent')
      .session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('No pending swap request found with that ID or you are not authorized to cancel it', 404));
    }

    swapRequest.status = 'cancelled';
    swapRequest.respondedAt = new Date();

    if (swapRequest.requesterEvent) {
      swapRequest.requesterEvent.status = 'swappable';
      await swapRequest.requesterEvent.save({ session });
    }

    if (swapRequest.requestedEvent) {
      swapRequest.requestedEvent.status = 'swappable';
      await swapRequest.requestedEvent.save({ session });
    }

    const requesterEventData = swapRequest.requesterEvent ? swapRequest.requesterEvent.toObject() : null;
    const requestedEventData = swapRequest.requestedEvent ? swapRequest.requestedEvent.toObject() : null;
    const swapRequestId = swapRequest._id;

    await swapRequest.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populatedSwapRequest = await SwapRequest.findById(swapRequestId)
      .populate('requester', 'name email')
      .populate('requestedTo', 'name email')
      .populate('requesterEvent', 'title date startTime endTime')
      .populate('requestedEvent', 'title date startTime endTime');

    const io = getIO();

    if (requesterEventData) {
      io.emit('events:statusChanged', {
        event: requesterEventData,
        userId: swapRequest.requester.toString(),
      });
    }

    if (requestedEventData) {
      io.emit('events:statusChanged', {
        event: requestedEventData,
        userId: swapRequest.requestedTo.toString(),
      });
    }

    const payload = {
      swapRequest: populatedSwapRequest,
      action: 'cancelled',
      actorId: swapRequest.requester.toString(),
    };

    io.to(swapRequest.requester.toString()).emit('swaps:updated', payload);
    io.to(swapRequest.requestedTo.toString()).emit('swaps:updated', payload);

    res.status(200).json({
      status: 'success',
      data: { swapRequest: populatedSwapRequest }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// Expire old pending swap requests
export const expireOldSwapRequests = async () => {
  try {
    const result = await SwapRequest.updateMany(
      {
        status: 'pending',
        expiresAt: { $lte: new Date() }
      },
      {
        status: 'expired',
        respondedAt: new Date(),
        responseMessage: 'This request has expired.'
      }
    );
    return result;
  } catch (error) {
    console.error('Error expiring old swap requests:', error);
    throw error;
  }
};