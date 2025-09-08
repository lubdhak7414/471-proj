// backend/routes/technicianRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import Technician from '../models/technician.model.js'; 
import User from '../models/user.model.js';
import Service from '../models/service.model.js';

const router = express.Router();




router.get('/', async (req, res) => {
  try {
    const technicians = await Technician.find()
      .populate('user', 'name picture')
      .populate('services', 'name');
    res.json(technicians);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      userId,
      services,
      experience,
      hourlyRate,
      availability,
      serviceArea,
      certifications
    } = req.body;

    // Validate required fields

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    
    }
    if (!userId || !services || !experience || !hourlyRate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists and is a technician
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'technician') {
      return res.status(400).json({ message: 'User is not a technician' });
    }

    // Check if technician profile already exists
    let technician = await Technician.findOne({ user: userId });

    if (technician) {
      // Update existing technician
      technician.services = services;
      technician.experience = experience;
      technician.hourlyRate = hourlyRate;
      if (availability) technician.availability = availability;
      if (serviceArea) technician.serviceArea = serviceArea;
      if (certifications) technician.certifications = certifications;
    } else {
      // Create new technician
      technician = new Technician({
        user: userId,
        services,
        experience,
        hourlyRate,
        availability: availability || {
          monday: { start: '', end: '', available: false },
          // ... other days
        },
        serviceArea: serviceArea || [],
        certifications: certifications || [],
        rating: { average: 0, count: 0 },
        isVerified: false,
        isAvailable: true
      });
    }

    const savedTechnician = await technician.save();
    res.status(201).json(savedTechnician);
  } catch (error) {
    console.error('Error saving technician profile:', error.message, error.stack);
  res.status(500).json({ 
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
  }
});


router.post('/search', async (req, res) => {
  try {
    console.log('request body', req.body);
    const { name, services, minRating, city, area, experience } = req.body;
    // const currentDay = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();

    let query = {};

  
    if (services) {
      let serviceId;
      if (mongoose.Types.ObjectId.isValid(services)) {
        serviceId = services;
      } else {
        const service = await Service.findOne({ 
          name: { $regex: new RegExp(`^${services}$`, 'i') } // 
        });
        if (service) serviceId = service._id;
      }
      if (serviceId) {
        query.services = serviceId; 
      } else {
        
        return res.json([]);
      }
    }

    // Name filter
    if (name) {
      const users = await User.find({ 
        name: { $regex: new RegExp(name, 'i') } 
      }, '_id');
      const userIds = users.map(user => user._id);
      if (userIds.length === 0) {
        return res.json([]); 
      }
      query.user = { $in: userIds };
    }

    // Area filter
    if (city || area) {
      query.serviceArea = { $elemMatch: {} };
      
      if (city) {
        query.serviceArea.$elemMatch.city = { $regex: new RegExp(city, 'i') };
      }
      
      if (area) {
        query.serviceArea.$elemMatch.areas = { 
          $elemMatch: { $regex: new RegExp(area, 'i') } 
        };
      }
    }

    // Rating filter
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Experience filter
    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    const technicians = await Technician.find(query)
      .populate('user', 'name picture')
      .populate('services', 'name') // Populate service names
      .lean();

    // const now = new Date();
    // const currentHours = now.getHours();
    // const currentMinutes = now.getMinutes();
    // const currentTime = currentHours * 100 + currentMinutes;

    // const availableTechs = technicians.filter(tech => {
    //   const availability = tech.availability?.[currentDay]; // Added optional chaining
    //   if (!availability || !availability.available) return false;
      
    //   const [startHour, startMinute] = availability.start.split(':').map(Number);
    //   const [endHour, endMinute] = availability.end.split(':').map(Number);
      
    //   const startTime = startHour * 100 + startMinute;
    //   const endTime = endHour * 100 + endMinute;
      
    //   return currentTime >= startTime && currentTime <= endTime;
    // });

    res.json(technicians);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid technician ID format' });
    }

    // Find and delete the technician
    const technician = await Technician.findByIdAndDelete(id);

    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    // Optionally: You might want to update the associated user's role
    // await User.findByIdAndUpdate(technician.user, { role: 'user' });

    res.json({ 
      message: 'Technician deleted successfully',
      deletedTechnician: technician
    });

  } catch (error) {
    console.error('Error deleting technician:', error);
    res.status(500).json({ 
      message: 'Server error while deleting technician',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 


