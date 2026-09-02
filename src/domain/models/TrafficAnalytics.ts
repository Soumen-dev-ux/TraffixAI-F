export type TrafficAnalytics = {
  totalVehicles: number;
  activeCameras: number;
  totalCameras: number;

  congestionLevel: "low" | "moderate" | "high" | "critical";

  vehicleDistribution: {
    car: number;
    motorcycle: number;
    bus: number;
    truck: number;
    van: number;
    taxi: number;
  };

  cameraTraffic: {
    cameraId: string;
    cameraName: string;
    vehicleCount: number;
    congestionLevel: "low" | "moderate" | "high" | "critical";
  }[];

  hourlyTraffic: {
    hour: string;
    vehicleCount: number;
  }[];
};