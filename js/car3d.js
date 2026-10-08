/**
 * Interactive 3D Automobile Showcase
 * High-Performance WebGL Supercar Model using Three.js & OrbitControls
 * Procedural CAD-accurate geometry - zero external 3D file dependencies.
 * Works natively offline, under file:// protocol, and on all mobile devices.
 */

class CarViewer3D {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.options = Object.assign({
            isHero: false,
            autoRotate: true,
            autoRotateSpeed: 1.2,
            initialColor: 0x00d4ff, // Cyber Cyan
            enableHotspots: true
        }, options);

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.carGroup = null;
        this.wheels = [];
        this.materials = {};
        this.lights = {};
        this.wireframeMode = false;
        this.headlightsOn = true;
        this.underglowOn = true;
        this.currentMode = 'studio'; // studio, cad, neon
        this.animId = null;

        // Hotspots data with 3D local coordinates
        this.hotspots = [
            {
                id: 'splitter',
                title: 'Carbon-Fiber Aerodynamic Splitter',
                tag: 'AERODYNAMICS // DOWNFORCE',
                desc: 'Front carbon splitter produces 180 kg of downforce at 200 km/h, preventing front-axle lift and feeding brake cooling ducts.',
                pos: new THREE.Vector3(0, 0.25, 2.3),
                camPos: new THREE.Vector3(1.8, 0.8, 2.6),
                lookAt: new THREE.Vector3(0, 0.3, 2.1)
            },
            {
                id: 'brakes',
                title: 'Brembo Carbon-Ceramic Brakes',
                tag: 'BRAKING & SUSPENSION',
                desc: '390 mm ventilated carbon-ceramic rotors clamped by 6-piston monobloc aluminum calipers for zero fade under heavy track duty.',
                pos: new THREE.Vector3(1.05, 0.45, 1.35),
                camPos: new THREE.Vector3(2.1, 0.7, 1.4),
                lookAt: new THREE.Vector3(0.9, 0.4, 1.35)
            },
            {
                id: 'cockpit',
                title: 'Carbon Monocoque Cockpit',
                tag: 'CHASSIS & STRUCTURAL',
                desc: 'Torsional rigidity of 45,000 Nm/deg. Ergonomic racing cabin with tinted canopy and integrated safety roll-structure.',
                pos: new THREE.Vector3(0, 1.1, 0.05),
                camPos: new THREE.Vector3(1.6, 1.6, 1.1),
                lookAt: new THREE.Vector3(0, 0.9, 0)
            },
            {
                id: 'engine',
                title: 'Mid-Mounted Twin-Turbo V8 Bay',
                tag: 'POWERTRAIN & DYNAMICS',
                desc: 'Low center of gravity mid-engine layout. 4.0L displacement with dual scroll turbos producing 750 HP, achieving a 42:58 weight balance.',
                pos: new THREE.Vector3(0, 0.85, -0.95),
                camPos: new THREE.Vector3(1.8, 1.5, -0.9),
                lookAt: new THREE.Vector3(0, 0.7, -0.9)
            },
            {
                id: 'spoiler',
                title: 'Active DRS Rear Aero Wing',
                tag: 'VARIABLE DOWNFORCE',
                desc: 'Hydraulically actuated active wing adjusts angle-of-attack from 0° (high speed DRS) to 28° (airbrake stabilization under braking).',
                pos: new THREE.Vector3(0, 1.15, -2.15),
                camPos: new THREE.Vector3(-1.8, 1.3, -2.4),
                lookAt: new THREE.Vector3(0, 0.9, -2.0)
            }
        ];

        this.activeHotspot = null;
        this.cameraTarget = null;
        this.cameraLookTarget = null;

        this.init();
    }

    init() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 500;

        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x080b11);
        this.scene.fog = new THREE.FogExp2(0x080b11, 0.045);

        // 2. Camera
        const fov = this.options.isHero ? 36 : 42;
        this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);
        if (this.options.isHero) {
            this.camera.position.set(3.8, 1.6, 4.2);
        } else {
            this.camera.position.set(4.5, 2.0, 4.8);
        }

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);

        // 4. Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.06;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.03; // Keep above floor
            this.controls.minDistance = 2.2;
            this.controls.maxDistance = 12.0;
            this.controls.autoRotate = this.options.autoRotate;
            this.controls.autoRotateSpeed = this.options.autoRotateSpeed;
            this.controls.target.set(0, 0.55, 0);
            this.controls.update();
        }

        // 5. Materials setup
        this.initMaterials();

        // 6. Lights
        this.initLights();

        // 7. Build Car Model
        this.buildSupercar();

        // 8. Ground Platform & Shadow
        this.buildGround();

        // 9. Hotspots Overlay (only for main section)
        if (this.options.enableHotspots && !this.options.isHero) {
            this.initHotspotsDOM();
        }

        // 10. Event Listeners
        window.addEventListener('resize', this.onResize.bind(this));

        // 11. Start Animation Loop
        this.animate = this.animate.bind(this);
        this.animate();
    }

    initMaterials() {
        // Metallic glossy car paint
        this.materials.body = new THREE.MeshPhysicalMaterial({
            color: this.options.initialColor,
            metalness: 0.85,
            roughness: 0.18,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            reflectivity: 0.9
        });

        // Carbon fiber composite
        this.materials.carbon = new THREE.MeshStandardMaterial({
            color: 0x15171c,
            metalness: 0.4,
            roughness: 0.65
        });

        // Dark tinted aerodynamic canopy glass
        this.materials.glass = new THREE.MeshPhysicalMaterial({
            color: 0x050d18,
            metalness: 0.2,
            roughness: 0.05,
            transmission: 0.82,
            thickness: 0.5,
            transparent: true,
            opacity: 0.88
        });

        // Rubber tires
        this.materials.tire = new THREE.MeshStandardMaterial({
            color: 0x111215,
            metalness: 0.1,
            roughness: 0.88
        });

        // Alloy wheels rims
        this.materials.rim = new THREE.MeshStandardMaterial({
            color: 0xdde6ed,
            metalness: 0.92,
            roughness: 0.2
        });

        // Cross-drilled brake rotors
        this.materials.rotor = new THREE.MeshStandardMaterial({
            color: 0x88929e,
            metalness: 0.95,
            roughness: 0.3
        });

        // Race brake calipers (Crimson Red)
        this.materials.caliper = new THREE.MeshStandardMaterial({
            color: 0xff1e38,
            metalness: 0.6,
            roughness: 0.25
        });

        // LED Headlights (Cool White / Cyan glow)
        this.materials.headlight = new THREE.MeshStandardMaterial({
            color: 0xd8f8ff,
            emissive: 0x88eeff,
            emissiveIntensity: 3.0,
            roughness: 0.1
        });

        // LED Taillights (Hyper Red glow)
        this.materials.taillight = new THREE.MeshStandardMaterial({
            color: 0xff002b,
            emissive: 0xff002b,
            emissiveIntensity: 3.5,
            roughness: 0.1
        });

        // Titanium Exhaust Tips
        this.materials.exhaust = new THREE.MeshStandardMaterial({
            color: 0x5a6d82,
            metalness: 0.95,
            roughness: 0.15
        });

        // Interior cockpit
        this.materials.interior = new THREE.MeshStandardMaterial({
            color: 0x181c24,
            roughness: 0.7
        });

        // Wireframe CAD material for blueprint mode
        this.materials.wireframe = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.85
        });
    }

    initLights() {
        // Soft ambient light
        this.lights.ambient = new THREE.AmbientLight(0x0e1726, 1.2);
        this.scene.add(this.lights.ambient);

        // Key Light (Main white studio light)
        this.lights.key = new THREE.DirectionalLight(0xffffff, 2.4);
        this.lights.key.position.set(5, 8, 4);
        this.lights.key.castShadow = true;
        this.lights.key.shadow.mapSize.width = 1024;
        this.lights.key.shadow.mapSize.height = 1024;
        this.lights.key.shadow.bias = -0.001;
        this.scene.add(this.lights.key);

        // Fill Light (Cool engineering blue)
        this.lights.fill = new THREE.DirectionalLight(0x00a8ff, 1.5);
        this.lights.fill.position.set(-6, 4, -4);
        this.scene.add(this.lights.fill);

        // Rim Light (Warm amber/magenta accent edge)
        this.lights.rim = new THREE.DirectionalLight(0xff5500, 1.8);
        this.lights.rim.position.set(0, 6, -6);
        this.scene.add(this.lights.rim);

        // Dynamic Underglow Light (Cyber Cyan floor neon)
        this.lights.underglow = new THREE.PointLight(0x00f0ff, 2.5, 6.0);
        this.lights.underglow.position.set(0, 0.1, 0);
        this.scene.add(this.lights.underglow);

        // Headlight Beams
        this.lights.headlightLeft = new THREE.SpotLight(0xaae8ff, 3.5, 12, Math.PI / 6, 0.4, 1);
        this.lights.headlightLeft.position.set(-0.7, 0.55, 2.2);
        this.lights.headlightLeft.target.position.set(-0.7, 0.1, 7.0);
        this.scene.add(this.lights.headlightLeft);
        this.scene.add(this.lights.headlightLeft.target);

        this.lights.headlightRight = new THREE.SpotLight(0xaae8ff, 3.5, 12, Math.PI / 6, 0.4, 1);
        this.lights.headlightRight.position.set(0.7, 0.55, 2.2);
        this.lights.headlightRight.target.position.set(0.7, 0.1, 7.0);
        this.scene.add(this.lights.headlightRight);
        this.scene.add(this.lights.headlightRight.target);
    }

    buildSupercar() {
        this.carGroup = new THREE.Group();
        this.carGroup.position.y = 0.38; // Align wheel bottom with ground

        // --- 1. LOWER CHASSIS & FLOOR PAN ---
        const floorGeo = new THREE.BoxGeometry(1.85, 0.08, 4.4);
        const floorMesh = new THREE.Mesh(floorGeo, this.materials.carbon);
        floorMesh.position.set(0, 0.06, 0);
        floorMesh.castShadow = true;
        this.carGroup.add(floorMesh);

        // --- 2. FRONT CARBON SPLITTER & AERO CANARDS ---
        const splitterGeo = new THREE.BoxGeometry(1.92, 0.04, 0.65);
        const splitter = new THREE.Mesh(splitterGeo, this.materials.carbon);
        splitter.position.set(0, 0.04, 2.22);
        this.carGroup.add(splitter);

        // Dual splitter vertical endplates
        [-0.95, 0.95].forEach(x => {
            const endplateGeo = new THREE.BoxGeometry(0.04, 0.14, 0.4);
            const endplate = new THREE.Mesh(endplateGeo, this.materials.carbon);
            endplate.position.set(x, 0.09, 2.22);
            this.carGroup.add(endplate);
        });

        // --- 3. MAIN CAR BODY (SCULPTED HOOD, SIDES, REAR DECK) ---
        // Front Hood section
        const hoodGeo = new THREE.BoxGeometry(1.78, 0.28, 1.45);
        const hood = new THREE.Mesh(hoodGeo, this.materials.body);
        hood.position.set(0, 0.38, 1.5);
        hood.rotation.x = 0.08;
        hood.castShadow = true;
        this.carGroup.add(hood);

        // Front Nose cone taper
        const noseGeo = new THREE.BoxGeometry(1.72, 0.22, 0.6);
        const nose = new THREE.Mesh(noseGeo, this.materials.body);
        nose.position.set(0, 0.25, 2.05);
        nose.castShadow = true;
        this.carGroup.add(nose);

        // Hood dual heat extraction vents (Carbon)
        [-0.38, 0.38].forEach(x => {
            const ventGeo = new THREE.BoxGeometry(0.24, 0.02, 0.5);
            const vent = new THREE.Mesh(ventGeo, this.materials.carbon);
            vent.position.set(x, 0.51, 1.45);
            vent.rotation.x = 0.08;
            this.carGroup.add(vent);
        });

        // Mid-Body / Side Sills & Door Strakes
        const midBodyGeo = new THREE.BoxGeometry(1.88, 0.42, 1.8);
        const midBody = new THREE.Mesh(midBodyGeo, this.materials.body);
        midBody.position.set(0, 0.34, 0.0);
        midBody.castShadow = true;
        this.carGroup.add(midBody);

        // Side aerodynamic skirts (Carbon)
        [-0.96, 0.96].forEach(x => {
            const skirtGeo = new THREE.BoxGeometry(0.06, 0.08, 2.2);
            const skirt = new THREE.Mesh(skirtGeo, this.materials.carbon);
            skirt.position.set(x, 0.08, 0.0);
            this.carGroup.add(skirt);

            // Side air intake scoops for mid-engine cooling
            const scoopGeo = new THREE.BoxGeometry(0.12, 0.24, 0.45);
            const scoop = new THREE.Mesh(scoopGeo, this.materials.carbon);
            scoop.position.set(x * 0.98, 0.38, -0.65);
            this.carGroup.add(scoop);
        });

        // Rear Engine Deck
        const rearDeckGeo = new THREE.BoxGeometry(1.82, 0.36, 1.4);
        const rearDeck = new THREE.Mesh(rearDeckGeo, this.materials.body);
        rearDeck.position.set(0, 0.44, -1.35);
        rearDeck.rotation.x = -0.05;
        rearDeck.castShadow = true;
        this.carGroup.add(rearDeck);

        // Rear Louvered Engine Cover (Carbon / Tinted)
        for (let i = 0; i < 4; i++) {
            const louverGeo = new THREE.BoxGeometry(0.9, 0.02, 0.16);
            const louver = new THREE.Mesh(louverGeo, this.materials.carbon);
            louver.position.set(0, 0.63 - i * 0.03, -0.9 - i * 0.25);
            louver.rotation.x = 0.2;
            this.carGroup.add(louver);
        }

        // --- 4. COCKPIT CANOPY & AERODYNAMIC GREENHOUSE ---
        // Curved glass bubble canopy
        const cabinGeo = new THREE.BoxGeometry(1.42, 0.52, 1.65);
        const cabin = new THREE.Mesh(cabinGeo, this.materials.glass);
        cabin.position.set(0, 0.76, 0.05);
        cabin.castShadow = true;
        this.carGroup.add(cabin);

        // Roof panel (Carbon Fiber)
        const roofGeo = new THREE.BoxGeometry(1.22, 0.04, 1.1);
        const roof = new THREE.Mesh(roofGeo, this.materials.carbon);
        roof.position.set(0, 1.02, 0.0);
        this.carGroup.add(roof);

        // A-Pillars & Windshield Frame
        [-0.62, 0.62].forEach(x => {
            const pillarGeo = new THREE.BoxGeometry(0.06, 0.48, 0.06);
            const pillar = new THREE.Mesh(pillarGeo, this.materials.carbon);
            pillar.position.set(x, 0.78, 0.65);
            pillar.rotation.x = 0.55;
            this.carGroup.add(pillar);
        });

        // Interior Seats peek
        [-0.32, 0.32].forEach(x => {
            const seatGeo = new THREE.BoxGeometry(0.4, 0.45, 0.35);
            const seat = new THREE.Mesh(seatGeo, this.materials.interior);
            seat.position.set(x, 0.55, 0.0);
            this.carGroup.add(seat);

            const headrestGeo = new THREE.BoxGeometry(0.2, 0.16, 0.1);
            const headrest = new THREE.Mesh(headrestGeo, this.materials.interior);
            headrest.position.set(x, 0.82, -0.05);
            this.carGroup.add(headrest);
        });

        // Steering Wheel Yoke peek
        const wheelYokeGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 24);
        const wheelYoke = new THREE.Mesh(wheelYokeGeo, this.materials.carbon);
        wheelYoke.position.set(-0.32, 0.68, 0.45);
        wheelYoke.rotation.x = 0.4;
        this.carGroup.add(wheelYoke);

        // --- 5. HEADLIGHTS & TAILLIGHTS ---
        // High-Tech LED Projector Headlights
        [-0.68, 0.68].forEach(x => {
            // Light housing
            const lightGeo = new THREE.BoxGeometry(0.28, 0.08, 0.3);
            const light = new THREE.Mesh(lightGeo, this.materials.headlight);
            light.position.set(x, 0.44, 2.12);
            light.rotation.y = (x > 0 ? -0.15 : 0.15);
            this.carGroup.add(light);

            // Lower DRL neon strip
            const drlGeo = new THREE.BoxGeometry(0.32, 0.02, 0.1);
            const drl = new THREE.Mesh(drlGeo, this.materials.headlight);
            drl.position.set(x, 0.38, 2.22);
            this.carGroup.add(drl);
        });

        // Continuous Cyber Rear LED Lightbar
        const rearLightGeo = new THREE.BoxGeometry(1.68, 0.06, 0.05);
        const rearLight = new THREE.Mesh(rearLightGeo, this.materials.taillight);
        rearLight.position.set(0, 0.52, -2.05);
        this.carGroup.add(rearLight);

        // --- 6. REAR DIFFUSER & DUAL TITANIUM EXHAUSTS ---
        // Rear carbon diffuser
        const diffuserGeo = new THREE.BoxGeometry(1.86, 0.16, 0.6);
        const diffuser = new THREE.Mesh(diffuserGeo, this.materials.carbon);
        diffuser.position.set(0, 0.14, -2.05);
        diffuser.rotation.x = -0.15;
        this.carGroup.add(diffuser);

        // 4 Vertical Diffuser Aero Strakes
        [-0.6, -0.2, 0.2, 0.6].forEach(x => {
            const strakeGeo = new THREE.BoxGeometry(0.03, 0.2, 0.55);
            const strake = new THREE.Mesh(strakeGeo, this.materials.carbon);
            strake.position.set(x, 0.14, -2.05);
            this.carGroup.add(strake);
        });

        // Dual Center/Twin Titanium Exhaust Pipes
        [-0.22, -0.07, 0.07, 0.22].forEach(x => {
            const exhaustGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.25, 16);
            const exhaust = new THREE.Mesh(exhaustGeo, this.materials.exhaust);
            exhaust.rotation.x = Math.PI / 2;
            exhaust.position.set(x, 0.36, -2.08);
            this.carGroup.add(exhaust);

            // Glowing inner heat core
            const innerGlowGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.05, 16);
            const innerGlow = new THREE.Mesh(innerGlowGeo, this.materials.taillight);
            innerGlow.rotation.x = Math.PI / 2;
            innerGlow.position.set(x, 0.36, -2.18);
            this.carGroup.add(innerGlow);
        });

        // --- 7. ACTIVE AERODYNAMIC REAR WING / SPOILER ---
        // Dual carbon fiber wing uprights/pylons
        [-0.45, 0.45].forEach(x => {
            const pylonGeo = new THREE.BoxGeometry(0.04, 0.42, 0.2);
            const pylon = new THREE.Mesh(pylonGeo, this.materials.carbon);
            pylon.position.set(x, 0.82, -1.9);
            pylon.rotation.x = -0.25;
            this.carGroup.add(pylon);
        });

        // Main Inverted Aerofoil Wing Blade
        const wingGeo = new THREE.BoxGeometry(1.95, 0.04, 0.35);
        const wing = new THREE.Mesh(wingGeo, this.materials.body);
        wing.position.set(0, 1.05, -2.0);
        wing.rotation.x = 0.05;
        wing.castShadow = true;
        this.carGroup.add(wing);

        // Wing endplates (Carbon)
        [-0.98, 0.98].forEach(x => {
            const endGeo = new THREE.BoxGeometry(0.03, 0.18, 0.42);
            const endplate = new THREE.Mesh(endGeo, this.materials.carbon);
            endplate.position.set(x, 1.05, -2.0);
            this.carGroup.add(endplate);
        });

        // --- 8. WHEELS & BRAKE ASSEMBLIES (4 HIGH-DETAIL UNITS) ---
        const wheelPositions = [
            { x: -0.94, y: 0.0, z: 1.35, isLeft: true },  // Front Left
            { x: 0.94, y: 0.0, z: 1.35, isLeft: false },  // Front Right
            { x: -0.96, y: 0.0, z: -1.35, isLeft: true }, // Rear Left
            { x: 0.96, y: 0.0, z: -1.35, isLeft: false }  // Rear Right
        ];

        wheelPositions.forEach(pos => {
            const wheelUnit = this.createWheelAssembly(pos.isLeft);
            wheelUnit.position.set(pos.x, pos.y, pos.z);
            this.carGroup.add(wheelUnit);
            this.wheels.push(wheelUnit);
        });

        this.scene.add(this.carGroup);
    }

    createWheelAssembly(isLeft) {
        const wheel = new THREE.Group();

        // 1. Rubber Tire (Cylinder oriented along X axis)
        const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 32);
        const tire = new THREE.Mesh(tireGeo, this.materials.tire);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        wheel.add(tire);

        // Tire tread grooves
        const treadGeo = new THREE.TorusGeometry(0.38, 0.02, 8, 32);
        const tread = new THREE.Mesh(treadGeo, this.materials.tire);
        tread.rotation.y = Math.PI / 2;
        wheel.add(tread);

        // 2. Alloy Rim
        const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.29, 24);
        const rim = new THREE.Mesh(rimGeo, this.materials.rim);
        rim.rotation.z = Math.PI / 2;
        wheel.add(rim);

        // Multi-Spoke Center Hub
        const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.31, 16);
        const hub = new THREE.Mesh(hubGeo, this.materials.rim);
        hub.rotation.z = Math.PI / 2;
        wheel.add(hub);

        // Center nut / badge
        const nutGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.32, 6);
        const nut = new THREE.Mesh(nutGeo, this.materials.caliper);
        nut.rotation.z = Math.PI / 2;
        wheel.add(nut);

        // 5 Dual Spokes
        for (let i = 0; i < 5; i++) {
            const spokeGeo = new THREE.BoxGeometry(0.03, 0.22, 0.03);
            const spoke = new THREE.Mesh(spokeGeo, this.materials.rim);
            spoke.position.x = isLeft ? -0.1 : 0.1;
            spoke.rotation.x = (i * Math.PI * 2) / 5;
            wheel.add(spoke);
        }

        // 3. Carbon-Ceramic Vented Brake Rotor
        const rotorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.025, 24);
        const rotor = new THREE.Mesh(rotorGeo, this.materials.rotor);
        rotor.rotation.z = Math.PI / 2;
        rotor.position.x = isLeft ? 0.06 : -0.06;
        wheel.add(rotor);

        // 4. Brembo Crimson Brake Caliper
        const caliperGeo = new THREE.BoxGeometry(0.07, 0.14, 0.08);
        const caliper = new THREE.Mesh(caliperGeo, this.materials.caliper);
        caliper.position.set(isLeft ? 0.06 : -0.06, 0.15, 0.08);
        caliper.rotation.x = -0.3;
        wheel.add(caliper);

        return wheel;
    }

    buildGround() {
        // Contact Shadow Plane directly under car
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 256;
        shadowCanvas.height = 256;
        const ctx = shadowCanvas.getContext('2d');
        const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
        grad.addColorStop(0, 'rgba(0,0,0,0.85)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
        const shadowGeo = new THREE.PlaneGeometry(3.6, 6.2);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.88,
            depthWrite: false
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = 0.01;
        this.scene.add(shadowMesh);

        // Engineering Studio Floor Grid with concentric rings
        const gridHelper = new THREE.GridHelper(24, 24, 0x00f0ff, 0x162335);
        gridHelper.position.y = 0.0;
        this.scene.add(gridHelper);
    }

    initHotspotsDOM() {
        // Container for HTML 3D callout markers
        let overlay = document.getElementById('car-hotspots-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'car-hotspots-overlay';
            overlay.className = 'car-hotspots-overlay';
            this.container.appendChild(overlay);
        }
        this.hotspotsOverlay = overlay;

        // Create HTML marker button for each hotspot
        this.hotspotElements = [];
        this.hotspots.forEach((hs, idx) => {
            const btn = document.createElement('button');
            btn.className = 'hotspot-marker';
            btn.setAttribute('aria-label', hs.title);
            btn.innerHTML = `<span class="marker-pulse"></span><span class="marker-dot">${idx + 1}</span><span class="marker-label">${hs.title}</span>`;
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.soundEngine) window.soundEngine.playMechanicalClick(950, 0.06);
                this.selectHotspot(hs);
            });

            overlay.appendChild(btn);
            this.hotspotElements.push({ hs, el: btn });
        });
    }

    updateHotspotsPosition() {
        if (!this.hotspotElements || !this.camera) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        const tempVec = new THREE.Vector3();

        this.hotspotElements.forEach(item => {
            // Hotspot in world coordinates
            tempVec.copy(item.hs.pos);
            tempVec.applyMatrix4(this.carGroup.matrixWorld);

            // Check if facing camera
            tempVec.project(this.camera);

            const isBehind = tempVec.z > 1.0;
            if (isBehind) {
                item.el.style.opacity = '0';
                item.el.style.pointerEvents = 'none';
                return;
            }

            const x = (tempVec.x * 0.5 + 0.5) * width;
            const y = (-(tempVec.y * 0.5) + 0.5) * height;

            item.el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            item.el.style.opacity = '1';
            item.el.style.pointerEvents = 'auto';
        });
    }

    selectHotspot(hs) {
        this.activeHotspot = hs;

        // Smooth camera tween to hotspot
        this.cameraTarget = hs.camPos.clone();
        this.cameraLookTarget = hs.lookAt.clone();

        // Update info card on page
        const cardTitle = document.getElementById('inspection-title');
        const cardTag = document.getElementById('inspection-tag');
        const cardDesc = document.getElementById('inspection-desc');
        const cardBox = document.getElementById('inspection-card');

        if (cardTitle) cardTitle.textContent = hs.title;
        if (cardTag) cardTag.textContent = hs.tag;
        if (cardDesc) cardDesc.textContent = hs.desc;
        if (cardBox) {
            cardBox.classList.add('active');
            cardBox.classList.remove('hidden');
        }

        // Highlight marker
        this.hotspotElements.forEach(item => {
            if (item.hs.id === hs.id) {
                item.el.classList.add('active');
            } else {
                item.el.classList.remove('active');
            }
        });
    }

    resetCamera() {
        this.activeHotspot = null;
        if (this.options.isHero) {
            this.cameraTarget = new THREE.Vector3(3.8, 1.6, 4.2);
        } else {
            this.cameraTarget = new THREE.Vector3(4.5, 2.0, 4.8);
        }
        this.cameraLookTarget = new THREE.Vector3(0, 0.55, 0);

        const cardBox = document.getElementById('inspection-card');
        if (cardBox) cardBox.classList.remove('active');

        if (this.hotspotElements) {
            this.hotspotElements.forEach(item => item.el.classList.remove('active'));
        }
    }

    setColor(colorHex) {
        if (this.materials.body) {
            this.materials.body.color.setHex(colorHex);
            if (window.soundEngine) window.soundEngine.playMechanicalClick(750, 0.05);
        }
    }

    toggleWireframe() {
        this.wireframeMode = !this.wireframeMode;
        const targetMat = this.wireframeMode ? this.materials.wireframe : this.materials.body;
        
        this.carGroup.traverse(child => {
            if (child.isMesh && child.material !== this.materials.glass && child.material !== this.materials.headlight && child.material !== this.materials.taillight) {
                child.material = this.wireframeMode ? this.materials.wireframe : (child.userData.originalMat || child.material);
                if (!child.userData.originalMat && !this.wireframeMode) {
                    child.userData.originalMat = child.material;
                }
            }
        });

        if (this.wireframeMode) {
            this.scene.background = new THREE.Color(0x040810);
            this.scene.fog.color = new THREE.Color(0x040810);
        } else {
            this.scene.background = new THREE.Color(0x080b11);
            this.scene.fog.color = new THREE.Color(0x080b11);
        }

        if (window.soundEngine) window.soundEngine.playMechanicalClick(1100, 0.08);
        return this.wireframeMode;
    }

    toggleHeadlights() {
        this.headlightsOn = !this.headlightsOn;
        const intensity = this.headlightsOn ? 3.5 : 0.0;
        this.lights.headlightLeft.intensity = intensity;
        this.lights.headlightRight.intensity = intensity;

        this.materials.headlight.emissiveIntensity = this.headlightsOn ? 3.0 : 0.1;

        if (window.soundEngine) window.soundEngine.playMechanicalClick(840, 0.05);
        return this.headlightsOn;
    }

    toggleUnderglow() {
        this.underglowOn = !this.underglowOn;
        this.lights.underglow.intensity = this.underglowOn ? 2.5 : 0.0;
        if (window.soundEngine) window.soundEngine.playMechanicalClick(650, 0.05);
        return this.underglowOn;
    }

    toggleAutoRotate() {
        if (this.controls) {
            this.controls.autoRotate = !this.controls.autoRotate;
            return this.controls.autoRotate;
        }
        return false;
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animId = requestAnimationFrame(this.animate);

        // Smooth camera transition when zooming/focusing on hotspot
        if (this.cameraTarget) {
            this.camera.position.lerp(this.cameraTarget, 0.05);
            if (this.controls && this.cameraLookTarget) {
                this.controls.target.lerp(this.cameraLookTarget, 0.05);
            }
            if (this.camera.position.distanceTo(this.cameraTarget) < 0.05) {
                this.cameraTarget = null;
            }
        }

        // Rotate wheels when car spins
        if (this.controls && this.controls.autoRotate && !this.activeHotspot) {
            this.wheels.forEach(w => {
                w.rotation.x += 0.03;
            });
        }

        if (this.controls) {
            this.controls.update();
        }

        // Update 3D hotspot screen positions
        if (this.options.enableHotspots && !this.options.isHero) {
            this.updateHotspotsPosition();
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animId) cancelAnimationFrame(this.animId);
        window.removeEventListener('resize', this.onResize);
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.remove();
        }
    }
}

window.CarViewer3D = CarViewer3D;
