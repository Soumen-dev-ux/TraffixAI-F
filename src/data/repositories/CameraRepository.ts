import {Camera} from "../../domain/models/Camera";

export interface CameraRepository {
  getCameras() : Promise<Camera[]>;
}