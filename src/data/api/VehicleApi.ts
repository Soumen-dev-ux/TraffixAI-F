import { Vehicle } from "../../domain/models/Vehicle";

const dummyVehicles: Vehicle[] = [
  {
    id: "VH_001",
    plateNumber: "WB12AB1234",
    vehicleType: "car",
    color: "White",
    cameraId: "CAM_001",
    cameraName: "Park Street Junction",
    latitude: 22.5535,
    longitude: 88.3525,
    detectedAt: "10:42:18",
  },
  {
    id: "VH_002",
    plateNumber: "WB06CD5678",
    vehicleType: "motorcycle",
    color: "Black",
    cameraId: "CAM_002",
    cameraName: "Esplanade Crossing",
    latitude: 22.5646,
    longitude: 88.3512,
    detectedAt: "10:45:32",
  },
  {
    id: "VH_003",
    plateNumber: "WB24EF9012",
    vehicleType: "bus",
    color: "Blue",
    cameraId: "CAM_003",
    cameraName: "Salt Lake Sector V",
    latitude: 22.5769,
    longitude: 88.4331,
    detectedAt: "10:48:05",
  },
  {
    id: "VH_004",
    plateNumber: "WB18GH3456",
    vehicleType: "truck",
    color: "Red",
    cameraId: "CAM_004",
    cameraName: "Howrah Bridge",
    latitude: 22.5958,
    longitude: 88.3476,
    detectedAt: "10:51:21",
  },
];

export const vehicleApi = {
  async searchVehicle(plateNumber: string): Promise<Vehicle | null> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cleanQuery = plateNumber.replace(/[\s-]/g, "").toLowerCase();
    if (!cleanQuery) return null;

    const vehicle = dummyVehicles.find((item) => {
      const cleanPlate = item.plateNumber.replace(/[\s-]/g, "").toLowerCase();
      return cleanPlate === cleanQuery || cleanPlate.includes(cleanQuery);
    });

    return vehicle || null;
  },
};