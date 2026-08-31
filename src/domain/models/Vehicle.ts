export type VehicleType =
  | "car"
  | "motorcycle"
  | "bus"
  | "truck"
  | "van"
  | "taxi";

export type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  color: string;
  cameraId: string;
  cameraName: string;
  latitude: number;
  longitude: number;
  detectedAt: string;
};