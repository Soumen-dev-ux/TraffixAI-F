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
  {
    vehicleId: "VH_002",
    plateNumber: "WB06CD5678",
    vehicleType: "motorcycle",
    detections: [
      {
        id: "DET_005",
        cameraId: "CAM_005",
        cameraName: "Gariahat Junction",
        latitude: 22.5186,
        longitude: 88.3654,
        detectedAt: "10:20:10",
      },
      {
        id: "DET_006",
        cameraId: "CAM_001",
        cameraName: "Park Street Junction",
        latitude: 22.5535,
        longitude: 88.3525,
        detectedAt: "10:35:40",
      },
      {
        id: "DET_007",
        cameraId: "CAM_002",
        cameraName: "Esplanade Crossing",
        latitude: 22.5646,
        longitude: 88.3512,
        detectedAt: "10:45:32",
      },
    ],
  },
  {
    vehicleId: "VH_003",
    plateNumber: "WB24EF9012",
    vehicleType: "bus",
    detections: [
      {
        id: "DET_008",
        cameraId: "CAM_004",
        cameraName: "Howrah Bridge",
        latitude: 22.5958,
        longitude: 88.3476,
        detectedAt: "10:15:00",
      },
      {
        id: "DET_009",
        cameraId: "CAM_003",
        cameraName: "Salt Lake Sector V",
        latitude: 22.5769,
        longitude: 88.4331,
        detectedAt: "10:48:05",
      },
    ],
  },
  {
    vehicleId: "VH_004",
    plateNumber: "WB18GH3456",
    vehicleType: "truck",
    detections: [
      {
        id: "DET_010",
        cameraId: "CAM_001",
        cameraName: "Park Street Junction",
        latitude: 22.5535,
        longitude: 88.3525,
        detectedAt: "10:05:12",
      },
      {
        id: "DET_011",
        cameraId: "CAM_004",
        cameraName: "Howrah Bridge",
        latitude: 22.5958,
        longitude: 88.3476,
        detectedAt: "10:51:21",
      },
    ],
  },
];

export const vehicleTrajectoryApi = {
  async getTrajectory(plateNumber: string): Promise<VehicleTrajectory | null> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cleanQuery = plateNumber.replace(/[\s-]/g, "").toLowerCase();
    if (!cleanQuery) return null;

    const trajectory = dummyTrajectories.find((item) => {
      const cleanPlate = item.plateNumber.replace(/[\s-]/g, "").toLowerCase();
      return cleanPlate === cleanQuery || cleanPlate.includes(cleanQuery);
    });

    return trajectory || null;
  },
};