// user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		phone: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		address: {
			street: { type: String },
			city: { type: String },
			area: { type: String },
			postalCode: { type: String },
		},
		picture: {
			type: String,
			default: "",
		},
		role: {
			type: String,
			enum: ["user", "technician", "admin"],
			default: "user",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);
export default User;







