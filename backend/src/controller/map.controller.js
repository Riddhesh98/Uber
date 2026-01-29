import axios from "axios";
import { Captain } from "../models/Captain.model.js";
const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY;

// Address → Lat/Lng
export const geocodeAddress = async (address) => {
  const url = "https://api.geoapify.com/v1/geocode/search";

  const response = await axios.get(url, {
    params: {
      text: address,
      apiKey: GEOAPIFY_KEY,
    },
  });

  const data = response.data;

  if (!data.features || data.features.length === 0) {
    throw new Error("Address not found");
  }

  const [lng, lat] = data.features[0].geometry.coordinates;
  return { lat, lng };
};

// Distance + Time
export const getRouteInfo = async (start, end) => {
  const url = "https://api.geoapify.com/v1/routing";

  const response = await axios.get(url, {
    params: {
      waypoints: `${start.lat},${start.lng}|${end.lat},${end.lng}`,
      mode: "drive",
      apiKey: GEOAPIFY_KEY,
    },
  });

  const route = response.data.features[0].properties;

  return {
    distanceKm: (route.distance / 1000).toFixed(2),
    durationMin: Math.ceil(route.time / 60),
  };
};

export const calculateRoute = async (req, res) => {

  try {
    const { pickup, destination } = req.body;

    if (!pickup || !destination) {
      return res.status(400).json({
        success: false,
        message: "Pickup and destination are required",
      });
    }

    const pickupCoords = await geocodeAddress(pickup);
    const destinationCoords = await geocodeAddress(destination);

    const routeInfo = await getRouteInfo(
      pickupCoords,
      destinationCoords
    );

    res.status(200).json({
      success: true,
      pickup: pickupCoords,
      destination: destinationCoords,
      distanceKm: routeInfo.distanceKm,
      durationMin: routeInfo.durationMin,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};



export const addressSuggestions = async (req, res) => {
  try {
    const { text } = req.query; // or req.body.text for POST

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'text' is required",
      });
    }

    const url = "https://api.geoapify.com/v1/geocode/autocomplete";

    const response = await axios.get(url, {
      params: {
        text,
        limit: 5,
        apiKey: GEOAPIFY_KEY,
      },
    });

    const suggestions = response.data.features.map((feature) => ({
      address: feature.properties.formatted,
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    }));

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};
export const getCaptainInTheRadius = async (ltd, lng, radius) => {
  // get captains with valid location
  const captains = await Captain.find({
    "location.ltd": { $ne: null },
    "location.lng": { $ne: null },
   
  });

  const R = 6371; // Earth radius in KM

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const nearbyCaptains = captains.filter(captain => {
    const distance = getDistance(
      ltd,
      lng,
      captain.location.ltd,
      captain.location.lng
    );

    return distance <= radius;
  });

  console.log(nearbyCaptains);
  return nearbyCaptains;
};

