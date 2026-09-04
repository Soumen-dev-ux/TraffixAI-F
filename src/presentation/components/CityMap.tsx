import MapView, {
  Heatmap,
  Marker,
  Polyline,
} from "react-native-maps";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getTrafficHeatmapPoints } from "../../data/api/mockHeatmapData";
import { Camera } from "../../domain/models/Camera";
import { Vehicle } from "../../domain/models/Vehicle";
import { VehicleTrajectory } from "../../domain/models/VehicleTrajectory";

type Props = {
  cameras: Camera[];
  vehicle: Vehicle | null;
  trajectory: VehicleTrajectory | null;
  onCameraPress: (camera: Camera) => void;
};

function getVehicleEmoji(
  type: Vehicle["vehicleType"]
) {
  switch (type) {
    case "car":
      return "🚗";

    case "motorcycle":
      return "🏍️";

    case "bus":
      return "🚌";

    case "truck":
      return "🚚";

    case "van":
      return "🚐";

    case "taxi":
      return "🚕";

    default:
      return "🚗";
  }
}

export default function CityMap({
  cameras,
  vehicle,
  trajectory,
  onCameraPress,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const heatmapPoints = useMemo(() => {
    return getTrafficHeatmapPoints(cameras);
  }, [cameras]);

  /*
   * Focus on the searched vehicle
   */
  useEffect(() => {
    if (!vehicle || !mapRef.current) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      800
    );
  }, [vehicle]);

  /*
   * Fit the entire trajectory on the map
   */
  useEffect(() => {
    if (
      !trajectory ||
      trajectory.detections.length < 2 ||
      !mapRef.current
    ) {
      return;
    }

    const coordinates =
      trajectory.detections.map(
        (detection) => ({
          latitude: detection.latitude,
          longitude: detection.longitude,
        })
      );

    setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        coordinates,
        {
          edgePadding: {
            top: 100,
            right: 60,
            bottom: 100,
            left: 60,
          },
          animated: true,
        }
      );
    }, 500);
  }, [trajectory]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 22.5726,
          longitude: 88.3639,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* ========================= */}
        {/* TRAFFIC HEATMAP LAYER     */}
        {/* ========================= */}
        {showHeatmap && heatmapPoints.length > 0 && (
          <Heatmap
            points={heatmapPoints}
            opacity={0.7}
            radius={40}
            gradient={{
              colors: [
                "#3b82f6",
                "#06b6d4",
                "#10b981",
                "#f59e0b",
                "#ef4444",
              ],
              startPoints: [0.1, 0.35, 0.6, 0.8, 1.0],
              colorMapSize: 256,
            }}
          />
        )}

        {/* ========================= */}
        {/* CCTV CAMERA MARKERS       */}
        {/* ========================= */}
        {cameras.map((camera) => (
          <Marker
            key={`camera-${camera.id}`}
            coordinate={{
              latitude: camera.latitude,
              longitude: camera.longitude,
            }}
            title={camera.name}
            description={camera.id}
            onPress={() =>
              onCameraPress(camera)
            }
          >
            <View style={styles.cameraMarker}>
              <Text style={styles.cameraEmoji}>
                📹
              </Text>
            </View>
          </Marker>
        ))}

        {/* ========================= */}
        {/* VEHICLE TRAJECTORY         */}
        {/* ========================= */}
        {trajectory &&
          trajectory.detections.length > 1 && (
            <Polyline
              coordinates={trajectory.detections.map(
                (detection) => ({
                  latitude:
                    detection.latitude,
                  longitude:
                    detection.longitude,
                })
              )}
              strokeWidth={5}
              strokeColor="#2563eb"
              lineCap="round"
              lineJoin="round"
            />
          )}

        {/* ========================= */}
        {/* DETECTION MARKERS          */}
        {/* ========================= */}
        {trajectory?.detections.map(
          (detection, index) => {
            const isLatest =
              index ===
              trajectory.detections.length - 1;

            return (
              <Marker
                key={`detection-${detection.id}`}
                coordinate={{
                  latitude:
                    detection.latitude,
                  longitude:
                    detection.longitude,
                }}
                title={detection.cameraName}
                description={
                  detection.detectedAt
                }
              >
                <View
                  style={[
                    styles.detectionMarker,
                    isLatest &&
                      styles.latestMarker,
                  ]}
                >
                  <Text style={styles.detectionNumber}>
                    {index + 1}
                  </Text>
                </View>
              </Marker>
            );
          }
        )}

        {/* ========================= */}
        {/* CURRENT VEHICLE            */}
        {/* ========================= */}
        {vehicle && (
          <Marker
            key={`vehicle-${vehicle.id}`}
            coordinate={{
              latitude: vehicle.latitude,
              longitude: vehicle.longitude,
            }}
            title={vehicle.plateNumber}
            description={`${vehicle.color} ${vehicle.vehicleType}`}
          >
            <View style={styles.vehicleMarker}>
              <Text style={styles.vehicleEmoji}>
                {getVehicleEmoji(
                  vehicle.vehicleType
                )}
              </Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* =========================== */}
      {/* HEATMAP TOGGLE BUTTON       */}
      {/* =========================== */}
      <TouchableOpacity
        style={[
          styles.heatmapToggle,
          showHeatmap
            ? styles.heatmapToggleActive
            : styles.heatmapToggleInactive,
        ]}
        onPress={() => setShowHeatmap(!showHeatmap)}
        activeOpacity={0.8}
      >
        <Text style={styles.heatmapToggleEmoji}>🔥</Text>
        <Text
          style={[
            styles.heatmapToggleText,
            showHeatmap ? styles.textActive : styles.textInactive,
          ]}
        >
          {showHeatmap ? "Heatmap On" : "Heatmap Off"}
        </Text>
      </TouchableOpacity>

      {/* =========================== */}
      {/* MAP LEGEND                  */}
      {/* =========================== */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>
            📹
          </Text>
          <Text style={styles.legendText}>
            CCTV
          </Text>
        </View>

        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>
            {vehicle
              ? getVehicleEmoji(
                  vehicle.vehicleType
                )
              : "🚗"}
          </Text>
          <Text style={styles.legendText}>
            Vehicle
          </Text>
        </View>

        {trajectory &&
          trajectory.detections.length > 0 && (
            <View style={styles.legendItem}>
              <View style={styles.routeIndicator} />
              <Text style={styles.legendText}>
                Route
              </Text>
            </View>
          )}

        {showHeatmap && (
          <View style={[styles.legendItem, styles.heatmapLegendItem]}>
            <Text style={styles.densityLabel}>Low</Text>
            <View style={styles.heatColorBar}>
              <View style={[styles.heatDot, { backgroundColor: "#3b82f6" }]} />
              <View style={[styles.heatDot, { backgroundColor: "#10b981" }]} />
              <View style={[styles.heatDot, { backgroundColor: "#f59e0b" }]} />
              <View style={[styles.heatDot, { backgroundColor: "#ef4444" }]} />
            </View>
            <Text style={styles.densityLabel}>High</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  heatmapToggle: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    zIndex: 10,
  },
  heatmapToggleActive: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  heatmapToggleInactive: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  heatmapToggleEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  heatmapToggleText: {
    fontSize: 13,
    fontWeight: "700",
  },
  textActive: {
    color: "#f59e0b",
  },
  textInactive: {
    color: "#64748b",
  },
  cameraMarker: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  cameraEmoji: {
    fontSize: 24,
  },
  vehicleMarker: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 6,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  vehicleEmoji: {
    fontSize: 30,
  },
  detectionMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  latestMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderColor: "#dc2626",
  },
  detectionNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e40af",
  },
  legend: {
    position: "absolute",
    bottom: 15,
    left: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    zIndex: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  legendEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
  },
  routeIndicator: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2563eb",
    marginRight: 5,
  },
  heatmapLegendItem: {
    borderLeftWidth: 1,
    borderLeftColor: "#cbd5e1",
    paddingLeft: 10,
    marginRight: 0,
  },
  densityLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  heatColorBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
    gap: 2,
  },
  heatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
