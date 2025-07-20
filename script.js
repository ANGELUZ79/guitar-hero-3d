/**
 * Guitar Hero 3D - Main Game Script
 * 3D Musical Staff with Three.js and Note Cylinder System
 * Includes fallback mode for 2D gameplay when Three.js is not available
 */

class GuitarHero3D {
    constructor() {
        // Game state
        this.isPlaying = false;
        this.isPaused = false;
        this.currentSongIndex = 0;
        this.score = 0;
        this.combo = 0;
        this.startTime = 0;
        this.lastNoteTime = 0;
        this.gameMode = 'loading'; // 'loading', '3d', '2d'
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        
        // 2D fallback components
        this.currentNote = null;
        this.noteTimer = null;
        this.songTimer = null;
        
        // Game objects
        this.staffLines = [];
        this.cylinders = [];
        this.invisibleLines = [];
        this.hitZone = null;
        
        // Musical configuration
        this.staffConfig = {
            // Main visible lines (E4, G4, B4, D5, F5)
            mainLines: [
                { note: 'E4', y: -2, color: 0xff6b6b, name: 'MI' },
                { note: 'G4', y: -1, color: 0xffe66d, name: 'SOL' },
                { note: 'B4', y: 0, color: 0x6c5ce7, name: 'SI' },
                { note: 'D5', y: 1, color: 0x00b894, name: 'RE' },
                { note: 'F5', y: 2, color: 0x0984e3, name: 'FA' }
            ],
            // Spaces between lines (F4, A4, C5, E5)
            spaces: [
                { note: 'F4', y: -1.5, color: 0x4ecdc4, name: 'FA' },
                { note: 'A4', y: -0.5, color: 0xff9f43, name: 'LA' },
                { note: 'C5', y: 0.5, color: 0xfd79a8, name: 'DO' },
                { note: 'E5', y: 1.5, color: 0xe17055, name: 'MI' }
            ],
            // Additional invisible lines
            invisibleLines: [
                { note: 'C4', y: -3, color: 0xfd79a8, name: 'DO' },
                { note: 'D4', y: -2.5, color: 0x00b894, name: 'RE' },
                { note: 'A5', y: 2.5, color: 0xff9f43, name: 'LA' },
                { note: 'C6', y: 3, color: 0xfd79a8, name: 'DO' }
            ]
        };
        
        // Note color mappings for 2D mode
        this.noteColors = {
            'MI': '#ff6b6b', 'FA': '#4ecdc4', 'SOL': '#ffe66d', 'LA': '#ff9f43',
            'SI': '#6c5ce7', 'DO': '#fd79a8', 'RE': '#00b894'
        };
        
        // Song data
        this.songData = [
            {"name": "SOL", "duration": 0.5},
            {"name": "SOL", "duration": 0.5},
            {"name": "MI", "duration": 0.5},
            {"name": "MI", "duration": 0.5},
            {"name": "SOL", "duration": 0.5},
            {"name": "SOL", "duration": 0.5},
            {"name": "MI", "duration": 0.5},
            {"name": "MI", "duration": 0.5},
            {"name": "SOL", "duration": 0.5},
            {"name": "SOL", "duration": 0.5},
            {"name": "LA", "duration": 0.5},
            {"name": "SOL", "duration": 0.5},
            {"name": "FA", "duration": 0.5},
            {"name": "MI", "duration": 0.5},
            {"name": "RE", "duration": 1},
            {"name": "FA", "duration": 0.5},
            {"name": "FA", "duration": 0.5},
            {"name": "RE", "duration": 0.5},
            {"name": "RE", "duration": 0.5},
            {"name": "FA", "duration": 0.5},
            {"name": "FA", "duration": 0.5},
            {"name": "RE", "duration": 0.5},
            {"name": "RE", "duration": 0.5},
            {"name": "FA", "duration": 0.5},
            {"name": "FA", "duration": 0.5},
            {"name": "SOL", "duration": 0.5},
            {"name": "FA", "duration": 0.5},
            {"name": "MI", "duration": 0.5},
            {"name": "RE", "duration": 0.5},
            {"name": "DO", "duration": 1}
        ];
        
        // Speed settings
        this.cylinderSpeed = 0.05; // Base speed
        this.hitZoneZ = -1; // Z position where notes should be hit
        
        // Input handling
        this.keyMapping = {
            '1': 'E4', '2': 'F4', '3': 'G4', '4': 'A4', '5': 'B4',
            '6': 'C5', '7': 'D5', '8': 'E5', '9': 'F5'
        };
        
        // Note name to Spanish mapping
        this.noteToSpanish = {
            'E4': 'MI', 'F4': 'FA', 'G4': 'SOL', 'A4': 'LA', 'B4': 'SI',
            'C5': 'DO', 'D5': 'RE', 'E5': 'MI', 'F5': 'FA'
        };
        
        this.init();
    }
    
    async init() {
        // Check if Three.js is available
        if (typeof THREE !== 'undefined') {
            this.gameMode = '3d';
            this.setup3DMode();
        } else {
            // Wait a bit for Three.js to load, then fallback to 2D
            setTimeout(() => {
                if (typeof THREE !== 'undefined') {
                    this.gameMode = '3d';
                    this.setup3DMode();
                } else {
                    this.gameMode = '2d';
                    this.setup2DMode();
                    console.log('Running in 2D fallback mode');
                }
            }, 1000);
        }
        
        this.setupControls();
        this.setupKeyboardInput();
        
        // Show audio warning if needed
        if (!window.MidiSounds.isInitialized) {
            document.getElementById('audio-warning').style.display = 'block';
        }
        
        console.log('Guitar Hero initialized successfully');
    }
    
    setup3DMode() {
        this.setupScene();
        this.createStaff();
        this.animate();
        console.log('3D mode activated');
    }
    
    setup2DMode() {
        // Hide the canvas and setup 2D visual elements
        const canvas = document.getElementById('game-canvas');
        canvas.style.display = 'none';
        
        // Show the 2D note display
        const noteDisplay = document.getElementById('note-display');
        noteDisplay.style.display = 'flex';
        
        console.log('2D fallback mode activated');
    }
    
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        // Add fog for depth effect
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add lights
        this.setupLighting();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (main)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point light for staff illumination
        const pointLight = new THREE.PointLight(0x4ecdc4, 0.5, 50);
        pointLight.position.set(0, 5, 2);
        this.scene.add(pointLight);
        
        // Spotlight for hit zone
        const spotLight = new THREE.SpotLight(0xffe66d, 1, 100, Math.PI / 6, 0.1);
        spotLight.position.set(0, 5, 0);
        spotLight.target.position.set(0, 0, this.hitZoneZ);
        spotLight.castShadow = true;
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
    }
    
    createStaff() {
        const staffGroup = new THREE.Group();
        
        // Create main staff lines
        this.staffConfig.mainLines.forEach((lineConfig, index) => {
            const line = this.createStaffLine(lineConfig, true);
            staffGroup.add(line);
            this.staffLines.push({ ...lineConfig, mesh: line, visible: true });
        });
        
        // Create invisible lines (will be shown with glow when cylinders pass)
        this.staffConfig.invisibleLines.forEach((lineConfig, index) => {
            const line = this.createStaffLine(lineConfig, false);
            staffGroup.add(line);
            this.invisibleLines.push({ ...lineConfig, mesh: line, visible: false });
        });
        
        // Create hit zone indicator
        this.createHitZone();
        
        this.scene.add(staffGroup);
    }
    
    createStaffLine(config, visible = true) {
        const geometry = new THREE.PlaneGeometry(20, 0.05);
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: true,
            opacity: visible ? 0.8 : 0.1,
            emissive: new THREE.Color(config.color).multiplyScalar(0.1)
        });
        
        const line = new THREE.Mesh(geometry, material);
        line.position.set(0, config.y, 0);
        line.userData = { note: config.note, name: config.name, config: config };
        
        return line;
    }
    
    createHitZone() {
        // Create semi-transparent plane at hit zone
        const geometry = new THREE.PlaneGeometry(12, 6);
        const material = new THREE.MeshLambertMaterial({
            color: 0xffe66d,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        
        this.hitZone = new THREE.Mesh(geometry, material);
        this.hitZone.position.set(0, 0, this.hitZoneZ);
        this.scene.add(this.hitZone);
        
        // Add hit zone border
        const borderGeometry = new THREE.EdgesGeometry(geometry);
        const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffe66d, linewidth: 2 });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        border.position.copy(this.hitZone.position);
        this.scene.add(border);
    }
    
    createNoteCylinder(noteData, startTime) {
        if (this.gameMode === '2d') {
            this.show2DNote(noteData, startTime);
            return null;
        }
        
        // Find note configuration
        const allNotes = [
            ...this.staffConfig.mainLines,
            ...this.staffConfig.spaces,
            ...this.staffConfig.invisibleLines
        ];
        
        const noteConfig = allNotes.find(n => n.name === noteData.name);
        if (!noteConfig) {
            console.warn(`Note configuration not found for: ${noteData.name}`);
            return null;
        }
        
        // Create cylinder geometry
        const radius = 0.2 + (noteData.duration * 0.1); // Size based on duration
        const height = 0.4;
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
        
        // Create material with note color
        const material = new THREE.MeshPhongMaterial({
            color: noteConfig.color,
            emissive: new THREE.Color(noteConfig.color).multiplyScalar(0.2),
            shininess: 100
        });
        
        const cylinder = new THREE.Mesh(geometry, material);
        
        // Position cylinder
        const startZ = 20; // Start far back
        cylinder.position.set(0, noteConfig.y, startZ);
        cylinder.rotation.z = Math.PI / 2; // Rotate to lie along staff line
        
        // Add note label
        this.addNoteLabel(cylinder, noteData.name);
        
        // Store note data
        cylinder.userData = {
            note: noteData.name,
            standardNote: noteConfig.note,
            duration: noteData.duration,
            startTime: startTime,
            targetY: noteConfig.y,
            speed: this.cylinderSpeed / noteData.duration, // Faster for shorter notes
            hit: false,
            missed: false
        };
        
        this.scene.add(cylinder);
        this.cylinders.push(cylinder);
        
        return cylinder;
    }
    
    show2DNote(noteData, startTime) {
        // Show note in 2D mode
        const noteElement = document.getElementById('active-note');
        const labelElement = noteElement.querySelector('.note-label');
        
        // Set note color and label
        const color = this.noteColors[noteData.name] || '#ff6b6b';
        noteElement.style.background = `linear-gradient(45deg, ${color}, ${color}dd)`;
        labelElement.textContent = noteData.name;
        
        // Show the note
        noteElement.classList.add('active');
        
        // Set timer for when note should be hit
        const hitTime = noteData.duration * 1000; // Convert to milliseconds
        
        this.currentNote = {
            name: noteData.name,
            startTime: Date.now(),
            duration: noteData.duration,
            hitTime: hitTime,
            hit: false
        };
        
        // Hide note after duration
        this.noteTimer = setTimeout(() => {
            if (!this.currentNote.hit) {
                this.processMiss();
            }
            noteElement.classList.remove('active');
            this.currentNote = null;
        }, hitTime);
    }
    
    addNoteLabel(cylinder, noteName) {
        // Create canvas for text texture
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        // Style text
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw text
        context.fillText(noteName, canvas.width / 2, canvas.height / 2);
        
        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Create text plane
        const geometry = new THREE.PlaneGeometry(1, 0.5);
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.set(0, 0.3, 0);
        
        cylinder.add(textMesh);
    }
    
    setupControls() {
        // Play button
        document.getElementById('play-btn').addEventListener('click', () => {
            if (!this.isPlaying) {
                this.startGame();
            }
        });
        
        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Stop button
        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopGame();
        });
        
        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    setupKeyboardInput() {
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            
            // Handle note keys (1-9)
            if (this.keyMapping[key]) {
                this.hitNote(this.keyMapping[key]);
                this.highlightHitLine(this.keyMapping[key]);
            }
            
            // Handle control keys
            switch (key) {
                case ' ':
                    event.preventDefault();
                    if (!this.isPlaying) {
                        this.startGame();
                    } else {
                        this.togglePause();
                    }
                    break;
                case 'Escape':
                    this.stopGame();
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            const key = event.key;
            if (this.keyMapping[key]) {
                this.removeHitLineHighlight(this.keyMapping[key]);
            }
        });
    }
    
    highlightHitLine(note) {
        const hitLine = document.querySelector(`.hit-line[data-note="${note}"]`);
        if (hitLine) {
            hitLine.classList.add('active');
        }
    }
    
    removeHitLineHighlight(note) {
        const hitLine = document.querySelector(`.hit-line[data-note="${note}"]`);
        if (hitLine) {
            hitLine.classList.remove('active');
        }
    }
    
    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.lastNoteTime = 0;
        this.currentSongIndex = 0;
        
        // Schedule all notes
        this.scheduleNotes();
        
        // Update UI
        this.updateUI();
        
        console.log('Game started in', this.gameMode, 'mode');
    }
    
    togglePause() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            window.MidiSounds.stopAllNotes();
            if (this.noteTimer) {
                clearTimeout(this.noteTimer);
            }
            if (this.songTimer) {
                clearTimeout(this.songTimer);
            }
        }
        
        console.log(this.isPaused ? 'Game paused' : 'Game resumed');
    }
    
    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        
        // Clear timers
        if (this.noteTimer) {
            clearTimeout(this.noteTimer);
            this.noteTimer = null;
        }
        if (this.songTimer) {
            clearTimeout(this.songTimer);
            this.songTimer = null;
        }
        
        // Clear 3D cylinders
        if (this.gameMode === '3d') {
            this.cylinders.forEach(cylinder => {
                this.scene.remove(cylinder);
            });
            this.cylinders = [];
        }
        
        // Clear 2D note
        if (this.gameMode === '2d') {
            const noteElement = document.getElementById('active-note');
            noteElement.classList.remove('active');
            this.currentNote = null;
        }
        
        // Stop all sounds
        window.MidiSounds.stopAllNotes();
        
        // Reset game state
        this.currentSongIndex = 0;
        this.lastNoteTime = 0;
        
        console.log('Game stopped');
    }
    
    restartGame() {
        this.stopGame();
        
        // Reset score and combo
        this.score = 0;
        this.combo = 0;
        this.updateUI();
        
        // Start again
        setTimeout(() => this.startGame(), 100);
    }
    
    scheduleNotes() {
        let currentTime = 0;
        
        this.songData.forEach((noteData, index) => {
            this.songTimer = setTimeout(() => {
                if (this.isPlaying && !this.isPaused) {
                    if (this.gameMode === '3d') {
                        this.createNoteCylinder(noteData, currentTime);
                    } else {
                        this.show2DNote(noteData, currentTime);
                    }
                    this.currentSongIndex = index;
                }
            }, currentTime * 1000);
            
            currentTime += noteData.duration * 2; // Add some spacing between notes
        });
    }
    
    hitNote(standardNote) {
        if (!this.isPlaying || this.isPaused) return;
        
        const spanishNote = this.noteToSpanish[standardNote];
        
        if (this.gameMode === '2d') {
            // 2D mode hit detection
            if (this.currentNote && this.currentNote.name === spanishNote) {
                const elapsed = Date.now() - this.currentNote.startTime;
                const target = this.currentNote.hitTime * 0.7; // Hit window around 70% of duration
                const distance = Math.abs(elapsed - target) / target;
                
                this.processHit({ userData: { note: spanishNote, duration: this.currentNote.duration } }, distance);
                this.currentNote.hit = true;
                
                // Clear timer and hide note
                if (this.noteTimer) {
                    clearTimeout(this.noteTimer);
                }
                const noteElement = document.getElementById('active-note');
                noteElement.classList.remove('active');
                this.currentNote = null;
            } else {
                this.processMiss();
            }
        } else {
            // 3D mode hit detection
            const hitThreshold = 1.0; // Distance threshold for successful hit
            let hitCylinder = null;
            let minDistance = Infinity;
            
            this.cylinders.forEach(cylinder => {
                if (cylinder.userData.hit || cylinder.userData.missed) return;
                if (cylinder.userData.standardNote !== standardNote) return;
                
                const distance = Math.abs(cylinder.position.z - this.hitZoneZ);
                if (distance < hitThreshold && distance < minDistance) {
                    minDistance = distance;
                    hitCylinder = cylinder;
                }
            });
            
            if (hitCylinder) {
                this.processHit(hitCylinder, minDistance);
            } else {
                this.processMiss();
            }
        }
    }
    
    processHit(cylinder, distance) {
        if (this.gameMode === '3d') {
            cylinder.userData.hit = true;
        }
        
        // Calculate hit quality based on distance
        let quality, points;
        if (distance < 0.2) {
            quality = 'perfect';
            points = 100;
        } else if (distance < 0.5) {
            quality = 'good';
            points = 75;
        } else {
            quality = 'ok';
            points = 50;
        }
        
        // Update score and combo
        this.combo++;
        this.score += points * Math.max(1, Math.floor(this.combo / 5));
        
        // Play sound effects
        window.MidiSounds.playNote(cylinder.userData.note, cylinder.userData.duration, 'piano');
        window.MidiSounds.playHitEffect(quality);
        
        // Visual feedback
        if (this.gameMode === '3d') {
            this.createHitEffect(cylinder.position);
            // Make cylinder disappear
            cylinder.material.transparent = true;
            cylinder.material.opacity = 0.3;
            // Light up invisible lines if note is on them
            this.lightUpInvisibleLine(cylinder.userData.standardNote);
        } else {
            this.create2DHitEffect();
        }
        
        this.updateUI();
        
        console.log(`Hit ${cylinder.userData.note} - ${quality} (+${points})`);
    }
    
    create2DHitEffect() {
        // Create hit effect for 2D mode
        const noteElement = document.getElementById('active-note');
        noteElement.style.transform = 'scale(1.3)';
        noteElement.style.boxShadow = '0 0 50px rgba(255, 255, 255, 0.8)';
        
        setTimeout(() => {
            noteElement.style.transform = 'scale(1)';
            noteElement.style.boxShadow = '0 0 30px rgba(255, 107, 107, 0.6)';
        }, 200);
    }
    
    processMiss() {
        // Reset combo on miss
        this.combo = 0;
        
        // Play miss sound
        window.MidiSounds.playMissEffect();
        
        this.updateUI();
        
        console.log('Miss!');
    }
    
    lightUpInvisibleLine(standardNote) {
        if (this.gameMode !== '3d') return;
        
        this.invisibleLines.forEach(lineData => {
            if (lineData.note === standardNote) {
                // Temporarily make the line visible with glow effect
                lineData.mesh.material.opacity = 0.8;
                lineData.mesh.material.emissive.setHex(lineData.color);
                lineData.mesh.material.emissiveIntensity = 0.3;
                
                // Fade back after a short time
                setTimeout(() => {
                    lineData.mesh.material.opacity = 0.1;
                    lineData.mesh.material.emissiveIntensity = 0.1;
                }, 500);
            }
        });
    }
    
    createHitEffect(position) {
        if (this.gameMode !== '3d') return;
        
        // Create particle effect for successful hit
        const particleCount = 20;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.02, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 1, 0.7),
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            particle.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            ));
            
            particles.add(particle);
        }
        
        this.scene.add(particles);
        
        // Animate particles
        const animateParticles = () => {
            particles.children.forEach(particle => {
                particle.position.y += 0.02;
                particle.material.opacity -= 0.02;
                particle.scale.multiplyScalar(1.02);
            });
            
            if (particles.children[0].material.opacity > 0) {
                requestAnimationFrame(animateParticles);
            } else {
                this.scene.remove(particles);
            }
        };
        
        animateParticles();
    }
    
    updateUI() {
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('combo-value').textContent = this.combo;
        
        // Update progress
        let completed = 0;
        if (this.gameMode === '3d') {
            completed = this.cylinders.filter(c => c.userData.hit || c.userData.missed).length;
        } else {
            completed = this.currentSongIndex;
        }
        document.getElementById('progress-value').textContent = completed;
        
        // Update current note
        let currentNoteName = '-';
        if (this.gameMode === '3d') {
            const activeCylinder = this.cylinders.find(c => 
                !c.userData.hit && !c.userData.missed && c.position.z > this.hitZoneZ - 2
            );
            if (activeCylinder) {
                currentNoteName = activeCylinder.userData.note;
            }
        } else if (this.currentNote) {
            currentNoteName = this.currentNote.name;
        }
        
        document.getElementById('note-name').textContent = currentNoteName;
    }
    
    animate() {
        if (this.gameMode !== '3d') return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.isPlaying && !this.isPaused) {
            this.updateCylinders();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateCylinders() {
        if (this.gameMode !== '3d') return;
        
        this.cylinders.forEach((cylinder, index) => {
            if (cylinder.userData.hit || cylinder.userData.missed) return;
            
            // Move cylinder towards camera
            cylinder.position.z -= cylinder.userData.speed;
            
            // Add slight rotation for visual appeal
            cylinder.rotation.x += 0.01;
            
            // Check if cylinder passed the hit zone without being hit
            if (cylinder.position.z < this.hitZoneZ - 2) {
                cylinder.userData.missed = true;
                this.combo = 0; // Reset combo on miss
                cylinder.material.color.setHex(0x666666); // Darken missed notes
                this.updateUI();
            }
            
            // Remove cylinders that are too far
            if (cylinder.position.z < -10) {
                this.scene.remove(cylinder);
                this.cylinders.splice(index, 1);
            }
        });
        
        // Check if song is complete
        if (this.cylinders.length === 0 && this.isPlaying && this.currentSongIndex >= this.songData.length - 1) {
            this.stopGame();
            alert(`¡Canción completada!\nPuntuación final: ${this.score}`);
        }
    }
    
    onWindowResize() {
        if (this.gameMode !== '3d') return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.guitarHero = new GuitarHero3D();
});

// Handle page visibility changes to pause game
document.addEventListener('visibilitychange', () => {
    if (window.guitarHero && window.guitarHero.isPlaying && document.hidden) {
        window.guitarHero.togglePause();
    }
});
    
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        // Add fog for depth effect
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add lights
        this.setupLighting();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (main)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point light for staff illumination
        const pointLight = new THREE.PointLight(0x4ecdc4, 0.5, 50);
        pointLight.position.set(0, 5, 2);
        this.scene.add(pointLight);
        
        // Spotlight for hit zone
        const spotLight = new THREE.SpotLight(0xffe66d, 1, 100, Math.PI / 6, 0.1);
        spotLight.position.set(0, 5, 0);
        spotLight.target.position.set(0, 0, this.hitZoneZ);
        spotLight.castShadow = true;
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
    }
    
    createStaff() {
        const staffGroup = new THREE.Group();
        
        // Create main staff lines
        this.staffConfig.mainLines.forEach((lineConfig, index) => {
            const line = this.createStaffLine(lineConfig, true);
            staffGroup.add(line);
            this.staffLines.push({ ...lineConfig, mesh: line, visible: true });
        });
        
        // Create invisible lines (will be shown with glow when cylinders pass)
        this.staffConfig.invisibleLines.forEach((lineConfig, index) => {
            const line = this.createStaffLine(lineConfig, false);
            staffGroup.add(line);
            this.invisibleLines.push({ ...lineConfig, mesh: line, visible: false });
        });
        
        // Create hit zone indicator
        this.createHitZone();
        
        this.scene.add(staffGroup);
    }
    
    createStaffLine(config, visible = true) {
        const geometry = new THREE.PlaneGeometry(20, 0.05);
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: true,
            opacity: visible ? 0.8 : 0.1,
            emissive: new THREE.Color(config.color).multiplyScalar(0.1)
        });
        
        const line = new THREE.Mesh(geometry, material);
        line.position.set(0, config.y, 0);
        line.userData = { note: config.note, name: config.name, config: config };
        
        return line;
    }
    
    createHitZone() {
        // Create semi-transparent plane at hit zone
        const geometry = new THREE.PlaneGeometry(12, 6);
        const material = new THREE.MeshLambertMaterial({
            color: 0xffe66d,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        
        this.hitZone = new THREE.Mesh(geometry, material);
        this.hitZone.position.set(0, 0, this.hitZoneZ);
        this.scene.add(this.hitZone);
        
        // Add hit zone border
        const borderGeometry = new THREE.EdgesGeometry(geometry);
        const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffe66d, linewidth: 2 });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        border.position.copy(this.hitZone.position);
        this.scene.add(border);
    }
    
    createNoteCylinder(noteData, startTime) {
        // Find note configuration
        const allNotes = [
            ...this.staffConfig.mainLines,
            ...this.staffConfig.spaces,
            ...this.staffConfig.invisibleLines
        ];
        
        const noteConfig = allNotes.find(n => n.name === noteData.name);
        if (!noteConfig) {
            console.warn(`Note configuration not found for: ${noteData.name}`);
            return null;
        }
        
        // Create cylinder geometry
        const radius = 0.2 + (noteData.duration * 0.1); // Size based on duration
        const height = 0.4;
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
        
        // Create material with note color
        const material = new THREE.MeshPhongMaterial({
            color: noteConfig.color,
            emissive: new THREE.Color(noteConfig.color).multiplyScalar(0.2),
            shininess: 100
        });
        
        const cylinder = new THREE.Mesh(geometry, material);
        
        // Position cylinder
        const startZ = 20; // Start far back
        cylinder.position.set(0, noteConfig.y, startZ);
        cylinder.rotation.z = Math.PI / 2; // Rotate to lie along staff line
        
        // Add note label
        this.addNoteLabel(cylinder, noteData.name);
        
        // Store note data
        cylinder.userData = {
            note: noteData.name,
            standardNote: noteConfig.note,
            duration: noteData.duration,
            startTime: startTime,
            targetY: noteConfig.y,
            speed: this.cylinderSpeed / noteData.duration, // Faster for shorter notes
            hit: false,
            missed: false
        };
        
        this.scene.add(cylinder);
        this.cylinders.push(cylinder);
        
        return cylinder;
    }
    
    addNoteLabel(cylinder, noteName) {
        // Create canvas for text texture
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        // Style text
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw text
        context.fillText(noteName, canvas.width / 2, canvas.height / 2);
        
        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Create text plane
        const geometry = new THREE.PlaneGeometry(1, 0.5);
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.set(0, 0.3, 0);
        
        cylinder.add(textMesh);
    }
    
    setupControls() {
        // Play button
        document.getElementById('play-btn').addEventListener('click', () => {
            if (!this.isPlaying) {
                this.startGame();
            }
        });
        
        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Stop button
        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopGame();
        });
        
        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    setupKeyboardInput() {
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            
            // Handle note keys (1-9)
            if (this.keyMapping[key]) {
                this.hitNote(this.keyMapping[key]);
                this.highlightHitLine(this.keyMapping[key]);
            }
            
            // Handle control keys
            switch (key) {
                case ' ':
                    event.preventDefault();
                    if (!this.isPlaying) {
                        this.startGame();
                    } else {
                        this.togglePause();
                    }
                    break;
                case 'Escape':
                    this.stopGame();
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            const key = event.key;
            if (this.keyMapping[key]) {
                this.removeHitLineHighlight(this.keyMapping[key]);
            }
        });
    }
    
    highlightHitLine(note) {
        const hitLine = document.querySelector(`.hit-line[data-note="${note}"]`);
        if (hitLine) {
            hitLine.classList.add('active');
        }
    }
    
    removeHitLineHighlight(note) {
        const hitLine = document.querySelector(`.hit-line[data-note="${note}"]`);
        if (hitLine) {
            hitLine.classList.remove('active');
        }
    }
    
    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.lastNoteTime = 0;
        
        // Schedule all notes
        this.scheduleNotes();
        
        // Update UI
        this.updateUI();
        
        console.log('Game started');
    }
    
    togglePause() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            window.MidiSounds.stopAllNotes();
        }
        
        console.log(this.isPaused ? 'Game paused' : 'Game resumed');
    }
    
    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        
        // Clear all cylinders
        this.cylinders.forEach(cylinder => {
            this.scene.remove(cylinder);
        });
        this.cylinders = [];
        
        // Stop all sounds
        window.MidiSounds.stopAllNotes();
        
        // Reset game state
        this.currentSongIndex = 0;
        this.lastNoteTime = 0;
        
        console.log('Game stopped');
    }
    
    restartGame() {
        this.stopGame();
        
        // Reset score and combo
        this.score = 0;
        this.combo = 0;
        this.updateUI();
        
        // Start again
        setTimeout(() => this.startGame(), 100);
    }
    
    scheduleNotes() {
        let currentTime = 0;
        
        this.songData.forEach((noteData, index) => {
            setTimeout(() => {
                if (this.isPlaying && !this.isPaused) {
                    this.createNoteCylinder(noteData, currentTime);
                }
            }, currentTime * 1000);
            
            currentTime += noteData.duration * 2; // Add some spacing between notes
        });
    }
    
    hitNote(standardNote) {
        if (!this.isPlaying || this.isPaused) return;
        
        // Find cylinders near the hit zone
        const hitThreshold = 1.0; // Distance threshold for successful hit
        let hitCylinder = null;
        let minDistance = Infinity;
        
        this.cylinders.forEach(cylinder => {
            if (cylinder.userData.hit || cylinder.userData.missed) return;
            if (cylinder.userData.standardNote !== standardNote) return;
            
            const distance = Math.abs(cylinder.position.z - this.hitZoneZ);
            if (distance < hitThreshold && distance < minDistance) {
                minDistance = distance;
                hitCylinder = cylinder;
            }
        });
        
        if (hitCylinder) {
            this.processHit(hitCylinder, minDistance);
        } else {
            this.processMiss();
        }
    }
    
    processHit(cylinder, distance) {
        cylinder.userData.hit = true;
        
        // Calculate hit quality based on distance
        let quality, points;
        if (distance < 0.2) {
            quality = 'perfect';
            points = 100;
        } else if (distance < 0.5) {
            quality = 'good';
            points = 75;
        } else {
            quality = 'ok';
            points = 50;
        }
        
        // Update score and combo
        this.combo++;
        this.score += points * Math.max(1, Math.floor(this.combo / 5));
        
        // Play sound effects
        window.MidiSounds.playNote(cylinder.userData.note, cylinder.userData.duration, 'piano');
        window.MidiSounds.playHitEffect(quality);
        
        // Visual feedback
        this.createHitEffect(cylinder.position);
        
        // Make cylinder disappear
        cylinder.material.transparent = true;
        cylinder.material.opacity = 0.3;
        
        // Light up invisible lines if note is on them
        this.lightUpInvisibleLine(cylinder.userData.standardNote);
        
        this.updateUI();
        
        console.log(`Hit ${cylinder.userData.note} - ${quality} (+${points})`);
    }
    
    processMiss() {
        // Reset combo on miss
        this.combo = 0;
        
        // Play miss sound
        window.MidiSounds.playMissEffect();
        
        this.updateUI();
        
        console.log('Miss!');
    }
    
    lightUpInvisibleLine(standardNote) {
        this.invisibleLines.forEach(lineData => {
            if (lineData.note === standardNote) {
                // Temporarily make the line visible with glow effect
                lineData.mesh.material.opacity = 0.8;
                lineData.mesh.material.emissive.setHex(lineData.color);
                lineData.mesh.material.emissiveIntensity = 0.3;
                
                // Fade back after a short time
                setTimeout(() => {
                    lineData.mesh.material.opacity = 0.1;
                    lineData.mesh.material.emissiveIntensity = 0.1;
                }, 500);
            }
        });
    }
    
    createHitEffect(position) {
        // Create particle effect for successful hit
        const particleCount = 20;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.02, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 1, 0.7),
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            particle.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            ));
            
            particles.add(particle);
        }
        
        this.scene.add(particles);
        
        // Animate particles
        const animateParticles = () => {
            particles.children.forEach(particle => {
                particle.position.y += 0.02;
                particle.material.opacity -= 0.02;
                particle.scale.multiplyScalar(1.02);
            });
            
            if (particles.children[0].material.opacity > 0) {
                requestAnimationFrame(animateParticles);
            } else {
                this.scene.remove(particles);
            }
        };
        
        animateParticles();
    }
    
    updateUI() {
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('combo-value').textContent = this.combo;
        document.getElementById('progress-value').textContent = 
            this.cylinders.filter(c => c.userData.hit || c.userData.missed).length;
        
        // Update current note
        const activeCylinder = this.cylinders.find(c => 
            !c.userData.hit && !c.userData.missed && c.position.z > this.hitZoneZ - 2
        );
        
        if (activeCylinder) {
            document.getElementById('note-name').textContent = activeCylinder.userData.note;
        } else {
            document.getElementById('note-name').textContent = '-';
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.isPlaying && !this.isPaused) {
            this.updateCylinders();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateCylinders() {
        this.cylinders.forEach((cylinder, index) => {
            if (cylinder.userData.hit || cylinder.userData.missed) return;
            
            // Move cylinder towards camera
            cylinder.position.z -= cylinder.userData.speed;
            
            // Add slight rotation for visual appeal
            cylinder.rotation.x += 0.01;
            
            // Check if cylinder passed the hit zone without being hit
            if (cylinder.position.z < this.hitZoneZ - 2) {
                cylinder.userData.missed = true;
                this.combo = 0; // Reset combo on miss
                cylinder.material.color.setHex(0x666666); // Darken missed notes
                this.updateUI();
            }
            
            // Remove cylinders that are too far
            if (cylinder.position.z < -10) {
                this.scene.remove(cylinder);
                this.cylinders.splice(index, 1);
            }
        });
        
        // Check if song is complete
        if (this.cylinders.length === 0 && this.isPlaying) {
            this.stopGame();
            alert(`¡Canción completada!\nPuntuación final: ${this.score}`);
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.guitarHero = new GuitarHero3D();
});

// Handle page visibility changes to pause game
document.addEventListener('visibilitychange', () => {
    if (window.guitarHero && window.guitarHero.isPlaying && document.hidden) {
        window.guitarHero.togglePause();
    }
});