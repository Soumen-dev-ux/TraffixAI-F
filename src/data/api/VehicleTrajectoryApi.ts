
import { VehicleTrajectory } from "../../domain/models/VehicleTrajectory";

const dummyTrajectories: VehicleTrajectory[] = [
  {
    vehicleId: "VH_001",
    plateNumber: "WB12AB1234",
    vehicleType: "car",

    detections: [
      {
        id: "DET_001",
        cameraId: "CAM_001",
        cameraName: "Park Street Junction",
        latitude: 22.5535,
        longitude: 88.3525,
        detectedAt: "10:12:05",
      },
      {
        id: "DET_002",
        cameraId: "CAM_002",
        cameraName: "Esplanade Crossing",
        latitude: 22.5646,
        longitude: 88.3512,
        detectedAt: "10:18:42",
      },
      {
        id: "DET_003",
        cameraId: "CAM_004",
        cameraName: "Howrah Bridge",
        latitude: 22.5958,
        longitude: 88.3476,
        detectedAt: "10:27:18",
      },
      {
        id: "DET_004",
        cameraId: "CAM_003",
        cameraName: "Salt Lake Sector V",
        latitude: 22.5769,
        longitude: 88.4331,
        detectedAt: "10:41:33",
      },
    ],
  },
];

export const vehicleTrajectoryApi = {
  async getTrajectory(
    plateNumber: string
  ): Promise<VehicleTrajectory | null> {
    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    const trajectory = dummyTrajectories.find(
      (item) =>
        item.plateNumber.toLowerCase() ===
        plateNumber.trim().toLowerCase()
    );

    return trajectory || null;
  },
};