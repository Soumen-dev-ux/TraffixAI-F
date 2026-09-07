import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { getTrafficHeatmapPoints } from "../../data/api/mockHeatmapData";
import { Camera } from "../../domain/models/Camera";
import { Vehicle } from "../../domain/models/Vehicle";
import { VehicleTrajectory } from "../../domain/models/VehicleTrajectory";
import { getMapHtmlContent } from "./mapHtmlContent";

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
  const [show3D, setShow3D] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const camerasRef = useRef(cameras);
  camerasRef.current = cameras;
  const vehicleRef = useRef(vehicle);
  vehicleRef.current = vehicle;
  const trajectoryRef = useRef(trajectory);
  trajectoryRef.current = trajectory;
  const showHeatmapRef = useRef(showHeatmap);
  showHeatmapRef.current = showHeatmap;
  const show3DRef = useRef(show3D);
  show3DRef.current = show3D;
  const onCameraPressRef = useRef(onCameraPress);
  onCameraPressRef.current = onCameraPress;

  const htmlContent = useMemo(() => getMapHtmlContent(), []);

  const sendMapUpdate = () => {
    if (!webViewRef.current) return;
    const currentCameras = camerasRef.current;
    const heatmapPoints = getTrafficHeatmapPoints(currentCameras);
    const payload = {
      type: "UPDATE_DATA",
      cameras: currentCameras,
      vehicle: vehicleRef.current,
      trajectory: trajectoryRef.current,
      showHeatmap: showHeatmapRef.current,
      show3D: show3DRef.current,
      heatmapPoints,
    };

    const jsCode = `(function() {
      var data = ${JSON.stringify(payload)};
      if (window.__traffixUpdateMap) {
        window.__traffixUpdateMap(data);
      }
    })(); true;`;

    webViewRef.current.injectJavaScript(jsCode);
    webViewRef.current.postMessage(JSON.stringify(payload));
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const raw = event.nativeEvent.data;
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (data?.type === "CAMERA_CLICK") {
        const found = camerasRef.current.find((c) => c.id === data.cameraId);
        if (found) {
          onCameraPressRef.current(found);
        }
      } else if (data?.type === "MAP_READY") {
        sendMapUpdate();
      }
    } catch (err) {
      console.warn("CityMap mobile onMessage parse error:", err);
    }
  };

  useEffect(() => {
    sendMapUpdate();
  }, [cameras, vehicle, trajectory, showHeatmap, show3D]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        onLoadEnd={sendMapUpdate}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        androidLayerType="hardware"
        scrollEnabled={false}
        nestedScrollEnabled={true}
        style={styles.webView}
      />

      {/* Top Map Action Buttons */}
      <View style={styles.topControls}>
        {/* 3D Buildings Toggle */}
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            show3D ? styles.toggleBtn3DActive : styles.toggleBtnInactive,
          ]}
          onPress={() => setShow3D(!show3D)}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleEmoji}>🏢</Text>
          <Text
            style={[
              styles.toggleText,
              show3D ? styles.text3DActive : styles.textInactive,
            ]}
          >
            {show3D ? "3D Buildings On" : "3D Off"}
          </Text>
        </TouchableOpacity>

        {/* Heatmap Toggle */}
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            showHeatmap ? styles.toggleBtnHeatActive : styles.toggleBtnInactive,
          ]}
          onPress={() => setShowHeatmap(!showHeatmap)}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleEmoji}>🔥</Text>
          <Text
            style={[
              styles.toggleText,
              showHeatmap ? styles.textHeatActive : styles.textInactive,
            ]}
          >
            {showHeatmap ? "Heatmap On" : "Heatmap Off"}
          </Text>
        </TouchableOpacity>
      </View>

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
            <View style={styles.heatDotContainer}>
              <View style={[styles.heatDot, { backgroundColor: "#3b82f6" }]} />
              <View style={[styles.heatDot, { backgroundColor: "#10b981" }]} />
              <View style={[styles.heatDot, { backgroundColor: "#f59e0b" }]} />
              <View style={[styles.heatDot, { backgroundColor: "#ef4444" }]} />
            </View>
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
    backgroundColor: "#0b0f19",
  },
  webView: {
    flex: 1,
    backgroundColor: "#0b0f19",
  },
  topControls: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  toggleBtn3DActive: {
    backgroundColor: "#0f172a",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
  },
  toggleBtnHeatActive: {
    backgroundColor: "#0f172a",
    borderWidth: 1.5,
    borderColor: "#f59e0b",
  },
  toggleBtnInactive: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  toggleEmoji: {
    fontSize: 14,
    marginRight: 5,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  text3DActive: {
    color: "#38bdf8",
  },
  textHeatActive: {
    color: "#f59e0b",
  },
  textInactive: {
    color: "#94a3b8",
  },
  legend: {
    position: "absolute",
    bottom: 15,
    left: 15,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    zIndex: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  legendEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  routeIndicator: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0284c7",
    marginRight: 5,
  },
  heatmapLegendItem: {
    borderLeftWidth: 1,
    borderLeftColor: "#334155",
    paddingLeft: 10,
    marginRight: 0,
  },
  densityLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
  },
  heatDotContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
    gap: 2,
  },
  heatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
