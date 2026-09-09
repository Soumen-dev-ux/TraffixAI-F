import { VehicleTrajectory } from "../../domain/models/VehicleTrajectory";
import { apiClient } from "./apiClient";

export const vehicleTrajectoryApi = {
  async getTrajectory(plateNumber: string): Promise<VehicleTrajectory | null> {
    const cleanQuery = plateNumber.replace(/[\s-]/g, "").toUpperCase();
    if (!cleanQuery) return null;

    // Try live backend trajectory endpoint
    const res = await apiClient.get<any>(`/api/v1/vehicles/${encodeURIComponent(cleanQuery)}/trajectory`);
    if (res.isLive && res.data && Array.isArray(res.data.points) && res.data.points.length > 0) {
      return {
        vehicleId: res.data.vehicle_id || `VH_${cleanQuery}`,
        plateNumber: cleanQuery,
        vehicleType: res.data.vehicle_type || 'car',
        detections: res.data.points.map((pt: any, index: number) => ({
          id: pt.event_id || `DET_${index + 1}`,
          cameraId: pt.camera_id || `CAM_00${(index % 5) + 1}`,
          cameraName: pt.camera_name || `Junction Camera ${index + 1}`,
          latitude: Number(pt.latitude || pt.lat || 22.5535),
          longitude: Number(pt.longitude || pt.lng || 88.3525),
          detectedAt: pt.timestamp || pt.detected_at || new Date().toLocaleTimeString(),
        })),
      };
    }

    // Clean slate: no fake fallback data. Return null if no detections in DB.
    return null;
  },
};