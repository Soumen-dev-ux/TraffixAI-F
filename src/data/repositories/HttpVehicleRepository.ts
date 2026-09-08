import { Vehicle } from "../../domain/models/Vehicle";
import { VehicleRepository } from "./VehicleRepository";
import { vehicleApi } from "../api/VehicleApi";

export class HttpVehicleRepository implements VehicleRepository {
  async searchVehicle(plateNumber: string): Promise<Vehicle | null> {
    return vehicleApi.searchVehicle(plateNumber);
  }
}
