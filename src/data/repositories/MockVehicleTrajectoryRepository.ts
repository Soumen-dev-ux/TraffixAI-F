import { VehicleTrajectory } from "@/src/domain/models/VehicleTrajectory";
import { vehicleTrajectoryApi } from "../api/VehicleTrajectoryApi";
import { VehicleTrajectoryRepository } from "./VehicleTrajectoryRepository";

export class MockVehicleTrajectoryRepository implements VehicleTrajectoryRepository {
  async getTrajectory(plateNumber: string): Promise<VehicleTrajectory | null> {
    return await vehicleTrajectoryApi.getTrajectory(
    plateNumber
  );
  }
}