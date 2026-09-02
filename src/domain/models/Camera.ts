export type TrafficLevel = "low" | "moderate" | "high" | "critical";

export type Camera = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;

  status: "online" | "offline";

  fps: number;

  vehicleCount: number;

  trafficLevel: TrafficLevel;

  detectedVehicles: {
    car: number;
    motorcycle: number;
    bus: number;
    truck: number;
    van: number;
    taxi: number;
  };
};