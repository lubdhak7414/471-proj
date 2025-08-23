import express from 'express';
import Booking from '../Models/booking.model.js';
import Technician from '../Models/technician.model.js';
import User from '../Models/user.model.js';
import Service from '../Models/service.model.js'
import mongoose from 'mongoose';
const router = express.Router();


router.post('/user/:userId', async (req, res) => {
  try {
    const { userId }=req.params;
    const { 
      user, 
      service, 
      description, 
      preferredDate, 
      preferredTime, 
      urgency, 
      address,
      images 
    } = req.body;

    // Validate required fields
    if (!user || !service || !description || !preferredDate || !preferredTime || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate service exists
    const serviceExists = await Service.findById(service);
    if (!serviceExists) {
      return res.status(404).json({ message: "Service not found" });
    }


    // Validate technician exists and offers this service
    const technician = await Technician.findOne({ user: userId }).populate('services');
    if (!technician) {
      return res.status(404).json({ message: "Technician not found for this user" });
    }

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    if (!technician.services.some(s => s._id.equals(service))) {
      return res.status(400).json({ 
        message: "This technician doesn't offer the requested service" 
      });
    }



    // Create new booking
    const newBooking = new Booking({
      user,
      technician: technician._id,
      service,
      description,
      preferredDate: new Date(preferredDate),
      preferredTime,
      urgency: urgency || 'medium',
      address,
      images: images || [],
      status: 'pending'
    });

    const savedBooking = await newBooking.save();
    
    // Populate the response with user and service details
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('user', 'name email phone picture')
      .populate('service', 'name category estimatedPrice');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get bookings for technician with filters
router.get('/user/:userId/bookings', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;


    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Find technician by userId
    const technician = await Technician.findOne({ user: userId });
    if (!technician) {
      return res.status(404).json({ message: "Technician not found for this user" });
    }

    let query = {};

    if (status === 'pending') {
      // Get pending bookings for services this technician offers
      query = {
        status: 'pending',
        service: { $in: technician.services }
      };
    } else {
      // Get bookings assigned to this technician
      query = {
        technician: technician._id,
        ...(status && { status })
      };
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email phone picture")
      .populate("service", "name category estimatedPrice");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status
router.patch('/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, userId } = req.body;

    if (!["accepted", "rejected", "in-progress", "completed", "cancelled","pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    // Find technician by userId
    const technician = await Technician.findOne({ user: userId });
    if (!technician) {
      return res.status(404).json({ message: "Technician not found for this user" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }



    // For pending -> accepted: Assign technician
    if (booking.status === 'pending' && status === 'accepted') {
      if (!technician.services.includes(booking.service)) {
        console.log(technician._id)
        console.log('Unauthorized: booking.technician', booking.technician, 'technician._id', technician._id);
        return res.status(403).json({ message: "Technician doesn't offer this service" });
      }
      
      booking.technician = technician._id;
      booking.status = 'accepted';
    } 
    // For other status updates
    else {
      // Validate technician ownership
      if (booking.technician.toString() !== technician._id.toString()) {
        console.log('Unauthorized: booking.technician', booking.technician, 'technician._id', technician._id);
        return res.status(403).json({ message: "Unauthorized action" });
      }
      
      // Validate status transitions
      const validTransitions = {
        'accepted': ['in-progress', 'cancelled'],
        'in-progress': ['completed', 'cancelled']
      };
      
      if (!validTransitions[booking.status]?.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status transition from ${booking.status} to ${status}`
        });
      }
      
      booking.status = status;
      
      // Record timestamps
      if (status === 'completed') booking.completedAt = new Date();
      if (status === 'cancelled') booking.cancelledAt = new Date();
    }

    const updatedBooking = await booking.save();
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;