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

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MapLibre Traffic Map</title>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <style>
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
    }
    .camera-marker {
      background: #ffffff;
      border: 2px solid #0284c7;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
    }
    .camera-marker:hover {
      transform: scale(1.25) translateY(-2px);
      box-shadow: 0 8px 18px rgba(2, 132, 199, 0.45);
      z-index: 50;
    }
    .camera-label {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.9);
      color: #38bdf8;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .vehicle-marker {
      background: #0f172a;
      color: #ffffff;
      border: 2px solid #38bdf8;
      border-radius: 24px;
      padding: 4px 10px;
      box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4);
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      animation: vehicleFloat 2s ease-in-out infinite alternate;
    }
    @keyframes vehicleFloat {
      from { transform: translateY(0px); }
      to { transform: translateY(-4px); }
    }
    .vehicle-emoji {
      font-size: 20px;
    }
    .vehicle-plate-pill {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #f8fafc;
    }
    .detection-marker {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ffffff;
      border: 2.5px solid #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 12px;
      color: #1e40af;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    .detection-marker.latest {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #dc2626;
      border-color: #ffffff;
      color: #ffffff;
      box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.35), 0 4px 12px rgba(0,0,0,0.4);
      animation: pulseAlert 1.5s infinite;
    }
    @keyframes pulseAlert {
      0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
      100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    }
    .maplibregl-popup-content {
      border-radius: 12px;
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.95);
      color: #f8fafc;
      backdrop-filter: blur(8px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.1);
      font-size: 12px;
      line-height: 1.4;
    }
    .maplibregl-popup-close-button {
      color: #94a3b8;
      font-size: 16px;
      padding: 4px;
    }
    .maplibregl-ctrl-group {
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var rasterFallback = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors'
        }
      },
      layers: [{
        id: 'osm-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }]
    };

    var mapStyle = {
      version: 8,
      sources: {
        'esri-tiles': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 18,
          attribution: '&copy; Esri, DeLorme, NAVTEQ, TomTom &mdash; MapLibre'
        }
      },
      layers: [{
        id: 'esri-tiles-layer',
        type: 'raster',
        source: 'esri-tiles',
        minzoom: 0,
        maxzoom: 22
      }]
    };

    var map = new maplibregl.Map({
      container: 'map',
      style: mapStyle,
      center: [88.3639, 22.5726], // [lng, lat]
      zoom: 13,
      minZoom: 9,
      maxZoom: 18.5,
      pitch: 35, // 3D perspective tilt
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');

    map.on('error', function(e) {
      if (e && e.error && e.error.message && e.error.message.includes('style')) {
        console.warn('MapLibre vector style fallback to raster OSM tiles', e);
        map.setStyle(rasterFallback);
      }
    });

    var isMapReady = false;
    var pendingData = null;
    var cameraMarkers = [];
    var trajectoryMarkers = [];
    var vehicleMarker = null;

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

    function initLayers() {
      // 1. Heatmap Source & WebGL Layer
      if (!map.getSource('traffic-heat-source')) {
        map.addSource('traffic-heat-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addLayer({
          id: 'traffic-heat-layer',
          type: 'heatmap',
          source: 'traffic-heat-source',
          paint: {
            'heatmap-weight': ['get', 'weight'],
            'heatmap-intensity': 1.6,
            'heatmap-radius': 38,
            'heatmap-opacity': 0.75,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(59,130,246,0)',
              0.2, '#3b82f6',
              0.4, '#06b6d4',
              0.6, '#10b981',
              0.8, '#f59e0b',
              1.0, '#ef4444'
            ]
          }
        });
      }

      // 2. Trajectory Line Source & Layers
      if (!map.getSource('trajectory-source')) {
        map.addSource('trajectory-source', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
        });
        map.addLayer({
          id: 'trajectory-glow-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#60a5fa',
            'line-width': 10,
            'line-opacity': 0.45,
            'line-blur': 4
          }
        });
        map.addLayer({
          id: 'trajectory-line-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#2563eb',
            'line-width': 5,
            'line-opacity': 0.95
          }
        });
      }
    }

    map.on('load', function() {
      isMapReady = true;
      initLayers();
      if (pendingData) {
        updateMap(pendingData);
        pendingData = null;
      }
      window.parent.postMessage({ type: 'MAP_READY' }, '*');
    });

    function updateMap(data) {
      if (!data) return;
      if (!isMapReady) {
        pendingData = data;
        return;
      }

      var cameras = data.cameras || [];
      var vehicle = data.vehicle;
      var trajectory = data.trajectory;
      var showHeatmap = data.showHeatmap;
      var heatmapPoints = data.heatmapPoints || [];

      // 1. Update Heatmap Layer
      if (map.getLayer('traffic-heat-layer')) {
        map.setLayoutProperty('traffic-heat-layer', 'visibility', showHeatmap ? 'visible' : 'none');
      }
      if (map.getSource('traffic-heat-source')) {
        var heatFeatures = heatmapPoints.map(function(p) {
          return {
            type: 'Feature',
            properties: { weight: p.weight || 0.5 },
            geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] }
          };
        });
        map.getSource('traffic-heat-source').setData({
          type: 'FeatureCollection',
          features: heatFeatures
        });
      }

      // 2. Update Cameras
      cameraMarkers.forEach(function(m) { m.remove(); });
      cameraMarkers = [];
      cameras.forEach(function(camera) {
        var el = document.createElement('div');
        el.className = 'camera-marker';
        el.title = camera.name || camera.id;
        el.innerHTML = '📹<span class="camera-label">' + (camera.name || camera.id) + '</span>';
        el.addEventListener('click', function(ev) {
          ev.stopPropagation();
          window.parent.postMessage({ type: 'CAMERA_CLICK', cameraId: camera.id }, '*');
        });

        var popup = new maplibregl.Popup({ offset: 20 })
          .setHTML('<strong style="font-size:13px; color:#38bdf8;">' + (camera.name || camera.id) + '</strong><br/><span style="color:#94a3b8;">Status: ' + (camera.status || 'Active') + '</span>');

        var marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([camera.longitude, camera.latitude])
          .setPopup(popup)
          .addTo(map);

        cameraMarkers.push(marker);
      });

      // 3. Update Trajectory
      trajectoryMarkers.forEach(function(m) { m.remove(); });
      trajectoryMarkers = [];

      var lineCoords = [];
      if (trajectory && trajectory.detections && trajectory.detections.length > 0) {
        lineCoords = trajectory.detections.map(function(d) {
          return [d.longitude, d.latitude];
        });

        trajectory.detections.forEach(function(detection, index) {
          var isLatest = index === trajectory.detections.length - 1;
          var el = document.createElement('div');
          el.className = 'detection-marker ' + (isLatest ? 'latest' : '');
          el.innerHTML = String(index + 1);

          var popup = new maplibregl.Popup({ offset: 18 })
            .setHTML('<strong>Point #' + (index + 1) + '</strong><br/>' + (detection.cameraName || '') + '<br/><span style="color:#94a3b8;">' + (detection.detectedAt || '') + '</span>');

          var marker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([detection.longitude, detection.latitude])
            .setPopup(popup)
            .addTo(map);

          trajectoryMarkers.push(marker);
        });

        if (lineCoords.length > 1) {
          var bounds = new maplibregl.LngLatBounds();
          lineCoords.forEach(function(c) { bounds.extend(c); });
          map.fitBounds(bounds, { padding: 60, pitch: 35, duration: 1200 });
        }
      }

      if (map.getSource('trajectory-source')) {
        map.getSource('trajectory-source').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: lineCoords.length > 1 ? lineCoords : []
          }
        });
      }

      // 4. Update Vehicle
      if (vehicleMarker) {
        vehicleMarker.remove();
        vehicleMarker = null;
      }
      if (vehicle) {
        var el = document.createElement('div');
        el.className = 'vehicle-marker';
        var emoji = getVehicleEmoji(vehicle.vehicleType);
        el.innerHTML = '<span class="vehicle-emoji">' + emoji + '</span><span class="vehicle-plate-pill">' + (vehicle.plateNumber || '') + '</span>';

        var popup = new maplibregl.Popup({ offset: 24 })
          .setHTML('<strong>' + vehicle.plateNumber + '</strong><br/>' + (vehicle.color || '') + ' ' + (vehicle.vehicleType || '') + '<br/><span style="color:#94a3b8;">Speed: ' + (vehicle.speed ? vehicle.speed + ' km/h' : 'Moving') + '</span>');

        vehicleMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .setPopup(popup)
          .addTo(map);

        if (!trajectory || !trajectory.detections || trajectory.detections.length <= 1) {
          map.flyTo({
            center: [vehicle.longitude, vehicle.latitude],
            zoom: 15,
            pitch: 40,
            duration: 1500
          });
        }
      }

      // 5. Auto-fit cameras on initial view
      if (!vehicle && (!trajectory || !trajectory.detections || trajectory.detections.length === 0)) {
        if (cameras.length > 1) {
          var camBounds = new maplibregl.LngLatBounds();
          cameras.forEach(function(c) { camBounds.extend([c.longitude, c.latitude]); });
          map.fitBounds(camBounds, { padding: 80, pitch: 25, duration: 800 });
        }
      }
    }

    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'UPDATE_DATA') {
        updateMap(event.data);
      }
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
