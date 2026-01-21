import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const GolfSimulatorViewer = () => {
  const mountRef = useRef(null);
  const [config, setConfig] = useState({
    width: 16, depth: 25, height: 10, screenType: 'builtin', panelColor: '#1a1a1a', panelDepth: 6, showPanels: true,
    projectorResolution: '4K', projectorModel: 'BenQ LK936ST', launchMonitor: 'Uneekor EYE XO2', showLaunchMonitor: true,
    launchMonitorType: 'ceiling', // 'ceiling' or 'floor'
    truGolfMultisport: false, turfColor: '#4a7a4a', matColor: '#3a6a3a', floorType: 'turf', monitorCount: 2,
    monitorSize: 43, monitorPosition: 'right', showBallDispenser: false, colorScheme: 'dark',
    enclosureWidth: 15.33, enclosureDepth: 5, enclosureHeight: 9.83, matDistance: 9.5,
    monitorDistanceFromScreen: 10,
    showComputer: true,
    turfDepth: 15,
    flushTurf: false,
    screenWidth: 15, // Screen width in feet
    aspectRatio: '16:9', // Screen aspect ratio
    autoProjectorDistance: true, // Auto-calculate projector distance based on throw ratio
    puttingCups: 0, // 0, 1, or 2 putting cups
    showRoughFringe: false, // Show rough/fringe border when turf width < room width
    roughFringeColor: 'green', // 'green' or 'black' for rough/fringe border
    showLEDStrip: false, // Show LED strip at panel seam
    ledStripDistance: 2, // Distance from screen (2' or 4' where panels meet)
    wallColor: 'white', // Wall color: white, black, charcoal, light-gray
    ceilingColor: 'white', // Ceiling color: white, black, charcoal, light-gray
    furniture: {
      barstools: 0,
      couches: 0,
      tables: 0,
      chairs: 0
    },
    furnitureLayout: {
      xOffset: 0,
      zOffset: 10,
      rotation: 0
    },
    showGolfer: false,
    golferHandedness: 'right',
    showCurtains: false,
    curtainDepth: 10 // How far curtains extend from back wall (in feet)
  });
  const [showControls, setShowControls] = useState(true);
  const [showPricing, setShowPricing] = useState(true);
  const [activeTab, setActiveTab] = useState('room');
  const [camState, setCamState] = useState({ r: 20, h: 0, v: 0 });
  const camStateRef = useRef({ r: 20, h: 0, v: 0 });
  const [panelPos, setPanelPos] = useState({
    x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 400) : 900,
    y: 16
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  const [pricingPanelPos, setPricingPanelPos] = useState({
    x: 16,
    y: typeof window !== 'undefined' ? window.innerHeight - 350 : 500
  });
  const [isPricingDragging, setIsPricingDragging] = useState(false);
  const [pricingDragOffset, setPricingDragOffset] = useState({ x: 0, y: 0 });
  const pricingPanelRef = useRef(null);

  const generateSnapshot = () => {
    const scrZ = config.screenType === 'builtin' ? -config.depth/2 + 1 : -config.depth/2 + 1;
    const matZ = scrZ + config.matDistance;
    const projectorDistance = config.autoProjectorDistance
      ? calculateProjectorDistance(config.screenWidth, config.projectorModel)
      : 12;
    const projZ = scrZ + projectorDistance;
    const projElecZ = projZ + 0.5;
    const lmZ = matZ - 3.5;
    const lmElecZ = lmZ - 0.5;
    const monitorZ = scrZ + config.monitorDistanceFromScreen;
    const computerX = config.width/2 - 0.5;

    const mw = config.monitorSize / 12;
    const mh = mw * (9/16);
    const lowestMonitorBottom = config.height*0.5 - mh/2;
    const deskHeight = Math.min(2.5, lowestMonitorBottom - 2.5);
    const computerY = deskHeight + 0.7;
    const computerZ = monitorZ - 0.5;

    const projSpecs = projectorSpecs[config.projectorModel];

    const report = `GOLF SIMULATOR ELECTRICAL & EQUIPMENT SNAPSHOT
================================================================================
Room Dimensions: ${config.width}' W × ${config.depth}' D × ${config.height}' H
Screen Type: ${config.screenType === 'builtin' ? 'Built-In Wall Screen' : 'Cage Enclosure'}
Screen Dimensions: ${config.screenType === 'builtin'
  ? `${(config.width - 0.333).toFixed(2)}' W × ${(config.height - 0.333).toFixed(2)}' H (4" smaller than room)`
  : `${(config.enclosureWidth - 0.333).toFixed(2)}' W × ${(config.enclosureHeight - 0.333).toFixed(2)}' H (4" smaller than cage frame)`}
Screen Width (for throw calc): ${config.screenWidth}ft
Aspect Ratio: ${config.aspectRatio}
Generated: ${new Date().toLocaleString()}

⚠️  IMPORTANT: Screen/cage is positioned 12" (1 foot) from the back wall
    All "distance from back wall" measurements account for this offset.

COLOR-CODED ELECTRICAL SYSTEM:
🔴 Red Outlets = Power sources
🟠 Orange Conduit = Electrical runs/pipes
🔵 Blue Conduit Boxes = Junction/connection boxes

================================================================================
EQUIPMENT LOCATIONS (from front wall):
================================================================================

PROJECTOR:
  Model: ${config.projectorModel}
  Throw Ratio: ${projSpecs ? projSpecs.throwRatio.join(' - ') : 'N/A'}
  Lens Type: ${projSpecs && projSpecs.hasZoom ? 'Zoom (adjustable)' : 'Fixed'}
  Calculated Distance: ${projectorDistance.toFixed(1)}ft from screen
  Formula: ${config.screenWidth}ft (screen width) × ${projSpecs ? ((projSpecs.throwRatio[0] + projSpecs.throwRatio[1])/2).toFixed(2) : 'N/A'} (avg throw ratio)
  Location: Center ceiling, ${Math.abs(projZ).toFixed(1)}' from screen
  Position: X: 0.0', Y: ${(config.height - 0.5).toFixed(1)}' (ceiling), Z: ${projZ.toFixed(1)}'

PROJECTOR ELECTRICAL:
  🔴 Red Outlet: X: 0.0', Y: ${(config.height - 0.02).toFixed(1)}' (ceiling), Z: ${projElecZ.toFixed(1)}'
  🔵 Blue Conduit Box: X: 0.4', Y: ${(config.height - 0.04).toFixed(1)}' (ceiling), Z: ${projElecZ.toFixed(1)}'
  Distance from screen: ${Math.abs(projElecZ - scrZ).toFixed(1)}'
  Distance from back wall: ${((config.depth/2) - projElecZ).toFixed(1)}' (screen is 1' from back wall)
  🟠 Orange Conduit Path:
    - Horizontal run to right wall: ${Math.abs(computerX).toFixed(1)}'
    - Along ceiling to computer: ${Math.abs(computerZ - projElecZ).toFixed(1)}'
    - Vertical drop to PC: ${(config.height - 0.06 - (computerY + 0.65)).toFixed(1)}'

${config.showLaunchMonitor ? `
LAUNCH MONITOR:
  Model: ${config.launchMonitor}
  Location: Center ceiling, ${Math.abs(lmZ - scrZ).toFixed(1)}' from screen
  Position: X: 0.0', Y: ${(config.height - 0.6).toFixed(1)}' (ceiling), Z: ${lmZ.toFixed(1)}'
  Distance from hitting area: ${Math.abs(matZ - lmZ).toFixed(1)}' (in front of tee)
  Distance from back wall: ${((config.depth/2) - lmZ).toFixed(1)}' (screen is 1' from back wall)

LAUNCH MONITOR ELECTRICAL:
  🔴 Red Outlet: X: 0.0', Y: ${(config.height - 0.02).toFixed(1)}' (ceiling), Z: ${lmElecZ.toFixed(1)}'
  🔵 Blue Conduit Box: X: 0.4', Y: ${(config.height - 0.04).toFixed(1)}' (ceiling), Z: ${lmElecZ.toFixed(1)}'
  Distance from screen: ${Math.abs(lmElecZ - scrZ).toFixed(1)}'
  Distance from back wall: ${((config.depth/2) - lmElecZ).toFixed(1)}' (screen is 1' from back wall)
  🟠 Orange Conduit Path:
    - Horizontal run to right wall: ${Math.abs(computerX).toFixed(1)}'
    - Along ceiling to computer: ${Math.abs(monitorZ - lmElecZ).toFixed(1)}'
    - Vertical drop to PC: ${(config.height - 0.06 - (computerY + 0.65)).toFixed(1)}'
` : ''}

HITTING MAT:
  Location: ${Math.abs(matZ).toFixed(1)}' from screen
  Position: X: 0.0', Y: 0.05', Z: ${matZ.toFixed(1)}'
  Size: 9' W × 4' D
  Turf Type: ${config.floorType === 'turf' ? 'Green Turf' : 'Black Turf'}
  Flush Setting: ${config.flushTurf ? 'ON (seamless/same height)' : 'OFF (raised mat)'}

${config.monitorCount > 0 ? `
TV MONITORS:
  Count: ${config.monitorCount}
  Size: ${config.monitorSize}" each
  Location: Right wall, ${Math.abs(monitorZ).toFixed(1)}' from screen
  Position: X: ${computerX.toFixed(1)}', Z: ${monitorZ.toFixed(1)}'
` : ''}

${config.showComputer ? `
COMPUTER & DESK:
  Desk Height: ${deskHeight.toFixed(1)}'
  Computer Location: Right wall, ${Math.abs(computerZ).toFixed(1)}' from screen
  Computer Position: X: ${computerX.toFixed(1)}', Y: ${computerY.toFixed(1)}', Z: ${computerZ.toFixed(1)}'
  Desk Size: 3' W × 1.5' D
` : ''}

================================================================================
MEASUREMENTS REFERENCE:
================================================================================
- All X coordinates: Negative = Left, Positive = Right, 0 = Center
- All Y coordinates: Height from floor
- All Z coordinates: Negative = Toward Screen, Positive = Toward Back Wall
- Screen located at Z: ${scrZ.toFixed(1)}'
- Back wall located at Z: ${(config.depth/2).toFixed(1)}'

Mat Distance from Screen: ${config.matDistance.toFixed(1)}'
Turf Depth: ${config.turfDepth.toFixed(1)}' (starts at screen)

================================================================================
`;

    // Create and download the file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golf-simulator-snapshot-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const projModels = {
    '4K': ['BenQ LK936ST', 'BenQ TK710STi', 'BenQ AK700ST', 'Optoma UHZ35ST', 'Optoma ZK608ST'],
    '1080P': ['Optoma ZW350ST', 'BenQ TH671ST', 'BenQ AH700ST']
  };

  // Projector throw ratio data - distance = screen width × throw ratio
  const projectorSpecs = {
    'BenQ LK936ST': { throwRatio: [0.81, 0.89], hasZoom: true },
    'BenQ AK700ST': { throwRatio: [0.69, 0.83], hasZoom: true },
    'Optoma UHZ35ST': { throwRatio: [0.50, 0.50], hasZoom: false },
    'BenQ TK710STi': { throwRatio: [0.69, 0.83], hasZoom: true }, // Estimated similar to AK700ST
    'Optoma ZK608ST': { throwRatio: [0.50, 0.50], hasZoom: false }, // Estimated similar to UHZ35ST
    'Optoma ZW350ST': { throwRatio: [0.50, 0.50], hasZoom: false }, // Estimated
    'BenQ TH671ST': { throwRatio: [0.69, 0.83], hasZoom: true }, // Estimated
    'BenQ AH700ST': { throwRatio: [0.69, 0.83], hasZoom: true } // Estimated
  };

  // Calculate projector distance based on screen width and throw ratio
  const calculateProjectorDistance = (screenWidth, projectorModel) => {
    const specs = projectorSpecs[projectorModel];
    if (!specs) return 12; // Default fallback

    // Use middle of throw ratio range for auto-calculation
    const avgThrowRatio = specs.hasZoom
      ? (specs.throwRatio[0] + specs.throwRatio[1]) / 2
      : specs.throwRatio[0];

    return screenWidth * avgThrowRatio;
  };

  const lms = ['ProTee VX', 'TruGolf Apogee', 'Foresight Falcon', 'Foresight GC3', 'Uneekor EYE XO', 'Uneekor EYE XO2', 'Uneekor EYE XR', 'Uneekor EYE MINI', 'Uneekor EYE MINI LITE', 'Trackman IO', 'Bushnell Launch Pro', 'Garmin Approach R10', 'Garmin Approach R50', 'TruGolf LaunchBox'];

  // Separate lists for ceiling and floor launch monitors
  const ceilingLaunchMonitors = ['ProTee VX', 'TruGolf Apogee', 'Foresight Falcon', 'Uneekor EYE XO', 'Uneekor EYE XO2', 'Uneekor EYE XR', 'Trackman IO'];

  const floorLaunchMonitors = ['Uneekor EYE MINI', 'Uneekor EYE MINI LITE', 'Foresight GC3', 'Bushnell Launch Pro', 'Garmin Approach R10', 'Garmin Approach R50', 'TruGolf LaunchBox'];

  // Launch monitor mounting types
  const launchMonitorTypes = {
    'ProTee VX': 'ceiling',
    'TruGolf Apogee': 'ceiling',
    'Foresight Falcon': 'ceiling',
    'Foresight GC3': 'floor',
    'Uneekor EYE XO': 'ceiling',
    'Uneekor EYE XO2': 'ceiling',
    'Uneekor EYE XR': 'ceiling',
    'Uneekor EYE MINI': 'floor',
    'Uneekor EYE MINI LITE': 'floor',
    'Trackman IO': 'ceiling',
    'Bushnell Launch Pro': 'floor',
    'Garmin Approach R10': 'floor',
    'Garmin Approach R50': 'floor',
    'TruGolf LaunchBox': 'floor'
  };

  // Pricing data
  const PRICING = {
    projectors: {
      'BenQ LK936ST': 4849,
      'BenQ TK710STi': 2199,
      'BenQ AK700ST': 2849,
      'Optoma UHZ35ST': 2199,
      'Optoma ZK608ST': 6735,
      'Optoma ZW350ST': 909,
      'BenQ TH671ST': 929,
      'BenQ AH700ST': 2199
    },
    launchMonitors: {
      'ProTee VX': 6499,
      'TruGolf Apogee': 7995,
      'Foresight Falcon': 14999,
      'Foresight GC3': 6999,
      'Uneekor EYE XO': 8000,
      'Uneekor EYE XO2': 11000,
      'Uneekor EYE XR': 6999,
      'Uneekor EYE MINI': 4500,
      'Uneekor EYE MINI LITE': 2750,
      'Trackman IO': 23495,
      'Bushnell Launch Pro': 4499,
      'Garmin Approach R10': 599,
      'Garmin Approach R50': 4750,
      'TruGolf LaunchBox': 2995
    },
    screens: {
      builtin: 1885,
      enclosure: 2500
    },
    panels: {
      '4ft': 2448,
      '6ft': 3640
    },
    turf: 11.90,
    mat: 774.50,
    installation: 3650,
    monitors: 229,
    computer: 2699
  };

  const calculatePrice = () => {
    let total = 0;
    total += PRICING.projectors[config.projectorModel] || 0;
    if (config.showLaunchMonitor) total += PRICING.launchMonitors[config.launchMonitor] || 0;

    // Screen pricing
    if (config.screenType === 'builtin') {
      total += PRICING.screens.builtin; // $1,885 flat rate for built-in screen
      // Add panel costs if panels are shown
      if (config.showPanels) {
        const panelCost = config.panelDepth === 4 ? PRICING.panels['4ft'] : PRICING.panels['6ft'];
        total += panelCost;
      }
    } else {
      total += PRICING.screens.enclosure; // $2,500 flat rate for cage/enclosure (includes screen)
    }

    // Turf pricing: $11.90 per square foot
    const turfArea = config.width * config.turfDepth; // square feet
    total += turfArea * PRICING.turf;

    // Hitting mat: $774.50 for 4'x9' mat
    total += PRICING.mat;

    total += config.monitorCount * PRICING.monitors;
    if (config.showComputer) total += PRICING.computer;
    total += PRICING.installation;
    return Math.round(total);
  };

  const upd = (k, v) => setConfig(p => ({ ...p, [k]: v }));

  const handlePanelMouseDown = (e) => {
    if (e.target.closest('input, select, button:not(.drag-handle)')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - panelPos.x,
      y: e.clientY - panelPos.y
    });
  };

  const handlePricingPanelMouseDown = (e) => {
    if (e.target.closest('button:not(.drag-handle)')) return;
    setIsPricingDragging(true);
    setPricingDragOffset({
      x: e.clientX - pricingPanelPos.x,
      y: e.clientY - pricingPanelPos.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPanelPos({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
      if (isPricingDragging) {
        setPricingPanelPos({
          x: e.clientX - pricingDragOffset.x,
          y: e.clientY - pricingDragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsPricingDragging(false);
    };

    if (isDragging || isPricingDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isPricingDragging, pricingDragOffset]);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const ml = new THREE.DirectionalLight(0xffffff, 0.6);
    ml.position.set(5, 10, 5);
    ml.castShadow = true;
    scene.add(ml);
    scene.add(new THREE.DirectionalLight(0xffffff, 0.3)).position.set(-5, 5, -5);

    const clrs = { dark: { w: 0x2a2a2a, f: 0x0a0a0a, c: 0x3a3a3a }, light: { w: 0xe0e0e0, f: 0xc9b896, c: 0xf5f5f5 }, modern: { w: 0x4a4a4a, f: 0x1a1a1a, c: 0x3a3a3a } }[config.colorScheme];

    // Color mapping for walls and ceiling
    const colorMap = {
      'white': 0xf5f5f5,
      'black': 0x0a0a0a,
      'charcoal': 0x2a2a2a,
      'light-gray': 0xb0b0b0
    };

    const wallColorHex = colorMap[config.wallColor] || 0xf5f5f5;
    const ceilingColorHex = colorMap[config.ceilingColor] || 0xf5f5f5;

    const add = (g, m, p, r) => {
      const mesh = new THREE.Mesh(g, m);
      if (p) mesh.position.set(...p);
      if (r) mesh.rotation.set(...r);
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };

    const scrZ = config.screenType === 'builtin' ? -config.depth/2 + 1 : -config.depth/2 + 1;
    const matZ = scrZ + config.matDistance;

    // Cap ceiling height at 10 feet for projector and overhead launch monitors
    const ceilingHeight = Math.min(config.height, 10);

    // Hitting mat - if flush, use slightly darker green; otherwise elevated with darker color
    if (config.flushTurf) {
      // Flush turf - slightly elevated (0.005ft = ~1/16") to prevent Z-fighting with turf plane
      // Mat is always green (darker shade), hitting strip is even darker
      const flushMatColor = 0x3a5a3a; // Darker green for hitting mat
      const flushStripColor = 0x2a4a2a; // Even darker green for hitting strip

      add(new THREE.BoxGeometry(9, 0.1, 4), new THREE.MeshStandardMaterial({ color: flushMatColor, roughness: 0.9 }), [0, 0.005, matZ]);
      add(new THREE.BoxGeometry(1, 0.1, 2.5), new THREE.MeshStandardMaterial({ color: flushStripColor, roughness: 0.85 }), [0, 0.01, matZ]);
    } else {
      // Raised mat with darker color (original behavior)
      add(new THREE.BoxGeometry(9, 0.1, 4), new THREE.MeshStandardMaterial({ color: config.matColor, roughness: 0.9 }), [0, 0.05, matZ]);
      add(new THREE.BoxGeometry(1, 0.11, 2.5), new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: 0.85 }), [0, 0.11, matZ]);
    }

    // Turf area starts at screen and extends outward by turfDepth
    const turfStartZ = scrZ; // Start at the screen
    const turfCenterZ = turfStartZ + config.turfDepth/2; // Center of turf area

    // Check if rough/fringe should be shown (when turf roll is 15' and room is wider)
    const turfRollWidth = 15; // Standard turf roll width
    const needsRoughFringe = config.showRoughFringe && config.width > turfRollWidth;

    if (needsRoughFringe) {
      // Center turf strip (15' wide)
      add(new THREE.PlaneGeometry(turfRollWidth, config.turfDepth), new THREE.MeshStandardMaterial({ color: config.floorType === 'carpet' ? clrs.f : config.turfColor, roughness: 0.9 }), [0, 0, turfCenterZ], [-Math.PI/2, 0, 0]);

      // Rough/fringe borders on left and right - user selectable color
      const roughWidth = (config.width - turfRollWidth) / 2; // Width of each rough strip
      const roughColor = config.roughFringeColor === 'black' ? 0x050505 : 0x2a4a2a; // Black or darker green

      // Left rough/fringe
      add(new THREE.PlaneGeometry(roughWidth, config.turfDepth), new THREE.MeshStandardMaterial({ color: roughColor, roughness: 0.95 }), [-(turfRollWidth/2 + roughWidth/2), 0.002, turfCenterZ], [-Math.PI/2, 0, 0]);

      // Right rough/fringe
      add(new THREE.PlaneGeometry(roughWidth, config.turfDepth), new THREE.MeshStandardMaterial({ color: roughColor, roughness: 0.95 }), [turfRollWidth/2 + roughWidth/2, 0.002, turfCenterZ], [-Math.PI/2, 0, 0]);
    } else {
      // Full-width turf (no rough borders)
      add(new THREE.PlaneGeometry(config.width, config.turfDepth), new THREE.MeshStandardMaterial({ color: config.floorType === 'carpet' ? clrs.f : config.turfColor, roughness: 0.9 }), [0, 0, turfCenterZ], [-Math.PI/2, 0, 0]);
    }

    // Fill remaining floor space behind turf with concrete/dark floor
    const backWallZ = config.depth/2;
    const turfEndZ = turfStartZ + config.turfDepth;
    const backFloorDepth = backWallZ - turfEndZ;

    if (backFloorDepth > 0) {
      const backFloorZ = turfEndZ + backFloorDepth/2;
      add(new THREE.PlaneGeometry(config.width, backFloorDepth), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 }), [0, 0, backFloorZ], [-Math.PI/2, 0, 0]);
    }

    // Walls and ceiling with user-selected colors
    const wm = new THREE.MeshStandardMaterial({ color: wallColorHex, roughness: 0.7 });
    add(new THREE.PlaneGeometry(config.width, config.height), wm, [0, config.height/2, -config.depth/2]); // Back wall
    add(new THREE.PlaneGeometry(config.depth, config.height), wm, [-config.width/2, config.height/2, 0], [0, Math.PI/2, 0]); // Left wall
    add(new THREE.PlaneGeometry(config.depth, config.height), wm, [config.width/2, config.height/2, 0], [0, -Math.PI/2, 0]); // Right wall
    add(new THREE.PlaneGeometry(config.width, config.depth), new THREE.MeshStandardMaterial({ color: ceilingColorHex, roughness: 0.9 }), [0, config.height, 0], [Math.PI/2, 0, 0]); // Ceiling

    // Curtains on left and right walls
    if (config.showCurtains) {
      const curtainColor = 0x2a2a2a; // Dark charcoal gray
      const curtainHeight = config.height - 0.17; // 2" shorter than room height
      const curtainOffset = 0.15; // 2" in front of wall
      const curtainDepth = config.curtainDepth; // User-adjustable depth

      // Start curtains after panels (built-in) or cage (enclosure)
      const curtainStartZ = config.screenType === 'builtin'
        ? (config.showPanels ? scrZ + config.panelDepth : scrZ)
        : scrZ + config.enclosureDepth;
      const curtainCenterZ = curtainStartZ + curtainDepth/2; // Center position

      const curtainMaterial = new THREE.MeshStandardMaterial({
        color: curtainColor,
        roughness: 0.95,
        side: THREE.DoubleSide
      });

      // Left wall curtain
      add(new THREE.PlaneGeometry(curtainDepth, curtainHeight), curtainMaterial, [-config.width/2 + curtainOffset, curtainHeight/2, curtainCenterZ], [0, Math.PI/2, 0]);

      // Right wall curtain
      add(new THREE.PlaneGeometry(curtainDepth, curtainHeight), curtainMaterial, [config.width/2 - curtainOffset, curtainHeight/2, curtainCenterZ], [0, -Math.PI/2, 0]);

      // Curtain rods (simple cylinders at top)
      const rodMaterial = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, metalness: 0.7, roughness: 0.3 });
      add(new THREE.CylinderGeometry(0.04, 0.04, curtainDepth, 16), rodMaterial, [-config.width/2 + curtainOffset, config.height - 0.1, curtainCenterZ], [0, 0, Math.PI/2]);
      add(new THREE.CylinderGeometry(0.04, 0.04, curtainDepth, 16), rodMaterial, [config.width/2 - curtainOffset, config.height - 0.1, curtainCenterZ], [0, 0, Math.PI/2]);
    }

    // LED strip at panel seam - goes up left wall, across ceiling, down right wall
    if (config.showLEDStrip) {
      const ledZ = scrZ + config.ledStripDistance; // Position at panel seam (2' or 4' from screen)
      const ledWidth = 0.08; // ~1" wide LED strip
      const ledColor = 0xffaa00; // Warm LED orange/amber color
      const ledMaterial = new THREE.MeshStandardMaterial({
        color: ledColor,
        emissive: ledColor,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.1
      });

      // Vertical strip up left wall (from floor to ceiling)
      add(new THREE.BoxGeometry(ledWidth, config.height, ledWidth), ledMaterial, [-config.width/2 + 0.02, config.height/2, ledZ]);

      // Horizontal strip across ceiling (from left to right wall)
      add(new THREE.BoxGeometry(config.width, ledWidth, ledWidth), ledMaterial, [0, config.height - 0.02, ledZ]);

      // Vertical strip down right wall (from ceiling to floor)
      add(new THREE.BoxGeometry(ledWidth, config.height, ledWidth), ledMaterial, [config.width/2 - 0.02, config.height/2, ledZ]);

      // Add point lights along the LED strip for illumination effect
      const ledLight1 = new THREE.PointLight(ledColor, 0.3, 8);
      ledLight1.position.set(-config.width/2 + 0.1, config.height/2, ledZ);
      scene.add(ledLight1);

      const ledLight2 = new THREE.PointLight(ledColor, 0.3, 8);
      ledLight2.position.set(0, config.height - 0.1, ledZ);
      scene.add(ledLight2);

      const ledLight3 = new THREE.PointLight(ledColor, 0.3, 8);
      ledLight3.position.set(config.width/2 - 0.1, config.height/2, ledZ);
      scene.add(ledLight3);
    }

    if (config.screenType === 'builtin') {
      const sw = config.width - 0.333, sh = config.height - 0.333; // 4" smaller than room (4"/12" = 0.333ft)

      const createScreenGolfImage = () => {
        const c = document.createElement('canvas');
        c.width = 1920;
        c.height = 1080;
        const ctx = c.getContext('2d');

        const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 1920, 400);

        ctx.fillStyle = '#6b8e99';
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.lineTo(300, 250);
        ctx.lineTo(600, 350);
        ctx.lineTo(900, 200);
        ctx.lineTo(1200, 300);
        ctx.lineTo(1500, 250);
        ctx.lineTo(1920, 350);
        ctx.lineTo(1920, 400);
        ctx.closePath();
        ctx.fill();

        const fairwayGrad = ctx.createLinearGradient(0, 400, 0, 1080);
        fairwayGrad.addColorStop(0, '#5a9a5a');
        fairwayGrad.addColorStop(1, '#4a7c4a');
        ctx.fillStyle = fairwayGrad;
        ctx.fillRect(0, 400, 1920, 680);

        ctx.fillStyle = '#3a6a3a';
        ctx.fillRect(0, 400, 300, 680);
        ctx.fillRect(1620, 400, 300, 680);

        for (let i = 0; i < 8; i++) {
          const x = 100 + i * 80;
          const y = 500 + Math.random() * 100;
          ctx.fillStyle = '#4a3520';
          ctx.fillRect(x - 10, y, 20, 80);
          ctx.fillStyle = '#2d5016';
          ctx.beginPath();
          ctx.arc(x, y - 20, 50, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let i = 0; i < 8; i++) {
          const x = 1620 + i * 80;
          const y = 500 + Math.random() * 100;
          ctx.fillStyle = '#4a3520';
          ctx.fillRect(x - 10, y, 20, 80);
          ctx.fillStyle = '#2d5016';
          ctx.beginPath();
          ctx.arc(x, y - 20, 50, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#f4e4c1';
        ctx.beginPath();
        ctx.ellipse(1400, 850, 120, 80, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(500, 900, 100, 70, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3a7a3a';
        ctx.beginPath();
        ctx.ellipse(960, 950, 250, 130, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(960, 950);
        ctx.lineTo(960, 850);
        ctx.stroke();

        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(960, 850);
        ctx.lineTo(960, 890);
        ctx.lineTo(1020, 870);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(960, 950, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(820, 50, 280, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HOLE 7', 960, 100);
        ctx.font = '36px Arial';
        ctx.fillText('PAR 4   -   385 YDS', 960, 140);

        return new THREE.CanvasTexture(c);
      };

      add(new THREE.PlaneGeometry(sw, sh), new THREE.MeshStandardMaterial({
        map: createScreenGolfImage(),
        roughness: 0.8,
        emissive: 0xffffff,
        emissiveIntensity: 0.1
      }), [0, 0.17 + sh/2, scrZ]);

      if (config.showPanels) {
        const pm = new THREE.MeshStandardMaterial({ color: config.panelColor, roughness: 0.7 });
        for (let i = 0; i < Math.floor(config.panelDepth/2); i++) {
          for (let j = 0; j < Math.floor(config.height/2); j++) {
            add(new THREE.BoxGeometry(0.08, 1.95, 1.95), pm, [-config.width/2+0.04, 1+j*2, scrZ+1+i*2]).castShadow = true;
            add(new THREE.BoxGeometry(0.08, 1.95, 1.95), pm, [config.width/2-0.04, 1+j*2, scrZ+1+i*2]).castShadow = true;
          }
        }
        for (let i = 0; i < Math.floor(config.width/2); i++) {
          for (let j = 0; j < Math.floor(config.panelDepth/2); j++) {
            add(new THREE.BoxGeometry(1.95, 0.08, 1.95), pm, [-config.width/2+1+i*2, config.height-0.04, scrZ+1+j*2]).castShadow = true;
          }
        }
      }
    } else {
      const pip = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6 });
      const can = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide });
      const w = config.enclosureWidth, d = config.enclosureDepth, h = config.enclosureHeight;

      const cageOffset = scrZ + d/2;

      [[-w/2,-d/2], [w/2,-d/2], [w/2,d/2], [-w/2,d/2]].forEach(([x,z]) => add(new THREE.CylinderGeometry(0.05, 0.05, h), pip, [x, h/2, z + cageOffset]).castShadow = true);
      [[0,h,-d/2], [0,h,d/2], [-w/2,h,0], [w/2,h,0], [0,0,-d/2], [0,0,d/2], [-w/2,0,0], [w/2,0,0]].forEach(([x,y,z], i) => {
        const len = i < 2 || i >= 4 && i < 6 ? w : d;
        const rot = i < 2 || i >= 4 && i < 6 ? [0,0,Math.PI/2] : [0,0,0];
        add(new THREE.CylinderGeometry(0.05, 0.05, len), pip, [x, y, z + cageOffset], rot).castShadow = true;
      });

      add(new THREE.PlaneGeometry(w-0.2, h-0.2), can, [0, h/2, -d/2+0.05 + cageOffset]);
      add(new THREE.PlaneGeometry(d-0.2, h-0.2), can, [-w/2+0.05, h/2, 0 + cageOffset], [0, Math.PI/2, 0]);
      add(new THREE.PlaneGeometry(d-0.2, h-0.2), can, [w/2-0.05, h/2, 0 + cageOffset], [0, -Math.PI/2, 0]);
      add(new THREE.PlaneGeometry(w-0.2, d-0.2), can, [0, h-0.05, 0 + cageOffset], [Math.PI/2, 0, 0]);

      const createScreenGolfImage = () => {
        const c = document.createElement('canvas');
        c.width = 1920;
        c.height = 1080;
        const ctx = c.getContext('2d');

        const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 1920, 400);

        ctx.fillStyle = '#6b8e99';
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.lineTo(300, 250);
        ctx.lineTo(600, 350);
        ctx.lineTo(900, 200);
        ctx.lineTo(1200, 300);
        ctx.lineTo(1500, 250);
        ctx.lineTo(1920, 350);
        ctx.lineTo(1920, 400);
        ctx.closePath();
        ctx.fill();

        const fairwayGrad = ctx.createLinearGradient(0, 400, 0, 1080);
        fairwayGrad.addColorStop(0, '#5a9a5a');
        fairwayGrad.addColorStop(1, '#4a7c4a');
        ctx.fillStyle = fairwayGrad;
        ctx.fillRect(0, 400, 1920, 680);

        ctx.fillStyle = '#3a6a3a';
        ctx.fillRect(0, 400, 300, 680);
        ctx.fillRect(1620, 400, 300, 680);

        for (let i = 0; i < 8; i++) {
          const x = 100 + i * 80;
          const y = 500 + Math.random() * 100;
          ctx.fillStyle = '#4a3520';
          ctx.fillRect(x - 10, y, 20, 80);
          ctx.fillStyle = '#2d5016';
          ctx.beginPath();
          ctx.arc(x, y - 20, 50, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let i = 0; i < 8; i++) {
          const x = 1620 + i * 80;
          const y = 500 + Math.random() * 100;
          ctx.fillStyle = '#4a3520';
          ctx.fillRect(x - 10, y, 20, 80);
          ctx.fillStyle = '#2d5016';
          ctx.beginPath();
          ctx.arc(x, y - 20, 50, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#f4e4c1';
        ctx.beginPath();
        ctx.ellipse(1400, 850, 120, 80, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(500, 900, 100, 70, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3a7a3a';
        ctx.beginPath();
        ctx.ellipse(960, 950, 250, 130, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(960, 950);
        ctx.lineTo(960, 850);
        ctx.stroke();

        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(960, 850);
        ctx.lineTo(960, 890);
        ctx.lineTo(1020, 870);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(960, 950, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(820, 50, 280, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HOLE 7', 960, 100);
        ctx.font = '36px Arial';
        ctx.fillText('PAR 4   -   385 YDS', 960, 140);

        return new THREE.CanvasTexture(c);
      };

      const screenGap = 0.167; // 2" gap on each side (4" total = 0.333ft, so 0.167ft per side)
      add(new THREE.PlaneGeometry(w - screenGap*2, h - screenGap*2), new THREE.MeshStandardMaterial({
        map: createScreenGolfImage(),
        roughness: 0.3,
        emissive: 0xffffff,
        emissiveIntensity: 0.2
      }), [0, h/2, scrZ + 0.1]);
    }

    // Calculate projector distance based on throw ratio and screen width
    const projectorDistance = config.autoProjectorDistance
      ? calculateProjectorDistance(config.screenWidth, config.projectorModel)
      : 12; // Fallback to 12 feet if auto is off

    const projZ = scrZ + projectorDistance;

    add(new THREE.BoxGeometry(0.8, 0.4, 0.8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }), [0, ceilingHeight-0.5, projZ]);
    add(new THREE.CylinderGeometry(0.12, 0.12, 0.15), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 }), [0, ceilingHeight-0.5, projZ-0.45], [Math.PI/2, 0, 0]);

    const projElecZ = projZ + 0.5;
    // Red outlet
    add(new THREE.BoxGeometry(0.25, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3 }), [0, ceilingHeight-0.02, projElecZ]);
    add(new THREE.BoxGeometry(0.2, 0.02, 0.25), new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.5 }), [0, ceilingHeight-0.05, projElecZ]);
    add(new THREE.CircleGeometry(0.025, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }), [-0.05, ceilingHeight-0.06, projElecZ], [-Math.PI/2, 0, 0]);
    add(new THREE.CircleGeometry(0.025, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }), [0.05, ceilingHeight-0.06, projElecZ], [-Math.PI/2, 0, 0]);

    // Conduit box (gray metal box) next to outlet
    add(new THREE.BoxGeometry(0.3, 0.08, 0.3), new THREE.MeshStandardMaterial({ color: 0x0066ff, metalness: 0.6, roughness: 0.4 }), [0.4, ceilingHeight-0.04, projElecZ]);
    add(new THREE.CircleGeometry(0.015, 8), new THREE.MeshBasicMaterial({ color: 0x333333 }), [0.4, ceilingHeight-0.08, projElecZ + 0.12], [-Math.PI/2, 0, 0]);
    add(new THREE.CircleGeometry(0.015, 8), new THREE.MeshBasicMaterial({ color: 0x333333 }), [0.4, ceilingHeight-0.08, projElecZ - 0.12], [-Math.PI/2, 0, 0]);

    // Projector conduit runs to the actual computer location (same as launch monitor)
    if (config.monitorCount > 0 && config.showComputer) {
      const mw = config.monitorSize / 12;
      const mh = mw * (9/16);
      const monitorZ = scrZ + config.monitorDistanceFromScreen;
      const computerX = config.width/2 - 0.5;
      const lowestMonitorBottom = config.height*0.5 - mh/2;
      const deskHeight = Math.min(2.5, lowestMonitorBottom - 2.5);
      const computerY = deskHeight + 0.7;
      const computerZ = monitorZ - 0.5;

      // Horizontal conduit along ceiling (X-axis - center to computer wall)
      const conduitLengthX = Math.abs(computerX);
      if (conduitLengthX > 0) {
        add(new THREE.CylinderGeometry(0.052, 0.052, conduitLengthX, 16), new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.7, roughness: 0.3 }), [computerX/2, ceilingHeight-0.06, projElecZ], [0, 0, Math.PI/2]).castShadow = true;
      }

      // Horizontal conduit along ceiling (Z-axis - from projector position BACKWARD to computer position)
      // projElecZ is closer to screen (more negative), computerZ is further back (more positive)
      // So we need to go FROM projElecZ TO computerZ (positive direction)
      const conduitLengthZ = Math.abs(computerZ - projElecZ);
      if (conduitLengthZ > 0) {
        // Center point between projElecZ and computerZ
        const centerZ = (projElecZ + computerZ) / 2;
        add(new THREE.CylinderGeometry(0.052, 0.052, conduitLengthZ, 16), new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.7, roughness: 0.3 }), [computerX, ceilingHeight-0.06, centerZ], [Math.PI/2, 0, 0]).castShadow = true;
      }

      // Vertical conduit drop down to computer top
      const verticalDropHeight = config.height - 0.06 - (computerY + 0.65);
      if (verticalDropHeight > 0) {
        add(new THREE.CylinderGeometry(0.052, 0.052, verticalDropHeight, 16), new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.7, roughness: 0.3 }), [computerX, config.height - 0.06 - verticalDropHeight/2, computerZ], [0, 0, 0]).castShadow = true;
      }
    }

    const mkTxt = (txt) => {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 64;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(txt, 128, 40);
      return new THREE.CanvasTexture(c);
    };

    add(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: mkTxt(config.projectorModel), transparent: true }), [0, ceilingHeight-0.2, projZ+0.5], [-Math.PI/4, 0, 0]);

    if (config.showLaunchMonitor) {
      const lmType = config.launchMonitorType;

      if (lmType === 'ceiling') {
        // CEILING MOUNTED (Uneekor, ProTee, etc.)
        const lmZ = matZ - 3.5; // 3'6" (3.5 feet) IN FRONT of the tee position (toward screen)
        add(new THREE.BoxGeometry(1.2, 0.25, 0.6), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6 }), [0, ceilingHeight-0.6, lmZ]);
        add(new THREE.CylinderGeometry(0.06, 0.06, 0.08), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9 }), [-0.25, ceilingHeight-0.72, lmZ]);
        add(new THREE.CylinderGeometry(0.06, 0.06, 0.08), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9 }), [0.25, ceilingHeight-0.72, lmZ]);
        add(new THREE.CircleGeometry(0.02, 16), new THREE.MeshBasicMaterial({ color: 0x00ff00 }), [0, ceilingHeight-0.74, lmZ+0.25], [-Math.PI/2, 0, 0]);
        add(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshBasicMaterial({ map: mkTxt(config.launchMonitor), transparent: true }), [0, ceilingHeight-0.3, lmZ+0.4], [-Math.PI/6, 0, 0]);

        const lmElecZ = lmZ - 0.5; // Outlet 6" closer to screen (in front of LM)
        // Red outlet
        add(new THREE.BoxGeometry(0.25, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3 }), [0, ceilingHeight-0.02, lmElecZ]);
        add(new THREE.BoxGeometry(0.2, 0.02, 0.25), new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.5 }), [0, ceilingHeight-0.05, lmElecZ]);
        add(new THREE.CircleGeometry(0.025, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }), [-0.05, ceilingHeight-0.06, lmElecZ], [-Math.PI/2, 0, 0]);
        add(new THREE.CircleGeometry(0.025, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }), [0.05, ceilingHeight-0.06, lmElecZ], [-Math.PI/2, 0, 0]);

        // Conduit box (gray metal box) next to outlet
        add(new THREE.BoxGeometry(0.3, 0.08, 0.3), new THREE.MeshStandardMaterial({ color: 0x0066ff, metalness: 0.6, roughness: 0.4 }), [0.4, ceilingHeight-0.04, lmElecZ]);
        add(new THREE.CircleGeometry(0.015, 8), new THREE.MeshBasicMaterial({ color: 0x333333 }), [0.4, ceilingHeight-0.08, lmElecZ + 0.12], [-Math.PI/2, 0, 0]);
        add(new THREE.CircleGeometry(0.015, 8), new THREE.MeshBasicMaterial({ color: 0x333333 }), [0.4, ceilingHeight-0.08, lmElecZ - 0.12], [-Math.PI/2, 0, 0]);

        // Conduit runs horizontally from launch monitor to computer location (right wall), then drops down
        if (config.monitorCount > 0 && config.showComputer) {
          const mw = config.monitorSize / 12;
          const mh = mw * (9/16);
          const monitorZ = scrZ + config.monitorDistanceFromScreen;
          const computerX = config.width/2 - 0.5;
          const lowestMonitorBottom = config.height*0.5 - mh/2;
          const deskHeight = Math.min(2.5, lowestMonitorBottom - 2.5);
          const computerY = deskHeight + 0.7;
          const computerZ = monitorZ - 0.5;

          // Horizontal conduit along ceiling (X-axis - center to right wall)
          const lmConduitLengthX = Math.abs(computerX);
          if (lmConduitLengthX > 0) {
            add(new THREE.CylinderGeometry(0.052, 0.052, lmConduitLengthX, 16), new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.7, roughness: 0.3 }), [computerX/2, ceilingHeight-0.06, lmElecZ], [0, 0, Math.PI/2]).castShadow = true;
          }

          // Horizontal conduit along ceiling (Z-axis - from LM position to monitor position)
          const lmConduitLengthZ = Math.abs(monitorZ - lmElecZ);
          if (lmConduitLengthZ > 0) {
            add(new THREE.CylinderGeometry(0.052, 0.052, lmConduitLengthZ, 16), new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.7, roughness: 0.3 }), [computerX, ceilingHeight-0.06, lmElecZ + lmConduitLengthZ/2], [Math.PI/2, 0, 0]).castShadow = true;
          }

          // Vertical conduit drop down to computer at the corner
          const verticalDropHeight = config.height - 0.06 - (computerY + 0.65);
          if (verticalDropHeight > 0) {
            add(new THREE.CylinderGeometry(0.052, 0.052, verticalDropHeight, 16), new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.7, roughness: 0.3 }), [computerX, config.height - 0.06 - verticalDropHeight/2, monitorZ], [0, 0, 0]).castShadow = true;
          }
        }
      } else {
        // FLOOR MOUNTED (Foresight, Trackman, Bushnell, Garmin, etc.)
        // Position at the ball dispenser location (to the right side of mat)
        const isR10 = config.launchMonitor === 'Garmin Approach R10';

        // Ball dispenser position calculation
        const dispenserX = 0.5 + 0.833 + (1.2 * 0.75) / 2;

        // Floor launch monitors go where ball dispenser would be (right side of mat)
        const floorLmX = isR10 ? 0 : dispenserX; // R10 centered, others at dispenser location
        const floorLmZ = isR10 ? matZ + 5 : matZ; // R10 behind mat, others at mat level

        // Floor units are 15" tall (1.25 feet)
        const floorLmHeight = 1.25; // 15 inches = 1.25 feet

        // Base/tripod - smaller and lower
        add(new THREE.CylinderGeometry(0.3, 0.35, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.4 }), [floorLmX, 0.04, floorLmZ]).castShadow = true;

        // Center pole - 15" total height
        add(new THREE.CylinderGeometry(0.05, 0.05, floorLmHeight - 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.3 }), [floorLmX, (floorLmHeight - 0.3) / 2 + 0.08, floorLmZ]).castShadow = true;

        // Launch monitor unit at top (compact)
        add(new THREE.BoxGeometry(0.5, 0.25, 0.35), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.4 }), [floorLmX, floorLmHeight - 0.125, floorLmZ]).castShadow = true;

        // Camera lens - faces toward the hitting area
        add(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.2 }), [floorLmX, floorLmHeight - 0.125, floorLmZ - 0.22], [Math.PI/2, 0, 0]).castShadow = true;

        // Power LED
        add(new THREE.CircleGeometry(0.015, 16), new THREE.MeshBasicMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 }), [floorLmX + 0.2, floorLmHeight - 0.05, floorLmZ], [0, -Math.PI/2, 0]);

        // Label - smaller and positioned above unit
        add(new THREE.PlaneGeometry(0.6, 0.15), new THREE.MeshBasicMaterial({ map: mkTxt(config.launchMonitor), transparent: true }), [floorLmX, floorLmHeight + 0.15, floorLmZ], [0, 0, 0]);

        // Floor outlet behind the device
        const floorOutletZ = floorLmZ - 0.6;
        add(new THREE.BoxGeometry(0.25, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3 }), [floorLmX, 0.03, floorOutletZ]);
        add(new THREE.CircleGeometry(0.025, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }), [floorLmX - 0.05, 0.05, floorOutletZ], [-Math.PI/2, 0, 0]);
        add(new THREE.CircleGeometry(0.025, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }), [floorLmX + 0.05, 0.05, floorOutletZ], [-Math.PI/2, 0, 0]);

        // Power cable from device to outlet (simple representation)
        const cablePoints = [
          new THREE.Vector3(floorLmX, 0.1, floorLmZ),
          new THREE.Vector3(floorLmX, 0.08, floorLmZ - 0.3),
          new THREE.Vector3(floorLmX, 0.05, floorOutletZ)
        ];
        const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
        const cableGeometry = new THREE.TubeGeometry(cableCurve, 20, 0.015, 8, false);
        const cableMesh = new THREE.Mesh(cableGeometry, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }));
        scene.add(cableMesh);
      }
    }

    if (config.monitorCount > 0) {
      const mw = config.monitorSize / 12;
      const mh = mw * (9/16);
      const monitorZ = scrZ + config.monitorDistanceFromScreen;
      const xP = config.width/2 - 0.5;

      const createGolfImage = (type) => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 288;
        const ctx = c.getContext('2d');

        const skyGrad = ctx.createLinearGradient(0, 0, 0, 150);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 512, 150);

        ctx.fillStyle = '#4a7c4a';
        ctx.fillRect(0, 150, 512, 138);

        ctx.fillStyle = '#3a6a3a';
        ctx.fillRect(0, 150, 80, 138);
        ctx.fillRect(432, 150, 80, 138);

        ctx.fillStyle = '#f4e4c1';
        ctx.beginPath();
        ctx.ellipse(400, 220, 50, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 5; i++) {
          const x = 50 + i * 100;
          ctx.fillStyle = '#2d5016';
          ctx.beginPath();
          ctx.moveTo(x, 150);
          ctx.lineTo(x - 15, 120);
          ctx.lineTo(x + 15, 120);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#1a3a0a';
          ctx.beginPath();
          ctx.arc(x, 115, 20, 0, Math.PI * 2);
          ctx.fill();
        }

        if (type === 'green') {
          ctx.fillStyle = '#2a5a2a';
          ctx.beginPath();
          ctx.arc(256, 240, 60, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(256, 240);
          ctx.lineTo(256, 200);
          ctx.stroke();

          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.moveTo(256, 200);
          ctx.lineTo(256, 210);
          ctx.lineTo(275, 205);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 150, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Hole 7', 20, 30);
        ctx.font = '14px Arial';
        ctx.fillText('Par 4 - 385 yds', 20, 50);
        ctx.fillText('Wind: 5mph →', 20, 65);

        return new THREE.CanvasTexture(c);
      };

      for (let i = 0; i < config.monitorCount; i++) {
        const frame = add(new THREE.BoxGeometry(mw, mh, 0.1), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }), [xP, config.height*0.5+i*(mh+0.3), monitorZ], [0, -Math.PI/2, 0]);
        frame.castShadow = true;

        const screenMat = new THREE.MeshStandardMaterial({
          map: createGolfImage(i === 0 ? 'green' : 'fairway'),
          emissive: 0x222222,
          emissiveIntensity: 0.3
        });
        add(new THREE.PlaneGeometry(mw - 0.2, mh - 0.2), screenMat, [xP - 0.06, config.height*0.5+i*(mh+0.3), monitorZ], [0, -Math.PI/2, 0]);
      }

      if (config.showComputer) {
        const lowestMonitorBottom = config.height*0.5 - mh/2;
        const deskHeight = Math.min(2.5, lowestMonitorBottom - 2.5);
        const deskWidth = 3; // Reduced from 4 to 3 feet
        const deskDepth = 1.5; // Reduced from 2 to 1.5 feet

        add(new THREE.BoxGeometry(deskDepth, 0.1, deskWidth), new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.6 }), [xP, deskHeight, monitorZ], [0, -Math.PI/2, 0]).castShadow = true;

        const legPositions = [
          [xP, deskHeight/2, monitorZ - deskWidth/2 + 0.3],
          [xP, deskHeight/2, monitorZ + deskWidth/2 - 0.3]
        ];
        legPositions.forEach(pos => {
          add(new THREE.BoxGeometry(0.15, deskHeight, 0.15), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.7 }), pos, [0, -Math.PI/2, 0]).castShadow = true;
        });

        add(new THREE.BoxGeometry(deskDepth - 0.1, 0.4, deskWidth - 0.6), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.7 }), [xP, deskHeight - 0.5, monitorZ], [0, -Math.PI/2, 0]).castShadow = true;

        const computerX = xP;
        const computerY = deskHeight + 0.7;
        const computerZ = monitorZ - 0.5; // Moved closer to edge of desk

        add(new THREE.BoxGeometry(0.75, 1.3, 0.65), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.3 }), [computerX, computerY, computerZ], [0, -Math.PI/2, 0]).castShadow = true;
        add(new THREE.BoxGeometry(0.76, 1.2, 0.6), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.4, roughness: 0.4 }), [computerX - 0.005, computerY, computerZ], [0, -Math.PI/2, 0]).castShadow = true;
        add(new THREE.CircleGeometry(0.02, 16), new THREE.MeshBasicMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 }), [computerX - 0.015, computerY + 0.55, computerZ], [0, Math.PI/2, 0]);
        add(new THREE.BoxGeometry(0.05, 0.15, 0.5), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.8 }), [computerX - 0.01, computerY + 0.2, computerZ], [0, -Math.PI/2, 0]).castShadow = true;
        add(new THREE.BoxGeometry(0.5, 0.03, 1.0), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 }), [xP, deskHeight + 0.03, monitorZ + 0.4], [0, -Math.PI/2, 0]).castShadow = true;
        add(new THREE.BoxGeometry(0.12, 0.04, 0.08), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 }), [xP, deskHeight + 0.03, monitorZ + 1.0], [0, -Math.PI/2, 0]).castShadow = true;
        add(new THREE.BoxGeometry(0.3, 0.01, 0.25), new THREE.MeshStandardMaterial({ color: 0x1a3a5a, roughness: 0.9 }), [xP, deskHeight + 0.01, monitorZ + 0.9], [0, -Math.PI/2, 0]).castShadow = true;
      }
    }

    if (config.showBallDispenser) {
      const dispenserX = 0.5 + 0.833 + (1.2 * 0.75) / 2;
      const dispenserZ = matZ;

      add(new THREE.BoxGeometry(1.2, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.7 }), [dispenserX, 0.53, dispenserZ]).castShadow = true;
      add(new THREE.CylinderGeometry(0.45, 0.3, 0.375, 16), new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.8 }), [dispenserX, 1.17, dispenserZ]).castShadow = true;
      add(new THREE.BoxGeometry(0.225, 0.3, 0.375), new THREE.MeshStandardMaterial({ color: 0x1a2a1a, roughness: 0.6 }), [dispenserX - 0.49, 0.23, dispenserZ]).castShadow = true;
      add(new THREE.BoxGeometry(0.3, 0.225, 0.0375), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 }), [dispenserX, 0.75, dispenserZ + 0.47]).castShadow = true;
      add(new THREE.CylinderGeometry(0.06, 0.06, 0.0375), new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x330000, emissiveIntensity: 0.5 }), [dispenserX, 0.75, dispenserZ + 0.495], [Math.PI/2, 0, 0]).castShadow = true;
      add(new THREE.BoxGeometry(1.125, 0.075, 0.825), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }), [dispenserX, 0.045, dispenserZ]).castShadow = true;
    }

    const furnitureZ = matZ + config.furnitureLayout.zOffset;
    let furnitureOffset = config.furnitureLayout.xOffset;
    const rotRad = (config.furnitureLayout.rotation * Math.PI) / 180;

    const rotatePoint = (x, z, angle) => {
      return [
        x * Math.cos(angle) - z * Math.sin(angle),
        x * Math.sin(angle) + z * Math.cos(angle)
      ];
    };

    for (let i = 0; i < config.furniture.barstools; i++) {
      const localX = furnitureOffset;
      const [rx, rz] = rotatePoint(localX, 0, rotRad);
      add(new THREE.CylinderGeometry(0.6, 0.6, 0.1), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.3 }), [rx, 2.5, furnitureZ + rz], [0, rotRad, 0]).castShadow = true;
      add(new THREE.CylinderGeometry(0.05, 0.05, 2.5), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8 }), [rx, 1.25, furnitureZ + rz], [0, rotRad, 0]).castShadow = true;
      add(new THREE.TorusGeometry(0.4, 0.03, 8, 16), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8 }), [rx, 1, furnitureZ + rz], [Math.PI/2, rotRad, 0]).castShadow = true;
      furnitureOffset += 1.5;
    }

    for (let i = 0; i < config.furniture.couches; i++) {
      const localX = furnitureOffset;
      const [rx, rz] = rotatePoint(localX, 0, rotRad);
      add(new THREE.BoxGeometry(6, 1.5, 2.5), new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.8 }), [rx, 0.75, furnitureZ + rz], [0, rotRad, 0]).castShadow = true;
      const [backX, backZ] = rotatePoint(localX, 1.05, rotRad);
      add(new THREE.BoxGeometry(6, 1.5, 0.4), new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.8 }), [backX, 1.7, furnitureZ + backZ], [0, rotRad, 0]).castShadow = true;
      const [leftArmX, leftArmZ] = rotatePoint(localX - 2.8, 0, rotRad);
      const [rightArmX, rightArmZ] = rotatePoint(localX + 2.8, 0, rotRad);
      add(new THREE.BoxGeometry(0.4, 1.2, 2.5), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), [leftArmX, 1.1, furnitureZ + leftArmZ], [0, rotRad, 0]).castShadow = true;
      add(new THREE.BoxGeometry(0.4, 1.2, 2.5), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), [rightArmX, 1.1, furnitureZ + rightArmZ], [0, rotRad, 0]).castShadow = true;
      furnitureOffset += 7;
    }

    for (let i = 0; i < config.furniture.tables; i++) {
      const localX = furnitureOffset;
      const [rx, rz] = rotatePoint(localX, 0, rotRad);
      add(new THREE.BoxGeometry(3, 0.1, 2), new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.6 }), [rx, 2.5, furnitureZ + rz], [0, rotRad, 0]).castShadow = true;
      [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]].forEach(([ox, oz]) => {
        const [legX, legZ] = rotatePoint(localX + ox, oz, rotRad);
        add(new THREE.CylinderGeometry(0.05, 0.05, 2.5), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5 }), [legX, 1.25, furnitureZ + legZ], [0, rotRad, 0]).castShadow = true;
      });
      furnitureOffset += 3.5;
    }

    for (let i = 0; i < config.furniture.chairs; i++) {
      const localX = furnitureOffset;
      const [rx, rz] = rotatePoint(localX, 0, rotRad);
      add(new THREE.BoxGeometry(1.5, 0.3, 1.5), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), [rx, 1.5, furnitureZ + rz], [0, rotRad, 0]).castShadow = true;
      const [backX, backZ] = rotatePoint(localX, 0.6, rotRad);
      add(new THREE.BoxGeometry(1.5, 1.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), [backX, 2.4, furnitureZ + backZ], [0, rotRad, 0]).castShadow = true;
      [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([ox, oz]) => {
        const [legX, legZ] = rotatePoint(localX + ox, oz, rotRad);
        add(new THREE.CylinderGeometry(0.04, 0.04, 1.5), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5 }), [legX, 0.75, furnitureZ + legZ], [0, rotRad, 0]).castShadow = true;
      });
      furnitureOffset += 2;
    }

    if (config.showGolfer) {
      const golferX = config.golferHandedness === 'right' ? -0.5 : 0.5;
      const golferZ = matZ;
      const handMod = config.golferHandedness === 'right' ? 1 : -1;

      add(new THREE.CylinderGeometry(0.35, 0.38, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0x2a4a6a, roughness: 0.7 }), [golferX, 2.3, golferZ], [Math.PI * 0.05, 0, 0]).castShadow = true;
      add(new THREE.CylinderGeometry(0.38, 0.32, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), [golferX, 1.75, golferZ + 0.05], [Math.PI * 0.05, 0, 0]).castShadow = true;
      add(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xfdbcb4, roughness: 0.6 }), [golferX, 2.75, golferZ - 0.05]).castShadow = true;
      add(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshStandardMaterial({ color: 0xfdbcb4, roughness: 0.5 }), [golferX, 3.05, golferZ - 0.1]).castShadow = true;
      add(new THREE.SphereGeometry(0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 }), [golferX, 3.15, golferZ - 0.1]).castShadow = true;
      add(new THREE.SphereGeometry(0.15, 12, 12), new THREE.MeshStandardMaterial({ color: 0x2a4a6a, roughness: 0.7 }), [golferX - 0.4 * handMod, 2.5, golferZ - 0.05]).castShadow = true;
      add(new THREE.SphereGeometry(0.15, 12, 12), new THREE.MeshStandardMaterial({ color: 0x2a4a6a, roughness: 0.7 }), [golferX + 0.4 * handMod, 2.5, golferZ - 0.05]).castShadow = true;
      add(new THREE.CylinderGeometry(0.15, 0.12, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), [golferX - 0.15 * handMod, 1.2, golferZ + 0.1], [Math.PI * 0.08, 0, 0]).castShadow = true;
      add(new THREE.CylinderGeometry(0.15, 0.12, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), [golferX + 0.15 * handMod, 1.2, golferZ + 0.05], [Math.PI * 0.02, 0, 0]).castShadow = true;
      add(new THREE.CylinderGeometry(0.12, 0.09, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), [golferX - 0.15 * handMod, 0.65, golferZ + 0.2], [Math.PI * 0.05, 0, 0]).castShadow = true;
      add(new THREE.CylinderGeometry(0.12, 0.09, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), [golferX + 0.15 * handMod, 0.65, golferZ + 0.15], [0, 0, 0]).castShadow = true;
      add(new THREE.BoxGeometry(0.18, 0.1, 0.28), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 }), [golferX - 0.15 * handMod, 0.35, golferZ + 0.28]).castShadow = true;
      add(new THREE.BoxGeometry(0.18, 0.1, 0.28), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 }), [golferX + 0.15 * handMod, 0.35, golferZ + 0.23]).castShadow = true;
      add(new THREE.BoxGeometry(0.2, 0.03, 0.3), new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.8 }), [golferX - 0.15 * handMod, 0.295, golferZ + 0.28]).castShadow = true;
      add(new THREE.BoxGeometry(0.2, 0.03, 0.3), new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.8 }), [golferX + 0.15 * handMod, 0.295, golferZ + 0.23]).castShadow = true;
      add(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0x2a4a6a, roughness: 0.7 }), [golferX - 0.55 * handMod, 2.35, golferZ - 0.25], [0, 0, Math.PI * 0.5 * handMod]).castShadow = true;
      add(new THREE.CylinderGeometry(0.08, 0.07, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0xfdbcb4, roughness: 0.6 }), [golferX - 0.85 * handMod, 2.15, golferZ - 0.5], [0, Math.PI * 0.1 * handMod, Math.PI * 0.4 * handMod]).castShadow = true;
      add(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0x2a4a6a, roughness: 0.7 }), [golferX + 0.55 * handMod, 2.4, golferZ - 0.2], [Math.PI * 0.15, 0, -Math.PI * 0.4 * handMod]).castShadow = true;
      add(new THREE.CylinderGeometry(0.08, 0.07, 0.35, 16), new THREE.MeshStandardMaterial({ color: 0xfdbcb4, roughness: 0.6 }), [golferX + 0.7 * handMod, 2.1, golferZ - 0.65], [Math.PI * 0.5, Math.PI * 0.1 * handMod, 0]).castShadow = true;
      add(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfdbcb4, roughness: 0.6 }), [golferX - 0.95 * handMod, 1.95, golferZ - 0.65]).castShadow = true;
      add(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfdbcb4, roughness: 0.6 }), [golferX + 0.78 * handMod, 1.9, golferZ - 0.8]).castShadow = true;
      add(new THREE.BoxGeometry(0.08, 0.12, 0.05), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), [golferX - 0.95 * handMod, 1.95, golferZ - 0.62]).castShadow = true;
      const shaftMesh = add(new THREE.CylinderGeometry(0.015, 0.015, 3.8), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.9, roughness: 0.2 }), [golferX - 0.85 * handMod, 2.2, golferZ - 0.7]);
      shaftMesh.rotation.set(Math.PI * 0.2, Math.PI * 0.08 * handMod, Math.PI * 0.55 * handMod);
      shaftMesh.castShadow = true;
      const gripMesh = add(new THREE.CylinderGeometry(0.045, 0.04, 0.5), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 }), [golferX - 0.52 * handMod, 2.85, golferZ - 0.7]);
      gripMesh.rotation.set(Math.PI * 0.2, Math.PI * 0.08 * handMod, Math.PI * 0.55 * handMod);
      gripMesh.castShadow = true;
      const headMesh = add(new THREE.BoxGeometry(0.18, 0.14, 0.35), new THREE.MeshStandardMaterial({ color: 0xd4d4d4, metalness: 0.95, roughness: 0.15 }), [golferX - 1.2 * handMod, 0.5, golferZ - 0.7]);
      headMesh.rotation.set(Math.PI * 0.2, Math.PI * 0.08 * handMod, Math.PI * 0.55 * handMod);
      headMesh.castShadow = true;
      const faceMesh = add(new THREE.BoxGeometry(0.19, 0.12, 0.02), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.3 }), [golferX - 1.21 * handMod, 0.5, golferZ - 0.62]);
      faceMesh.rotation.set(Math.PI * 0.2, Math.PI * 0.08 * handMod, Math.PI * 0.55 * handMod);
      faceMesh.castShadow = true;
      add(new THREE.SphereGeometry(0.035, 20, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 }), [golferX, 0.135, golferZ + 0.3]).castShadow = true;
      add(new THREE.CylinderGeometry(0.008, 0.015, 0.1), new THREE.MeshStandardMaterial({ color: 0xeaa860, roughness: 0.8 }), [golferX, 0.09, golferZ + 0.3]).castShadow = true;
    }

    // Putting cups - white, 4.25" diameter (0.354ft), positioned 2' from screen
    if (config.puttingCups > 0) {
      const cupZ = scrZ + 2; // 2 feet from screen
      const cupRadius = 0.177; // 4.25" diameter / 2 = 2.125" radius = 0.177ft
      const cupDepth = 0.25; // 3 inches deep
      const cupElevation = 0.005; // Slight elevation to prevent Z-fighting with turf

      if (config.puttingCups === 1) {
        // Single cup in center - elevated slightly above turf
        add(new THREE.CylinderGeometry(cupRadius, cupRadius * 0.9, cupDepth, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), [0, -cupDepth/2 + cupElevation, cupZ]).receiveShadow = true;
        // Black inner ring
        add(new THREE.CylinderGeometry(cupRadius * 0.95, cupRadius * 0.85, cupDepth * 0.9, 32), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }), [0, -cupDepth/2 + cupElevation + 0.01, cupZ]);
      } else if (config.puttingCups === 2) {
        // Two cups: 3' from center (left and right), 2' from screen - elevated slightly above turf
        [-3, 3].forEach(xOffset => {
          add(new THREE.CylinderGeometry(cupRadius, cupRadius * 0.9, cupDepth, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), [xOffset, -cupDepth/2 + cupElevation, cupZ]).receiveShadow = true;
          // Black inner ring
          add(new THREE.CylinderGeometry(cupRadius * 0.95, cupRadius * 0.85, cupDepth * 0.9, 32), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }), [xOffset, -cupDepth/2 + cupElevation + 0.01, cupZ]);
        });
      }
    }

    let r = camStateRef.current.r, h = camStateRef.current.h, v = camStateRef.current.v;
    let tH = h, tV = v, tR = r, md = false, lx = 0, ly = 0;

    camera.position.x = r * Math.sin(h) * Math.cos(v);
    camera.position.y = r * Math.sin(v) + config.height/2;
    camera.position.z = r * Math.cos(h) * Math.cos(v);
    camera.lookAt(0, config.height/2, -config.depth/4);

    renderer.domElement.addEventListener('mousedown', (e) => { md = true; lx = e.clientX; ly = e.clientY; });
    renderer.domElement.addEventListener('mousemove', (e) => { if (md) { tH += (e.clientX - lx) * 0.005; tV += (e.clientY - ly) * 0.005; tV = Math.max(-1.4, Math.min(1.4, tV)); lx = e.clientX; ly = e.clientY; } });
    renderer.domElement.addEventListener('mouseup', () => { md = false; });
    renderer.domElement.addEventListener('wheel', (e) => { e.preventDefault(); tR += e.deltaY * 0.01; tR = Math.max(3, Math.min(40, tR)); }, { passive: false });

    // Touch controls for mobile
    let touchStartDist = 0;
    renderer.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        md = true;
        lx = e.touches[0].clientX;
        ly = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Two finger pinch for zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });

    renderer.domElement.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && md) {
        const touch = e.touches[0];
        tH += (touch.clientX - lx) * 0.005;
        tV += (touch.clientY - ly) * 0.005;
        tV = Math.max(-1.4, Math.min(1.4, tV));
        lx = touch.clientX;
        ly = touch.clientY;
      } else if (e.touches.length === 2) {
        // Two finger pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (touchStartDist > 0) {
          const delta = (touchStartDist - dist) * 0.05;
          tR += delta;
          tR = Math.max(3, Math.min(40, tR));
        }
        touchStartDist = dist;
      }
    }, { passive: false });

    renderer.domElement.addEventListener('touchend', () => {
      md = false;
      touchStartDist = 0;
    }, { passive: true });

    const animate = () => {
      requestAnimationFrame(animate);
      h += (tH - h) * 0.1; v += (tV - v) * 0.1; r += (tR - r) * 0.1;
      camStateRef.current = { r, h, v };
      camera.position.x = r * Math.sin(h) * Math.cos(v);
      camera.position.y = r * Math.sin(v) + config.height/2;
      camera.position.z = r * Math.cos(h) * Math.cos(v);
      camera.lookAt(0, config.height/2, -config.depth/4);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [config]);

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      <div ref={mountRef} className="w-full h-full absolute inset-0" />
      <div
        ref={panelRef}
        style={{ left: `${panelPos.x}px`, top: `${panelPos.y}px` }}
        className="absolute bg-black/90 rounded-lg text-white max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
        onMouseDown={handlePanelMouseDown}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 cursor-move drag-handle">
          <h2 className="font-bold">Golf Simulator Config</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={generateSnapshot}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold flex items-center gap-1"
              title="Download configuration snapshot with all measurements"
            >
              Snapshot
            </button>
            <button onClick={() => setShowControls(!showControls)} className="text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded">
              {showControls ? '-' : '+'}
            </button>
          </div>
        </div>
        {showControls && (
          <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
            {/* Control panel content truncated for brevity - uses the same UI as original */}
          </div>
        )}
      </div>

      {/* Pricing Panel */}
      <div
        ref={pricingPanelRef}
        style={{ left: `${pricingPanelPos.x}px`, top: `${pricingPanelPos.y}px` }}
        className="absolute bg-green-900/95 rounded-lg text-white text-sm w-72 max-w-[calc(50vw-1rem)] sm:max-w-none border-2 border-green-500 shadow-xl"
        onMouseDown={handlePricingPanelMouseDown}
      >
        <div className="flex items-center justify-between p-4 border-b border-green-700 cursor-move drag-handle">
          <h3 className="font-bold text-lg text-green-400">ESTIMATED TOTAL</h3>
          <button
            onClick={() => setShowPricing(!showPricing)}
            className="text-2xl w-8 h-8 flex items-center justify-center hover:bg-green-800 rounded"
          >
            {showPricing ? '-' : '+'}
          </button>
        </div>
        {showPricing && (
          <div className="p-4">
            <div className="text-3xl font-bold text-green-300 mb-2">
              ${calculatePrice().toLocaleString()}
            </div>
            <div className="text-xs space-y-1 text-gray-300">
              <div>Projector: ${PRICING.projectors[config.projectorModel]?.toLocaleString()}</div>
              {config.showLaunchMonitor && <div>Launch Monitor: ${PRICING.launchMonitors[config.launchMonitor]?.toLocaleString()}</div>}
              <div>Screen: ${config.screenType === 'builtin' ? PRICING.screens.builtin.toLocaleString() : PRICING.screens.enclosure.toLocaleString()}</div>
              <div>Turf ({config.width}x{config.turfDepth}ft): ${Math.round(config.width * config.turfDepth * PRICING.turf).toLocaleString()}</div>
              <div>Mat (4x9ft): ${PRICING.mat.toLocaleString()}</div>
              {config.monitorCount > 0 && <div>Monitors: ${(config.monitorCount * PRICING.monitors).toLocaleString()}</div>}
              {config.showComputer && <div>Computer: ${PRICING.computer.toLocaleString()}</div>}
              <div>Installation: ${PRICING.installation.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 bg-black/80 rounded-lg p-3 text-white text-xs space-y-1">
        <p>{config.width}x{config.depth}x{config.height}ft</p>
        <p>{config.screenType === 'builtin' ? 'Built-In' : 'Cage'}</p>
        <p className="text-gray-400 text-[10px] mt-2">Drag/Swipe to rotate - Scroll/Pinch to zoom</p>
      </div>
    </div>
  );
};

export default GolfSimulatorViewer;
