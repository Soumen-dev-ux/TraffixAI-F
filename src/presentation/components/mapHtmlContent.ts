import { kolkataBuildings } from "../../data/kolkataBuildings";

export function getMapHtmlContent(): string {
  const buildingsJson = JSON.stringify(kolkataBuildings);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>MapLibre Traffic Map</title>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map {
      width: 100%;
      height: 100%;
      background: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    .camera-marker {
      background: #ffffff;
      border: 2px solid #0284c7;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.45);
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
    }
    .camera-marker:hover, .camera-marker:active {
      transform: scale(1.25) translateY(-4px);
      box-shadow: 0 12px 24px rgba(2, 132, 199, 0.55);
      z-index: 50;
    }
    .camera-label {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      color: #38bdf8;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
      border: 1px solid rgba(56, 189, 248, 0.35);
      letter-spacing: 0.3px;
    }
    .vehicle-marker {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .vehicle-emoji {
      font-size: 30px;
      filter: drop-shadow(0 6px 10px rgba(0,0,0,0.5));
      animation: bounce 2s infinite ease-in-out;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .vehicle-plate-pill {
      position: absolute;
      bottom: -20px;
      background: #0f172a;
      color: #38bdf8;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid #0284c7;
      white-space: nowrap;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
      pointer-events: none;
    }
    .detection-marker {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid #2563eb;
      color: #1e40af;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      cursor: pointer;
    }
    .detection-marker.latest {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #dc2626;
      border-color: #ffffff;
      color: #ffffff;
      box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.35), 0 6px 16px rgba(0,0,0,0.45);
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
    function postToHost(msg) {
      try {
        var payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(payload);
        }
        if (window.parent && window.parent.postMessage) {
          window.parent.postMessage(msg, '*');
        }
      } catch (e) {
        console.error('postToHost error', e);
      }
    }

    var mapStyle = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: '&copy; OpenStreetMap contributors &mdash; MapLibre'
        },
        'kolkata-buildings': {
          type: 'geojson',
          data: ${buildingsJson}
        }
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 22
        },
        {
          id: '3d-buildings-layer',
          type: 'fill-extrusion',
          source: 'kolkata-buildings',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': [
              'interpolate', ['linear'], ['get', 'height'],
              12, '#f8fafc',
              20, '#e2e8f0',
              30, '#cbd5e1',
              45, '#94a3b8'
            ],
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              13, 0,
              14.5, ['get', 'height']
            ],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.88
          }
        }
      ]
    };

    // Initialize map with enhanced 3D perspective pitch and angled bearing
    var map = new maplibregl.Map({
      container: 'map',
      style: mapStyle,
      center: [88.3639, 22.5726],
      zoom: 13,
      minZoom: 2,
      maxZoom: 19,
      pitch: 50, // Enhanced 3D camera angle
      bearing: -18, // Angled street perspective
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');

    var isMapReady = false;
    var pendingData = null;
    var cameraMarkers = [];
    var trajectoryMarkers = [];
    var vehicleMarker = null;
    var is3DCurrent = true;

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
      // 1. WebGL Traffic Density Heatmap
      if (!map.getSource('traffic-heat-source')) {
        map.addSource('traffic-heat-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addLayer({
          id: 'traffic-heat-layer',
          type: 'heatmap',
          source: 'traffic-heat-source',
          maxzoom: 18,
          paint: {
            'heatmap-weight': ['get', 'weight'],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 2.5],
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.2, '#3b82f6',
              0.4, '#06b6d4',
              0.6, '#10b981',
              0.8, '#f59e0b',
              1.0, '#ef4444'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 18, 15, 38],
            'heatmap-opacity': 0.72
          }
        });
      }

      // 2. Elevated 3D Trajectory Ribbon (Multi-Layer Depth)
      if (!map.getSource('trajectory-source')) {
        map.addSource('trajectory-source', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
        });

        // Layer A: Ground Drop-Shadow (provides floating 3D elevation illusion)
        map.addLayer({
          id: 'trajectory-shadow-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#020617',
            'line-width': 12,
            'line-opacity': 0.38,
            'line-blur': 6,
            'line-offset': 4
          }
        });

        // Layer B: Outer Neon Cyan Glow Bloom
        map.addLayer({
          id: 'trajectory-glow-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#38bdf8',
            'line-width': 10,
            'line-opacity': 0.55,
            'line-blur': 4
          }
        });

        // Layer C: Vibrant Blue Core Route
        map.addLayer({
          id: 'trajectory-line-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#0284c7',
            'line-width': 5,
            'line-opacity': 1.0
          }
        });

        // Layer D: Sharp Center Laser Highlight
        map.addLayer({
          id: 'trajectory-highlight-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.5,
            'line-opacity': 0.85
          }
        });
      }
    }

    map.on('load', function() {
      isMapReady = true;
      try {
        map.setLight({
          anchor: 'viewport',
          color: '#ffffff',
          intensity: 0.6,
          position: [1.15, 210, 30]
        });
      } catch(e) {}
      initLayers();
      if (pendingData) {
        updateMap(pendingData);
        pendingData = null;
      }
      postToHost({ type: 'MAP_READY' });
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
      var is3D = data.is3DView !== undefined ? data.is3DView : true;

      // Smooth camera perspective pitch transition & building visibility toggle
      if (is3D !== is3DCurrent) {
        is3DCurrent = is3D;
        if (map.getLayer('3d-buildings-layer')) {
          map.setLayoutProperty('3d-buildings-layer', 'visibility', is3D ? 'visible' : 'none');
        }
        if (is3D) {
          map.easeTo({ pitch: 50, bearing: -18, duration: 800 });
        } else {
          map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
        }
      }

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
        el.innerHTML = '📹<span class=\"camera-label\">' + (camera.name || camera.id) + '</span>';
        el.addEventListener('click', function(ev) {
          ev.stopPropagation();
          postToHost({ type: 'CAMERA_CLICK', cameraId: camera.id });
        });

        var popup = new maplibregl.Popup({ offset: 20 })
          .setHTML('<strong style=\"font-size:13px; color:#0284c7;\">' + (camera.name || camera.id) + '</strong><br/><span style=\"color:#94a3b8;\">Status: ' + (camera.status || 'Active') + '</span>');

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
            .setHTML('<strong>Point #' + (index + 1) + '</strong><br/>' + (detection.cameraName || '') + '<br/><span style=\"color:#94a3b8;\">' + (detection.detectedAt || '') + '</span>');

          var marker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([detection.longitude, detection.latitude])
            .setPopup(popup)
            .addTo(map);

          trajectoryMarkers.push(marker);
        });

        if (lineCoords.length > 1) {
          var bounds = new maplibregl.LngLatBounds();
          lineCoords.forEach(function(c) { bounds.extend(c); });
          map.fitBounds(bounds, { padding: 60, pitch: is3DCurrent ? 50 : 0, bearing: is3DCurrent ? -18 : 0, duration: 1200 });
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
        var vel = document.createElement('div');
        vel.className = 'vehicle-marker';
        var emoji = getVehicleEmoji(vehicle.vehicleType);
        vel.innerHTML = '<span class=\"vehicle-emoji\">' + emoji + '</span><span class=\"vehicle-plate-pill\">' + (vehicle.plateNumber || '') + '</span>';

        var vpopup = new maplibregl.Popup({ offset: 24 })
          .setHTML('<strong>' + vehicle.plateNumber + '</strong><br/>' + (vehicle.color || '') + ' ' + (vehicle.vehicleType || '') + '<br/><span style=\"color:#94a3b8;\">Speed: ' + (vehicle.speed ? vehicle.speed + ' km/h' : 'Moving') + '</span>');

        vehicleMarker = new maplibregl.Marker({ element: vel, anchor: 'center' })
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .setPopup(vpopup)
          .addTo(map);

        if (!trajectory || !trajectory.detections || trajectory.detections.length <= 1) {
          map.flyTo({
            center: [vehicle.longitude, vehicle.latitude],
            zoom: 15.5,
            pitch: is3DCurrent ? 52 : 0,
            bearing: is3DCurrent ? -18 : 0,
            duration: 1500
          });
        }
      }

      // 5. Auto-fit cameras on initial view
      if (!vehicle && (!trajectory || !trajectory.detections || trajectory.detections.length === 0)) {
        if (cameras.length > 1) {
          var camBounds = new maplibregl.LngLatBounds();
          cameras.forEach(function(c) { camBounds.extend([c.longitude, c.latitude]); });
          map.fitBounds(camBounds, { padding: 80, pitch: is3DCurrent ? 46 : 0, bearing: is3DCurrent ? -18 : 0, duration: 800 });
        }
      }
    }

    window.__traffixUpdateMap = function(data) {
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) {}
      }
      updateMap(data);
    };

    function handleIncomingEvent(event) {
      var data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) {}
      }
      if (data && data.type === 'UPDATE_DATA') {
        updateMap(data);
      }
    }

    window.addEventListener('message', handleIncomingEvent);
    document.addEventListener('message', handleIncomingEvent);
  </script>
</body>
</html>`;
}
