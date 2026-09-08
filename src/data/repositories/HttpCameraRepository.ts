import { Camera } from "../../domain/models/Camera";
import { CameraRepository } from "./CameraRepository";
import { CameraApi } from "../api/CameraApi";

export class HttpCameraRepository implements CameraRepository {
  async getCameras(): Promise<Camera[]> {
    return CameraApi.getCameras();
  }
}
