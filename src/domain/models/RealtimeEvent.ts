export type RealtimeEventType =
  | "camera_status"
  | "vehicle_detection"
  | "traffic_update"
  | "camera_added"
  | "camera_deleted"
  | "cameras_reset"
  | "security_alert";

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

    cameraName?: string;
    latitude?: number;
    longitude?: number;
    trajectory?: any;
    [key: string]: any;
  };
};