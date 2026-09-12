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

      var primaryColor = '#38bdf8';
      var secondaryColor = '#0284c7';
      var roofColor = '#0369a1';
      var highlightColor = '#e0f2fe';

      if (cName.includes('yellow') || vType === 'taxi') {
        primaryColor = '#eab308';
        secondaryColor = '#ca8a04';
        roofColor = '#a16207';
        highlightColor = '#fef08a';
      } else if (cName.includes('red')) {
        primaryColor = '#ef4444';
        secondaryColor = '#dc2626';
        roofColor = '#b91c1c';
        highlightColor = '#fecaca';
      } else if (cName.includes('white') || cName.includes('silver') || cName.includes('grey') || cName.includes('gray')) {
        primaryColor = '#e2e8f0';
        secondaryColor = '#94a3b8';
        roofColor = '#64748b';
        highlightColor = '#ffffff';
      } else if (cName.includes('black') || cName.includes('dark')) {
        primaryColor = '#334155';
        secondaryColor = '#1e293b';
        roofColor = '#0f172a';
        highlightColor = '#64748b';
      } else if (cName.includes('green')) {
        primaryColor = '#22c55e';
        secondaryColor = '#16a34a';
        roofColor = '#15803d';
        highlightColor = '#bbf7d0';
      }

      // 1. 3D TRUCK
      if (vType === 'truck') {
        return '<svg width="68" height="68" viewBox="0 0 100 100" class="vehicle-3d-svg">' +
          '<defs>' +
            '<filter id="v-shadow-truck" x="-30%" y="-30%" width="160%" height="160%">' +
              '<feGaussianBlur in="SourceAlpha" stdDeviation="3"/>' +
              '<feOffset dx="2" dy="5"/>' +
              '<feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>' +
              '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
            '</filter>' +
            '<linearGradient id="truck-beam" x1="0%" y1="0%" x2="100%" y2="100%">' +
              '<stop offset="0%" stop-color="#38bdf8" stop-opacity="0.65"/>' +
              '<stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>' +
            '</linearGradient>' +
          '</defs>' +
          '<ellipse cx="50" cy="62" rx="34" ry="18" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.8" class="radar-pulse" />' +
          '<polygon points="28,68 8,85 30,95 44,76" fill="url(#truck-beam)" />' +
          '<polygon points="56,76 46,95 68,85 48,68" fill="url(#truck-beam)" />' +
          '<ellipse cx="50" cy="62" rx="26" ry="12" fill="rgba(0,0,0,0.55)" filter="url(#v-shadow-truck)" />' +
          '<g filter="url(#v-shadow-truck)">' +
            '<polygon points="32,28 66,12 66,42 32,58" fill="' + secondaryColor + '" />' +
            '<polygon points="32,28 66,12 80,18 46,35" fill="' + primaryColor + '" />' +
            '<polygon points="66,12 80,18 80,48 66,42" fill="' + roofColor + '" />' +
            '<line x1="43" y1="23" x2="43" y2="52" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />' +
            '<line x1="54" y1="18" x2="54" y2="47" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />' +
            '<polygon points="18,48 36,39 46,44 28,54" fill="' + highlightColor + '" />' +
            '<polygon points="18,48 28,54 28,70 18,63" fill="' + primaryColor + '" />' +
            '<polygon points="28,54 46,44 46,60 28,70" fill="' + secondaryColor + '" />' +
            '<polygon points="20,49 34,42 42,46 28,53" fill="#0f172a" opacity="0.85" />' +
            '<polygon points="22,50 32,45 36,47 26,52" fill="#38bdf8" opacity="0.6" />' +
            '<circle cx="20" cy="62" r="2.5" fill="#fef08a" />' +
            '<circle cx="27" cy="67" r="2.5" fill="#fef08a" />' +
            '<ellipse cx="22" cy="69" rx="4" ry="7" fill="#090d16" stroke="#475569" stroke-width="1" />' +
            '<ellipse cx="40" cy="63" rx="4" ry="7" fill="#090d16" stroke="#475569" stroke-width="1" />' +
            '<ellipse cx="72" cy="46" rx="4" ry="7" fill="#090d16" stroke="#475569" stroke-width="1" />' +
          '</g>' +
        '</svg>';
      }

      // 2. 3D BUS
      if (vType === 'bus') {
        return '<svg width="68" height="68" viewBox="0 0 100 100" class="vehicle-3d-svg">' +
          '<defs>' +
            '<filter id="v-shadow-bus" x="-30%" y="-30%" width="160%" height="160%">' +
              '<feGaussianBlur in="SourceAlpha" stdDeviation="3"/>' +
              '<feOffset dx="2" dy="5"/>' +
              '<feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>' +
              '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
            '</filter>' +
            '<linearGradient id="bus-beam" x1="0%" y1="0%" x2="100%" y2="100%">' +
              '<stop offset="0%" stop-color="#38bdf8" stop-opacity="0.65"/>' +
              '<stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>' +
            '</linearGradient>' +
          '</defs>' +
          '<ellipse cx="50" cy="62" rx="34" ry="18" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.8" class="radar-pulse" />' +
          '<polygon points="20,66 2,82 24,96 36,73" fill="url(#bus-beam)" />' +
          '<ellipse cx="50" cy="62" rx="28" ry="12" fill="rgba(0,0,0,0.55)" filter="url(#v-shadow-bus)" />' +
          '<g filter="url(#v-shadow-bus)">' +
            '<polygon points="20,32 68,10 82,16 34,39" fill="' + highlightColor + '" />' +
            '<polygon points="20,32 34,39 34,65 20,57" fill="' + primaryColor + '" />' +
            '<polygon points="34,39 82,16 82,42 34,65" fill="' + secondaryColor + '" />' +
            '<polygon points="40,22 60,13 65,15 45,24" fill="#64748b" />' +
            '<polygon points="21,34 33,40 33,52 21,46" fill="#0f172a" />' +
            '<polygon points="22,36 31,41 31,50 22,45" fill="#38bdf8" opacity="0.75" />' +
            '<polygon points="37,40 78,21 78,32 37,51" fill="#0f172a" />' +
            '<polygon points="39,41 76,23 76,30 39,49" fill="#0284c7" opacity="0.8" />' +
            '<circle cx="22" cy="54" r="2.2" fill="#fef08a" />' +
            '<circle cx="30" cy="59" r="2.2" fill="#fef08a" />' +
            '<ellipse cx="26" cy="62" rx="3.5" ry="6.5" fill="#090d16" stroke="#475569" stroke-width="1" />' +
            '<ellipse cx="68" cy="42" rx="3.5" ry="6.5" fill="#090d16" stroke="#475569" stroke-width="1" />' +
          '</g>' +
        '</svg>';
      }

      // 3. 3D MOTORCYCLE / BIKE
      if (vType === 'motorcycle' || vType === 'bike' || vType === 'motorbike') {
        return '<svg width="58" height="58" viewBox="0 0 100 100" class="vehicle-3d-svg">' +
          '<defs>' +
            '<filter id="v-shadow-bike" x="-30%" y="-30%" width="160%" height="160%">' +
              '<feGaussianBlur in="SourceAlpha" stdDeviation="2"/>' +
              '<feOffset dx="1" dy="4"/>' +
              '<feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>' +
              '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
            '</filter>' +
          '</defs>' +
          '<ellipse cx="50" cy="64" rx="26" ry="14" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" class="radar-pulse" />' +
          '<ellipse cx="50" cy="64" rx="18" ry="8" fill="rgba(0,0,0,0.55)" filter="url(#v-shadow-bike)" />' +
          '<g filter="url(#v-shadow-bike)">' +
            '<ellipse cx="64" cy="50" rx="4" ry="10" fill="#0f172a" stroke="#475569" stroke-width="1.5" />' +
            '<ellipse cx="32" cy="65" rx="4" ry="10" fill="#0f172a" stroke="#475569" stroke-width="1.5" />' +
            '<polygon points="34,60 52,42 62,48 44,66" fill="' + secondaryColor + '" />' +
            '<polygon points="38,48 48,38 56,42 46,52" fill="' + primaryColor + '" />' +
            '<circle cx="48" cy="28" r="7" fill="#0f172a" stroke="' + primaryColor + '" stroke-width="1" />' +
            '<path d="M42,35 C42,32 54,32 54,35 L58,46 L40,46 Z" fill="#1e293b" />' +
            '<line x1="30" y1="48" x2="38" y2="44" stroke="#e2e8f0" stroke-width="2" />' +
            '<circle cx="28" cy="58" r="3" fill="#fef08a" />' +
          '</g>' +
        '</svg>';
      }

      // 4. 3D VAN
      if (vType === 'van') {
        return '<svg width="64" height="64" viewBox="0 0 100 100" class="vehicle-3d-svg">' +
          '<defs>' +
            '<filter id="v-shadow-van" x="-30%" y="-30%" width="160%" height="160%">' +
              '<feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>' +
              '<feOffset dx="2" dy="4"/>' +
              '<feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>' +
              '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
            '</filter>' +
          '</defs>' +
          '<ellipse cx="50" cy="62" rx="30" ry="16" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.8" class="radar-pulse" />' +
          '<ellipse cx="50" cy="62" rx="24" ry="11" fill="rgba(0,0,0,0.55)" filter="url(#v-shadow-van)" />' +
          '<g filter="url(#v-shadow-van)">' +
            '<polygon points="24,36 64,16 76,22 36,44" fill="' + highlightColor + '" />' +
            '<polygon points="24,36 36,44 36,66 24,58" fill="' + primaryColor + '" />' +
            '<polygon points="36,44 76,22 76,44 36,66" fill="' + secondaryColor + '" />' +
            '<polygon points="20,48 24,36 36,44 32,56" fill="' + primaryColor + '" />' +
            '<polygon points="22,46 25,38 34,44 31,52" fill="#0f172a" />' +
            '<polygon points="23,46 25,40 32,45 30,50" fill="#38bdf8" opacity="0.75" />' +
            '<line x1="52" y1="35" x2="52" y2="57" stroke="rgba(0,0,0,0.3)" stroke-width="1" />' +
            '<circle cx="21" cy="54" r="2.2" fill="#fef08a" />' +
            '<circle cx="28" cy="59" r="2.2" fill="#fef08a" />' +
            '<ellipse cx="28" cy="63" rx="3.5" ry="6.5" fill="#090d16" stroke="#475569" stroke-width="1" />' +
            '<ellipse cx="62" cy="46" rx="3.5" ry="6.5" fill="#090d16" stroke="#475569" stroke-width="1" />' +
          '</g>' +
        '</svg>';
      }

      // 5. 3D CAR / SEDAN / TAXI (Default)
      return '<svg width="64" height="64" viewBox="0 0 100 100" class="vehicle-3d-svg">' +
        '<defs>' +
          '<filter id="v-shadow-car" x="-30%" y="-30%" width="160%" height="160%">' +
            '<feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>' +
            '<feOffset dx="2" dy="5"/>' +
            '<feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>' +
            '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
          '</filter>' +
          '<linearGradient id="headlight-beam" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#38bdf8" stop-opacity="0.65"/>' +
            '<stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<ellipse cx="50" cy="62" rx="30" ry="16" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.85" class="radar-pulse" />' +
        '<polygon points="22,66 2,82 22,96 34,74" fill="url(#headlight-beam)" />' +
        '<ellipse cx="50" cy="62" rx="24" ry="11" fill="rgba(0,0,0,0.55)" filter="url(#v-shadow-car)" />' +
        '<g filter="url(#v-shadow-car)">' +
          '<polygon points="18,52 38,42 78,22 84,26 44,66 24,58" fill="' + secondaryColor + '" />' +
          '<polygon points="18,52 24,58 24,66 18,60" fill="' + roofColor + '" />' +
          '<polygon points="24,58 44,66 44,74 24,66" fill="' + secondaryColor + '" />' +
          '<polygon points="44,66 84,26 84,34 44,74" fill="' + roofColor + '" />' +
          '<polygon points="34,36 50,28 66,20 50,48" fill="' + highlightColor + '" />' +
          '<polygon points="28,46 36,37 48,43 40,52" fill="#0f172a" />' +
          '<polygon points="30,46 36,39 46,44 40,50" fill="#38bdf8" opacity="0.85" />' +
          '<polygon points="42,50 49,43 64,22 57,29" fill="#0f172a" />' +
          '<polygon points="44,49 49,44 62,24 57,29" fill="#0284c7" opacity="0.8" />' +
          '<polygon points="18,52 30,46 42,52 30,58" fill="' + primaryColor + '" />' +
          '<circle cx="22" cy="56" r="2.5" fill="#fef08a" />' +
          '<circle cx="32" cy="62" r="2.5" fill="#fef08a" />' +
          '<polygon points="23,59 31,64 30,66 22,61" fill="#090d16" />' +
          '<ellipse cx="26" cy="65" rx="3.5" ry="7" fill="#090d16" stroke="#475569" stroke-width="1.2" />' +
          '<ellipse cx="64" cy="46" rx="3.5" ry="7" fill="#090d16" stroke="#475569" stroke-width="1.2" />' +
        '</g>' +
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

        vehicleMarker = new maplibregl.Marker({ element: vel, anchor: 'center' })
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
