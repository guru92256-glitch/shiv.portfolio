/**
 * Main Portfolio Interactivity & Engineering HUD Logic
 * Author: Shivraj Singh Chouhan
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Sound Toggle
    initAudioToggle();

    // 2. Initialize Navigation & Scroll Spy
    initNavigation();

    // 3. Initialize Interactive Background CAD Grid & Dust
    initCadBackground();

    // 4. Initialize Interactive About Section Mechanical Gear Train
    initGearCanvas();

    // 5. Initialize 3D Car Viewers (Hero & Main 3D Showcase)
    initCarViewers();

    // 6. Initialize Projects Filter & Modal
    initProjectsSystem();

    // 7. Initialize Stats Counter on Scroll
    initStatsCounters();

    // 8. Initialize Contact Form & Copy Email
    initContactSection();

    // 9. Initialize Smooth Scroll
    initSmoothScroll();
});

/* ==========================================================================
   1. AUDIO TOGGLE & SYNTHESIZER
   ========================================================================== */
function initAudioToggle() {
    const audioBtn = document.getElementById('sound-toggle-btn');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
        if (window.soundEngine) {
            const enabled = window.soundEngine.toggle();
            audioBtn.classList.toggle('active', enabled);
            const icon = audioBtn.querySelector('.sound-icon');
            const text = audioBtn.querySelector('.sound-text');
            if (icon) icon.textContent = enabled ? '🔊' : '🔇';
            if (text) text.textContent = enabled ? 'AUDIO ON' : 'AUDIO OFF';
        }
    });

    // Add subtle hover sound to all interactive elements
    document.querySelectorAll('.btn, .nav-link, .skill-card, .project-card, .achievement-card, .filter-btn, .hotspot-nav-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (window.soundEngine && window.soundEngine.enabled) {
                window.soundEngine.playHoverTone(580);
            }
        });
    });
}

/* ==========================================================================
   2. NAVIGATION, MOBILE HAMBURGER & SCROLL SPY
   ========================================================================== */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Sticky nav state on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Section Scroll Spy
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // Mobile menu toggle
    if (mobileToggle && navLinksContainer) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navLinksContainer.classList.toggle('open');
            mobileToggle.classList.toggle('open', isOpen);
            mobileToggle.setAttribute('aria-expanded', isOpen);
            if (window.soundEngine) window.soundEngine.playMechanicalClick(700, 0.05);
        });

        // Close mobile menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('open');
                mobileToggle.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

/* ==========================================================================
   3. BACKGROUND CAD BLUEPRINT CANVAS
   ========================================================================== */
function initCadBackground() {
    const canvas = document.getElementById('cad-bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const count = Math.min(Math.floor(width / 35), 45);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.4 + 0.2
        });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.x += p1.vx;
            p1.y += p1.vy;

            if (p1.x < 0) p1.x = width;
            if (p1.x > width) p1.x = 0;
            if (p1.y < 0) p1.y = height;
            if (p1.y > height) p1.y = 0;

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.12 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            // Mouse proximity line
            const mdx = p1.x - mouseX;
            const mdy = p1.y - mouseY;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < 160) {
                ctx.strokeStyle = `rgba(255, 85, 0, ${0.25 * (1 - mDist / 160)})`;
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
            }

            // Draw particle point (technical cross)
            ctx.fillStyle = `rgba(0, 240, 255, ${p1.alpha})`;
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }, { passive: true });
}

/* ==========================================================================
   4. INTERACTIVE GEAR TRAIN SIMULATOR (ABOUT ME SECTION)
   ========================================================================== */
function initGearCanvas() {
    const canvas = document.getElementById('gear-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.parentElement.clientWidth || 360;
    let height = canvas.height = 240;

    let angle1 = 0;
    let rpmSpeed = 1.0;

    // RPM Slider
    const rpmSlider = document.getElementById('gear-rpm-slider');
    const rpmValueText = document.getElementById('gear-rpm-value');
    if (rpmSlider) {
        rpmSlider.addEventListener('input', (e) => {
            rpmSpeed = parseFloat(e.target.value);
            if (rpmValueText) rpmValueText.textContent = `${Math.round(rpmSpeed * 60)} RPM`;
        });
    }

    function drawGear(x, y, radius, teeth, angle, color, strokeColor, label) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Gear outer profile with teeth
        ctx.beginPath();
        const toothDepth = radius * 0.16;
        for (let i = 0; i < teeth; i++) {
            const a0 = (i * 2 * Math.PI) / teeth;
            const a1 = ((i + 0.3) * 2 * Math.PI) / teeth;
            const a2 = ((i + 0.6) * 2 * Math.PI) / teeth;
            const a3 = ((i + 0.9) * 2 * Math.PI) / teeth;

            const rOut = radius + toothDepth;
            const rIn = radius - toothDepth;

            if (i === 0) {
                ctx.moveTo(Math.cos(a0) * rIn, Math.sin(a0) * rIn);
            } else {
                ctx.lineTo(Math.cos(a0) * rIn, Math.sin(a0) * rIn);
            }
            ctx.lineTo(Math.cos(a1) * rOut, Math.sin(a1) * rOut);
            ctx.lineTo(Math.cos(a2) * rOut, Math.sin(a2) * rOut);
            ctx.lineTo(Math.cos(a3) * rIn, Math.sin(a3) * rIn);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner rim
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = '#080d16';
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.stroke();

        // 4 Spokes
        for (let s = 0; s < 4; s++) {
            ctx.save();
            ctx.rotate((s * Math.PI) / 2);
            ctx.fillStyle = strokeColor;
            ctx.fillRect(-2, -radius * 0.55, 4, radius * 0.55);
            ctx.restore();
        }

        // Center hub bore & keyway
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#05070c';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // Fixed label outside rotation
        if (label) {
            ctx.fillStyle = strokeColor;
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y + radius + 22);
        }
    }

    function renderGears() {
        ctx.clearRect(0, 0, width, height);

        // Center coordinates
        const gear1X = width * 0.32;
        const gear1Y = height * 0.46;
        const r1 = 58;
        const teeth1 = 18;

        const gear2X = width * 0.72;
        const gear2Y = height * 0.46;
        const r2 = 42;
        const teeth2 = 13;

        // Draw Center Distance line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(gear1X, gear1Y);
        ctx.lineTo(gear2X, gear2Y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Advance angles inversely proportional to teeth ratio
        angle1 += 0.02 * rpmSpeed;
        const angle2 = -angle1 * (teeth1 / teeth2);

        // Draw Driver Gear (Cyan)
        drawGear(gear1X, gear1Y, r1, teeth1, angle1, '#0e1f33', '#00f0ff', `PINION [${teeth1}T]`);

        // Draw Driven Gear (Orange)
        drawGear(gear2X, gear2Y, r2, teeth2, angle2, '#2b1908', '#ff6600', `DRIVEN [${teeth2}T]`);

        requestAnimationFrame(renderGears);
    }
    renderGears();

    window.addEventListener('resize', () => {
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.clientWidth || 360;
    }, { passive: true });
}

/* ==========================================================================
   5. 3D CAR VIEWERS INITIALIZATION & CONTROLS
   ========================================================================== */
function initCarViewers() {
    // 1. Hero 3D Teaser Viewer
    if (document.getElementById('hero-car-viewport')) {
        window.heroCar = new CarViewer3D('hero-car-viewport', {
            isHero: true,
            autoRotate: true,
            autoRotateSpeed: 1.6,
            initialColor: 0x00d4ff,
            enableHotspots: false
        });
    }

    // 2. Main 3D Automobile Showcase Viewer
    if (document.getElementById('main-car-viewport')) {
        window.mainCar = new CarViewer3D('main-car-viewport', {
            isHero: false,
            autoRotate: false,
            initialColor: 0x00d4ff,
            enableHotspots: true
        });

        setupCarControls(window.mainCar);
    }
}

function setupCarControls(car) {
    // Color selector buttons
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const colorHex = parseInt(btn.getAttribute('data-color'), 16);
            car.setColor(colorHex);
        });
    });

    // Wireframe / CAD Mode Toggle
    const wireframeBtn = document.getElementById('btn-toggle-wireframe');
    if (wireframeBtn) {
        wireframeBtn.addEventListener('click', () => {
            const isWireframe = car.toggleWireframe();
            wireframeBtn.classList.toggle('active', isWireframe);
            wireframeBtn.setAttribute('aria-pressed', isWireframe);
        });
    }

    // Headlights Toggle
    const headlightsBtn = document.getElementById('btn-toggle-headlights');
    if (headlightsBtn) {
        headlightsBtn.addEventListener('click', () => {
            const isOn = car.toggleHeadlights();
            headlightsBtn.classList.toggle('active', isOn);
            headlightsBtn.setAttribute('aria-pressed', isOn);
        });
    }

    // Underglow Toggle
    const underglowBtn = document.getElementById('btn-toggle-underglow');
    if (underglowBtn) {
        underglowBtn.addEventListener('click', () => {
            const isOn = car.toggleUnderglow();
            underglowBtn.classList.toggle('active', isOn);
            underglowBtn.setAttribute('aria-pressed', isOn);
        });
    }

    // Turntable Auto-Rotate Toggle
    const rotateBtn = document.getElementById('btn-toggle-rotate');
    if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
            const isRotating = car.toggleAutoRotate();
            rotateBtn.classList.toggle('active', isRotating);
            rotateBtn.setAttribute('aria-pressed', isRotating);
        });
    }

    // Reset Camera Button
    const resetCamBtn = document.getElementById('btn-reset-camera');
    if (resetCamBtn) {
        resetCamBtn.addEventListener('click', () => {
            car.resetCamera();
            if (window.soundEngine) window.soundEngine.playMechanicalClick(620, 0.05);
        });
    }

    // Hotspot Quick Navigation Buttons (under the 3D viewport)
    document.querySelectorAll('.hotspot-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const hsId = btn.getAttribute('data-hotspot');
            const found = car.hotspots.find(h => h.id === hsId);
            if (found) {
                car.selectHotspot(found);
                document.querySelectorAll('.hotspot-nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    // Close Inspection Card Button
    const closeCardBtn = document.getElementById('close-inspection-card');
    if (closeCardBtn) {
        closeCardBtn.addEventListener('click', () => {
            const card = document.getElementById('inspection-card');
            if (card) card.classList.remove('active');
            car.resetCamera();
        });
    }

    // Turbo Engine Sound trigger button
    const revBtn = document.getElementById('btn-engine-rev');
    if (revBtn) {
        revBtn.addEventListener('click', () => {
            if (window.soundEngine) {
                if (!window.soundEngine.enabled) window.soundEngine.toggle();
                window.soundEngine.playEngineRev();
            }
            // Add subtle shake animation to viewport
            const vp = document.getElementById('main-car-viewport');
            if (vp) {
                vp.classList.add('rumble');
                setTimeout(() => vp.classList.remove('rumble'), 800);
            }
        });
    }
}

/* ==========================================================================
   6. PROJECTS SYSTEM: FILTERING & DETAILED MODAL
   ========================================================================== */
const PROJECTS_DATA = {
    'p1': {
        title: 'Apex-GT Aerodynamic Hypercar Concept',
        category: 'Automobile Modelling & 3D',
        badge: 'AUTOMOTIVE MODELLING',
        image: 'assets/images/project-supercar.svg',
        summary: 'Full-scale aerodynamic surface modelling and computational design for a high-performance track-focused hypercar.',
        tools: ['SolidWorks', 'Blender 3D', 'NURBS Surfacing', 'Aerodynamics', 'KeyShot'],
        overview: 'Developed a comprehensive 3D exterior package emphasizing ground-effect aerodynamics, active aerodynamic surfaces, and functional cooling channels. Engineered with a drag coefficient target of Cd = 0.28 while generating over 450 kg of downforce at 250 km/h.',
        highlights: [
            'Sculpted dual front venturi tunnels feeding front brake cooling assemblies.',
            'Engineered hydraulically actuated active rear wing with automated DRS logic.',
            'Lightweight monocoque chassis integrating mid-mounted powertrain mounts.',
            'Production-ready Class-A surfaces prepared for CAD manufacturing evaluation.'
        ],
        metrics: [
            { label: 'Downforce', val: '450 kg @ 250 km/h' },
            { label: 'Drag Coeff.', val: 'Cd 0.28' },
            { label: 'Surface Class', val: 'Class-A NURBS' },
            { label: 'Weight Dist.', val: '42:58 RWD' }
        ]
    },
    'p2': {
        title: 'Twin-Spur Mechanical Gearbox & Differential',
        category: 'Mechanical Engineering',
        badge: 'MECHANICAL KINEMATICS',
        image: 'assets/images/project-gearbox.svg',
        summary: 'Kinematic transmission simulation, involute tooth profile synthesis, and gear ratio optimization.',
        tools: ['Engineering Mechanics', 'CAD Modeling', 'Kinematics', 'Gear Design', 'FEA Basics'],
        overview: 'Designed a high-torque dual-reduction transmission mechanism with customized 3.42:1 final drive ratio. Conducted mathematical analysis of bending stress, contact pressure, and pitch-line velocity to ensure smooth power transmission without tooth jamming.',
        highlights: [
            'Synthesized 20° pressure angle involute tooth profiles minimizing backlash.',
            'Calculated Lewis bending equation margins for alloy steel gear blanks.',
            'Simulated pitch-point contact mechanics and sliding friction dissipation.',
            'Achieved calculated mechanical transmission efficiency exceeding 98.4%.'
        ],
        metrics: [
            { label: 'Gear Ratio', val: '3.42 : 1' },
            { label: 'Efficiency', val: '98.4%' },
            { label: 'Pressure Angle', val: '20° Involute' },
            { label: 'Center Dist.', val: '220.00 mm' }
        ]
    },
    'p3': {
        title: 'High-Poly V8 Twin-Turbo Engine Assembly',
        category: '3D Modelling & Automotive',
        badge: '3D MODELLING & CAD',
        image: 'assets/images/project-engine.svg',
        summary: 'Complex parametric 3D assembly of an internal combustion power unit featuring twin turbochargers and dry-sump lubrication.',
        tools: ['3D CAD', 'Parametric Design', 'Blender', 'Photorealistic Rendering', 'Mechanical Drawing'],
        overview: 'Detailed parametric modeling of a 4.0L 90-degree V8 engine assembly. Included cylinder block, DOHC cylinder heads, valve covers, exhaust manifolds, dual turbochargers with wastegate actuators, and carbon fiber intake plenum.',
        highlights: [
            'Over 85 distinct precision components assembled into a unified CAD hierarchy.',
            'Dry-sump oil pan layout configured for ultra-low center of gravity integration.',
            'Hot-V turbocharger placement minimizing turbo lag and exhaust runner volume.',
            'Rendered with realistic thermal coloration and brushed titanium shaders.'
        ],
        metrics: [
            { label: 'Displacement', val: '4.0 Litres' },
            { label: 'Configuration', val: '90° Twin-Turbo V8' },
            { label: 'Output Spec', val: '750 HP Target' },
            { label: 'Assembly Count', val: '85+ Parts' }
        ]
    },
    'p4': {
        title: 'Velocity Automotive Brand Identity System',
        category: 'Graphic Design',
        badge: '🏅 GOLD MEDAL PROJECT',
        image: 'assets/images/project-branding.svg',
        summary: 'Award-winning visual identity, typography system, livery design, and editorial brand architecture.',
        tools: ['Adobe Illustrator', 'Photoshop', 'Brand Strategy', 'Typography', 'Visual Identity'],
        overview: 'Honored with the 1st Place Gold Medal in Graphic Design. Crafted a futuristic corporate design language for a cutting-edge automotive mobility venture. Merged high-velocity aerodynamics with minimalist editorial discipline.',
        highlights: [
            'Custom geometric logomark derived from aerodynamic speed strakes and mechanical gears.',
            'Comprehensive identity style guide including grid systems, color tokens, and vehicle livery.',
            'Designed high-impact promotional posters, merchandise, and technical datasheets.',
            'Received unanimous first-place appraisal for typographic balance and aesthetic purity.'
        ],
        metrics: [
            { label: 'Award', val: '🏅 Gold Medalist' },
            { label: 'Discipline', val: 'Brand Architecture' },
            { label: 'Scope', val: 'Complete Identity' },
            { label: 'Verdict', val: '1st Place Winner' }
        ]
    },
    'p5': {
        title: 'Cinematic Automotive Showcase & Motion Reel',
        category: 'Editing',
        badge: 'EDITING PROFESSIONAL',
        image: 'assets/images/project-editing.svg',
        summary: 'High-energy cinematic automotive video reel combining dynamic speed ramps, sound design, and color grading.',
        tools: ['Premiere Pro', 'After Effects', 'Color Grading (LUTs)', 'Sound Design', 'Speed Ramping'],
        overview: 'A showcase of professional editing capabilities combining fast-paced visual storytelling, beat-synced audio transitions, and rich cinematic color science. Designed to emphasize the raw power, mechanical precision, and emotional rush of performance automobiles.',
        highlights: [
            'Precision frame-accurate cut synchronization to custom audio score.',
            'Custom automotive telemetry overlays and HUD motion graphic tracking.',
            'Teal & orange cinematic LUT workflow optimized for high dynamic range displays.',
            'Bespoke multi-layer sound design incorporating turbo spools, exhaust cracks, and gear shifts.'
        ],
        metrics: [
            { label: 'Resolution', val: '4K UHD 60 FPS' },
            { label: 'Color Space', val: 'DCI-P3 Log' },
            { label: 'Audio Tracks', val: '12+ FX Layers' },
            { label: 'Role', val: 'Editor & Colorist' }
        ]
    },
    'p6': {
        title: 'Formula Student Aerofoil & Downforce Assembly',
        category: 'Mechanical Engineering & Future',
        badge: 'AERODYNAMICS & CFD',
        image: 'assets/images/project-aerodynamics.svg',
        summary: 'Multi-element front wing aerodynamic study for high downforce and low-speed cornering stability.',
        tools: ['Aerodynamics', 'CFD Simulation', 'Engineering Drawing', 'Carbon Composites', 'CAD'],
        overview: 'Conducted preliminary aerodynamic design for a Formula Student competition front wing. Incorporated multi-element inverted aerofoils, endplate vortex generators, and adjustable Gurney flaps to maximize low-speed tire grip in autocross events.',
        highlights: [
            'High lift coefficient (CL = -2.48) tailored specifically for sub-100 km/h turns.',
            'Endplate slot design mitigating front tire wake aerodynamic interference.',
            'Lightweight pre-preg carbon fiber composite layup specification.',
            'Calculated ground effect suction boundary layers at varying ride heights.'
        ],
        metrics: [
            { label: 'Target Downforce', val: '680 N @ 100 km/h' },
            { label: 'Lift Coeff (CL)', val: '-2.48' },
            { label: 'Ride Height', val: '65 mm Ground' },
            { label: 'Material', val: 'Carbon Composite' }
        ]
    }
};

function initProjectsSystem() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    // Filter cards
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category.includes(filter)) {
                    card.style.display = 'flex';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });

            if (window.soundEngine) window.soundEngine.playMechanicalClick(800, 0.04);
        });
    });

    // Modal elements
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close-btn');
    const modalBackdrop = document.getElementById('modal-backdrop');

    if (!modal) return;

    // Open project modal
    document.querySelectorAll('.btn-view-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projId = btn.getAttribute('data-project');
            const data = PROJECTS_DATA[projId];
            if (!data) return;

            // Populate Modal Content
            document.getElementById('modal-title').textContent = data.title;
            document.getElementById('modal-badge').textContent = data.badge;
            document.getElementById('modal-img').src = data.image;
            document.getElementById('modal-img').alt = data.title;
            document.getElementById('modal-overview').textContent = data.overview;

            // Tools list
            const toolsContainer = document.getElementById('modal-tools');
            toolsContainer.innerHTML = '';
            data.tools.forEach(tool => {
                const span = document.createElement('span');
                span.className = 'tech-tag';
                span.textContent = tool;
                toolsContainer.appendChild(span);
            });

            // Highlights
            const highlightsContainer = document.getElementById('modal-highlights');
            highlightsContainer.innerHTML = '';
            data.highlights.forEach(hl => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="check-bullet">▸</span> ${hl}`;
                highlightsContainer.appendChild(li);
            });

            // Metrics
            const metricsContainer = document.getElementById('modal-metrics');
            metricsContainer.innerHTML = '';
            data.metrics.forEach(m => {
                const div = document.createElement('div');
                div.className = 'modal-metric-card';
                div.innerHTML = `
                    <div class="metric-val">${m.val}</div>
                    <div class="metric-lbl">${m.label}</div>
                `;
                metricsContainer.appendChild(div);
            });

            // Open Modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (window.soundEngine) window.soundEngine.playMechanicalClick(900, 0.06);
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (window.soundEngine) window.soundEngine.playMechanicalClick(600, 0.04);
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    // Escape key closes modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   7. STATS NUMERICAL COUNTERS ON SCROLL
   ========================================================================== */
function initStatsCounters() {
    const statElements = document.querySelectorAll('.counter-val');
    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                statElements.forEach(el => {
                    const target = parseFloat(el.getAttribute('data-target'));
                    const isDecimal = el.getAttribute('data-target').includes('.');
                    const suffix = el.getAttribute('data-suffix') || '';
                    const duration = 1800;
                    const startTime = performance.now();

                    function updateNumber(now) {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        const current = easeOut * target;

                        el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(updateNumber);
                        } else {
                            el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
                        }
                    }
                    requestAnimationFrame(updateNumber);
                });
            }
        });
    }, { threshold: 0.3 });

    const educationSection = document.getElementById('education');
    if (educationSection) observer.observe(educationSection);
}

/* ==========================================================================
   8. CONTACT FORM & ONE-CLICK EMAIL COPY
   ========================================================================== */
function initContactSection() {
    // Copy email button
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const email = 'guru92256@gmail.com';
            navigator.clipboard.writeText(email).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<span class="icon">✓</span> COPIED TO CLIPBOARD!';
                copyBtn.classList.add('copied');
                showToast('Email address copied to clipboard: ' + email);
                if (window.soundEngine) window.soundEngine.playMechanicalClick(1000, 0.05);

                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('copied');
                }, 2800);
            }).catch(() => {
                showToast('Email: ' + email);
            });
        });
    }

    // Contact Form submission
    const form = document.getElementById('portfolio-contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const subject = document.getElementById('contact-subject').value.trim() || 'Portfolio Inquiry for Shivraj Singh Chouhan';
            const message = document.getElementById('contact-message').value.trim();

            if (!name || !email || !message) {
                showToast('Please fill out all required fields.', 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> TRANSMITTING...';

            // Simulate engineering transmission dispatch
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;

                // Offer direct mailto trigger so message actually routes to Shivraj
                const mailtoUrl = `mailto:guru92256@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hello Shivraj,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
                
                showToast('Message ready! Opening your default email client to send to guru92256@gmail.com');
                if (window.soundEngine) window.soundEngine.playEngineRev();

                form.reset();

                // Trigger mailto after brief delay
                setTimeout(() => {
                    window.location.href = mailtoUrl;
                }, 1200);
            }, 1000);
        });
    }
}

// Toast notification helper
function showToast(msg, type = 'info') {
    let toast = document.getElementById('portfolio-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'portfolio-toast';
        toast.className = 'portfolio-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = msg;
    toast.className = `portfolio-toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

/* ==========================================================================
   9. SMOOTH SCROLLING
   ========================================================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                if (window.soundEngine) window.soundEngine.playMechanicalClick(720, 0.04);
            }
        });
    });
}
