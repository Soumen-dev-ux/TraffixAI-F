import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { Camera } from "../../domain/models/Camera";
import { Vehicle } from "../../domain/models/Vehicle";
import { VehicleTrajectory } from "../../domain/models/VehicleTrajectory";

type Props = {
  cameras: Camera[];
  vehicle: Vehicle | null;
  trajectory: VehicleTrajectory | null;
  onCameraPress: (camera: Camera) => void;
};

function getVehicleEmoji(type: Vehicle["vehicleType"]) {
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

  // Focus map on searched vehicle
  useEffect(() => {
    if (!vehicle || !mapRef.current) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800,
    );
  }, [vehicle]);

  return (
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
      {/* CCTV Cameras */}
      {cameras.map((camera) => (
        <Marker
          key={camera.id}
          coordinate={{
            latitude: camera.latitude,
            longitude: camera.longitude,
          }}
          title={camera.name}
          description={camera.id}
          onPress={() => onCameraPress(camera)}
        >
          <View style={styles.cameraMarker}>
            <Text style={styles.cameraEmoji}>📹</Text>
          </View>
        </Marker>
      ))}

      {/* Searched Vehicle */}
      {vehicle && (
        <Marker
          key={vehicle.id}
          coordinate={{
            latitude: vehicle.latitude,
            longitude: vehicle.longitude,
          }}
          title={vehicle.plateNumber}
          description={`${vehicle.color} ${vehicle.vehicleType}`}
        >
          <View style={styles.vehicleMarker}>
            <Text style={styles.vehicleEmoji}>
              {getVehicleEmoji(vehicle.vehicleType)}
            </Text>
          </View>
        </Marker>
      )}

      {trajectory && trajectory.detections.length > 1 && (
        <Polyline
          coordinates={trajectory.detections.map((detection) => ({
            latitude: detection.latitude,
            longitude: detection.longitude,
          }))}
          strokeWidth={4}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
  },

  cameraMarker: {
    backgroundColor: "#ffffff",
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
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  vehicleEmoji: {
    fontSize: 28,
  },
});
