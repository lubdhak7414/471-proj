import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    messageType: { type: String, enum: ["text", "image", "file"], default: "text" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date }
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;