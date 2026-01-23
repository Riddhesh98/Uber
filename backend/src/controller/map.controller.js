import axios from "axios";

const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY;

// Address → Lat/Lng
const geocodeAddress = async (address) => {
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
const getRouteInfo = async (start, end) => {
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
  console.log("🔥 calculateRoute HIT");
  console.log("BODY:", req.body);
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
