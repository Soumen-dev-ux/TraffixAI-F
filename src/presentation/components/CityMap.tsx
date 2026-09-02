import MapView, {
  Marker,
  Polyline,
} from "react-native-maps";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useEffect,
  useRef,
} from "react";

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

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
    width: "100%",
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

    justifyContent: "center",
    alignItems: "center",

    elevation: 4,
  },

  latestMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  detectionNumber: {
    fontSize: 12,
    fontWeight: "700",
  },

  legend: {
    position: "absolute",

    bottom: 15,
    left: 15,

    flexDirection: "row",

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
  },

  routeIndicator: {
    width: 20,
    height: 4,
    borderRadius: 2,

    marginRight: 5,
  },
});
