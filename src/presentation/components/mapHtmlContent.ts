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
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    .camera-marker {
      background: #1e293b;
      border: 2px solid #22c55e;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.55);
      color: #38bdf8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
    }
    .camera-marker.offline {
      border-color: #ef4444;
      color: #94a3b8;
    }
    .camera-marker:hover, .camera-marker:active {
      transform: scale(1.22) translateY(-3px);
      box-shadow: 0 12px 24px rgba(34, 197, 94, 0.45);
      z-index: 50;
    }
    .camera-count-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #0f172a;
      border: 1.5px solid #22c55e;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
    }
    .camera-marker.offline .camera-count-badge {
      border-color: #ef4444;
    }
    .camera-label {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      color: #f1f5f9;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      letter-spacing: 0.3px;
    }
    .vehicle-marker {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .vehicle-icon-ring {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #0284c7;
      border: 2.5px solid #38bdf8;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.3), 0 8px 20px rgba(0,0,0,0.6);
      animation: pulseVehicle 2s infinite ease-in-out;
    }
    @keyframes pulseVehicle {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.3), 0 8px 20px rgba(0,0,0,0.6); }
      50% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(56, 189, 248, 0.15), 0 12px 24px rgba(0,0,0,0.7); }
    }
    .vehicle-plate-pill {
      position: absolute;
      bottom: -22px;
      background: #0f172a;
      color: #38bdf8;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #38bdf8;
      white-space: nowrap;
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
      pointer-events: none;
      letter-spacing: 0.5px;
    }
    .detection-marker {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #1e293b;
      border: 2px solid #10b981;
      color: #10b981;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      cursor: pointer;
    }
    .detection-marker.latest {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #dc2626;
      border-color: #ffffff;
      color: #ffffff;
      box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.35), 0 6px 16px rgba(0,0,0,0.6);
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
      background: #1e293b !important;
      border: 1px solid #334155;
    }
    .maplibregl-ctrl-group button {
      background: #1e293b !important;
      border-bottom: 1px solid #334155 !important;
    }
    .maplibregl-ctrl-icon {
      filter: invert(1) brightness(0.8);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <canvas id="route-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;"></canvas>
  <script>
    var activeLineCoords = [];
    var routeCache = {};
    var currentActiveCacheKey = '';

    function resizeCanvas() {
      var canvas = document.getElementById('route-canvas');
      if (canvas) {
        canvas.width = document.body.clientWidth || window.innerWidth;
        canvas.height = document.body.clientHeight || window.innerHeight;
      }
    }

    var CS_INSIDE = 0, CS_LEFT = 1, CS_RIGHT = 2, CS_BOTTOM = 4, CS_TOP = 8;
    function computeOutCode(x, y, xmin, ymin, xmax, ymax) {
      var code = CS_INSIDE;
      if (x < xmin) code |= CS_LEFT;
      else if (x > xmax) code |= CS_RIGHT;
      if (y < ymin) code |= CS_TOP;
      else if (y > ymax) code |= CS_BOTTOM;
      return code;
    }

    function clipLine(x0, y0, x1, y1, xmin, ymin, xmax, ymax) {
      var code0 = computeOutCode(x0, y0, xmin, ymin, xmax, ymax);
      var code1 = computeOutCode(x1, y1, xmin, ymin, xmax, ymax);
      var accept = false;

      while (true) {
        if (!(code0 | code1)) {
          accept = true;
          break;
        } else if (code0 & code1) {
          break;
        } else {
          var x, y;
          var outcodeOut = code0 ? code0 : code1;
          if (outcodeOut & CS_BOTTOM) {
            x = x0 + (x1 - x0) * (ymax - y0) / (y1 - y0);
            y = ymax;
          } else if (outcodeOut & CS_TOP) {
            x = x0 + (x1 - x0) * (ymin - y0) / (y1 - y0);
            y = ymin;
          } else if (outcodeOut & CS_RIGHT) {
            y = y0 + (y1 - y0) * (xmax - x0) / (x1 - x0);
            x = xmax;
          } else if (outcodeOut & CS_LEFT) {
            y = y0 + (y1 - y0) * (xmin - x0) / (x1 - x0);
            x = xmin;
          }

          if (outcodeOut === code0) {
            x0 = x; y0 = y;
            code0 = computeOutCode(x0, y0, xmin, ymin, xmax, ymax);
          } else {
            x1 = x; y1 = y;
            code1 = computeOutCode(x1, y1, xmin, ymin, xmax, ymax);
          }
        }
      }
      return accept ? [x0, y0, x1, y1] : null;
    }

    function perpDistSq(pt, l1, l2) {
      var dx = l2[0] - l1[0];
      var dy = l2[1] - l1[1];
      var lenSq = dx * dx + dy * dy;
      if (lenSq === 0) return (pt[0] - l1[0]) * (pt[0] - l1[0]) + (pt[1] - l1[1]) * (pt[1] - l1[1]);
      var u = Math.max(0, Math.min(1, ((pt[0] - l1[0]) * dx + (pt[1] - l1[1]) * dy) / lenSq));
      var px = l1[0] + u * dx;
      var py = l1[1] + u * dy;
      return (pt[0] - px) * (pt[0] - px) + (pt[1] - py) * (pt[1] - py);
    }

    function rdpSimplify(points, epsSq) {
      if (!points || points.length <= 2) return points || [];
      var maxDistSq = 0;
      var index = 0;
      var start = points[0];
      var end = points[points.length - 1];
      for (var i = 1; i < points.length - 1; i++) {
        var dSq = perpDistSq(points[i], start, end);
        if (dSq > maxDistSq) {
          maxDistSq = dSq;
          index = i;
        }
      }
      if (maxDistSq > epsSq) {
        var left = rdpSimplify(points.slice(0, index + 1), epsSq);
        var right = rdpSimplify(points.slice(index), epsSq);
        return left.slice(0, left.length - 1).concat(right);
      } else {
        return [start, end];
      }
    }

    function drawRouteCanvas() {
      var canvas = document.getElementById('route-canvas');
      if (!canvas || !map) return;
      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (!activeLineCoords || activeLineCoords.length < 2) return;

      var margin = 60;
      var xmin = -margin, ymin = -margin;
      var xmax = W + margin, ymax = H + margin;

      var projected = [];
      for (var i = 0; i < activeLineCoords.length; i++) {
        try {
          var p = map.project(activeLineCoords[i]);
          if (p && !isNaN(p.x) && !isNaN(p.y) && Math.abs(p.x) < 35000 && Math.abs(p.y) < 35000) {
            projected.push(p);
          } else {
            projected.push(null);
          }
        } catch(e) {
          projected.push(null);
        }
      }

      var path = new Path2D();
      var hasSegments = false;
      var lastX = -999999, lastY = -999999;

      for (var j = 0; j < projected.length - 1; j++) {
        var p1 = projected[j];
        var p2 = projected[j + 1];
        if (!p1 || !p2) continue;

        var clipped = clipLine(p1.x, p1.y, p2.x, p2.y, xmin, ymin, xmax, ymax);
        if (clipped) {
          hasSegments = true;
          // Connect smoothly if adjacent to previous segment to eliminate CPU end-cap rasterization
          if (Math.abs(clipped[0] - lastX) < 1 && Math.abs(clipped[1] - lastY) < 1) {
            path.lineTo(clipped[2], clipped[3]);
          } else {
            path.moveTo(clipped[0], clipped[1]);
            path.lineTo(clipped[2], clipped[3]);
          }
          lastX = clipped[2];
          lastY = clipped[3];
        }
      }

      if (!hasSegments) return;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Dark contrast casing (base outline)
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 10;
      ctx.stroke(path);

      // 2. Luminous Emerald ribbon
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.stroke(path);

      // 3. Cyber Cyan laser core
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke(path);
    }

    function applyRouteCoordinates(coords, shouldFitBounds) {
      activeLineCoords = coords || [];
      resizeCanvas();
      drawRouteCanvas();

      var src = map && map.getSource('trajectory-source');
      if (src) {
        src.setData({
          type: 'FeatureCollection',
          features: coords && coords.length > 1 ? [{
            type: 'Feature',
            properties: { id: 'route' },
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          }] : []
        });
      }

      if (shouldFitBounds && coords && coords.length > 1) {
        var bounds = new maplibregl.LngLatBounds();
        coords.forEach(function(c) { bounds.extend(c); });
        map.fitBounds(bounds, { padding: 80, pitch: is3DCurrent ? 50 : 0, bearing: is3DCurrent ? -18 : 0, duration: 1200 });
      }
    }
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
        },
        'traffic-heat-source': {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        },
        'trajectory-source': {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
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
              12, '#ffffff',
              20, '#f1f5f9',
              30, '#e2e8f0',
              45, '#cbd5e1'
            ],
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              13, 0,
              14.5, ['get', 'height']
            ],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.85
          }
        },
        {
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
        },
        // Layer A: Bold Dark Contrast Casing (outer border)
        {
          id: 'trajectory-shadow-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#090d16',
            'line-width': 10,
            'line-opacity': 0.95
          }
        },
        // Layer B: Luminous Emerald Glow Ribbon
        {
          id: 'trajectory-glow-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#10b981',
            'line-width': 7,
            'line-opacity': 0.95
          }
        },
        // Layer C: High-Luminance Neon Mint Core
        {
          id: 'trajectory-line-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#34d399',
            'line-width': 4,
            'line-opacity': 1.0
          }
        },
        // Layer D: Sharp Center Pure White Laser Line
        {
          id: 'trajectory-highlight-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.8,
            'line-opacity': 0.95
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

    function initLayers() {
      return true;
    }

    function setupReady() {
      if (isMapReady) {
        initLayers();
        return;
      }
      isMapReady = true;
      initLayers();
      if (pendingData) {
        var d = pendingData;
        pendingData = null;
        updateMap(d);
      }
      postToHost({ type: 'MAP_READY' });
    }

    map.on('style.load', function() {
      try {
        map.setLight({
          anchor: 'viewport',
          color: '#ffffff',
          intensity: 0.65,
          position: [1.15, 210, 30]
        });
      } catch(e) {}
      setupReady();
    });

    map.on('load', function() {
      setupReady();
    });

    // Fallback: If style.load or load delays due to network/tile issues, initialize immediately
    setTimeout(function() {
      setupReady();
    }, 250);

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
        var isOnline = camera.status === 'online';
        el.className = 'camera-marker ' + (isOnline ? 'online' : 'offline');
        el.title = camera.name || camera.id;
        el.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' +
          (camera.vehicleCount ? '<span class="camera-count-badge">' + camera.vehicleCount + '</span>' : '') +
          '<span class="camera-label">' + (camera.name || camera.id) + '</span>';

        el.addEventListener('click', function(ev) {
          ev.stopPropagation();
          postToHost({ type: 'CAMERA_CLICK', cameraId: camera.id });
        });

        var popup = new maplibregl.Popup({ offset: 20 })
          .setHTML('<strong style="font-size:13px; color:#38bdf8;">' + (camera.name || camera.id) + '</strong><br/><span style="color:' + (isOnline ? '#22c55e' : '#ef4444') + ';">Status: ' + (camera.status || 'Active') + '</span><br/><span style="color:#94a3b8;">Traffic: ' + (camera.trafficLevel || 'Normal') + '</span>');

        var marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([camera.longitude, camera.latitude])
          .setPopup(popup)
          .addTo(map);

        cameraMarkers.push(marker);
      });

      // 3. Update Trajectory
      trajectoryMarkers.forEach(function(m) { m.remove(); });
      trajectoryMarkers = [];

      var detections = (trajectory && trajectory.detections) || [];

      // Deduplicate consecutive identical coordinates
      var uniquePoints = [];
      for (var i = 0; i < detections.length; i++) {
        var pt = detections[i];
        if (pt && !isNaN(pt.latitude) && !isNaN(pt.longitude)) {
          if (uniquePoints.length === 0 ||
              Math.abs(uniquePoints[uniquePoints.length - 1].latitude - pt.latitude) > 0.0001 ||
              Math.abs(uniquePoints[uniquePoints.length - 1].longitude - pt.longitude) > 0.0001) {
            uniquePoints.push(pt);
          }
        }
      }

      // Render waypoint markers
      uniquePoints.forEach(function(detection, index) {
        var isLatest = index === uniquePoints.length - 1;
        var el = document.createElement('div');
        el.className = 'detection-marker ' + (isLatest ? 'latest' : '');
        el.innerHTML = String(index + 1);

        var popup = new maplibregl.Popup({ offset: 18 })
          .setHTML('<strong>Waypoint #' + (index + 1) + '</strong><br/>' + (detection.cameraName || '') + '<br/><span style="color:#94a3b8;">' + (detection.detectedAt || '') + '</span>');

        var marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([detection.longitude, detection.latitude])
          .setPopup(popup)
          .addTo(map);

        trajectoryMarkers.push(marker);
      });

      if (uniquePoints.length >= 2) {
        // Limit active routing traversal to latest 6 checkpoints to keep route clean and fast
        var routingPoints = uniquePoints.length > 6 ? uniquePoints.slice(-6) : uniquePoints;
        var cacheKey = routingPoints.map(function(p) {
          return p.longitude.toFixed(5) + ',' + p.latitude.toFixed(5);
        }).join(';');
        currentActiveCacheKey = cacheKey;

        if (routeCache[cacheKey]) {
          applyRouteCoordinates(routeCache[cacheKey], true);
        } else {
          // Query OSRM Driving Road Network to snap directly along actual Kolkata streets with full road curvature
          var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + cacheKey + '?overview=full&geometries=geojson';
          fetch(osrmUrl)
            .then(function(res) { return res.json(); })
            .then(function(resData) {
              if (resData && resData.code === 'Ok' && resData.routes && resData.routes[0] && resData.routes[0].geometry) {
                var rawCoords = resData.routes[0].geometry.coordinates;
                // Cartographic Ramer-Douglas-Peucker simplification:
                // Preserves 100% of curves, turns, roundabouts, and flyovers accurate to within 2.5m,
                // while stripping redundant collinear straight-line points for 60 FPS performance.
                var epsDeg = 2.5 / 106000;
                var roadCoords = rdpSimplify(rawCoords, epsDeg * epsDeg);
                routeCache[cacheKey] = roadCoords;
                if (currentActiveCacheKey === cacheKey) {
                  applyRouteCoordinates(roadCoords, true);
                }
              } else {
                var directCoords = routingPoints.map(function(p) { return [p.longitude, p.latitude]; });
                applyRouteCoordinates(directCoords, true);
              }
            })
            .catch(function(err) {
              console.warn('OSRM road snapping fallback to direct route:', err);
              var directCoords = routingPoints.map(function(p) { return [p.longitude, p.latitude]; });
              applyRouteCoordinates(directCoords, true);
            });
        }
      } else {
        currentActiveCacheKey = '';
        applyRouteCoordinates([], false);
      }

      // 4. Update Vehicle
      if (vehicleMarker) {
        vehicleMarker.remove();
        vehicleMarker = null;
      }
      if (vehicle) {
        var vel = document.createElement('div');
        vel.className = 'vehicle-marker';
        vel.innerHTML = '<div class="vehicle-icon-ring">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>' +
          '</div>' +
          '<span class="vehicle-plate-pill">' + (vehicle.plateNumber || '') + '</span>';

        var vpopup = new maplibregl.Popup({ offset: 24 })
          .setHTML('<strong style="color:#38bdf8;">' + vehicle.plateNumber + '</strong><br/><span style="color:#f1f5f9;">' + (vehicle.color || '') + ' ' + (vehicle.vehicleType || '') + '</span><br/><span style="color:#94a3b8;">Speed: ' + (vehicle.speed ? vehicle.speed + ' km/h' : 'Moving') + '</span>');

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

    var rAFScheduled = false;
    function scheduleDrawRoute() {
      if (rAFScheduled) return;
      rAFScheduled = true;
      requestAnimationFrame(function() {
        rAFScheduled = false;
        drawRouteCanvas();
      });
    }

    map.on('move', scheduleDrawRoute);
    map.on('zoom', scheduleDrawRoute);
    window.addEventListener('resize', function() {
      resizeCanvas();
      scheduleDrawRoute();
    });

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
