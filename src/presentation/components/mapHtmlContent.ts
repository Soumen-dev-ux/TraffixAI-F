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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .vehicle-marker:hover {
      transform: scale(1.18) translateY(-6px);
    }
    .vehicle-3d-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 10px 20px rgba(0,0,0,0.65));
    }
    .radar-pulse {
      animation: radarRingAnim 2.2s infinite ease-in-out;
      transform-origin: 50px 62px;
    }
    @keyframes radarRingAnim {
      0% { transform: scale(0.85); opacity: 0.9; }
      50% { transform: scale(1.15); opacity: 0.35; }
      100% { transform: scale(0.85); opacity: 0.9; }
    }
    .vehicle-plate-pill {
      background: rgba(15, 23, 42, 0.95);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1.5px solid #38bdf8;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 12px rgba(56, 189, 248, 0.5);
      letter-spacing: 0.6px;
      backdrop-filter: blur(6px);
      cursor: pointer;
      user-select: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      margin-bottom: 8px;
    }
    .vehicle-plate-pill:hover {
      transform: scale(1.12) translateY(-2px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.85), 0 0 16px rgba(56, 189, 248, 0.85);
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
    var hasInitialFitted = false;
    var lastFocusLocationKey = null;
    var lastVehicleKey = null;

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

    function initVehicle3DLayer() {
      if (typeof THREE === 'undefined') {
        setTimeout(initVehicle3DLayer, 100);
        return;
      }
      if (!map || !map.isStyleLoaded()) return;
      if (!map.getLayer('3d-vehicle-layer')) {
        try {
          map.addLayer(vehicle3DLayer);
        } catch(e) {
          console.warn('Vehicle 3D layer add error:', e);
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
      initVehicle3DLayer();
      setupReady();
      updateTrajectorySource();
      renderSvgRoute();
    });

    map.on('load', function() {
      initVehicle3DLayer();
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
      initVehicle3DLayer();
      setupReady();
    }, 250);

    // Three.js 3D WebGL Vehicle Model Builder & Layer
    function build3DVehicleMesh(type, colorName) {
      var group = new THREE.Group();
      var vType = (type || 'car').toLowerCase();
      var cName = (colorName || 'Silver').toLowerCase();

      var bodyHex = 0x94a3b8; // Silver default
      if (cName.includes('yellow') || vType === 'taxi') bodyHex = 0xeab308;
      else if (cName.includes('white')) bodyHex = 0xf8fafc;
      else if (cName.includes('black') || cName.includes('dark')) bodyHex = 0x0f172a;
      else if (cName.includes('red')) bodyHex = 0xef4444;
      else if (cName.includes('blue')) bodyHex = 0x2563eb;
      else if (cName.includes('green')) bodyHex = 0x16a34a;
      else if (cName.includes('orange')) bodyHex = 0xf97316;
      else if (cName.includes('grey') || cName.includes('gray')) bodyHex = 0x64748b;

      var bodyMat = new THREE.MeshStandardMaterial({
        color: bodyHex,
        metalness: 0.82,
        roughness: 0.22
      });

      var darkMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.4,
        roughness: 0.6
      });

      var tireMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        metalness: 0.1,
        roughness: 0.85
      });

      var rimMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.15
      });

      var glassMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85
      });

      var headlightMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a
      });

      var taillightMat = new THREE.MeshBasicMaterial({
        color: 0xef4444
      });

      var arrowMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.95
      });

      function createWheel(x, y, z, radius, width) {
        var wheelGroup = new THREE.Group();
        wheelGroup.position.set(x, y, z);

        var tireGeo = new THREE.CylinderGeometry(radius, radius, width, 16);
        tireGeo.rotateZ(Math.PI / 2);
        var tireMesh = new THREE.Mesh(tireGeo, tireMat);
        wheelGroup.add(tireMesh);

        var rimGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width * 1.05, 12);
        rimGeo.rotateZ(Math.PI / 2);
        var rimMesh = new THREE.Mesh(rimGeo, rimMat);
        wheelGroup.add(rimMesh);

        return wheelGroup;
      }

      // Forward Direction Navigation Arrow Hovering Ahead
      var arrowGroup = new THREE.Group();
      arrowGroup.position.set(0, -3.2, 0.6);
      var coneGeo = new THREE.ConeGeometry(0.55, 1.1, 12);
      coneGeo.rotateX(-Math.PI / 2);
      var coneMesh = new THREE.Mesh(coneGeo, arrowMat);
      arrowGroup.add(coneMesh);
      group.add(arrowGroup);

      // Ground Asphalt Shadow
      var shadowGeo = new THREE.PlaneGeometry(2.4, 5.0);
      var shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      });
      var shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(0, 0, 0.04);
      group.add(shadowMesh);

      if (vType === 'truck') {
        // 1. TRUCK MODEL
        var cabGeo = new THREE.BoxGeometry(2.2, 2.2, 2.4);
        var cabMesh = new THREE.Mesh(cabGeo, bodyMat);
        cabMesh.position.set(0, -1.8, 1.5);
        group.add(cabMesh);

        var cabGlassGeo = new THREE.BoxGeometry(2.0, 0.2, 0.9);
        var cabGlassMesh = new THREE.Mesh(cabGlassGeo, glassMat);
        cabGlassMesh.position.set(0, -2.85, 1.8);
        group.add(cabGlassMesh);

        var cargoGeo = new THREE.BoxGeometry(2.4, 5.2, 2.8);
        var cargoMesh = new THREE.Mesh(cargoGeo, bodyMat);
        cargoMesh.position.set(0, 1.8, 1.7);
        group.add(cargoMesh);

        group.add(createWheel(-1.15, -1.8, 0.45, 0.45, 0.3));
        group.add(createWheel(1.15, -1.8, 0.45, 0.45, 0.3));
        group.add(createWheel(-1.15, 1.5, 0.45, 0.45, 0.3));
        group.add(createWheel(1.15, 1.5, 0.45, 0.45, 0.3));
        group.add(createWheel(-1.15, 3.2, 0.45, 0.45, 0.3));
        group.add(createWheel(1.15, 3.2, 0.45, 0.45, 0.3));

        var hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.25), headlightMat);
        hl1.position.set(-0.8, -2.92, 0.8);
        group.add(hl1);
        var hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.25), headlightMat);
        hl2.position.set(0.8, -2.92, 0.8);
        group.add(hl2);

      } else if (vType === 'bus') {
        // 2. BUS MODEL
        var busGeo = new THREE.BoxGeometry(2.4, 8.4, 2.6);
        var busMesh = new THREE.Mesh(busGeo, bodyMat);
        busMesh.position.set(0, 0, 1.6);
        group.add(busMesh);

        var busGlassFront = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 1.2), glassMat);
        busGlassFront.position.set(0, -4.15, 1.7);
        group.add(busGlassFront);

        var busSideGlass1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6.8, 0.8), glassMat);
        busSideGlass1.position.set(-1.22, 0.2, 1.7);
        group.add(busSideGlass1);
        var busSideGlass2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6.8, 0.8), glassMat);
        busSideGlass2.position.set(1.22, 0.2, 1.7);
        group.add(busSideGlass2);

        var acGeo = new THREE.BoxGeometry(1.4, 2.6, 0.35);
        var acMesh = new THREE.Mesh(acGeo, darkMat);
        acMesh.position.set(0, 0, 2.95);
        group.add(acMesh);

        group.add(createWheel(-1.2, -2.6, 0.5, 0.5, 0.32));
        group.add(createWheel(1.2, -2.6, 0.5, 0.5, 0.32));
        group.add(createWheel(-1.2, 2.6, 0.5, 0.5, 0.32));
        group.add(createWheel(1.2, 2.6, 0.5, 0.5, 0.32));

        var bhl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.3), headlightMat);
        bhl1.position.set(-0.85, -4.22, 0.7);
        group.add(bhl1);
        var bhl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.3), headlightMat);
        bhl2.position.set(0.85, -4.22, 0.7);
        group.add(bhl2);

      } else if (vType === 'motorcycle' || vType === 'bike' || vType === 'motorbike') {
        // 3. MOTORCYCLE / BIKE MODEL
        var frameGeo = new THREE.BoxGeometry(0.45, 1.6, 0.6);
        var frameMesh = new THREE.Mesh(frameGeo, bodyMat);
        frameMesh.position.set(0, 0, 0.7);
        group.add(frameMesh);

        var seatGeo = new THREE.BoxGeometry(0.4, 0.7, 0.2);
        var seatMesh = new THREE.Mesh(seatGeo, darkMat);
        seatMesh.position.set(0, 0.3, 0.9);
        group.add(seatMesh);

        var barGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
        barGeo.rotateZ(Math.PI / 2);
        var barMesh = new THREE.Mesh(barGeo, rimMat);
        barMesh.position.set(0, -0.6, 1.05);
        group.add(barMesh);

        var riderTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.65), darkMat);
        riderTorso.position.set(0, 0.2, 1.3);
        group.add(riderTorso);
        var riderHelmet = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), bodyMat);
        riderHelmet.position.set(0, 0.15, 1.75);
        group.add(riderHelmet);

        group.add(createWheel(0, -0.9, 0.38, 0.38, 0.14));
        group.add(createWheel(0, 0.9, 0.38, 0.38, 0.14));

        var mhl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), headlightMat);
        mhl.position.set(0, -0.95, 0.85);
        group.add(mhl);

      } else {
        // 4. SEDAN / SUV / CAR (DEFAULT)
        var lowerGeo = new THREE.BoxGeometry(2.0, 4.4, 0.65);
        var lowerMesh = new THREE.Mesh(lowerGeo, bodyMat);
        lowerMesh.position.set(0, 0, 0.58);
        group.add(lowerMesh);

        var hoodGeo = new THREE.BoxGeometry(1.9, 1.3, 0.25);
        var hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
        hoodMesh.position.set(0, -1.4, 0.8);
        group.add(hoodMesh);

        var cabinGeo = new THREE.BoxGeometry(1.65, 2.1, 0.62);
        var cabinMesh = new THREE.Mesh(cabinGeo, bodyMat);
        cabinMesh.position.set(0, 0.1, 1.15);
        group.add(cabinMesh);

        var frontWindshield = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.1, 0.55), glassMat);
        frontWindshield.position.set(0, -0.95, 1.12);
        frontWindshield.rotation.x = Math.PI / 6;
        group.add(frontWindshield);

        var rearWindshield = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.1, 0.5), glassMat);
        rearWindshield.position.set(0, 1.12, 1.12);
        rearWindshield.rotation.x = -Math.PI / 6;
        group.add(rearWindshield);

        var sideGlass1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 0.45), glassMat);
        sideGlass1.position.set(-0.82, 0.1, 1.12);
        group.add(sideGlass1);
        var sideGlass2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 0.45), glassMat);
        sideGlass2.position.set(0.82, 0.1, 1.12);
        group.add(sideGlass2);

        var roofGlass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.05), glassMat);
        roofGlass.position.set(0, 0.1, 1.46);
        group.add(roofGlass);

        var mirror1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.12), bodyMat);
        mirror1.position.set(-1.05, -0.7, 0.95);
        group.add(mirror1);
        var mirror2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.12), bodyMat);
        mirror2.position.set(1.05, -0.7, 0.95);
        group.add(mirror2);

        group.add(createWheel(-1.0, -1.3, 0.35, 0.35, 0.22));
        group.add(createWheel(1.0, -1.3, 0.35, 0.35, 0.22));
        group.add(createWheel(-1.0, 1.3, 0.35, 0.35, 0.22));
        group.add(createWheel(1.0, 1.3, 0.35, 0.35, 0.22));

        var chl1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.18), headlightMat);
        chl1.position.set(-0.72, -2.18, 0.65);
        group.add(chl1);
        var chl2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.18), headlightMat);
        chl2.position.set(0.72, -2.18, 0.65);
        group.add(chl2);

        var ctl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.15), taillightMat);
        ctl1.position.set(-0.7, 2.18, 0.68);
        group.add(ctl1);
        var ctl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.15), taillightMat);
        ctl2.position.set(0.7, 2.18, 0.68);
        group.add(ctl2);
      }

      return group;
    }

    var currentVehicleData = null;
    var vehicleScene = null;
    var vehicleGroup = null;
    var vehicleThreeCamera = null;
    var vehicleThreeRenderer = null;
    var currentModelKey = null;

    var vehicle3DLayer = {
      id: '3d-vehicle-layer',
      type: 'custom',
      renderingMode: '3d',
      onAdd: function (mapInstance, gl) {
        if (typeof THREE === 'undefined') return;
        vehicleThreeCamera = new THREE.Camera();
        vehicleScene = new THREE.Scene();

        var ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
        vehicleScene.add(ambientLight);

        var sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
        sunLight.position.set(30, -80, 100).normalize();
        vehicleScene.add(sunLight);

        var groundLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
        groundLight.position.set(-30, 80, -20).normalize();
        vehicleScene.add(groundLight);

        vehicleGroup = new THREE.Group();
        vehicleScene.add(vehicleGroup);

        vehicleThreeRenderer = new THREE.WebGLRenderer({
          canvas: mapInstance.getCanvas(),
          context: gl,
          antialias: true
        });
        vehicleThreeRenderer.autoClear = false;
      },
      render: function (gl, matrix) {
        if (!vehicleThreeRenderer || !vehicleThreeCamera || !vehicleScene) return;
        if (!currentVehicleData || isNaN(currentVehicleData.latitude) || isNaN(currentVehicleData.longitude)) {
          if (vehicleGroup) vehicleGroup.visible = false;
          return;
        }

        vehicleGroup.visible = true;

        var vType = (currentVehicleData.vehicleType || currentVehicleData.type || 'car').toLowerCase();
        var vColor = (currentVehicleData.color || 'Silver').toLowerCase();
        var modelKey = vType + ':' + vColor;

        if (modelKey !== currentModelKey) {
          currentModelKey = modelKey;
          while (vehicleGroup.children.length > 0) {
            vehicleGroup.remove(vehicleGroup.children[0]);
          }
          var mesh = build3DVehicleMesh(vType, vColor);
          vehicleGroup.add(mesh);
        }

        var coord = maplibregl.MercatorCoordinate.fromLngLat(
          [Number(currentVehicleData.longitude), Number(currentVehicleData.latitude)],
          0
        );
        var meterScale = coord.meterInMercatorCoordinateUnits();
        var visualScale = meterScale * 4.2;

        vehicleGroup.position.set(coord.x, coord.y, coord.z);
        vehicleGroup.scale.set(visualScale, visualScale, visualScale);

        var headingDeg = currentVehicleData.heading || 0;
        vehicleGroup.rotation.set(0, 0, - (headingDeg * Math.PI / 180));

        var m = new THREE.Matrix4().fromArray(matrix);
        vehicleThreeCamera.projectionMatrix = m;

        vehicleThreeRenderer.resetState();
        vehicleThreeRenderer.render(vehicleScene, vehicleThreeCamera);
      }
    };

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

      // Smooth flyTo location ONLY when focusLocation changes (e.g. user selected/searched a camera)
      if (focusLocation && !isNaN(focusLocation.latitude) && !isNaN(focusLocation.longitude)) {
        var focusKey = Number(focusLocation.latitude).toFixed(4) + ',' + Number(focusLocation.longitude).toFixed(4);
        if (focusKey !== lastFocusLocationKey) {
          lastFocusLocationKey = focusKey;
          map.flyTo({
            center: [Number(focusLocation.longitude), Number(focusLocation.latitude)],
            zoom: 15.5,
            pitch: is3DCurrent ? 50 : 0,
            bearing: is3DCurrent ? -18 : 0,
            duration: 1200
          });
        }
      } else {
        lastFocusLocationKey = null;
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

      // 4. Update Vehicle (3D WebGL Model + Floating Plate Label)
      if (vehicleMarker) {
        vehicleMarker.remove();
        vehicleMarker = null;
      }
      if (vehicle && !isNaN(vehicle.latitude) && !isNaN(vehicle.longitude)) {
        var vType = vehicle.vehicleType || vehicle.type || 'car';
        var vColor = vehicle.color || 'Silver';

        var heading = 0;
        if (typeof vehicle.heading === 'number') {
          heading = vehicle.heading;
        } else if (trajectory && trajectory.detections && trajectory.detections.length >= 2) {
          var pts = trajectory.detections;
          var lastPt = pts[pts.length - 1];
          var prevPt = pts[pts.length - 2];
          var lat1 = Number(prevPt.latitude);
          var lng1 = Number(prevPt.longitude);
          var lat2 = Number(lastPt.latitude);
          var lng2 = Number(lastPt.longitude);
          if (!isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
            var dLat = lat2 - lat1;
            var dLng = (lng2 - lng1) * Math.cos(lat2 * Math.PI / 180);
            if (Math.abs(dLat) > 0.000001 || Math.abs(dLng) > 0.000001) {
              heading = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
            }
          }
        }

        currentVehicleData = {
          latitude: Number(vehicle.latitude),
          longitude: Number(vehicle.longitude),
          heading: heading,
          vehicleType: vType,
          color: vColor,
          plateNumber: vehicle.plateNumber,
          speed: vehicle.speed
        };

        // Floating ANPR Plate Pill above the 3D Vehicle
        var plateEl = document.createElement('div');
        plateEl.className = 'vehicle-plate-pill';
        plateEl.textContent = vehicle.plateNumber || 'TARGET';

        var vpopup = new maplibregl.Popup({ offset: 32 })
          .setHTML('<strong style="color:#38bdf8; font-size:13px;">' + (vehicle.plateNumber || 'TARGET') + '</strong><br/><span style="color:#f1f5f9; font-weight:600;">' + (vehicle.color || '') + ' ' + (vType.toUpperCase()) + '</span><br/><span style="color:#94a3b8;">Speed: ' + (vehicle.speed ? vehicle.speed + ' km/h' : 'Tracking') + '</span>');

        vehicleMarker = new maplibregl.Marker({
          element: plateEl,
          anchor: 'bottom'
        })
          .setLngLat([Number(vehicle.longitude), Number(vehicle.latitude)])
          .setPopup(vpopup)
          .addTo(map);

        var vKey = (vehicle.id || vehicle.plateNumber || '') + '@' + Number(vehicle.latitude).toFixed(4) + ',' + Number(vehicle.longitude).toFixed(4);
        if (vKey !== lastVehicleKey && (!trajectory || !trajectory.detections || trajectory.detections.length <= 1)) {
          lastVehicleKey = vKey;
          map.flyTo({
            center: [Number(vehicle.longitude), Number(vehicle.latitude)],
            zoom: 15.5,
            pitch: is3DCurrent ? 52 : 0,
            bearing: is3DCurrent ? -18 : 0,
            duration: 1500
          });
        }
      } else {
        currentVehicleData = null;
        lastVehicleKey = null;
      }
      map.triggerRepaint();

      // 5. Auto-fit cameras ONLY ONCE on initial map load (never interrupts user while navigating)
      if (!hasInitialFitted && !vehicle && (!trajectory || !trajectory.detections || trajectory.detections.length === 0)) {
        if (cameras.length > 1) {
          hasInitialFitted = true;
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
