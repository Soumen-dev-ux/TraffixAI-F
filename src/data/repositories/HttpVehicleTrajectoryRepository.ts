import { VehicleTrajectory } from "@/src/domain/models/VehicleTrajectory";
import { VehicleTrajectoryRepository } from "./VehicleTrajectoryRepository";
import { vehicleTrajectoryApi } from "../api/VehicleTrajectoryApi";

export class HttpVehicleTrajectoryRepository implements VehicleTrajectoryRepository {
  async getTrajectory(plateNumber: string): Promise<VehicleTrajectory | null> {
    return vehicleTrajectoryApi.getTrajectory(plateNumber);
  }
}
