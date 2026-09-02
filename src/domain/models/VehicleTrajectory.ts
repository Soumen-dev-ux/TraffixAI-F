import { VehicleType } from "./Vehicle";

export type VehicleDetection = {
  id: string;
  cameraId: string;
  cameraName: string;
  latitude: number;
  longitude: number;
  detectedAt: string;
};

export type VehicleTrajectory = {
  vehicleId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  detections: VehicleDetection[];
};