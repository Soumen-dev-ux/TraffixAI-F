import {Camera} from "../../domain/models/Camera";
import { CameraRepository } from "./CameraRepository";
import { mockCameras } from "../api/mockCameraData";

export class MockCameraRepository implements CameraRepository {
  async getCameras(): Promise<Camera[]> {
      return mockCameras;
  }
}