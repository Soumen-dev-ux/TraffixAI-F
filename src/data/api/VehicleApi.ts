import { Vehicle } from "../../domain/models/Vehicle";
import { apiClient } from "./apiClient";

export const vehicleApi = {
  async searchVehicle(plateNumber: string): Promise<Vehicle | null> {
    const cleanQuery = plateNumber.replace(/[\s-]/g, "").toUpperCase();
    if (!cleanQuery) return null;

    // Try live backend search first
    const res = await apiClient.get<{ vehicles?: any[] } | any>(`/api/v1/vehicles/search?plate_number=${encodeURIComponent(cleanQuery)}`);
    if (res.isLive && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data as any).vehicles;
      if (Array.isArray(list) && list.length > 0) {
        const item = list[0];
        return {
          id: item.vehicle_id || item.id || `VH_${item.plate_number}`,
          plateNumber: item.plate_number || item.plateNumber || cleanQuery,
          vehicleType: item.vehicle_type || item.vehicleType || 'car',
          color: item.color || 'White',
          cameraId: item.camera_id || item.cameraId || 'CAM_001',
          cameraName: item.camera_name || item.cameraName || 'Park Street Junction',
          latitude: Number(item.latitude || 22.5535),
          longitude: Number(item.longitude || 88.3525),
          detectedAt: item.detected_at || item.detectedAt || new Date().toLocaleTimeString(),
        };
      }
    }

    // Clean slate: no fake fallback vehicles. Return null if not in DB.
    return null;
  },
};