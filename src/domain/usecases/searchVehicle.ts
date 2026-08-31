import { Vehicle } from "../models/Vehicle";
import { VehicleRepository } from "../../data/repositories/VehicleRepository";

export class SearchVehicle {

  constructor(
    private vehicleRepository: VehicleRepository
  ) {}

  async execute(
    plateNumber: string
  ): Promise<Vehicle | null> {

    if (!plateNumber.trim()) {
      return null;
    }

    return await this.vehicleRepository.searchVehicle(
      plateNumber
    );
  }
}