// technician.controller.js
import Technician from "../models/technician.model.js";
import User from "../models/user.model.js";

// Create technician profile
export const createTechnician = async (req, res) => {
    try {
        const {
            user,
            services,
            experience,
            hourlyRate,
            availability,
            serviceArea,
            certifications
        } = req.body;

        // Check if user exists and is a technician
        const existingUser = await User.findById(user);
        if (!existingUser || existingUser.role !== 'technician') {
            return res.status(400).json({ 
                message: "Invalid user or user is not a technician" 
            });
        }

        const technician = new Technician({
            user,
            services,
            experience,
            hourlyRate,
            availability,
            serviceArea,
            certifications
        });

        await technician.save();
        res.status(201).json({
            message: "Technician profile created successfully",
            technician
        });
    } catch (error) {
        console.error("Create Technician Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Search technicians
export const searchTechnicians = async (req, res) => {
    try {
        const { 
            service, 
            location, 
            minRating, 
            maxRate, 
            availability, 
            page = 1, 
            limit = 10 
        } = req.query;

        const query = { isAvailable: true };

        if (service) {
            query.services = service;
        }

        if (location) {
            query['serviceArea.city'] = { $regex: location, $options: 'i' };
        }

        if (minRating) {
            query['rating.average'] = { $gte: parseFloat(minRating) };
        }

        if (maxRate) {
            query.hourlyRate = { $lte: parseFloat(maxRate) };
        }

        const technicians = await Technician.find(query)
            .populate('user', 'name phone picture')
            .populate('services', 'name category')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ 'rating.average': -1, totalJobs: -1 });

        const total = await Technician.countDocuments(query);

        res.status(200).json({
            technicians,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Search Technicians Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get technician by ID
export const getTechnicianById = async (req, res) => {
    try {
        const technician = await Technician.findById(req.params.id)
            .populate('user', 'name phone picture address')
            .populate('services', 'name category description');
        
        if (!technician) {
            return res.status(404).json({ message: "Technician not found" });
        }

        res.status(200).json(technician);
    } catch (error) {
        console.error("Get Technician Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get technician dashboard data
export const getTechnicianDashboard = async (req, res) => {
    try {
        const { technicianId } = req.params;
        
        const technician = await Technician.findById(technicianId)
            .populate('user', 'name picture');

        if (!technician) {
            return res.status(404).json({ message: "Technician not found" });
        }

        // Get pending bookings for this technician
        const pendingBookings = await Booking.find({
            technician: technicianId,
            status: 'pending'
        }).populate('user', 'name phone').populate('service', 'name');

        const dashboard = {
            technician,
            pendingBookings,
            totalJobs: technician.totalJobs,
            rating: technician.rating,
            isAvailable: technician.isAvailable
        };

        res.status(200).json(dashboard);
    } catch (error) {
        console.error("Get Technician Dashboard Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Accept/Reject booking
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, technicianId } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId, technician: technicianId },
            { status },
            { new: true }
        ).populate('user', 'name phone').populate('service', 'name');

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({
            message: `Booking ${status} successfully`,
            booking
        });
    } catch (error) {
        console.error("Update Booking Status Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

