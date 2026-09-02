import { VehicleTrajectory } from "../models/VehicleTrajectory";
import { VehicleTrajectoryRepository } from "../../data/repositories/VehicleTrajectoryRepository";

export class GetVehicleTrajectory {
  constructor(
    private repository: VehicleTrajectoryRepository
  ) {}

  async execute(
    plateNumber: string
  ): Promise<VehicleTrajectory | null> {
    if (!plateNumber.trim()) {
      return null;
    }

    const trajectory =
      await this.repository.getTrajectory(
        plateNumber
      );

    if (!trajectory) {
      return null;
    }

    // Always keep detections in chronological order.
    const sortedDetections = [
      ...trajectory.detections,
    ].sort((a, b) =>
      a.detectedAt.localeCompare(b.detectedAt)
    );

    return {
      ...trajectory,
      detections: sortedDetections,
    };
  }
}

