import { Camera } from "../models/Camera";
import { CameraRepository } from "../../data/repositories/CameraRepository";

export class GetCameras {
  constructor(
    private cameraRepository: CameraRepository
  ) {}

  async execute(): Promise<Camera[]>{
    return await this.cameraRepository.getCameras();
  }
}