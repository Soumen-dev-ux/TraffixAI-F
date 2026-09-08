import { Camera } from "../../domain/models/Camera";

const cameras: Camera[] = [
  {
    id: "CAM_001",
    name: "Park Street Junction",
    latitude: 22.5535,
    longitude: 88.3525,
    status: "online",
    fps: 24,
    vehicleCount: 18,
    trafficLevel: "moderate",
    detectedVehicles: {
      car: 12,
      motorcycle: 3,
      bus: 2,
      truck: 1,
      van: 0,
      taxi: 0,
    },
  },

  {
    id: "CAM_002",
    name: "Esplanade Crossing",
    latitude: 22.5646,
    longitude: 88.3512,
    status: "online",
    fps: 30,
    vehicleCount: 27,
    trafficLevel: "high",
    detectedVehicles: {
      car: 16,
      motorcycle: 6,
      bus: 3,
      truck: 1,
      van: 1,
      taxi: 0,
    },
  },

  {
    id: "CAM_003",
    name: "Salt Lake Sector V",
    latitude: 22.5769,
    longitude: 88.4331,
    status: "online",
    fps: 25,
    vehicleCount: 11,
    trafficLevel: "low",
    detectedVehicles: {
      car: 7,
      motorcycle: 2,
      bus: 1,
      truck: 0,
      van: 1,
      taxi: 0,
    },
  },

  {
    id: "CAM_004",
    name: "Howrah Bridge",
    latitude: 22.5958,
    longitude: 88.3476,
    status: "online",
    fps: 24,
    vehicleCount: 35,
    trafficLevel: "critical",
    detectedVehicles: {
      car: 18,
      motorcycle: 8,
      bus: 4,
      truck: 3,
      van: 1,
      taxi: 1,
    },
  },

  {
    id: "CAM_005",
    name: "Gariahat Junction",
    latitude: 22.5186,
    longitude: 88.3654,
    status: "offline",
    fps: 0,
    vehicleCount: 0,
    trafficLevel: "low",
    detectedVehicles: {
      car: 0,
      motorcycle: 0,
      bus: 0,
      truck: 0,
      van: 0,
      taxi: 0,
    },
  },
];

import { apiClient } from "./apiClient";

export const CameraApi = {
  defaultCameras: cameras,
  async getCameras(): Promise<Camera[]> {
    const res = await apiClient.get<{ cameras?: Camera[] } | Camera[]>('/api/v1/cameras');
    if (res.isLive && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data as any).cameras;
      if (Array.isArray(list)) {
        return list.map((c: any) => ({
          ...c,
          id: c.camera_id || c.id,
          vehicleCount: c.vehicle_count !== undefined ? c.vehicle_count : c.vehicleCount || 0,
          trafficLevel: c.traffic_level || c.trafficLevel || 'low',
          streamUrl: c.stream_url || c.streamUrl || '/videos/sample_traffic.mp4',
        }));
      }
    }
    return cameras;
  },

  async createCamera(cameraData: {
    name: string;
    latitude: number;
    longitude: number;
    direction?: string;
    stream_url?: string;
    camera_id?: string;
  }): Promise<Camera> {
    const res = await apiClient.post<any, any>('/api/v1/cameras', cameraData);
    if (res.isLive && res.data) {
      const c = res.data as any;
      return {
        id: c.camera_id || c.id,
        name: c.name || cameraData.name,
        latitude: Number(c.latitude || cameraData.latitude),
        longitude: Number(c.longitude || cameraData.longitude),
        direction: c.direction || cameraData.direction || 'Northbound',
        status: (c.status || 'online') as 'online' | 'offline',
        fps: c.fps || 25,
        vehicleCount: c.vehicle_count || 0,
        trafficLevel: c.traffic_level || 'low',
        streamUrl: c.stream_url || cameraData.stream_url || '/videos/sample_traffic.mp4',
        detectedVehicles: c.detected_vehicles || { car: 0, motorcycle: 0, bus: 0, truck: 0, van: 0, taxi: 0 },
      };
    }
    const newId = cameraData.camera_id || `CAM_${String(cameras.length + 1).padStart(3, '0')}`;
    const fallback: Camera = {
      id: newId,
      name: cameraData.name,
      latitude: cameraData.latitude,
      longitude: cameraData.longitude,
      direction: cameraData.direction || 'Northbound',
      status: 'online',
      fps: 25,
      vehicleCount: 0,
      trafficLevel: 'low',
      streamUrl: cameraData.stream_url || '/videos/sample_traffic.mp4',
      detectedVehicles: { car: 0, motorcycle: 0, bus: 0, truck: 0, van: 0, taxi: 0 },
    };
    cameras.push(fallback);
    return fallback;
  },

  async deleteCamera(cameraId: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/api/v1/cameras/${cameraId}`);
    const idx = cameras.findIndex((c) => c.id === cameraId);
    if (idx !== -1) {
      cameras.splice(idx, 1);
    }
    return res.isLive ? !!res.data?.deleted : true;
  },

  async resetCameras(mode: 'clear' | 'reset' = 'reset'): Promise<Camera[]> {
    const res = await apiClient.post<any, any>('/api/v1/cameras/reset', { mode });
    if (res.isLive && (res.data as any)?.cameras) {
      return (res.data as any).cameras.map((c: any) => ({
        id: c.camera_id || c.id,
        name: c.name,
        latitude: Number(c.latitude),
        longitude: Number(c.longitude),
        direction: c.direction || 'Northbound',
        status: (c.status || 'online') as 'online' | 'offline',
        fps: c.fps || 25,
        vehicleCount: c.vehicle_count !== undefined ? c.vehicle_count : c.vehicleCount || 0,
        trafficLevel: c.traffic_level || c.trafficLevel || 'low',
        streamUrl: c.stream_url || '/videos/sample_traffic.mp4',
        detectedVehicles: c.detected_vehicles || { car: 0, motorcycle: 0, bus: 0, truck: 0, van: 0, taxi: 0 },
      }));
    }
    if (mode === 'clear') {
      cameras.length = 0;
      return [];
    }
    return cameras;
  },

  async dispatchDetection(params: {
    cameraId: string;
    plateNumber: string;
    vehicleType?: string;
    color?: string;
  }): Promise<any> {
    const payload = {
      event_id: `evt_ui_${Date.now()}`,
      camera_id: params.cameraId,
      plate_number: params.plateNumber,
      vehicle_type: params.vehicleType || 'car',
      color: params.color || 'White',
      observed_at: new Date().toISOString(),
      vehicle_confidence: 0.98,
      bounding_box: { x1: 100, y1: 150, x2: 300, y2: 320 },
    };
    return apiClient.post('/api/v1/events/detection', payload);
  },
};