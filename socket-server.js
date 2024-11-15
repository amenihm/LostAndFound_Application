const io = require("socket.io")(3001, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"],
    },
  });
  
  const mongoose = require("mongoose");
  const Message = require("./models/Message");
  const User = require("./models/user.model");
  require("dotenv").config();
  
  // Connect to MongoDB
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    });
  
  // Handle MongoDB connection errors after initial connection
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });
  
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
  
  // Handle process termination
  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  });
  
  // Store active users
  const activeUsers = new Map();
  
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    // Handle user joining
    socket.on("user_connected", (userId) => {
      activeUsers.set(userId, socket.id);
      console.log("User joined:", userId);
    });
  
    // Handle sending messages
    socket.on("send_message", async (messageData) => {
      try {
        const { receiverId, itemId, content, senderId } = messageData;
  
        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);
  
        if (!receiver || !sender) {
          socket.emit("message_error", "User not found");
          return;
        }
  
        const newMessage = new Message({
          sender: {
            _id: senderId,
            username: sender.username,
          },
          receiver: {
            _id: receiverId,
            username: receiver.username,
          },
          itemId: itemId,
          content: content,
          read: false,
        });
  
        await newMessage.save();
  
        // Emit to sender
        socket.emit("message_sent", newMessage);
  
        // Emit to receiver if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message_received", newMessage);
        }
      } catch (error) {
        console.error("Message error:", error);
        socket.emit("message_error", error.message);
      }
    });
  
    // Handle disconnection
    socket.on("disconnect", () => {
      // Remove user from active users
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          break;
        }
      }
      console.log("User disconnected:", socket.id);
    });
  });
  
  // Start the socket server
  console.log("Socket server running on port 3001");
  