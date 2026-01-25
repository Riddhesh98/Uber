import {calculateRoute, getRouteInfo , geocodeAddress} from "../controller/map.controller.js"
import {Ride} from "../models/ride.model.js"
import crypto from "crypto"

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

    return res.status(201).json({
        success: true,
        message: "Ride request created successfully",
        ride,
    });

   

}

