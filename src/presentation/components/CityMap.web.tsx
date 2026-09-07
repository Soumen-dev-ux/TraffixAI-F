import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
          is3DView: is3DViewRef.current,
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
  }, [cameras, vehicle, trajectory, showHeatmap, is3DView]);

  const htmlContent = React.useMemo(() => getMapHtmlContent(), []);

  return (
    <View style={[styles.container, style]}>
      {React.createElement("iframe", {
        ref: iframeRef,
        srcDoc: htmlContent,
        style: {
          width: "100%",
          height: "100%",
          border: "none",
          backgroundColor: "#0f1117",
        },
        onLoad: sendMapUpdate,
      })}
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
});
