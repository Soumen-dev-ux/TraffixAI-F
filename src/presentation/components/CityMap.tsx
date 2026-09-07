import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
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
  is3DView?: boolean;
  showHeatmap?: boolean;
  style?: any;
};

export default function CityMap({
  cameras,
  vehicle,
  trajectory,
  onCameraPress,
  is3DView = true,
  showHeatmap = true,
  style,
}: Props) {
  const webViewRef = useRef<WebView>(null);

  const camerasRef = useRef(cameras);
  camerasRef.current = cameras;
  const vehicleRef = useRef(vehicle);
  vehicleRef.current = vehicle;
  const trajectoryRef = useRef(trajectory);
  trajectoryRef.current = trajectory;
  const showHeatmapRef = useRef(showHeatmap);
  showHeatmapRef.current = showHeatmap;
  const is3DViewRef = useRef(is3DView);
  is3DViewRef.current = is3DView;
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
      is3DView: is3DViewRef.current,
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
  }, [cameras, vehicle, trajectory, showHeatmap, is3DView]);

  return (
    <View style={[styles.container, style]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "#0f1117",
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "#0f1117",
  },
});
