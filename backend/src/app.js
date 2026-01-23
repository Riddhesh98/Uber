import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true,     
   
}));


app.use(express.json({limit:"16kb"}));

app.use(express.urlencoded({extended:true}));

app.use(express.static('public'));

app.use(cookieParser());



//Routes
import userRoutes from "./routes/user.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import mapRoutes from "./routes/map.routes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/captains", captainRoutes);
app.use("/api/maps", mapRoutes);

export default app;
