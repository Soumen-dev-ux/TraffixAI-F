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
      margin-top: -6px;
      background: rgba(15, 23, 42, 0.95);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 9px;
      border-radius: 6px;
      border: 1.5px solid #38bdf8;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(0,0,0,0.65), 0 0 12px rgba(56, 189, 248, 0.4);
      pointer-events: none;
      letter-spacing: 0.6px;
      backdrop-filter: blur(4px);
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

    function get3DVehicleSvg(type, colorName) {
      var vType = (type || 'car').toLowerCase();
      var cName = (colorName || 'Silver').toLowerCase();

      var bodyPrimary = '#475569';
      var bodySecondary = '#334155';
      var bodyDark = '#1e293b';
      var bodyHighlight = '#94a3b8';
      var roofGlass = '#0284c7';

      if (cName.includes('yellow') || vType === 'taxi') {
        bodyPrimary = '#eab308';
        bodySecondary = '#ca8a04';
        bodyDark = '#854d0e';
        bodyHighlight = '#fef08a';
      } else if (cName.includes('red')) {
        bodyPrimary = '#ef4444';
        bodySecondary = '#dc2626';
        bodyDark = '#991b1b';
        bodyHighlight = '#fca5a5';
      } else if (cName.includes('white') || cName.includes('silver') || cName.includes('grey') || cName.includes('gray')) {
        bodyPrimary = '#cbd5e1';
        bodySecondary = '#94a3b8';
        bodyDark = '#64748b';
        bodyHighlight = '#f8fafc';
      } else if (cName.includes('black') || cName.includes('dark')) {
        bodyPrimary = '#1e293b';
        bodySecondary = '#0f172a';
        bodyDark = '#020617';
        bodyHighlight = '#475569';
      } else if (cName.includes('blue')) {
        bodyPrimary = '#3b82f6';
        bodySecondary = '#2563eb';
        bodyDark = '#1d4ed8';
        bodyHighlight = '#93c5fd';
      } else if (cName.includes('green')) {
        bodyPrimary = '#22c55e';
        bodySecondary = '#16a34a';
        bodyDark = '#15803d';
        bodyHighlight = '#86efac';
      }

      // 1. 3D TRUCK
      if (vType === 'truck') {
        return '<svg width="78" height="110" viewBox="0 0 100 140" class="vehicle-3d-svg">' +
          '<defs>' +
            '<linearGradient id="nav-arrow-glow" x1="0%" y1="0%" x2="0%" y2="100%">' +
              '<stop offset="0%" stop-color="#38bdf8" stop-opacity="1"/>' +
              '<stop offset="100%" stop-color="#0284c7" stop-opacity="0.8"/>' +
            '</linearGradient>' +
          '</defs>' +
          '<!-- Navigation Direction Arrow on Road -->' +
          '<polygon points="50,2 38,24 45,22 45,36 55,36 55,22 62,24" fill="#ffffff" stroke="#0284c7" stroke-width="2.5" />' +
          '<!-- Asphalt Shadow -->' +
          '<ellipse cx="50" cy="88" rx="26" ry="46" fill="rgba(0,0,0,0.6)" />' +
          '<!-- Tandem Wheels -->' +
          '<rect x="22" y="48" width="6" height="15" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<rect x="72" y="48" width="6" height="15" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<rect x="22" y="104" width="6" height="15" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<rect x="72" y="104" width="6" height="15" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<rect x="22" y="120" width="6" height="15" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<rect x="72" y="120" width="6" height="15" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<!-- Cargo Trailer Box -->' +
          '<rect x="26" y="62" width="48" height="74" rx="4" fill="' + bodySecondary + '" stroke="' + bodyDark + '" stroke-width="1.5" />' +
          '<rect x="29" y="65" width="42" height="68" rx="2" fill="' + bodyPrimary + '" />' +
          '<line x1="26" y1="84" x2="74" y2="84" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />' +
          '<line x1="26" y1="106" x2="74" y2="106" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />' +
          '<!-- Front Driver Cabin -->' +
          '<path d="M28,62 L28,45 C28,40 34,36 50,36 C66,36 72,40 72,45 L72,62 Z" fill="' + bodyHighlight + '" />' +
          '<path d="M30,46 L70,46 L68,54 L32,54 Z" fill="#0f172a" />' +
          '<path d="M32,48 L68,48 L66,52 L34,52 Z" fill="' + roofGlass + '" opacity="0.85" />' +
          '<circle cx="34" cy="38" r="3" fill="#fef08a" />' +
          '<circle cx="66" cy="38" r="3" fill="#fef08a" />' +
          '<rect x="23" y="47" width="5" height="3" rx="1.5" fill="' + bodyDark + '" />' +
          '<rect x="72" y="47" width="5" height="3" rx="1.5" fill="' + bodyDark + '" />' +
        '</svg>';
      }

      // 2. 3D BUS
      if (vType === 'bus') {
        return '<svg width="78" height="110" viewBox="0 0 100 140" class="vehicle-3d-svg">' +
          '<!-- Navigation Direction Arrow -->' +
          '<polygon points="50,2 38,24 45,22 45,36 55,36 55,22 62,24" fill="#ffffff" stroke="#16a34a" stroke-width="2.5" />' +
          '<!-- Shadow -->' +
          '<ellipse cx="50" cy="86" rx="26" ry="46" fill="rgba(0,0,0,0.6)" />' +
          '<!-- Bus Aerodynamic Body -->' +
          '<rect x="25" y="40" width="50" height="94" rx="10" fill="' + bodySecondary + '" stroke="' + bodyDark + '" stroke-width="1.5" />' +
          '<rect x="27" y="42" width="46" height="90" rx="8" fill="' + bodyPrimary + '" />' +
          '<!-- Front Panoramic Windshield -->' +
          '<path d="M30,44 C36,40 64,40 70,44 L68,55 L32,55 Z" fill="#0f172a" />' +
          '<path d="M32,46 C38,43 62,43 68,46 L66,53 L34,53 Z" fill="' + roofGlass + '" opacity="0.85" />' +
          '<!-- Passenger Side Windows Strip -->' +
          '<rect x="28" y="58" width="8" height="70" rx="2" fill="#0f172a" />' +
          '<rect x="64" y="58" width="8" height="70" rx="2" fill="#0f172a" />' +
          '<!-- Roof AC & Vents -->' +
          '<rect x="42" y="66" width="16" height="36" rx="3" fill="#64748b" />' +
          '<!-- Headlights -->' +
          '<circle cx="32" cy="42" r="3" fill="#fef08a" />' +
          '<circle cx="68" cy="42" r="3" fill="#fef08a" />' +
        '</svg>';
      }

      // 3. 3D MOTORCYCLE / BIKE
      if (vType === 'motorcycle' || vType === 'bike' || vType === 'motorbike') {
        return '<svg width="68" height="96" viewBox="0 0 100 140" class="vehicle-3d-svg">' +
          '<!-- Navigation Direction Arrow -->' +
          '<polygon points="50,4 40,22 46,20 46,32 54,32 54,20 60,22" fill="#ffffff" stroke="#f59e0b" stroke-width="2.5" />' +
          '<!-- Shadow -->' +
          '<ellipse cx="50" cy="85" rx="16" ry="32" fill="rgba(0,0,0,0.6)" />' +
          '<!-- Front & Rear Wheels -->' +
          '<rect x="47" y="36" width="6" height="22" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />' +
          '<rect x="47" y="98" width="6" height="26" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />' +
          '<!-- Chassis Body & Tank -->' +
          '<path d="M44,56 L56,56 L58,86 L42,86 Z" fill="' + bodyPrimary + '" />' +
          '<!-- Handlebars -->' +
          '<line x1="30" y1="52" x2="70" y2="52" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round" />' +
          '<circle cx="29" cy="52" r="2.5" fill="#0f172a" />' +
          '<circle cx="71" cy="52" r="2.5" fill="#0f172a" />' +
          '<!-- Rider Helmet & Shoulders -->' +
          '<ellipse cx="50" cy="74" rx="9" ry="11" fill="#0f172a" stroke="' + bodyHighlight + '" stroke-width="1.5" />' +
          '<ellipse cx="50" cy="70" rx="6" ry="3" fill="#38bdf8" />' +
          '<circle cx="50" cy="40" r="3.5" fill="#fef08a" />' +
        '</svg>';
      }

      // 4. 3D VAN
      if (vType === 'van') {
        return '<svg width="76" height="106" viewBox="0 0 100 140" class="vehicle-3d-svg">' +
          '<!-- Navigation Direction Arrow -->' +
          '<polygon points="50,2 38,24 45,22 45,36 55,36 55,22 62,24" fill="#ffffff" stroke="#0284c7" stroke-width="2.5" />' +
          '<!-- Shadow -->' +
          '<ellipse cx="50" cy="85" rx="26" ry="42" fill="rgba(0,0,0,0.6)" />' +
          '<!-- Wheels -->' +
          '<rect x="22" y="52" width="6" height="16" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<rect x="72" y="52" width="6" height="16" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<rect x="22" y="102" width="6" height="16" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<rect x="72" y="102" width="6" height="16" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>' +
          '<!-- Body -->' +
          '<rect x="26" y="44" width="48" height="82" rx="8" fill="' + bodyPrimary + '" stroke="' + bodyDark + '" stroke-width="1.5" />' +
          '<!-- Windshield -->' +
          '<path d="M30,50 C36,46 64,46 70,50 L68,60 L32,60 Z" fill="#0f172a" />' +
          '<path d="M32,52 C38,48 62,48 68,52 L66,58 L34,58 Z" fill="' + roofGlass + '" opacity="0.85" />' +
          '<!-- Side Windows -->' +
          '<rect x="28" y="64" width="5" height="18" rx="1.5" fill="#0f172a" />' +
          '<rect x="67" y="64" width="5" height="18" rx="1.5" fill="#0f172a" />' +
          '<circle cx="32" cy="46" r="3" fill="#fef08a" />' +
          '<circle cx="68" cy="46" r="3" fill="#fef08a" />' +
        '</svg>';
      }

      // 5. 3D SUV / SEDAN / CAR (Google Maps 3D Navigation Model)
      return '<svg width="76" height="106" viewBox="0 0 100 140" class="vehicle-3d-svg">' +
        '<defs>' +
          '<linearGradient id="car-hood-grad" x1="0%" y1="0%" x2="0%" y2="100%">' +
            '<stop offset="0%" stop-color="' + bodyHighlight + '"/>' +
            '<stop offset="100%" stop-color="' + bodyPrimary + '"/>' +
          '</linearGradient>' +
          '<linearGradient id="windshield-glare" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#38bdf8" stop-opacity="0.95"/>' +
            '<stop offset="70%" stop-color="#0284c7" stop-opacity="0.85"/>' +
            '<stop offset="100%" stop-color="#0f172a" stop-opacity="0.95"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<!-- Navigation Forward Arrow (Google Maps Style) -->' +
        '<polygon points="50,2 38,24 45,22 45,36 55,36 55,22 62,24" fill="#ffffff" stroke="#2563eb" stroke-width="2.5" />' +
        '<!-- Ambient Ground Halo -->' +
        '<ellipse cx="50" cy="85" rx="30" ry="38" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4 4" class="radar-pulse" />' +
        '<!-- Ground Asphalt Shadow -->' +
        '<ellipse cx="50" cy="86" rx="25" ry="36" fill="rgba(0,0,0,0.65)" />' +
        '<!-- 4 3D Rubber Wheels with Silver Rims -->' +
        '<rect x="20" y="52" width="7" height="16" rx="3.5" fill="#090d16" stroke="#475569" stroke-width="1.2" />' +
        '<rect x="22" y="56" width="3" height="8" rx="1.5" fill="#94a3b8" />' +
        '<rect x="73" y="52" width="7" height="16" rx="3.5" fill="#090d16" stroke="#475569" stroke-width="1.2" />' +
        '<rect x="75" y="56" width="3" height="8" rx="1.5" fill="#94a3b8" />' +
        '<rect x="20" y="98" width="7" height="16" rx="3.5" fill="#090d16" stroke="#475569" stroke-width="1.2" />' +
        '<rect x="22" y="102" width="3" height="8" rx="1.5" fill="#94a3b8" />' +
        '<rect x="73" y="98" width="7" height="16" rx="3.5" fill="#090d16" stroke="#475569" stroke-width="1.2" />' +
        '<rect x="75" y="102" width="3" height="8" rx="1.5" fill="#94a3b8" />' +
        '<!-- 3D Car Body Chassis -->' +
        '<path d="M26,52 C26,44 34,40 50,40 C66,40 74,44 74,52 L74,116 C74,122 66,126 50,126 C34,126 26,122 26,116 Z" fill="url(#car-hood-grad)" stroke="' + bodyDark + '" stroke-width="1.5" />' +
        '<!-- Hood Character Lines -->' +
        '<line x1="38" y1="42" x2="40" y2="58" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />' +
        '<line x1="62" y1="42" x2="60" y2="58" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />' +
        '<!-- Front Windshield -->' +
        '<path d="M32,60 C38,56 62,56 68,60 L65,74 L35,74 Z" fill="#0f172a" />' +
        '<path d="M34,62 C40,58 60,58 66,62 L64,72 L36,72 Z" fill="url(#windshield-glare)" />' +
        '<!-- Roof Panel & Rails -->' +
        '<rect x="34" y="74" width="32" height="28" rx="3" fill="' + bodySecondary + '" />' +
        '<line x1="34" y1="76" x2="34" y2="100" stroke="#334155" stroke-width="2" stroke-linecap="round" />' +
        '<line x1="66" y1="76" x2="66" y2="100" stroke="#334155" stroke-width="2" stroke-linecap="round" />' +
        '<!-- Rear Windshield Glass -->' +
        '<path d="M34,103 L66,103 L68,113 L32,113 Z" fill="#0f172a" />' +
        '<path d="M36,104 L64,104 L66,111 L34,111 Z" fill="' + roofGlass + '" opacity="0.75" />' +
        '<!-- Side Mirrors -->' +
        '<rect x="18" y="58" width="8" height="4" rx="2" fill="' + bodyDark + '" />' +
        '<rect x="74" y="58" width="8" height="4" rx="2" fill="' + bodyDark + '" />' +
        '<!-- Headlights (Twin Glowing Xenon) -->' +
        '<circle cx="32" cy="44" r="3.2" fill="#fef08a" />' +
        '<circle cx="32" cy="44" r="1.5" fill="#ffffff" />' +
        '<circle cx="68" cy="44" r="3.2" fill="#fef08a" />' +
        '<circle cx="68" cy="44" r="1.5" fill="#ffffff" />' +
        '<!-- Taillights (Red LED Bar) -->' +
        '<rect x="29" y="122" width="10" height="3" rx="1.5" fill="#ef4444" />' +
        '<rect x="61" y="122" width="10" height="3" rx="1.5" fill="#ef4444" />' +
      '</svg>';
    }

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

      // 4. Update Vehicle
      if (vehicleMarker) {
        vehicleMarker.remove();
        vehicleMarker = null;
      }
      if (vehicle) {
        var vel = document.createElement('div');
        vel.className = 'vehicle-marker';
        var vType = vehicle.vehicleType || vehicle.type || 'car';
        var vColor = vehicle.color || 'Silver';
        var vSvg = get3DVehicleSvg(vType, vColor);

        vel.innerHTML = '<div class="vehicle-3d-wrapper">' +
          vSvg +
          '</div>' +
          '<span class="vehicle-plate-pill">' + (vehicle.plateNumber || 'TARGET') + '</span>';

        var vpopup = new maplibregl.Popup({ offset: 28 })
          .setHTML('<strong style="color:#38bdf8; font-size:13px;">' + (vehicle.plateNumber || 'TARGET') + '</strong><br/><span style="color:#f1f5f9; font-weight:600;">' + (vehicle.color || '') + ' ' + (vType.toUpperCase()) + '</span><br/><span style="color:#94a3b8;">Speed: ' + (vehicle.speed ? vehicle.speed + ' km/h' : 'Tracking') + '</span>');

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

        vehicleMarker = new maplibregl.Marker({
          element: vel,
          anchor: 'center',
          rotationAlignment: 'map',
          pitchAlignment: 'map',
          rotation: heading
        })
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .setPopup(vpopup)
          .addTo(map);

        var vKey = (vehicle.id || vehicle.plateNumber || '') + '@' + Number(vehicle.latitude).toFixed(4) + ',' + Number(vehicle.longitude).toFixed(4);
        if (vKey !== lastVehicleKey && (!trajectory || !trajectory.detections || trajectory.detections.length <= 1)) {
          lastVehicleKey = vKey;
          map.flyTo({
            center: [vehicle.longitude, vehicle.latitude],
            zoom: 15.5,
            pitch: is3DCurrent ? 52 : 0,
            bearing: is3DCurrent ? -18 : 0,
            duration: 1500
          });
        }
      } else {
        lastVehicleKey = null;
      }

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
