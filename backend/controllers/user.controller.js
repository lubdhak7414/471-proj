// controllers/user.controller.js
import User from '../models/user.model.js';

// Create a new user
export const createUser = async (req, res) => {
	try {
		const { name, email, phone, password, address, picture } = req.body;

		// Check if email already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'Email already in use' });
		}

		const user = new User({ name, email, phone, password, address, picture });
		await user.save();
		res.status(201).json(user);
	} catch (error) {
		console.error('Create User Error:', error);
		res.status(500).json({ message: 'Server Error' });
	}
};

// Get user by ID
export const getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json(user);
	} catch (error) {
		console.error('Get User Error:', error);
		res.status(500).json({ message: 'Server Error' });
	}
};

// Update user
export const updateUser = async (req, res) => {
	try {
		const { name, phone, address, picture, isActive } = req.body;
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{ name, phone, address, picture, isActive },
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json(updatedUser);
	} catch (error) {
		console.error('Update User Error:', error);
		res.status(500).json({ message: 'Server Error' });
	}
};

// Delete user
export const deleteUser = async (req, res) => {
	try {
		const deletedUser = await User.findByIdAndDelete(req.params.id);
		if (!deletedUser) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Delete User Error:', error);
		res.status(500).json({ message: 'Server Error' });
	}
};

// Get all users (for admin panel or analytics)
export const getAllUsers = async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json(users);
	} catch (error) {
		console.error('Get All Users Error:', error);
		res.status(500).json({ message: 'Server Error' });
	}
};

