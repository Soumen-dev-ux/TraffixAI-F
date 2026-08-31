import { VehicleTrajectory } from "@/src/domain/models/VehicleTrajectory";

export interface VehicleTrajectoryRepository {
  getTrajectory(
    plateNumber : string
  ): Promise<VehicleTrajectory | null>;
}