import { Camera } from "../../domain/models/Camera";

const cameras: Camera[] = [
  {
    id: "CAM_001",
    name: "Park Street Junction",
    latitude: 22.5535,
    longitude: 88.3525,
    status: "online",
    fps: 24,
    vehicleCount: 18,
    trafficLevel: "moderate",
    detectedVehicles: {
      car: 12,
      motorcycle: 3,
      bus: 2,
      truck: 1,
      van: 0,
      taxi: 0,
    },
  },

  {
    id: "CAM_002",
    name: "Esplanade Crossing",
    latitude: 22.5646,
    longitude: 88.3512,
    status: "online",
    fps: 30,
    vehicleCount: 27,
    trafficLevel: "high",
    detectedVehicles: {
      car: 16,
      motorcycle: 6,
      bus: 3,
      truck: 1,
      van: 1,
      taxi: 0,
    },
  },

  {
    id: "CAM_003",
    name: "Salt Lake Sector V",
    latitude: 22.5769,
    longitude: 88.4331,
    status: "online",
    fps: 25,
    vehicleCount: 11,
    trafficLevel: "low",
    detectedVehicles: {
      car: 7,
      motorcycle: 2,
      bus: 1,
      truck: 0,
      van: 1,
      taxi: 0,
    },
  },

  {
    id: "CAM_004",
    name: "Howrah Bridge",
    latitude: 22.5958,
    longitude: 88.3476,
    status: "online",
    fps: 24,
    vehicleCount: 35,
    trafficLevel: "critical",
    detectedVehicles: {
      car: 18,
      motorcycle: 8,
      bus: 4,
      truck: 3,
      van: 1,
      taxi: 1,
    },
  },

  {
    id: "CAM_005",
    name: "Gariahat Junction",
    latitude: 22.5186,
    longitude: 88.3654,
    status: "offline",
    fps: 0,
    vehicleCount: 0,
    trafficLevel: "low",
    detectedVehicles: {
      car: 0,
      motorcycle: 0,
      bus: 0,
      truck: 0,
      van: 0,
      taxi: 0,
    },
  },
];

export const CameraApi = {
  async getCameras(): Promise<Camera[]> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    return cameras;
  },
};