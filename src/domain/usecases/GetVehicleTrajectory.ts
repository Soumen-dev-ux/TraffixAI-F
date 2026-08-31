import { VehicleTrajectory } from "../models/VehicleTrajectory";
import { VehicleTrajectoryRepository } from "@/src/data/repositories/VehicleTrajectoryRepository";

export class GetVehicleTrajectory {
  constructor(
    private repository: VehicleTrajectoryRepository
  ) {}
  async execute(
    plateNumber: string
  ) : Promise<VehicleTrajectory | null> {
    if (!plateNumber.trim()){
      return null;
    }
    return await this.repository.getTrajectory(
      plateNumber
    );
  }
}