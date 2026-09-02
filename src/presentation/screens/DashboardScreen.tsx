import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import CameraBottomSheet from "../components/CameraBottomSheet";
import CityMap from "../components/CityMap";

import { MockTrafficAnalyticsReposiory } from "@/src/data/repositories/MockTrafficAnalyticsRepository";
import { MockVehicleRepository } from "@/src/data/repositories/MockVehicleRepository";
import { TrafficAnalytics } from "@/src/domain/models/TrafficAnalytics";
import { Vehicle } from "@/src/domain/models/Vehicle";
import { VehicleTrajectory } from "@/src/domain/models/VehicleTrajectory";
import { GetTrafficAnalytics } from "@/src/domain/usecases/GetTrafficAnalytics";
import { GetVehicleTrajectory } from "@/src/domain/usecases/GetVehicleTrajectory";
import { SearchVehicle } from "@/src/domain/usecases/searchVehicle";
import { MockCameraRepository } from "../../data/repositories/MockCameraRepository";
import { MockVehicleTrajectoryRepository } from "../../data/repositories/MockVehicleTrajectoryRepository";
import { Camera } from "../../domain/models/Camera";
import { GetCameras } from "../../domain/usecases/GetCameras";
import TrafficAnalyticsPanel from "../components/TrafficAnalyticsPanel";
import VehicleDetails from "../components/VehicleDetails";
import VehicleResultCard from "../components/VehicleResultcard";
import VehicleSearch from "../components/VehicleSearch";

export default function DashboardScreen() {
  // Camera data
  const [cameras, setCameras] = useState<Camera[]>([]);

  // Selected camera
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const [searchText, setSearchText] = useState("");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [vehicleLoading, setVehicleLoading] = useState(false);

  const [vehicleError, setVehicleError] = useState("");
  const [trajectory, setTrajectory] = useState<VehicleTrajectory | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [analytics, setAnalytics] = useState<TrafficAnalytics | null>(null);

  useEffect(() => {
    const repository = new MockTrafficAnalyticsReposiory();
    const useCase = new GetTrafficAnalytics(repository);
    useCase.execute().then(setAnalytics);
  }, []);

  // Search function
  const handleVehicleSearch = async () => {
    if (!searchText.trim()) {
      setVehicleError("Enter a vehicle number (e.g. WB12AB1234)");
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
          trajectoryRepository
        );

        const trajectoryResult = await getVehicleTrajectory.execute(searchText);

        setTrajectory(trajectoryResult);

        if (trajectoryResult && trajectoryResult.detections.length > 0) {
          const latest =
            trajectoryResult.detections[trajectoryResult.detections.length - 1];

          setVehicle({
            ...result,
            latitude: latest.latitude,
            longitude: latest.longitude,
            cameraId: latest.cameraId,
            cameraName: latest.cameraName,
            detectedAt: latest.detectedAt,
          });
        }
        setShowVehicleDetails(true);
      } else {
        setVehicle(null);
        setTrajectory(null);
        setShowVehicleDetails(false);
        setVehicleError("Vehicle not found. Try searching 'WB12AB1234' or 'WB06CD5678'");
      }
    } catch (error) {
      console.error(error);
      setVehicleError("Something went wrong while searching.");
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
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>TraffixAI</Text>
          <Text style={styles.subtitle}>City Traffic Intelligence</Text>
        </View>

        <View style={styles.profile}>
          <Text style={styles.profileEmoji}>👤</Text>
        </View>
      </View>

      {/* Vehicle Search */}
      <VehicleSearch
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          if (vehicleError) setVehicleError("");
        }}
        onSearch={handleVehicleSearch}
        loading={vehicleLoading}
      />

      {vehicleError ? <Text style={styles.error}>{vehicleError}</Text> : null}

      {vehicle ? (
        <VehicleResultCard
          vehicle={vehicle}
          onPress={() => {
            setShowVehicleDetails(true);
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
          <Text style={styles.statValue}>
            {analytics ? analytics.totalVehicles : 91}
          </Text>
          <Text style={styles.statLabel}>Vehicles</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {analytics ? analytics.congestionLevel.toUpperCase() : "HIGH"}
          </Text>
          <Text style={styles.statLabel}>Traffic</Text>
        </View>
      </View>

      {analytics && <TrafficAnalyticsPanel analytics={analytics} />}

      {/* Camera Details Popup */}
      <CameraBottomSheet
        visible={!!selectedCamera}
        camera={selectedCamera}
        onClose={() => setSelectedCamera(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 3,
    fontSize: 14,
  },
  profile: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  profileEmoji: {
    fontSize: 20,
  },
  error: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 10,
    marginTop: 4,
  },
  mapContainer: {
    height: 420,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#e5e7eb",
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    marginTop: 5,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "500",
  },
});
