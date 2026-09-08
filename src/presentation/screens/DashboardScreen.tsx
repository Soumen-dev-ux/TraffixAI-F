import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CityMap from "../components/CityMap";
import { DockedSidebar } from "../components/DockedSidebar";
import { MapControls } from "../components/MapControls";
import { CameraPopup } from "../components/CameraPopup";
import { SettingsModal } from "../components/SettingsModal";
import { ProfileModal } from "../components/ProfileModal";
import { AddCameraModal } from "../components/AddCameraModal";
import { useTheme } from "../theme/ThemeContext";

import { HttpTrafficAnalyticsRepository } from "@/src/data/repositories/HttpTrafficAnalyticsRepository";
import { HttpVehicleRepository } from "@/src/data/repositories/HttpVehicleRepository";
import { TrafficAnalytics } from "@/src/domain/models/TrafficAnalytics";
import { Vehicle } from "@/src/domain/models/Vehicle";
import { VehicleTrajectory } from "@/src/domain/models/VehicleTrajectory";
import { GetTrafficAnalytics } from "@/src/domain/usecases/GetTrafficAnalytics";
import { GetVehicleTrajectory } from "@/src/domain/usecases/GetVehicleTrajectory";
import { SearchVehicle } from "@/src/domain/usecases/searchVehicle";
import { CameraApi } from "../../data/api/CameraApi";
import { TrafficAnalyticsApi } from "../../data/api/TrafficAnalyticsApi";
import { HttpCameraRepository } from "../../data/repositories/HttpCameraRepository";
import { HttpVehicleTrajectoryRepository } from "../../data/repositories/HttpVehicleTrajectoryRepository";
import { Camera } from "../../domain/models/Camera";
import { GetCameras } from "../../domain/usecases/GetCameras";
import { RealtimeEvent } from "@/src/domain/models/RealtimeEvent";
import { SubscribeToRealtimeUpdates } from "@/src/domain/usecases/SubscribeToRealtimeUpdates";
import { WebSocketRealtimeRepository } from "@/src/data/repositories/WebSocketRealtimeRepository";

export default function DashboardScreen() {
  const { colors } = useTheme();

  // Camera data
  const [cameras, setCameras] = useState<Camera[]>(CameraApi.defaultCameras);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  // Vehicle tracking & search
  const [searchText, setSearchText] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState("");
  const [trajectory, setTrajectory] = useState<VehicleTrajectory | null>(null);

  // Analytics & Realtime
  const [analytics, setAnalytics] = useState<TrafficAnalytics | null>(TrafficAnalyticsApi.defaultAnalytics);
  const [, setLastRealtimeEvent] = useState<RealtimeEvent | null>(null);

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<'cameras' | 'tracking' | 'analytics' | 'alerts'>('cameras');
  const [is3DView, setIs3DView] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAddCamera, setShowAddCamera] = useState(false);
  const [liveDetections, setLiveDetections] = useState<{ id: string; plateNumber: string; cameraName: string; detectedAt: string; vehicleType?: string }[]>([]);

  // Realtime subscription (WebSocket with auto-fallback)
  useEffect(() => {
    const repository = new WebSocketRealtimeRepository();
    const useCase = new SubscribeToRealtimeUpdates(repository);
    const unsubscribe = useCase.execute((event) => {
      setLastRealtimeEvent(event);

      // Camera lifecycle events from WebSocket
      if ((event.type as any) === 'camera_added' && event.data) {
        const newCam = event.data as any;
        setCameras((prev) => {
          if (prev.some((c) => c.id === newCam.id || c.id === newCam.camera_id)) return prev;
          return [
            ...prev,
            {
              ...newCam,
              id: newCam.camera_id || newCam.id,
              vehicleCount: newCam.vehicle_count || 0,
              trafficLevel: newCam.traffic_level || 'low',
              streamUrl: newCam.stream_url || '/videos/sample_traffic.mp4',
              detectedVehicles: newCam.detected_vehicles || { car: 0, motorcycle: 0, bus: 0, truck: 0, van: 0, taxi: 0 },
            },
          ];
        });
      }

      if ((event.type as any) === 'camera_deleted' && event.data) {
        const delId = (event.data as any).camera_id;
        setCameras((prev) => prev.filter((c) => c.id !== delId));
      }

      if ((event.type as any) === 'cameras_reset' && event.data) {
        const newCams = (event.data as any).cameras || [];
        setCameras(
          newCams.map((c: any) => ({
            ...c,
            id: c.camera_id || c.id,
            vehicleCount: c.vehicle_count || 0,
            trafficLevel: c.traffic_level || 'low',
            streamUrl: c.stream_url || '/videos/sample_traffic.mp4',
            detectedVehicles: c.detected_vehicles || { car: 0, motorcycle: 0, bus: 0, truck: 0, van: 0, taxi: 0 },
          }))
        );
      }

      if (event.type === 'vehicle_detection' && event.data) {
        const d = event.data as any;
        const plate = d.plateNumber || d.plate_number || d.local_track_id || d.vehicleId;
        const camId = d.cameraId || d.camera_id;
        const camName = d.cameraName || d.camera_name || 'Park Street Junction';
        const detectedAt = d.timestamp || d.detectedAt || new Date().toISOString();
        const vType = d.vehicleType || d.vehicle_type || 'car';

        if (plate) {
          // 1. Update camera vehicle count dynamically
          setCameras((prevCams) =>
            prevCams.map((cam) => {
              if (cam.id === camId || cam.name === camName) {
                const newCount = (cam.vehicleCount || 0) + 1;
                return {
                  ...cam,
                  vehicleCount: newCount,
                  trafficLevel: newCount > 30 ? 'critical' : newCount > 20 ? 'high' : newCount > 10 ? 'moderate' : 'low',
                };
              }
              return cam;
            })
          );

          // 2. Update analytics active vehicles dynamically
          setAnalytics((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              totalVehicles: (prev.totalVehicles || 0) + 1,
            };
          });

          // 3. Add to recent live detections list
          setLiveDetections((prev) => [
            {
              id: event.id || String(Date.now()),
              plateNumber: plate,
              cameraName: camName,
              detectedAt,
              vehicleType: vType,
            },
            ...prev.filter((p) => p.plateNumber !== plate).slice(0, 19),
          ]);

          // 4. Automatically position car on map & render multi-camera trajectory route
          const newVehicle: Vehicle = {
            id: d.vehicleId || `VH_${plate}`,
            plateNumber: plate,
            vehicleType: vType,
            color: d.color || 'White',
            latitude: Number(d.latitude || 22.5535),
            longitude: Number(d.longitude || 88.3525),
            cameraId: camId,
            cameraName: camName,
            detectedAt,
            speed: d.speed || 45,
          };
          setVehicle(newVehicle);

          if (d.trajectory && Array.isArray(d.trajectory.detections) && d.trajectory.detections.length > 0) {
            setTrajectory(d.trajectory);
          } else {
            setTrajectory((prevTraj) => {
              const prevPoints = prevTraj && prevTraj.plateNumber === plate ? prevTraj.detections : [];
              const newPoint = {
                id: `DET_${Date.now()}`,
                cameraId: camId,
                cameraName: camName,
                latitude: newVehicle.latitude,
                longitude: newVehicle.longitude,
                detectedAt,
              };
              return {
                vehicleId: newVehicle.id,
                plateNumber: plate,
                vehicleType: vType,
                detections: [...prevPoints.filter((p) => p.cameraId !== camId), newPoint],
              };
            });
          }
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleAddCamera = async (camData: {
    name: string;
    latitude: number;
    longitude: number;
    direction: string;
    stream_url: string;
  }) => {
    const created = await CameraApi.createCamera(camData);
    setCameras((prev) => {
      if (prev.some((c) => c.id === created.id)) return prev;
      return [...prev, created];
    });
    setSelectedCamera(created);
  };

  const handleDeleteCamera = async (cameraId: string) => {
    await CameraApi.deleteCamera(cameraId);
    setCameras((prev) => prev.filter((c) => c.id !== cameraId));
    if (selectedCamera?.id === cameraId) {
      setSelectedCamera(null);
    }
  };

  const handleResetCameras = async (mode: 'clear' | 'reset') => {
    const updated = await CameraApi.resetCameras(mode);
    setCameras(updated);
    setSelectedCamera(null);
  };

  // Analytics data
  useEffect(() => {
    const repository = new HttpTrafficAnalyticsRepository();
    const useCase = new GetTrafficAnalytics(repository);
    useCase.execute().then(setAnalytics);
  }, []);

  // Cameras loading
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const repository = new HttpCameraRepository();
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
      const repository = new HttpVehicleRepository();
      const searchVehicle = new SearchVehicle(repository);
      const result = await searchVehicle.execute(target);

      if (result) {
        setVehicle(result);

        const trajectoryRepository = new HttpVehicleTrajectoryRepository();
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
          liveDetections={liveDetections}
          onOpenAddCamera={() => setShowAddCamera(true)}
          onDeleteCamera={handleDeleteCamera}
          onResetCameras={handleResetCameras}
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

      {/* Deploy Camera Modal */}
      <AddCameraModal
        visible={showAddCamera}
        onClose={() => setShowAddCamera(false)}
        onAddCamera={handleAddCamera}
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
