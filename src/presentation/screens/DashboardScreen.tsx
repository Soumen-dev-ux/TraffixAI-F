import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CityMap from "../components/CityMap";
import { TopBar } from "../components/TopBar";
import { CameraSidebar } from "../components/CameraSidebar";
import { CameraPopup } from "../components/CameraPopup";
import { VehiclePopup } from "../components/VehiclePopup";
import { StatsBar } from "../components/StatsBar";
import { SettingsModal } from "../components/SettingsModal";
import { ProfileModal } from "../components/ProfileModal";
import { useTheme } from "../theme/ThemeContext";

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
import { RealtimeEvent } from "@/src/domain/models/RealtimeEvent";
import { SubscribeToRealtimeUpdates } from "@/src/domain/usecases/SubscribeToRealtimeUpdates";
import { MockRealtimeRepository } from "@/src/data/repositories/MockRealtimeRepository";

export default function DashboardScreen() {
  const { colors } = useTheme();

  // Camera data
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  // Vehicle tracking & search
  const [searchText, setSearchText] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState("");
  const [trajectory, setTrajectory] = useState<VehicleTrajectory | null>(null);
  const [showVehiclePopup, setShowVehiclePopup] = useState(false);

  // Analytics & Realtime
  const [analytics, setAnalytics] = useState<TrafficAnalytics | null>(null);
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<RealtimeEvent | null>(null);

  // UI options & overlays
  const [is3DView, setIs3DView] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Realtime subscription
  useEffect(() => {
    const repository = new MockRealtimeRepository();
    const useCase = new SubscribeToRealtimeUpdates(repository);
    const unsubscribe = useCase.execute((event) => {
      console.log("Realtime event:", event);
      setLastRealtimeEvent(event);
    });
    return unsubscribe;
  }, []);

  // Analytics data
  useEffect(() => {
    const repository = new MockTrafficAnalyticsReposiory();
    const useCase = new GetTrafficAnalytics(repository);
    useCase.execute().then(setAnalytics);
  }, []);

  // Cameras loading
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

  // Vehicle Search
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
        const getVehicleTrajectory = new GetVehicleTrajectory(trajectoryRepository);
        const trajectoryResult = await getVehicleTrajectory.execute(searchText);

        setTrajectory(trajectoryResult);

        if (trajectoryResult && trajectoryResult.detections.length > 0) {
          const latest = trajectoryResult.detections[trajectoryResult.detections.length - 1];
          setVehicle({
            ...result,
            latitude: latest.latitude,
            longitude: latest.longitude,
            cameraId: latest.cameraId,
            cameraName: latest.cameraName,
            detectedAt: latest.detectedAt,
          });
        }
        setShowVehiclePopup(true);
      } else {
        setVehicle(null);
        setTrajectory(null);
        setShowVehiclePopup(false);
        setVehicleError("Vehicle not found. Try searching 'WB12AB1234' or 'WB06CD5678'");
      }
    } catch (error) {
      console.error(error);
      setVehicleError("Something went wrong while searching.");
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleCameraPress = (camera: Camera) => {
    setSelectedCamera(camera);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Full-screen Background Map */}
      <CityMap
        cameras={cameras}
        vehicle={vehicle}
        trajectory={trajectory}
        onCameraPress={handleCameraPress}
        is3DView={is3DView}
        showHeatmap={showHeatmap}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Top Bar (Brand, Search, Controls) */}
      <TopBar
        searchText={searchText}
        onSearchTextChange={(text) => {
          setSearchText(text);
          if (vehicleError) setVehicleError("");
        }}
        onSearch={handleVehicleSearch}
        searchLoading={vehicleLoading}
        onSettingsPress={() => setShowSettings(true)}
        onProfilePress={() => setShowProfile(true)}
      />

      {/* Search Error Floating Toast */}
      {vehicleError ? (
        <View style={[styles.errorToast, { backgroundColor: colors.surface, borderColor: colors.accentRed }]}>
          <Ionicons name="alert-circle" size={18} color={colors.accentRed} />
          <Text style={[styles.errorText, { color: colors.text }]}>{vehicleError}</Text>
          <TouchableOpacity onPress={() => setVehicleError("")} hitSlop={10}>
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Left Sidebar Camera List (Overlay) */}
      {showSidebar && (
        <CameraSidebar
          cameras={cameras}
          onCameraPress={handleCameraPress}
          selectedCameraId={selectedCamera?.id ?? null}
        />
      )}

      {/* Floating Toggle for Sidebar */}
      <TouchableOpacity
        style={[
          styles.sidebarToggleBtn,
          { backgroundColor: colors.overlay, borderColor: colors.border },
        ]}
        onPress={() => setShowSidebar(!showSidebar)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={showSidebar ? "chevron-back" : "videocam-outline"}
          size={18}
          color={colors.text}
        />
      </TouchableOpacity>

      {/* Bottom Right Floating Stats Strip */}
      <StatsBar cameraCount={cameras.length} analytics={analytics} />

      {/* Floating Camera Detail Modal/Card */}
      <CameraPopup
        camera={selectedCamera}
        visible={!!selectedCamera}
        onClose={() => setSelectedCamera(null)}
      />

      {/* Floating Vehicle Detail Modal/Card */}
      <VehiclePopup
        vehicle={vehicle}
        trajectory={trajectory}
        visible={showVehiclePopup && !!vehicle}
        onClose={() => setShowVehiclePopup(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        is3DView={is3DView}
        onToggle3D={() => setIs3DView(!is3DView)}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
      />

      {/* Profile Modal */}
      <ProfileModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
  },
  errorToast: {
    position: "absolute",
    top: 68,
    alignSelf: "center",
    zIndex: 110,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sidebarToggleBtn: {
    position: "absolute",
    left: 12,
    bottom: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
