import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CityMap from "../components/CityMap";
import { DockedSidebar } from "../components/DockedSidebar";
import { MapControls } from "../components/MapControls";
import { CameraPopup, DetectedVehicleItem } from "../components/CameraPopup";
import { SettingsModal } from "../components/SettingsModal";
import { ProfileModal } from "../components/ProfileModal";
import { AddCameraModal } from "../components/AddCameraModal";
import { EditCameraModal } from "../components/EditCameraModal";
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
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

  // Search state (Location search for Cameras; Vehicle search for Tracking)
  const [searchText, setSearchText] = useState("");
  const [locationSearchText, setLocationSearchText] = useState("");
  const [focusLocation, setFocusLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const vehicleRef = useRef<Vehicle | null>(null);
  vehicleRef.current = vehicle;
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
  const [liveDetections, setLiveDetections] = useState<DetectedVehicleItem[]>([]);
  const [reidAlert, setReidAlert] = useState<{ plate: string; fromCam: string; toCam: string; count: number } | null>(null);
  const [activeDetectingCameras, setActiveDetectingCameras] = useState<string[]>([]);

  // Synchronize live AI detection states across cameras
  useEffect(() => {
    const syncStatus = async () => {
      try {
        const res = await CameraApi.getDetectionStatus();
        if (Array.isArray(res?.active_cameras)) {
          setActiveDetectingCameras(res.active_cameras);
        }
      } catch {}
    };
    syncStatus();
    const interval = setInterval(syncStatus, 3000);
    return () => clearInterval(interval);
  }, []);

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

      if ((event.type as any) === 'camera_updated' && event.data) {
        const updatedCam = event.data as any;
        const camId = updatedCam.camera_id || updatedCam.id;
        setCameras((prev) =>
          prev.map((c) =>
            c.id === camId
              ? {
                  ...c,
                  ...updatedCam,
                  id: camId,
                  streamUrl: updatedCam.stream_url || c.streamUrl,
                }
              : c
          )
        );
        setSelectedCamera((prev) =>
          prev && prev.id === camId
            ? {
                ...prev,
                ...updatedCam,
                id: camId,
                streamUrl: updatedCam.stream_url || prev.streamUrl,
              }
            : prev
        );
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

      if (event.type === 'vehicle_exited' && event.data) {
        const d = event.data as any;
        const plate = d.plateNumber || d.localTrackId || d.vehicleId;
        const camId = d.cameraId;
        setLiveDetections((prev) =>
          prev.map((item) => {
            if (
              (item.plateNumber === plate || item.localTrackId === d.localTrackId) &&
              (!camId || item.cameraId === camId)
            ) {
              return { ...item, inFrame: false };
            }
            return item;
          })
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
          const nowMs = Date.now();
          const trackId = (d.localTrackId || d.local_track_id || '').toString();

          setLiveDetections((prev) => {
            const isExisting = prev.some(
              (p) => (trackId && p.localTrackId === trackId) ||
                     (p.plateNumber && p.plateNumber === plate && (p.cameraId === camId || p.cameraName === camName))
            );

            // 1. Only increment counter for brand-new vehicle tracks (not on every frame!)
            if (!isExisting) {
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

              setAnalytics((prevAnalytics) => {
                if (!prevAnalytics) return prevAnalytics;
                return {
                  ...prevAnalytics,
                  totalVehicles: (prevAnalytics.totalVehicles || 0) + 1,
                };
              });
            }

            // 2. Upsert existing detection item or prepend new item
            const newDet: DetectedVehicleItem = {
              id: event.id || String(nowMs),
              plateNumber: plate,
              cameraId: camId,
              cameraName: camName,
              detectedAt,
              vehicleType: vType,
              confidence: d.confidence || d.vehicle_confidence || 0.92,
              boundingBox: d.boundingBox || d.bounding_box || null,
              localTrackId: trackId || null,
              inFrame: true,
              timestampMs: nowMs,
            };

            const otherItems = prev
              .filter(
                (p) => !((trackId && p.localTrackId === trackId) ||
                         (p.plateNumber === plate && (p.cameraId === camId || p.cameraName === camName)))
              )
              .map((p) => ({
                ...p,
                inFrame: nowMs - (p.timestampMs || 0) < 25000,
              }));

            return [newDet, ...otherItems.slice(0, 48)];
          });

          // 4. Check for Multi-Camera Re-ID Match
          const trajDets = d.trajectory?.detections;
          if (Array.isArray(trajDets) && trajDets.length >= 2) {
            const prevPoint = trajDets[trajDets.length - 2];
            const curPoint = trajDets[trajDets.length - 1];
            if (prevPoint.cameraId !== curPoint.cameraId) {
              setReidAlert({
                plate,
                fromCam: prevPoint.cameraName || prevPoint.cameraId,
                toCam: curPoint.cameraName || curPoint.cameraId,
                count: trajDets.length,
              });
              setTimeout(() => {
                setReidAlert((prev) => (prev && prev.plate === plate ? null : prev));
              }, 9000);
            }
          }

          // 5. Automatically position car on map & render multi-camera trajectory route
          // Auto-update if matching active vehicle, or no vehicle active, or if multi-camera trajectory arrived
          const shouldUpdateVehicle = !vehicleRef.current || vehicleRef.current.plateNumber === plate || (Array.isArray(trajDets) && trajDets.length >= 2);
          if (shouldUpdateVehicle) {
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

  const handleUpdateCamera = async (
    cameraId: string,
    updateData: {
      name?: string;
      latitude?: number;
      longitude?: number;
      direction?: string;
      stream_url?: string;
    }
  ) => {
    const updated = await CameraApi.updateCamera(cameraId, updateData);
    setCameras((prev) =>
      prev.map((c) =>
        c.id === cameraId
          ? {
              ...c,
              ...updated,
              id: cameraId,
              streamUrl: updated.stream_url || c.streamUrl,
            }
          : c
      )
    );
    if (selectedCamera?.id === cameraId) {
      setSelectedCamera((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              id: cameraId,
              streamUrl: updated.stream_url || prev.streamUrl,
            }
          : null
      );
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
      setVehicleError("Enter a vehicle number to search");
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
        setVehicleError(`Vehicle "${target}" not found. Trigger detection on any camera to identify vehicles in real time.`);
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
    setFocusLocation({ latitude: camera.latitude, longitude: camera.longitude });
  };

  const handleLocationSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    // 1. Check if matches any existing camera by name, id, or direction
    const matchedCam = cameras.find(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.direction && c.direction.toLowerCase().includes(q))
    );
    if (matchedCam) {
      setSelectedCamera(matchedCam);
      setFocusLocation({ latitude: matchedCam.latitude, longitude: matchedCam.longitude });
      return;
    }

    // 2. Check known Kolkata city localities
    const kolkataLocations: Record<string, { latitude: number; longitude: number; name: string }> = {
      'park street': { latitude: 22.5535, longitude: 88.3525, name: 'Park Street Junction' },
      'park': { latitude: 22.5535, longitude: 88.3525, name: 'Park Street Junction' },
      'esplanade': { latitude: 22.5646, longitude: 88.3512, name: 'Esplanade Crossing' },
      'dharmatala': { latitude: 22.5646, longitude: 88.3512, name: 'Esplanade Crossing' },
      'salt lake': { latitude: 22.5769, longitude: 88.4331, name: 'Salt Lake Sector V' },
      'sector v': { latitude: 22.5769, longitude: 88.4331, name: 'Salt Lake Sector V' },
      'bidhannagar': { latitude: 22.5769, longitude: 88.4331, name: 'Salt Lake Sector V' },
      'howrah': { latitude: 22.5958, longitude: 88.3476, name: 'Howrah Bridge' },
      'howrah bridge': { latitude: 22.5958, longitude: 88.3476, name: 'Howrah Bridge' },
      'gariahat': { latitude: 22.5186, longitude: 88.3654, name: 'Gariahat Junction' },
      'shyambazar': { latitude: 22.6033, longitude: 88.3708, name: 'Shyambazar' },
      'new town': { latitude: 22.5867, longitude: 88.4754, name: 'New Town' },
      'victoria': { latitude: 22.5448, longitude: 88.3426, name: 'Victoria Memorial' },
    };

    for (const [key, loc] of Object.entries(kolkataLocations)) {
      if (key.includes(q) || q.includes(key)) {
        setFocusLocation({ latitude: loc.latitude, longitude: loc.longitude });
        const closeCam = cameras.find(
          (c) => Math.abs(c.latitude - loc.latitude) < 0.02 && Math.abs(c.longitude - loc.longitude) < 0.02
        );
        if (closeCam) {
          setSelectedCamera(closeCam);
        }
        return;
      }
    }
  };

  const handleClearVehicle = () => {
    setVehicle(null);
    setTrajectory(null);
    setSearchText("");
    setVehicleError("");
  };

  // Simulation of Vehicle Appearing at a Camera (Camera A -> Camera B)
  const handleSimulateVehicleDetection = (cameraId: string, plateNumber?: string) => {
    const cam = cameras.find((c) => c.id === cameraId);
    if (!cam) return;

    // If no vehicle is selected/specified, trigger genuine AI camera detection!
    if (!plateNumber || !plateNumber.trim()) {
      handleTriggerCameraDetection(cameraId);
      return;
    }

    const detectedTime = new Date().toISOString();
    const cleanPlate = plateNumber.trim().toUpperCase();

    // 1. Position vehicle at this camera
    const updatedVehicle: Vehicle = {
      id: `VH_${cleanPlate}`,
      plateNumber: cleanPlate,
      vehicleType: 'car',
      color: 'White',
      latitude: cam.latitude,
      longitude: cam.longitude,
      cameraId: cam.id,
      cameraName: cam.name,
      detectedAt: detectedTime,
      speed: Math.floor(38 + Math.random() * 20),
    };
    setVehicle(updatedVehicle);

    // 2. Append new waypoint to multi-camera trajectory
    setTrajectory((prevTraj) => {
      const isSameVehicle = prevTraj && prevTraj.plateNumber === cleanPlate;
      const prevDetections = isSameVehicle ? prevTraj.detections : [];

      const lastPoint = prevDetections[prevDetections.length - 1];
      if (lastPoint && lastPoint.cameraId === cam.id) {
        return prevTraj;
      }

      const newPoint = {
        id: `DET_${Date.now()}`,
        cameraId: cam.id,
        cameraName: cam.name,
        latitude: cam.latitude,
        longitude: cam.longitude,
        detectedAt: detectedTime,
      };

      return {
        vehicleId: updatedVehicle.id,
        plateNumber: cleanPlate,
        vehicleType: 'car',
        detections: [...prevDetections, newPoint],
      };
    });

    // 3. Increment camera vehicle counter locally
    setCameras((prevCams) =>
      prevCams.map((c) => {
        if (c.id === cam.id) {
          const newCount = (c.vehicleCount || 0) + 1;
          return {
            ...c,
            vehicleCount: newCount,
            trafficLevel: newCount > 30 ? 'critical' : newCount > 20 ? 'high' : newCount > 10 ? 'moderate' : 'low',
          };
        }
        return c;
      })
    );

    // 4. Update live detections feed
    const nowMs = Date.now();
    setLiveDetections((prev) => [
      {
        id: `LIVE_${nowMs}`,
        plateNumber: cleanPlate,
        cameraId: cam.id,
        cameraName: cam.name,
        detectedAt: detectedTime,
        vehicleType: 'car',
        inFrame: true,
        timestampMs: nowMs,
      },
      ...prev
        .filter((p) => !(p.plateNumber === cleanPlate && p.cameraName === cam.name))
        .map((p) => ({
          ...p,
          inFrame: nowMs - (p.timestampMs || 0) < 25000,
        }))
        .slice(0, 49),
    ]);

    // 5. Automatically switch active tab to 'tracking'
    setActiveTab('tracking');

    // 6. Asynchronous fire-and-forget sync to backend if online
    CameraApi.dispatchDetection({
      cameraId: cam.id,
      plateNumber: cleanPlate,
      vehicleType: 'car',
      color: 'White',
    }).catch(() => {});
  };

  const handleTriggerCameraDetection = async (cameraId: string) => {
    setActiveDetectingCameras((prev) => Array.from(new Set([...prev, cameraId])));
    try {
      await CameraApi.triggerCameraDetection(cameraId, 'auto');
    } catch (err) {
      console.error('Trigger camera detection failed:', err);
    }
  };

  const handleStopCameraDetection = async (cameraId: string) => {
    setActiveDetectingCameras((prev) => prev.filter((id) => id !== cameraId));
    try {
      await CameraApi.stopCameraDetection(cameraId);
    } catch (err) {
      console.error('Stop camera detection failed:', err);
    }
  };

  const handleSelectVehicleFromCamera = (plateNumber: string, vehicleType?: string) => {
    const cleanPlate = plateNumber.trim().toUpperCase();
    setSearchText(cleanPlate);

    // 1. Gather all detections for this vehicle across cameras
    const plateDetections = liveDetections.filter(
      (d) => d.plateNumber.replace(/[\s-]/g, '').toUpperCase() === cleanPlate.replace(/[\s-]/g, '')
    );

    // 2. Find chronological waypoints
    const sortedDets = [...plateDetections].sort((a, b) => {
      const tA = a.timestampMs || new Date(a.detectedAt).getTime();
      const tB = b.timestampMs || new Date(b.detectedAt).getTime();
      return tA - tB;
    });

    const waypoints = sortedDets.map((d, index) => {
      const cam = cameras.find((c) => c.id === d.cameraId || c.name === d.cameraName);
      return {
        id: d.id || `DET_${index + 1}`,
        cameraId: d.cameraId || cam?.id || 'CAM_001',
        cameraName: d.cameraName || cam?.name || 'Traffic Camera',
        latitude: cam ? cam.latitude : 22.5535,
        longitude: cam ? cam.longitude : 88.3525,
        detectedAt: d.detectedAt,
      };
    });

    // 3. Fallback to currently selected camera if no waypoints recorded yet
    const latestWaypoint = waypoints.length > 0 ? waypoints[waypoints.length - 1] : null;
    const targetCamera = latestWaypoint
      ? cameras.find((c) => c.id === latestWaypoint.cameraId)
      : selectedCamera || cameras[0];

    const currentLat = targetCamera ? targetCamera.latitude : 22.5535;
    const currentLng = targetCamera ? targetCamera.longitude : 88.3525;
    const currentCamId = targetCamera ? targetCamera.id : 'CAM_001';
    const currentCamName = targetCamera ? targetCamera.name : 'Traffic Camera';

    // 4. Set vehicle state
    const currentVehicle: Vehicle = {
      id: `VH_${cleanPlate}`,
      plateNumber: cleanPlate,
      vehicleType: (vehicleType || 'car') as any,
      color: 'White',
      latitude: currentLat,
      longitude: currentLng,
      cameraId: currentCamId,
      cameraName: currentCamName,
      detectedAt: latestWaypoint ? latestWaypoint.detectedAt : new Date().toISOString(),
      speed: 42,
    };
    setVehicle(currentVehicle);

    // 5. Set trajectory state (if 1 camera -> icon pin; if multiple cameras -> route polyline)
    if (waypoints.length > 0) {
      setTrajectory({
        vehicleId: currentVehicle.id,
        plateNumber: cleanPlate,
        vehicleType: currentVehicle.vehicleType,
        detections: waypoints,
      });
    } else {
      setTrajectory({
        vehicleId: currentVehicle.id,
        plateNumber: cleanPlate,
        vehicleType: currentVehicle.vehicleType,
        detections: [
          {
            id: `DET_${Date.now()}`,
            cameraId: currentCamId,
            cameraName: currentCamName,
            latitude: currentLat,
            longitude: currentLng,
            detectedAt: currentVehicle.detectedAt,
          },
        ],
      });
    }

    // 6. Focus map & activate Tracking tab
    setFocusLocation({ latitude: currentLat, longitude: currentLng });
    setActiveTab('tracking');
    setShowSidebar(true);
    setSelectedCamera(null);

    // Also attempt backend search in case more historical data exists in DB
    executeVehicleSearch(cleanPlate);
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
          locationSearchText={locationSearchText}
          onLocationSearchTextChange={setLocationSearchText}
          onLocationSearch={handleLocationSearch}
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
          onSimulateDetection={handleSimulateVehicleDetection}
          onTriggerCameraDetection={handleTriggerCameraDetection}
          onStopCameraDetection={handleStopCameraDetection}
          onEditCamera={(cam) => setEditingCamera(cam)}
          activeDetectingCameras={activeDetectingCameras}
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
          focusLocation={focusLocation}
          style={StyleSheet.absoluteFill}
        />

        {/* Floating Multi-Camera Re-ID Alert Banner */}
        {reidAlert && (
          <View style={[styles.reidBanner, { backgroundColor: colors.surface, borderColor: '#00f2fe' }]}>
            <View style={styles.reidBannerRow}>
              <View style={styles.reidBadge}>
                <Ionicons name="git-network" size={18} color="#00f2fe" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.reidTitle, { color: '#00f2fe' }]}>MULTI-CAMERA RE-ID MATCH</Text>
                  <View style={styles.reidPlateChip}>
                    <Text style={styles.reidPlateText}>{reidAlert.plate}</Text>
                  </View>
                </View>
                <Text style={[styles.reidSubtitle, { color: colors.text }]}>
                  {reidAlert.fromCam} ➔ <Text style={{ color: '#00f2fe', fontWeight: 'bold' }}>{reidAlert.toCam}</Text> (Transit Route Linked)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReidAlert(null)} style={{ padding: 4 }}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

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
          onTriggerCameraDetection={handleTriggerCameraDetection}
          onStopCameraDetection={handleStopCameraDetection}
          onEditCamera={(cam) => setEditingCamera(cam)}
          sessionDetections={liveDetections}
          onSelectVehicle={handleSelectVehicleFromCamera}
          activeDetectingCameras={activeDetectingCameras}
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

      {/* Edit Camera / Replace Video Modal */}
      <EditCameraModal
        camera={editingCamera}
        visible={!!editingCamera}
        onClose={() => setEditingCamera(null)}
        onUpdateCamera={handleUpdateCamera}
        onDeleteCamera={handleDeleteCamera}
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
  reidBanner: {
    position: "absolute",
    top: 18,
    alignSelf: "center",
    width: "90%",
    maxWidth: 480,
    zIndex: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  reidBannerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reidBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0, 242, 254, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  reidTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  reidPlateChip: {
    backgroundColor: "#00f2fe",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  reidPlateText: {
    color: "#0a0f1d",
    fontSize: 11,
    fontWeight: "bold",
  },
  reidSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
