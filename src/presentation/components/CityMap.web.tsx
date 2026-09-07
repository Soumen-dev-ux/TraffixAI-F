import { getMapHtmlContent } from "./mapHtmlContent";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const [showHeatmap, setShowHeatmap] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const camerasRef = useRef(cameras);
  camerasRef.current = cameras;
  const vehicleRef = useRef(vehicle);
  vehicleRef.current = vehicle;
  const trajectoryRef = useRef(trajectory);
  trajectoryRef.current = trajectory;
  const showHeatmapRef = useRef(showHeatmap);
  showHeatmapRef.current = showHeatmap;
  const onCameraPressRef = useRef(onCameraPress);
  onCameraPressRef.current = onCameraPress;

  const sendMapUpdate = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const currentCameras = camerasRef.current;
      const heatmapPoints = getTrafficHeatmapPoints(currentCameras);
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_DATA",
          cameras: currentCameras,
          vehicle: vehicleRef.current,
          trajectory: trajectoryRef.current,
          showHeatmap: showHeatmapRef.current,
          heatmapPoints,
        },
        "*"
      );
    }
  };

  // Handle messages from the iframe (camera clicks and readiness)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CAMERA_CLICK") {
        const found = camerasRef.current.find(
          (c) => c.id === event.data.cameraId
        );
        if (found) {
          onCameraPressRef.current(found);
        }
      }
      if (event.data?.type === "MAP_READY") {
        sendMapUpdate();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    sendMapUpdate();
  }, [cameras, vehicle, trajectory, showHeatmap]);

  const htmlContent = React.useMemo(() => getMapHtmlContent(), []);

  return (
    <View style={styles.container}>
      {React.createElement("iframe", {
        ref: iframeRef,
        srcDoc: htmlContent,
        style: {
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: 18,
        },
        onLoad: sendMapUpdate,
      })}

      {/* Heatmap Layer Toggle Control */}
      <TouchableOpacity
        style={[
          styles.heatmapToggle,
          showHeatmap ? styles.heatmapToggleActive : styles.heatmapToggleInactive,
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

      {/* Map Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>📹</Text>
          <Text style={styles.legendText}>CCTV</Text>
        </View>

        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>
            {vehicle ? getVehicleEmoji(vehicle.vehicleType) : "🚗"}
          </Text>
          <Text style={styles.legendText}>Vehicle</Text>
        </View>

        {trajectory && trajectory.detections.length > 0 && (
          <View style={styles.legendItem}>
            <View style={styles.routeIndicator} />
            <Text style={styles.legendText}>Route</Text>
          </View>
        )}

        {showHeatmap && (
          <View style={[styles.legendItem, styles.heatmapLegendItem]}>
            <Text style={styles.densityLabel}>Low</Text>
            <View style={styles.heatGradientBar} />
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
    width: "100%",
    height: "100%",
    minHeight: 400,
    borderRadius: 18,
    overflow: "hidden",
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
  legend: {
    position: "absolute",
    bottom: 15,
    left: 15,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: "#ffffff",
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
  heatGradientBar: {
    width: 60,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    // Linear gradient simulation for web / react-native-web
    // @ts-ignore
    backgroundImage: "linear-gradient(to right, #3b82f6, #06b6d4, #10b981, #f59e0b, #ef4444)",
    backgroundColor: "#f59e0b",
  },
});
