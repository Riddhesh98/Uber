import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config();

connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`\n Server is running on port : ${process.env.PORT} `);
    });
})
.catch((error) => {
    console.error("Failed to connect to the database:", error);
    throw error;
  })