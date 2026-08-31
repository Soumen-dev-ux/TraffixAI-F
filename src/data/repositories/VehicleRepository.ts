import {Vehicle} from "../../domain/models/Vehicle";

export interface VehicleRepository {
  searchVehicle(
    plateNumber: string
  ): Promise<Vehicle | null>;
}