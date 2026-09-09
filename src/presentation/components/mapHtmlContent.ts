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
    #traffix-route-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: visible;
    }
    @keyframes routePulseAnim {
      from { stroke-dashoffset: 48; }
      to { stroke-dashoffset: 0; }
    }
    .route-pulse-line {
      animation: routePulseAnim 1.2s linear infinite;
    }
  </style>
</head>
<body>
  <div id="map">
    <svg id="traffix-route-svg">
      <defs>
        <filter id="route-laser-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#10b981" flood-opacity="0.95"/>
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#06b6d4" flood-opacity="0.75"/>
        </filter>
      </defs>
      <path id="svg-route-casing" d="" fill="none" stroke="#020617" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
      <path id="svg-route-glow" d="" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" filter="url(#route-laser-glow)" />
      <path id="svg-route-core" d="" fill="none" stroke="#06b6d4" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity="1.0" />
      <path id="svg-route-pulse" d="" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 14" opacity="0.95" class="route-pulse-line" />
    </svg>
  </div>
  <script>
    var activeLineCoords = [];
    var routeCache = {};
    var currentActiveCacheKey = '';

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

    function generateSmoothRoute(points) {
      if (!points || points.length < 2) return [];
      var clean = [];
      for (var k = 0; k < points.length; k++) {
        var pt = points[k];
        if (pt && !isNaN(pt[0]) && !isNaN(pt[1])) {
          clean.push([Number(pt[0]), Number(pt[1])]);
        }
      }
      if (clean.length < 2) return clean;
      if (clean.length === 2) {
        var p1 = clean[0], p2 = clean[1];
        var line = [];
        var steps = 16;
        for (var i = 0; i <= steps; i++) {
          var t = i / steps;
          line.push([
            p1[0] + (p2[0] - p1[0]) * t,
            p1[1] + (p2[1] - p1[1]) * t
          ]);
        }
        return line;
      }
      var result = [];
      var pts = clean.slice();
      var full = [pts[0]].concat(pts, [pts[pts.length - 1]]);
      for (var i = 1; i < full.length - 2; i++) {
        var p0 = full[i - 1], p1 = full[i], p2 = full[i + 1], p3 = full[i + 2];
        var segments = 16;
        for (var j = 0; j <= segments; j++) {
          var t = j / segments;
          var t2 = t * t;
          var t3 = t2 * t;
          var x = 0.5 * ((2 * p1[0]) +
            (-p0[0] + p2[0]) * t +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
          var y = 0.5 * ((2 * p1[1]) +
            (-p0[1] + p2[1]) * t +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
          result.push([x, y]);
        }
      }
      return result;
    }

    function ensureSvgOverlay() {
      var mapDiv = document.getElementById('map');
      if (!mapDiv) return;
      var svg = document.getElementById('traffix-route-svg');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'traffix-route-svg';
        svg.setAttribute('class', 'route-svg-layer');
        svg.innerHTML = '<defs>' +
          '<filter id="route-laser-glow" x="-30%" y="-30%" width="160%" height="160%">' +
            '<feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#10b981" flood-opacity="0.95"/>' +
            '<feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#06b6d4" flood-opacity="0.75"/>' +
          '</filter>' +
        '</defs>' +
        '<path id="svg-route-casing" d="" fill="none" stroke="#020617" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />' +
        '<path id="svg-route-glow" d="" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" filter="url(#route-laser-glow)" />' +
        '<path id="svg-route-core" d="" fill="none" stroke="#06b6d4" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity="1.0" />' +
        '<path id="svg-route-pulse" d="" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 14" opacity="0.95" class="route-pulse-line" />';
        mapDiv.appendChild(svg);
      }
    }

    function renderSvgRoute() {
      ensureSvgOverlay();
      if (!map) return;
      var casing = document.getElementById('svg-route-casing');
      var glow = document.getElementById('svg-route-glow');
      var core = document.getElementById('svg-route-core');
      var pulse = document.getElementById('svg-route-pulse');
      if (!casing || !glow || !core || !pulse) return;

      if (!activeLineCoords || activeLineCoords.length < 2) {
        casing.setAttribute('d', '');
        glow.setAttribute('d', '');
        core.setAttribute('d', '');
        pulse.setAttribute('d', '');
        return;
      }

      var d = '';
      for (var i = 0; i < activeLineCoords.length; i++) {
        var c = activeLineCoords[i];
        if (!c || c.length < 2 || isNaN(c[0]) || isNaN(c[1])) continue;
        var pt = map.project(c);
        if (!pt || isNaN(pt.x) || isNaN(pt.y)) continue;
        d += (d === '' ? 'M ' : ' L ') + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1);
      }

      casing.setAttribute('d', d);
      glow.setAttribute('d', d);
      core.setAttribute('d', d);
      pulse.setAttribute('d', d);
    }

    function updateTrajectorySource() {
      if (!map) return;
      var src = map.getSource('trajectory-source');
      if (src) {
        try {
          src.setData({
            type: 'FeatureCollection',
            features: activeLineCoords && activeLineCoords.length > 1 ? [{
              type: 'Feature',
              properties: { id: 'route' },
              geometry: {
                type: 'LineString',
                coordinates: activeLineCoords
              }
            }] : []
          });
          map.triggerRepaint();
        } catch(e) {
          console.warn('updateTrajectorySource error:', e);
        }
      }
    }

    function applyRouteCoordinates(coords, shouldFitBounds) {
      activeLineCoords = (coords && coords.length > 0) ? coords : [];
      renderSvgRoute();
      updateTrajectorySource();

      if (map) {
        map.once('idle', function() {
          renderSvgRoute();
          updateTrajectorySource();
        });
      }

      if (shouldFitBounds && coords && coords.length > 1 && map) {
        try {
          var bounds = new maplibregl.LngLatBounds();
          coords.forEach(function(c) { bounds.extend(c); });
          map.fitBounds(bounds, { padding: 80, pitch: is3DCurrent ? 50 : 0, bearing: is3DCurrent ? -18 : 0, duration: 800 });
        } catch(e) {}
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
          data: { type: 'FeatureCollection', features: [] }
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
            'fill-extrusion-height': ['get', 'height'],
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
            'heatmap-opacity': 0.65
          }
        },
        // Elevated Native WebGL Trajectory Layers (rendered on top of 3D buildings & heatmaps for 100% visibility)
        {
          id: 'trajectory-casing-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#050b14',
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              10, 8,
              14, 12,
              17, 16
            ],
            'line-opacity': 0.95
          }
        },
        {
          id: 'trajectory-glow-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#10b981',
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              10, 5.5,
              14, 8.5,
              17, 12
            ],
            'line-opacity': 0.95
          }
        },
        {
          id: 'trajectory-core-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#06b6d4',
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              10, 3,
              14, 5,
              17, 7
            ],
            'line-opacity': 1.0
          }
        },
        {
          id: 'trajectory-highlight-layer',
          type: 'line',
          source: 'trajectory-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ffffff',
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              10, 1.2,
              14, 2,
              17, 3
            ],
            'line-opacity': 1.0
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

    var buildingsLoaded = false;
    function lazyLoadBuildings() {
      if (buildingsLoaded || !map) return;
      var bSrc = map.getSource('kolkata-buildings');
      if (bSrc && map.isStyleLoaded()) {
        buildingsLoaded = true;
        try {
          bSrc.setData(${buildingsJson});
        } catch(e) {
          console.warn('Lazy buildings load error:', e);
        }
      }
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
      updateTrajectorySource();
      renderSvgRoute();
    });

    map.on('load', function() {
      setupReady();
      updateTrajectorySource();
      renderSvgRoute();
      setTimeout(lazyLoadBuildings, 1200);
    });

    map.on('render', renderSvgRoute);
    map.on('move', renderSvgRoute);
    map.on('zoom', renderSvgRoute);
    map.on('pitch', renderSvgRoute);
    map.on('rotate', renderSvgRoute);
    map.on('resize', renderSvgRoute);

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
      var focusLocation = data.focusLocation;

      // Smooth flyTo location when user searches a location or camera
      if (focusLocation && !isNaN(focusLocation.latitude) && !isNaN(focusLocation.longitude)) {
        map.flyTo({
          center: [Number(focusLocation.longitude), Number(focusLocation.latitude)],
          zoom: 15.5,
          pitch: is3DCurrent ? 50 : 0,
          bearing: is3DCurrent ? -18 : 0,
          duration: 1200
        });
      }

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

      // Deduplicate consecutive identical coordinates and validate numbers
      var uniquePoints = [];
      for (var i = 0; i < detections.length; i++) {
        var pt = detections[i];
        if (pt && !isNaN(pt.latitude) && !isNaN(pt.longitude)) {
          var lat = Number(pt.latitude);
          var lng = Number(pt.longitude);
          if (uniquePoints.length === 0 ||
              Math.abs(uniquePoints[uniquePoints.length - 1].latitude - lat) > 0.0001 ||
              Math.abs(uniquePoints[uniquePoints.length - 1].longitude - lng) > 0.0001) {
            uniquePoints.push({
              id: pt.id || ('pt_' + i),
              cameraId: pt.cameraId,
              cameraName: pt.cameraName,
              latitude: lat,
              longitude: lng,
              detectedAt: pt.detectedAt
            });
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
        var routingPoints = uniquePoints.length > 16 ? uniquePoints.slice(-16) : uniquePoints;
        var directCoords = routingPoints.map(function(p) { return [Number(p.longitude), Number(p.latitude)]; });
        var smoothCoords = generateSmoothRoute(directCoords);

        var cacheKey = directCoords.map(function(p) {
          return p[0].toFixed(5) + ',' + p[1].toFixed(5);
        }).join(';');
        currentActiveCacheKey = cacheKey;

        // 1. Immediately display the smooth trajectory route (0ms latency, zero lag!)
        applyRouteCoordinates(routeCache[cacheKey] || smoothCoords, true);

        // 2. Non-blocking OSRM progressive background fetch (only when not cached)
        if (!routeCache[cacheKey]) {
          try {
            var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + cacheKey + '?overview=simplified&geometries=geojson';
            var abortCtrl = new AbortController();
            var timerId = setTimeout(function() { abortCtrl.abort(); }, 800);
            fetch(osrmUrl, { signal: abortCtrl.signal })
              .then(function(res) { clearTimeout(timerId); return res.json(); })
              .then(function(resData) {
                if (resData && resData.code === 'Ok' && resData.routes && resData.routes[0] && resData.routes[0].geometry) {
                  var roadCoords = resData.routes[0].geometry.coordinates;
                  if (roadCoords && roadCoords.length > 1) {
                    routeCache[cacheKey] = roadCoords;
                    if (currentActiveCacheKey === cacheKey) {
                      applyRouteCoordinates(roadCoords, false);
                    }
                  }
                }
              })
              .catch(function() {
                // Silently keep smoothCoords - zero interruption, zero lag!
              });
          } catch(e) {}
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
