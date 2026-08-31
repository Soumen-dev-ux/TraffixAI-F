import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";

import CityMap from "../components/CityMap";
import CameraBottomSheet from "../components/CameraBottomSheet";

import { Camera } from "../../domain/models/Camera";
import { MockCameraRepository } from "../../data/repositories/MockCameraRepository";
import { GetCameras } from "../../domain/usecases/GetCameras";

export default function DashboardScreen() {
  // Camera data
  const [cameras, setCameras] = useState<Camera[]>([]);

  // Selected camera
  const [selectedCamera, setSelectedCamera] =
    useState<Camera | null>(null);

  // Camera popup visibility
  const [cameraVisible, setCameraVisible] =
    useState(false);

  // Load cameras
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const repository = new MockCameraRepository();

        const getCameras = new GetCameras(repository);

        const data = await getCameras.execute();

        setCameras(data);
      } catch (error) {
        console.error("Failed to load cameras:", error);
      }
    };

    loadCameras();
  }, []);

  // Camera marker pressed
  const handleCameraPress = (camera: Camera) => {
    setSelectedCamera(camera);
    setCameraVisible(true);
  };

  // Close camera popup
  const handleCloseCamera = () => {
    setCameraVisible(false);
    setSelectedCamera(null);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            TraffixAI
          </Text>

          <Text style={styles.subtitle}>
            City Traffic Intelligence
          </Text>
        </View>

        <View style={styles.profile}>
          <Text>👤</Text>
        </View>
      </View>

      {/* Vehicle Search */}
      <TextInput
        style={styles.search}
        placeholder="Search vehicle number..."
        placeholderTextColor="#888"
      />

      {/* City Map */}
      <View style={styles.mapContainer}>
        <CityMap
          cameras={cameras}
          onCameraPress={handleCameraPress}
        />
      </View>

      {/* Statistics */}
      <View style={styles.stats}>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {cameras.length}
          </Text>

          <Text style={styles.statLabel}>
            Cameras
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            1240
          </Text>

          <Text style={styles.statLabel}>
            Vehicles
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            HIGH
          </Text>

          <Text style={styles.statLabel}>
            Traffic
          </Text>
        </View>

      </View>

      {/* Camera Details Popup */}
      <CameraBottomSheet
        visible={cameraVisible}
        camera={selectedCamera}
        onClose={handleCloseCamera}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  logo: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#777",
    marginTop: 3,
  },

  profile: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e5e5e5",
    justifyContent: "center",
    alignItems: "center",
  },

  search: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 15,
  },

  mapContainer: {
    flex: 1,
    minHeight: 400,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 15,
  },

  stats: {
    flexDirection: "row",
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },

  statLabel: {
    marginTop: 5,
    color: "#777",
  },
});
