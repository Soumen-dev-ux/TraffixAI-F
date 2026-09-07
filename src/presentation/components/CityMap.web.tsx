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
  const onCameraPressRef = useRef(onCameraPress);
  onCameraPressRef.current = onCameraPress;

  // Handle messages from the iframe (camera clicks)
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
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Send message to update iframe map data
  const updateMapData = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const heatmapPoints = getTrafficHeatmapPoints(cameras);
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_DATA",
          cameras,
          vehicle,
          trajectory,
          showHeatmap,
          heatmapPoints,
        },
        "*"
      );
    }
  };

  useEffect(() => {
    updateMapData();
  }, [cameras, vehicle, trajectory, showHeatmap]);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
  <style>
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #f0f2f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .camera-marker {
      background: #ffffff;
      border-radius: 20px;
      padding: 5px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    .camera-marker:hover {
      transform: scale(1.2);
    }
    .vehicle-marker {
      background: #ffffff;
      border-radius: 24px;
      padding: 6px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      font-size: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .detection-marker {
      width: 26px;
      height: 26px;
      border-radius: 13px;
      background: #ffffff;
      border: 2px solid #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
      color: #1e40af;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .detection-marker.latest {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      border-color: #dc2626;
      color: #991b1b;
    }
    .leaflet-popup-content-wrapper {
      border-radius: 8px;
      padding: 4px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([22.5726, 88.3639], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var heatLayer = null;
    var cameraLayerGroup = L.layerGroup().addTo(map);
    var trajectoryLayerGroup = L.layerGroup().addTo(map);
    var vehicleLayerGroup = L.layerGroup().addTo(map);

    function getVehicleEmoji(type) {
      switch (type) {
        case 'car': return '🚗';
        case 'motorcycle': return '🏍️';
        case 'bus': return '🚌';
        case 'truck': return '🚚';
        case 'van': return '🚐';
        case 'taxi': return '🚕';
        default: return '🚗';
      }
    }

    function updateMap(data) {
      if (!data) return;
      var cameras = data.cameras || [];
      var vehicle = data.vehicle;
      var trajectory = data.trajectory;
      var showHeatmap = data.showHeatmap;
      var heatmapPoints = data.heatmapPoints || [];

      // Update Heatmap
      if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
      }
      if (showHeatmap && heatmapPoints.length > 0 && typeof L.heatLayer === 'function') {
        var heatPoints = heatmapPoints.map(function(p) {
          return [p.latitude, p.longitude, p.weight];
        });
        heatLayer = L.heatLayer(heatPoints, {
          radius: 32,
          blur: 20,
          maxZoom: 16,
          max: 1.0,
          gradient: {
            0.2: '#3b82f6',
            0.4: '#06b6d4',
            0.6: '#10b981',
            0.8: '#f59e0b',
            1.0: '#ef4444'
          }
        }).addTo(map);
      }

      // Update Cameras
      cameraLayerGroup.clearLayers();
      cameras.forEach(function(camera) {
        var icon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="camera-marker" title="' + (camera.name || '') + '">📹</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        var marker = L.marker([camera.latitude, camera.longitude], { icon: icon });
        marker.bindTooltip(camera.name || camera.id);
        marker.on('click', function() {
          window.parent.postMessage({ type: 'CAMERA_CLICK', cameraId: camera.id }, '*');
        });
        cameraLayerGroup.addLayer(marker);
      });

      // Update Trajectory
      trajectoryLayerGroup.clearLayers();
      if (trajectory && trajectory.detections && trajectory.detections.length > 0) {
        var coords = trajectory.detections.map(function(d) {
          return [d.latitude, d.longitude];
        });

        if (coords.length > 1) {
          var polyline = L.polyline(coords, {
            color: '#2563eb',
            weight: 5,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          });
          trajectoryLayerGroup.addLayer(polyline);
        }

        trajectory.detections.forEach(function(detection, index) {
          var isLatest = index === trajectory.detections.length - 1;
          var icon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div class="detection-marker ' + (isLatest ? 'latest' : '') + '">' + (index + 1) + '</div>',
            iconSize: [isLatest ? 32 : 26, isLatest ? 32 : 26],
            iconAnchor: [isLatest ? 16 : 13, isLatest ? 16 : 13]
          });
          var marker = L.marker([detection.latitude, detection.longitude], { icon: icon });
          marker.bindTooltip(detection.cameraName + '<br/>' + detection.detectedAt);
          trajectoryLayerGroup.addLayer(marker);
        });

        if (coords.length > 1) {
          map.fitBounds(L.polyline(coords).getBounds(), { padding: [50, 50] });
        }
      }

      // Update Vehicle
      vehicleLayerGroup.clearLayers();
      if (vehicle) {
        var emoji = getVehicleEmoji(vehicle.vehicleType);
        var icon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="vehicle-marker">' + emoji + '</div>',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        var marker = L.marker([vehicle.latitude, vehicle.longitude], { icon: icon });
        marker.bindTooltip(vehicle.plateNumber + ' (' + vehicle.color + ' ' + vehicle.vehicleType + ')');
        vehicleLayerGroup.addLayer(marker);

        if (!trajectory || !trajectory.detections || trajectory.detections.length <= 1) {
          map.panTo([vehicle.latitude, vehicle.longitude], { animate: true });
        }
      }
    }

    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'UPDATE_DATA') {
        updateMap(event.data);
      }
    });

    window.addEventListener('load', function() {
      window.parent.postMessage({ type: 'MAP_READY' }, '*');
    });
  </script>
</body>
</html>
  `;

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
        onLoad: updateMapData,
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
