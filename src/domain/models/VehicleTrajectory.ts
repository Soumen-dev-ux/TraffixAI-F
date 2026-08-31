export type VehicleDetection = {
  id : string;
  cameraId : string;
  cameraName : string;
  latitude : number;
  longitude : number;
  detectedAt: string;
};

export type VehicleTrajectory = {
  vehicleId : string;
  plateNumber: string;
  vehicleType:
    | "car"
    | "motorcycle"
    | "bus"
    | "track"
    | "van"
    | "taxi";

  detections: VehicleDetection[];
};