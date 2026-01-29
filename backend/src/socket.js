import { Server } from "socket.io";
import { User } from "./models/user.model.js";
import { Captain } from "./models/captain.model.js";

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // 🔗 Join socket
    socket.on("join", async ({ userId, userType }) => {
      try {
        console.log(
          `user ${userId} of type ${userType} joined with socket ID ${socket.id}`
        );
        if (!userId || !userType) return;

        if (userType === "user") {
          await User.findByIdAndUpdate(userId, {
            socketId: socket.id,
          });
        }

        if (userType === "captain") {
          await Captain.findByIdAndUpdate(userId, {
            socketId: socket.id,
          });
     
        }
      } catch (error) {
        console.error("Join socket error:", error.message);
      }
    });

    socket.on("update-location-captain", async ({ userId, location }) => {
      try {
        if (
          location?.ltd === undefined ||
          location?.lng === undefined
        ) {
          return socket.emit("error", {
            message: "Invalid location data",
          });
        }

        await Captain.findByIdAndUpdate(userId, {
          location: {
            ltd: location.ltd,
            lng: location.lng,
          },
        });

      } catch (error) {
        console.error("Location update error:", error.message);
      }
    });
  }); // ✅ closes io.on("connection")
}; // ✅ closes initializeSocket

// 📤 Send event to specific socket
const sendMessageToSocketId = (socketId, messageObject) => {
  if (!io) {
    console.log("Socket.io not initialized");
    return;
  }

console.log("fromm backend socket.js:", socketId, messageObject);
  io.to(socketId).emit(
    messageObject.event,
    messageObject.data
  );
};

export { initializeSocket, sendMessageToSocketId };
