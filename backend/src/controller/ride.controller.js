import {calculateRoute, getRouteInfo , geocodeAddress, getCaptainInTheRadius} from "../controller/map.controller.js"
import {Ride} from "../models/ride.model.js"
import crypto from "crypto"
import {sendMessageToSocketId} from "../socket.js"
import { ApiError } from "../utils/ApiError.js"


export const otpGenerator = (digit)=>{
    //through crpto generate digit otp
    return crypto.randomInt(Math.pow(10, digit-1), Math.pow(10, digit)).toString();

}



    

// GET /fare
export const getFare = async (req, res, next) => {
  try {
    const pickup = req.query.pickup;
    const destination = req.query.destination;

    if (!pickup || !destination) {
      return res.status(400).json({
        success: false,
        message: "Pickup and destination are required",
      });
    }

    const pickupCoords = await geocodeAddress(pickup);
    const destinationCoords = await geocodeAddress(destination);

    const routeInfo = await getRouteInfo(pickupCoords, destinationCoords);

    const baseFare = 50;
    const costPerKmAuto = 12;
    const costPerKmCar = 15;
    const costPerKmMoto = 10;

    const distance = parseFloat(routeInfo.distanceKm);
    const fareAuto = baseFare + costPerKmAuto * distance;
    const fareCar = baseFare + costPerKmCar * distance;
    const fareMoto = baseFare + costPerKmMoto * distance;

    return res.status(200).json({
      success: true,
      fare: {
        auto: Math.round(fareAuto),
        car: Math.round(fareCar),
        motorcycle: Math.round(fareMoto),
      },
      distanceKm: routeInfo.distanceKm,
      durationMin: routeInfo.durationMin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



export const createRide= async (req,res)=>{
    // Logic to create a ride request
    const userId = req.user?._id || null;

  const { pickup, destination, vehicleType } = req.body;

  if (!pickup || !destination || !vehicleType) {
    throw new ApiError(400, "Pickup, destination, and vehicle type are required to create a ride");
  }

 
    //calculate fare
    const pickupCoords = await geocodeAddress(pickup);
    const destinationCoords = await geocodeAddress(destination);

    const routeInfo = await getRouteInfo(pickupCoords, destinationCoords);

    const baseFare = 50;
    const costPerKmAuto = 12;
    const costPerKmCar = 15;
    const costPerKmMoto = 10;

    const distance = parseFloat(routeInfo.distanceKm);
    const fare = {
      auto: Math.round(baseFare + costPerKmAuto * distance),
      car: Math.round(baseFare + costPerKmCar * distance),
      motorcycle: Math.round(baseFare + costPerKmMoto * distance),
    };

    

  

    const getCaptainInRadius = await getCaptainInTheRadius(pickupCoords.lat, pickupCoords.lng, 4);

   
 //save ride to db

    
// Validate vehicle type
const allowedVehicles = ["auto", "car", "motorcycle"];
if (!allowedVehicles.includes(vehicleType)) {
    throw new ApiError(400, "Invalid vehicle type");
}

const ride = new Ride({
    user: userId,
    pickup,
    destination,
    fare: fare[vehicleType], // ✅ fixed
    status: 'pending',
    otp: otpGenerator(6),
});
    const rideCreateSave =await ride.save();
    
    if(!rideCreateSave){
        throw new ApiError(500, "Could not create ride request, try again later");
    }

    // Notify captains in radius via socket
   

    //ride with user details cause captains need to see user info
    const rideWithUser = await Ride
    .findById(ride._id)
    .populate('user', '-password -refreshToken -socketId -otp');
  

    getCaptainInRadius.map((captain) =>{
     const res=  sendMessageToSocketId(captain.socketId, {
                    event: "new-ride",
                      data: rideWithUser,
                   });

      if(res instanceof Error){
        console.error("Socket error:", res.message);
      }


    })


    return res.status(201).json({
        success: true,
        message: "Ride request created successfully",
        ride,
    });

   

}


export const confrimRide = async (req) => {
  const { rideId } = req.body;

  if (!rideId) {
    throw new ApiError(400, "Ride ID is required to confirm ride");
  }

  const captainId = req.captain?._id || null;

  

  if (!captainId) {
    throw new ApiError(401, "Captain not authorized");
  }

  await Ride.findByIdAndUpdate(rideId, {
    captain: captainId,
    status: "accepted",
  });

  //add otp

  const ride = await Ride.findById(rideId)
  .populate("user", "-password")
  .populate("captain")
  .select("+otp");





  sendMessageToSocketId(ride.user.socketId, {
    event: "ride-confirmed",
    data: ride,
  });
  

  return ride;
};

export const startRide = async (req, res) => {
  try {
    const { rideId, otp } = req.body;

    console.log("from backend ride controller body:", req.body);

    if (!rideId || !otp) {
      throw new ApiError(400, "Ride ID and OTP are required to start ride");
    }

    const ride = await Ride.findById(rideId)
      .select("+otp")
      .populate("user", "-password")
      .populate("captain");

    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    if (ride.otp !== otp.toString()) {
      throw new ApiError(400, "Invalid OTP");
    }

    ride.status = "ongoing";
    await ride.save();



    // Notify user via socket
    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    // ✅ Send response directly
    return res.status(200).json({ success: true, ride });
  } catch (err) {
    console.error("Error in startRide:", err.message || err);
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

//end ride
export const endRide = async (req, res) => {

  try {
    const { rideId } = req.body;

    if (!rideId) {
      throw new ApiError(400, "Ride ID is required to end ride");
    }

    const ride= await Ride.findById(rideId)
    .populate("user", "-password")
    .populate("captain");
      
    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    if(ride.status !== "ongoing"){
        throw new ApiError(400, "Ride is not ongoing");
    } 
    

    ride.status = "completed";
    
    console.log("Ride ended successfully ride data" , ride);
    console.log("Ride ended successfully ride user socket id" , ride.user.socketId);
        // Notify user via socket
        sendMessageToSocketId(ride.user.socketId, {
          event: "ride-ended",
          data: ride,
        });

    await ride.save();




    return res.status(200).json({ success: true, ride });
  } catch (err) {
    console.error("Error in endRide:", err.message || err);
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }

}