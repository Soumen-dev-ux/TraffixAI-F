export function getMapHtmlContent(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>MapLibre 3D Tactical Traffic Map</title>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map {
      width: 100%;
      height: 100%;
      background: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    .camera-marker {
      background: rgba(15, 23, 42, 0.9);
      border: 2px solid #38bdf8;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      box-shadow: 0 0 14px rgba(56, 189, 248, 0.45);
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
    }
    .camera-marker:hover, .camera-marker:active {
      transform: scale(1.25) translateY(-3px);
      box-shadow: 0 0 22px rgba(56, 189, 248, 0.85);
      z-index: 50;
    }
    .camera-label {
      position: absolute;
      bottom: -22px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(11, 15, 25, 0.95);
      color: #38bdf8;
      font-size: 10px;
      font-weight: 700;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.7);
      border: 1px solid rgba(56, 189, 248, 0.35);
      letter-spacing: 0.4px;
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
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
      animation: vehiclePulse 2s infinite ease-in-out;
    }
    @keyframes vehiclePulse {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-4px) scale(1.08); }
    }
    .vehicle-plate-pill {
      position: absolute;
      bottom: -20px;
      background: #0f172a;
      color: #38bdf8;
      font-size: 10px;
      font-weight: 800;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #0284c7;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      pointer-events: none;
    }
    .detection-marker {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.95);
      border: 2px solid #38bdf8;
      color: #38bdf8;
      font-size: 11px;
      font-weight: 800;
      font-family: ui-monospace, monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
      cursor: pointer;
    }
    .detection-marker.latest {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #dc2626;
      border-color: #ffffff;
      color: #ffffff;
      box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.4), 0 0 18px rgba(220, 38, 38, 0.8);
      animation: pulseAlert 1.5s infinite;
    }
    @keyframes pulseAlert {
      0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.8), 0 0 12px rgba(220, 38, 38, 0.6); }
      70% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0), 0 0 20px rgba(220, 38, 38, 0.8); }
      100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0), 0 0 12px rgba(220, 38, 38, 0.6); }
    }
    .maplibregl-popup-content {
      border-radius: 12px;
      padding: 10px 14px;
      background: rgba(11, 15, 25, 0.95);
      color: #f8fafc;
      backdrop-filter: blur(10px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.6);
      border: 1px solid rgba(56, 189, 248, 0.25);
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
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .maplibregl-ctrl-group button {
      background: transparent;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .maplibregl-ctrl-group button:hover {
      background: rgba(56, 189, 248, 0.15);
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

    var rasterFallbackStyle = {
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
          attribution: '&copy; OpenStreetMap contributors'
        }
      },
      layers: [{
        id: 'osm-raster-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 22
      }]
    };

    var map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: [88.3639, 22.5726], // Kolkata Center [lng, lat]
      zoom: 13,
      minZoom: 2,
      maxZoom: 19,
      pitch: 52, // 3D perspective slant angle
      bearing: -15, // Cinematic perspective rotation
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');

    var isMapReady = false;
    var pendingData = null;
    var cameraMarkers = [];
    var trajectoryMarkers = [];
    var vehicleMarker = null;
    var is3DEnabled = true;

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
      // 1. 3D Buildings & Sunlight Shading
      if (map.getSource('openmaptiles') && !map.getLayer('3d-buildings')) {
        map.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'render_height'], 15],
              0, '#111827',
              20, '#1e293b',
              45, '#334155',
              80, '#475569',
              120, '#64748b'
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              13, 0,
              14, ['coalesce', ['get', 'render_height'], ['*', ['get', 'render_levels'], 3.2], 14]
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              13, 0,
              14, ['coalesce', ['get', 'render_min_height'], 0]
            ],
            'fill-extrusion-opacity': 0.88
          }
        });

        try {
          map.setLight({
            anchor: 'viewport',
            color: '#f8fafc',
            intensity: 0.45,
            position: [1.15, 210, 30] // Sunlight direction for realistic building shadows
          });
        } catch (err) {
          console.warn('setLight error:', err);
        }
      }

      // 2. Traffic Density Heatmap Layer
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

      // 3. Glowing Tactical Trajectory Paths
      if (!map.getSource('trajectory-source')) {
        map.addSource('trajectory-source', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
        });
        // Outer glowing neon bloom
        map.addLayer({
          id: 'trajectory-glow-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#38bdf8',
            'line-width': 12,
            'line-opacity': 0.5,
            'line-blur': 6
          }
        });
        // Inner focused laser core
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
      }
    }

    map.on('load', function() {
      isMapReady = true;
      initLayers();
      if (pendingData) {
        updateMap(pendingData);
        pendingData = null;
      }
      postToHost({ type: 'MAP_READY' });
    });

    map.on('error', function(e) {
      if (e && e.error && e.error.message && (e.error.message.includes('style') || e.error.message.includes('Failed to fetch'))) {
        console.warn('MapLibre vector style fallback to raster OSM', e);
        if (map.getStyle() !== rasterFallbackStyle) {
          map.setStyle(rasterFallbackStyle);
          map.once('style.load', function() {
            initLayers();
            if (pendingData) updateMap(pendingData);
          });
        }
      }
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
      var show3D = data.show3D !== undefined ? data.show3D : true;

      // Toggle 3D Buildings & Camera Perspective Tilt
      if (show3D !== is3DEnabled) {
        is3DEnabled = show3D;
        if (map.getLayer('3d-buildings')) {
          map.setLayoutProperty('3d-buildings', 'visibility', show3D ? 'visible' : 'none');
        }
        if (show3D) {
          map.easeTo({ pitch: 52, bearing: -15, duration: 800 });
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

        var popup = new maplibregl.Popup({ offset: 22 })
          .setHTML('<strong style=\"font-size:13px; color:#38bdf8;\">' + (camera.name || camera.id) + '</strong><br/><span style=\"color:#94a3b8;\">Status: ' + (camera.status || 'Active') + '</span>');

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

          var popup = new maplibregl.Popup({ offset: 20 })
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
          map.fitBounds(bounds, { padding: 70, pitch: is3DEnabled ? 52 : 0, duration: 1200 });
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

        var vpopup = new maplibregl.Popup({ offset: 26 })
          .setHTML('<strong style=\"color:#38bdf8;\">' + vehicle.plateNumber + '</strong><br/>' + (vehicle.color || '') + ' ' + (vehicle.vehicleType || '') + '<br/><span style=\"color:#94a3b8;\">Speed: ' + (vehicle.speed ? vehicle.speed + ' km/h' : 'Moving') + '</span>');

        vehicleMarker = new maplibregl.Marker({ element: vel, anchor: 'center' })
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .setPopup(vpopup)
          .addTo(map);

        if (!trajectory || !trajectory.detections || trajectory.detections.length <= 1) {
          map.flyTo({
            center: [vehicle.longitude, vehicle.latitude],
            zoom: 15.5,
            pitch: is3DEnabled ? 55 : 0,
            duration: 1500
          });
        }
      }

      // 5. Auto-fit cameras on initial view if no vehicle/trajectory
      if (!vehicle && (!trajectory || !trajectory.detections || trajectory.detections.length === 0)) {
        if (cameras.length > 1) {
          var camBounds = new maplibregl.LngLatBounds();
          cameras.forEach(function(c) { camBounds.extend([c.longitude, c.latitude]); });
          map.fitBounds(camBounds, { padding: 90, pitch: is3DEnabled ? 45 : 0, duration: 800 });
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
