// routes/user.routes.js
import express from 'express';
import {
	createUser,
	getUserById,
	updateUser,
	deleteUser,
	getAllUsers,
	loginUser
} from '../controllers/user.controller.js';

const router = express.Router();

// @route   POST /api/users
// @desc    Create a new user
router.post('/', createUser);


// @route   GET /api/users/:id
// @desc    Get a user by ID
router.get('/:id', getUserById);

// @route   PUT /api/users/:id
// @desc    Update a user by ID
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete a user by ID
router.delete('/:id', deleteUser);

// @route   GET /api/users
// @desc    Get all users (Admin use)
router.get('/', getAllUsers);

router.post('/login', loginUser);

export default router;
