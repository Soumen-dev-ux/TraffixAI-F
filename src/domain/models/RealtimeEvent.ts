export type RealtimeEventType =
  | "camera_status"
  | "vehicle_detection"
  | "traffic_update";

export type RealtimeEvent = {
  id: string;
  type: RealtimeEventType;
  timestamp: string;

  data: {
    cameraId?: string;
    status?: "online" | "offline";

    vehicleId?: string;
    plateNumber?: string;
    vehicleType?:
      | "car"
      | "motorcycle"
      | "bus"
      | "truck"
      | "van"
      | "taxi";

    vehicleCount?: number;
    congestionLevel?:
      | "low"
      | "moderate"
      | "high"
      | "critical";
  };
};