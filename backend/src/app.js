import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://fvc67gnl-5173.inc1.devtunnels.ms",
        "http://localhost:5174",
    ],
    
    credentials: true
}));


app.use(express.json({limit:"16kb"}));

app.use(express.urlencoded({extended:true}));

app.use(express.static('public'));

app.use(cookieParser());



//Routes
import userRoutes from "./routes/user.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import mapRoutes from "./routes/map.routes.js";
import rideRoutes from "./routes/ride.routes.js";


app.use("/api/v1/users", userRoutes);
app.use("/api/v1/captains", captainRoutes);
app.use("/api/maps", mapRoutes);
app.use("/api/v1/rides", rideRoutes);

export default app;
