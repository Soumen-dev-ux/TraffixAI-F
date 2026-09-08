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

    // Fallback to local high-fidelity mock data
    const vehicle = dummyVehicles.find((item) => {
      const cleanPlate = item.plateNumber.replace(/[\s-]/g, "").toUpperCase();
      return cleanPlate === cleanQuery || cleanPlate.includes(cleanQuery);
    });

    return vehicle || null;
  },
};