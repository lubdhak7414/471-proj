// controllers/user.controller.js
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, address, picture, role } = req.body;

    // 1️⃣ Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // 2️⃣ Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      address: address || {},
      picture: picture || "",
      role: role && ["user", "technician", "admin"].includes(role) ? role : "user", // safe role assignment
    });

    // 5️⃣ Save to DB
    await user.save();

    // 6️⃣ Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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

// Login user controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // Set this in your .env file
      { expiresIn: '1h' }
    );

    // Send the response with the token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        picture: user.picture,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login User Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


