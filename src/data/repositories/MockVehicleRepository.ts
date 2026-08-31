import { Vehicle } from "../../domain/models/Vehicle";
import { vehicleApi } from "../api/VehicleApi";
import { VehicleRepository } from "./VehicleRepository";

export class MockVehicleRepository
  implements VehicleRepository {

  async searchVehicle(
    plateNumber: string
  ): Promise<Vehicle | null> {

    return await vehicleApi.searchVehicle(
      plateNumber
    );
  }
}