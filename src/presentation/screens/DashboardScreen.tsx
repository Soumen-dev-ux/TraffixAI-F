import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CityMap from "../components/CityMap";
import { DockedSidebar } from "../components/DockedSidebar";
import { MapControls } from "../components/MapControls";
import { CameraPopup } from "../components/CameraPopup";
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

  // Analytics & Realtime
  const [analytics, setAnalytics] = useState<TrafficAnalytics | null>(null);
  const [, setLastRealtimeEvent] = useState<RealtimeEvent | null>(null);

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<'cameras' | 'tracking' | 'analytics'>('cameras');
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
  const executeVehicleSearch = async (plateNumber: string) => {
    const target = plateNumber.trim();
    if (!target) {
      setVehicleError("Enter a vehicle number (e.g. WB12AB1234)");
      return;
    }

    setVehicleLoading(true);
    setVehicleError("");
    setVehicle(null);

    try {
      const repository = new MockVehicleRepository();
      const searchVehicle = new SearchVehicle(repository);
      const result = await searchVehicle.execute(target);

      if (result) {
        setVehicle(result);

        const trajectoryRepository = new MockVehicleTrajectoryRepository();
        const getVehicleTrajectory = new GetVehicleTrajectory(trajectoryRepository);
        const trajectoryResult = await getVehicleTrajectory.execute(target);

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
        setActiveTab('tracking');
      } else {
        setVehicle(null);
        setTrajectory(null);
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

  const handleClearVehicle = () => {
    setVehicle(null);
    setTrajectory(null);
    setSearchText("");
    setVehicleError("");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* 1. Left Docked Solid Sidebar */}
      {showSidebar && (
        <DockedSidebar
          cameras={cameras}
          selectedCamera={selectedCamera}
          onCameraPress={handleCameraPress}
          searchText={searchText}
          onSearchTextChange={(text) => {
            setSearchText(text);
            if (vehicleError) setVehicleError("");
          }}
          onSearch={() => executeVehicleSearch(searchText)}
          searchLoading={vehicleLoading}
          vehicleError={vehicleError}
          onClearVehicleError={() => setVehicleError("")}
          vehicle={vehicle}
          trajectory={trajectory}
          onClearVehicle={handleClearVehicle}
          analytics={analytics}
          onSettingsPress={() => setShowSettings(true)}
          onProfilePress={() => setShowProfile(true)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectQuickVehicle={(plate) => {
            setSearchText(plate);
            executeVehicleSearch(plate);
          }}
          onToggleCollapse={() => setShowSidebar(false)}
        />
      )}

      {/* 2. Map Container (Fills remainder of the screen) */}
      <View style={styles.mapArea}>
        <CityMap
          cameras={cameras}
          vehicle={vehicle}
          trajectory={trajectory}
          onCameraPress={handleCameraPress}
          is3DView={is3DView}
          showHeatmap={showHeatmap}
          style={StyleSheet.absoluteFill}
        />

        {/* Floating Expand Button (Visible when sidebar is collapsed) */}
        {!showSidebar && (
          <TouchableOpacity
            style={[
              styles.sidebarExpandBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowSidebar(true)}
            activeOpacity={0.8}
            accessibilityLabel="Expand Sidebar"
          >
            <Ionicons
              name="menu"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        )}

        {/* Floating Solid Map Controls (Top Right: 3D toggle, Heatmap toggle) */}
        <MapControls
          is3DView={is3DView}
          onToggle3D={() => setIs3DView(!is3DView)}
          showHeatmap={showHeatmap}
          onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        />

        {/* Sleek Solid Camera Details Card (Anchored over map on top-right) */}
        <CameraPopup
          camera={selectedCamera}
          visible={!!selectedCamera}
          onClose={() => setSelectedCamera(null)}
        />
      </View>

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
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    overflow: "hidden",
  },
  mapArea: {
    flex: 1,
    height: "100%",
    position: "relative",
  },
  sidebarExpandBtn: {
    position: "absolute",
    bottom: 20,
    left: 16,
    zIndex: 35,
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});
