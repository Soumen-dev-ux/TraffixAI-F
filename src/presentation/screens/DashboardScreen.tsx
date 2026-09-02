import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import CameraBottomSheet from "../components/CameraBottomSheet";
import CityMap from "../components/CityMap";

import { MockVehicleRepository } from "@/src/data/repositories/MockVehicleRepository";
import { Vehicle } from "@/src/domain/models/Vehicle";
import { VehicleTrajectory } from "@/src/domain/models/VehicleTrajectory";
import { GetVehicleTrajectory } from "@/src/domain/usecases/GetVehicleTrajectory";
import { SearchVehicle } from "@/src/domain/usecases/searchVehicle";
import { MockCameraRepository } from "../../data/repositories/MockCameraRepository";
import { MockVehicleTrajectoryRepository } from "../../data/repositories/MockVehicleTrajectoryRepository";
import { Camera } from "../../domain/models/Camera";
import { GetCameras } from "../../domain/usecases/GetCameras";
import VehicleResultCard from "../components/VehicleResultcard";
import VehicleSearch from "../components/VehicleSearch";
import VehicleDetails from "../components/VehicleDetails";

export default function DashboardScreen() {
  // Camera data
  const [cameras, setCameras] = useState<Camera[]>([]);

  // Selected camera
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  // Camera popup visibility
  const [cameraVisible, setCameraVisible] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [vehicleLoading, setVehicleLoading] = useState(false);

  const [vehicleError, setVehicleError] = useState("");
  const [trajectory, setTrajectory] = useState<VehicleTrajectory | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  //search function

  const handleVehicleSearch = async () => {
    if (!searchText.trim()) {
      setVehicleError("Enter a vehicle number");
      return;
    }

    setVehicleLoading(true);
    setVehicleError("");
    setVehicle(null);

    try {
      const repository = new MockVehicleRepository();

      const searchVehicle = new SearchVehicle(repository);

      const result = await searchVehicle.execute(searchText);

      if (result) {
        setVehicle(result);

        const trajectoryRepository = new MockVehicleTrajectoryRepository();

        const getVehicleTrajectory = new GetVehicleTrajectory(
          trajectoryRepository,
        );

        const trajectoryResult = await getVehicleTrajectory.execute(searchText);

        setTrajectory(trajectoryResult);
        
if (
  trajectoryResult &&
  trajectoryResult.detections.length > 0
) {
  const latest =
    trajectoryResult.detections[
      trajectoryResult.detections.length - 1
    ];

  setVehicle({
    ...result,
    latitude: latest.latitude,
    longitude: latest.longitude,
    cameraId: latest.cameraId,
    cameraName: latest.cameraName,
    detectedAt: latest.detectedAt,
  });
}

      } else {
        setVehicle(null);
        setTrajectory(null);
        setVehicleError("Vehicle not found");
      }
    } catch (error) {
      console.error(error);
      setVehicleError("Something went wrong");
    } finally {
      setVehicleLoading(false);
    }
  };

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
          <Text style={styles.logo}>TraffixAI</Text>

          <Text style={styles.subtitle}>City Traffic Intelligence</Text>
        </View>

        <View style={styles.profile}>
          <Text>👤</Text>
        </View>
      </View>

      {/* Vehicle Search */}
      <VehicleSearch
        value={searchText}
        onChangeText={setSearchText}
        onSearch={handleVehicleSearch}
        loading={vehicleLoading}
      />

      {vehicleError ? <Text style={styles.error}>{vehicleError}</Text> : null}

      {vehicle ? (
        <VehicleResultCard
          vehicle={vehicle}
          onPress={() => {
            console.log("Vehicle selected:", vehicle);
          }}
        />
      ) : null}
      {vehicle && showVehicleDetails && (
  <VehicleDetails
    vehicle={vehicle}
    trajectory={trajectory}
    onClose={() => setShowVehicleDetails(false)}
  />
)}
      

      {/* City Map */}
      <View style={styles.mapContainer}>
        <CityMap
          cameras={cameras}
          vehicle={vehicle}
          trajectory={trajectory}
          onCameraPress={handleCameraPress}
        />
      </View>

      {/* Statistics */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{cameras.length}</Text>

          <Text style={styles.statLabel}>Cameras</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>1240</Text>

          <Text style={styles.statLabel}>Vehicles</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>HIGH</Text>

          <Text style={styles.statLabel}>Traffic</Text>
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

  error: {
    color: "#d93025",
    fontSize: 14,
    marginBottom: 10,
    marginTop: 4,
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
