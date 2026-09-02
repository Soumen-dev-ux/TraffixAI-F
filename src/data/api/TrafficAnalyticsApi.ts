import { TrafficAnalytics } from "../../domain/models/TrafficAnalytics";

export const TrafficAnalyticsApi = {
  async getAnalytics(): Promise<TrafficAnalytics> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    return {
      totalVehicles: 91,

      activeCameras: 4,

      totalCameras: 5,

      congestionLevel: "high",

      vehicleDistribution: {
        car: 53,
        motorcycle: 19,
        bus: 10,
        truck: 6,
        van: 2,
        taxi: 1,
      },

      cameraTraffic: [
        {
          cameraId: "CAM_001",
          cameraName: "Park Street Junction",
          vehicleCount: 18,
          congestionLevel: "moderate",
        },

        {
          cameraId: "CAM_002",
          cameraName: "Esplanade Crossing",
          vehicleCount: 27,
          congestionLevel: "high",
        },

        {
          cameraId: "CAM_003",
          cameraName: "Salt Lake Sector V",
          vehicleCount: 11,
          congestionLevel: "low",
        },

        {
          cameraId: "CAM_004",
          cameraName: "Howrah Bridge",
          vehicleCount: 35,
          congestionLevel: "critical",
        },

        {
          cameraId: "CAM_005",
          cameraName: "Gariahat Junction",
          vehicleCount: 0,
          congestionLevel: "low",
        },
      ],

      hourlyTraffic: [
        {
          hour: "08:00",
          vehicleCount: 32,
        },
        {
          hour: "09:00",
          vehicleCount: 48,
        },
        {
          hour: "10:00",
          vehicleCount: 67,
        },
        {
          hour: "11:00",
          vehicleCount: 74,
        },
        {
          hour: "12:00",
          vehicleCount: 81,
        },
        {
          hour: "13:00",
          vehicleCount: 91,
        },
      ],
    };
  },
};