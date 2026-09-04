import { Camera } from "../../domain/models/Camera";
import { HeatmapPoint } from "../../domain/models/HeatmapPoint";

// Base junction hotspots in the city (Kolkata region)
const BASE_HOTSPOTS: HeatmapPoint[] = [
  // Junction A area (Park Circus Connector)
  { latitude: 22.5726, longitude: 88.3639, weight: 0.9 },
  { latitude: 22.573, longitude: 88.3645, weight: 0.75 },
  { latitude: 22.572, longitude: 88.3632, weight: 0.8 },
  { latitude: 22.5715, longitude: 88.365, weight: 0.65 },

  // Junction B area (Salt Lake / Sector V)
  { latitude: 22.575, longitude: 88.37, weight: 1.0 },
  { latitude: 22.5758, longitude: 88.3712, weight: 0.85 },
  { latitude: 22.5742, longitude: 88.3688, weight: 0.9 },
  { latitude: 22.5765, longitude: 88.3725, weight: 0.7 },

  // Junction C area (Esplanade / Park Street)
  { latitude: 22.568, longitude: 88.355, weight: 0.4 },
  { latitude: 22.5672, longitude: 88.3562, weight: 0.35 },
  { latitude: 22.569, longitude: 88.354, weight: 0.5 },

  // Howrah Station Corridor
  { latitude: 22.583, longitude: 88.343, weight: 0.95 },
  { latitude: 22.582, longitude: 88.3445, weight: 0.8 },
  { latitude: 22.584, longitude: 88.3418, weight: 0.85 },

  // E.M. Bypass Corridor
  { latitude: 22.561, longitude: 88.395, weight: 0.88 },
  { latitude: 22.564, longitude: 88.393, weight: 0.75 },
  { latitude: 22.558, longitude: 88.398, weight: 0.82 },

  // Gariahat Junction
  { latitude: 22.518, longitude: 88.367, weight: 0.7 },
  { latitude: 22.519, longitude: 88.368, weight: 0.6 },
  { latitude: 22.517, longitude: 88.366, weight: 0.65 },

  // Sealdah Flyover
  { latitude: 22.566, longitude: 88.371, weight: 0.92 },
  { latitude: 22.565, longitude: 88.372, weight: 0.85 },
];

/**
 * Dynamically generates heatmap points based on active cameras and ambient city traffic hotspots.
 */
export function getTrafficHeatmapPoints(cameras: Camera[]): HeatmapPoint[] {
  const points: HeatmapPoint[] = [...BASE_HOTSPOTS];

  // Incorporate live camera vehicle density into heatmap clusters
  cameras.forEach((camera) => {
    let weight = 0.5;
    if (camera.trafficLevel === "critical") weight = 1.0;
    else if (camera.trafficLevel === "high") weight = 0.85;
    else if (camera.trafficLevel === "moderate") weight = 0.6;
    else if (camera.trafficLevel === "low") weight = 0.3;

    // Adjust weight by actual vehicle count if present
    if (camera.vehicleCount > 0) {
      weight = Math.min(1.0, Math.max(0.2, camera.vehicleCount / 30));
    }

    // Add main point at camera center
    points.push({
      latitude: camera.latitude,
      longitude: camera.longitude,
      weight,
    });

    // Add surrounding micro-density points to create a smooth heat blob around camera
    const offsets = [
      [0.0012, 0.0008],
      [-0.001, -0.0014],
      [0.0015, -0.0006],
      [-0.0008, 0.0012],
      [0.0005, 0.0018],
      [-0.0016, 0.0004],
    ];

    offsets.forEach(([dLat, dLng]) => {
      points.push({
        latitude: camera.latitude + dLat,
        longitude: camera.longitude + dLng,
        weight: Math.max(0.15, weight * 0.7),
      });
    });
  });

  return points;
}
