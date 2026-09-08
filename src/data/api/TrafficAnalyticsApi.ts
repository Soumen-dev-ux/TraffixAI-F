import { TrafficAnalytics } from "../../domain/models/TrafficAnalytics";
import { apiClient } from "./apiClient";

const defaultAnalytics: TrafficAnalytics = {
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
    { cameraId: "CAM_001", cameraName: "Park Street Junction", vehicleCount: 18, congestionLevel: "moderate" },
    { cameraId: "CAM_002", cameraName: "Esplanade Crossing", vehicleCount: 27, congestionLevel: "high" },
    { cameraId: "CAM_003", cameraName: "Salt Lake Sector V", vehicleCount: 11, congestionLevel: "low" },
    { cameraId: "CAM_004", cameraName: "Howrah Bridge", vehicleCount: 35, congestionLevel: "critical" },
    { cameraId: "CAM_005", cameraName: "Gariahat Junction", vehicleCount: 0, congestionLevel: "low" },
  ],
  hourlyTraffic: [
    { hour: "08:00", vehicleCount: 32 },
    { hour: "09:00", vehicleCount: 48 },
    { hour: "10:00", vehicleCount: 67 },
    { hour: "11:00", vehicleCount: 74 },
    { hour: "12:00", vehicleCount: 81 },
    { hour: "13:00", vehicleCount: 91 },
  ],
};

export const TrafficAnalyticsApi = {
  defaultAnalytics,
  async getAnalytics(): Promise<TrafficAnalytics> {
    const res = await apiClient.get<any>('/api/v1/analytics/overview');
    if (res.isLive && res.data) {
      return {
        totalVehicles: Number(res.data.total_vehicles || res.data.totalVehicles || 91),
        activeCameras: Number(res.data.active_cameras || res.data.activeCameras || 4),
        totalCameras: Number(res.data.total_cameras || res.data.totalCameras || 5),
        congestionLevel: res.data.congestion_level || res.data.congestionLevel || "high",
        vehicleDistribution: res.data.vehicle_distribution || res.data.vehicleDistribution || {
          car: 53,
          motorcycle: 19,
          bus: 10,
          truck: 6,
          van: 2,
          taxi: 1,
        },
        cameraTraffic: res.data.camera_traffic || res.data.cameraTraffic || defaultAnalytics.cameraTraffic,
        hourlyTraffic: res.data.hourly_traffic || res.data.hourlyTraffic || defaultAnalytics.hourlyTraffic,
      };
    }

    return defaultAnalytics;
  },
};