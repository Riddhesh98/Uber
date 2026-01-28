import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
import http from "http";
import { initializeSocket } from "./socket.js"; // 

dotenv.config();

const server = http.createServer(app);


initializeSocket(server);

connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch(console.error);
