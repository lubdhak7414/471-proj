// service.controller.js
import Service from "../models/service.model.js";

// Create a new service
export const createService = async (req, res) => {
    try {
        const {
            name,
            category,
            description,
            estimatedPrice,
            estimatedDuration,
            image
        } = req.body;

        const service = new Service({
            name,
            category,
            description,
            estimatedPrice,
            estimatedDuration,
            image
        });

        await service.save();
        res.status(201).json({
            message: "Service created successfully",
            service
        });
    } catch (error) {
        console.error("Create Service Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all services (Browse Repair Services)
export const getAllServices = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        
        const query = { isActive: true };
        
        if (category) {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const services = await Service.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Service.countDocuments(query);

        res.status(200).json({
            services,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Get All Services Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get service by ID
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json(service);
    } catch (error) {
        console.error("Get Service Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get service categories
export const getServiceCategories = async (req, res) => {
    try {
        const categories = await Service.distinct('category', { isActive: true });
        res.status(200).json(categories);
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update service
export const updateService = async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json(updatedService);
    } catch (error) {
        console.error("Update Service Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete service by ID
export const deleteService = async (req, res) => {
    try {
        const deletedService = await Service.findByIdAndDelete(req.params.id);
        
        if (!deletedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        console.error("Delete Service Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

