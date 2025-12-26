// Initialize Map
// Center slightly adjusted to new data center
const map = L.map('map').setView([38.975, -76.944], 15);

// OSM Base Layer
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

// Add OSM layer
osmLayer.addTo(map);

// Colors for routes based on volume
function getColor(count) {
    if (count > 50) return '#bd0026'; // High
    if (count > 20) return '#f03b20'; // Medium-High
    if (count > 10) return '#fd8d3c'; // Medium
    return '#feb24c'; // Low
}

// Check for data
if (typeof trafficData === 'undefined' || typeof intersectionCoords === 'undefined') {
    alert("Error: Traffic Data could not be loaded. Please check data.js syntax.");
    throw new Error("Data missing");
}

// Markers for Intersections - DRAGGABLE
const intersectionLayer = L.layerGroup().addTo(map);
const intersectionMarkers = {}; // Store markers for coordinate export

Object.entries(intersectionCoords).forEach(([id, coords]) => {
    // Validate coords
    if (!coords || coords.length !== 2) {
        console.warn(`Invalid coords for Int ${id}`);
        return;
    }

    // Use regular marker (draggable) instead of circleMarker
    const marker = L.marker(coords, {
        draggable: true,
        icon: L.divIcon({
            className: 'intersection-marker',
            html: `<div style="background:#3388ff;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.5);">${id}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    }).addTo(intersectionLayer);

    // Store reference
    intersectionMarkers[id] = marker;

    // Update coordinates on drag
    marker.on('dragend', function(e) {
        const pos = e.target.getLatLng();
        console.log(`Int ${id}: [${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}]`);
    });
});

// Export coordinates function
window.exportCoordinates = function() {
    let output = "const intersectionCoords = {\n";
    Object.entries(intersectionMarkers).forEach(([id, marker]) => {
        const pos = marker.getLatLng();
        output += `    ${id}: [${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}],\n`;
    });
    output += "};";
    console.log(output);

    // Also show in alert for easy copy
    const coordsText = Object.entries(intersectionMarkers).map(([id, marker]) => {
        const pos = marker.getLatLng();
        return `${id}: [${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}]`;
    }).join('\n');

    // Copy to clipboard
    navigator.clipboard.writeText(output).then(() => {
        alert("Coordinates copied to clipboard!\n\nAlso logged to browser console (F12).");
    }).catch(() => {
        alert("Coordinates logged to console (F12).\n\n" + coordsText);
    });
};

// Store route layers
const routeLayers = [];

// Simulation State
let simulationRunning = true;
let simulationSpeed = 1;
const vehicles = [];

// Simulation Clock (cycles through study hours: 6-10 AM, 3-7 PM)
let simHour = 6;
let simMinute = 0;
let simPeriod = 'AM';
let clockTicks = 0;

function updateClock() {
    clockTicks++;
    // Advance 1 minute every ~60 ticks (adjusted by speed)
    if (clockTicks >= Math.floor(60 / simulationSpeed)) {
        clockTicks = 0;
        simMinute++;
        if (simMinute >= 60) {
            simMinute = 0;
            simHour++;
            // Handle period transitions
            if (simPeriod === 'AM' && simHour >= 10) {
                // Jump from 10 AM to 3 PM
                simHour = 3;
                simPeriod = 'PM';
            } else if (simPeriod === 'PM' && simHour >= 7) {
                // Reset to 6 AM
                simHour = 6;
                simPeriod = 'AM';
            }
        }
    }
    // Update display
    const displayHour = simHour === 0 ? 12 : (simHour > 12 ? simHour - 12 : simHour);
    const displayMin = simMinute.toString().padStart(2, '0');
    document.getElementById('sim-clock').innerText = `${displayHour}:${displayMin} ${simPeriod}`;
}

// Draw Routes
const routeListContainer = document.getElementById('route-list');

// Filter data to only show active routes (> 0 vehicles)
const activeRoutes = trafficData.filter(r => r.count > 0);

activeRoutes.forEach(route => {
    // Get coordinates for path
    const latlngs = route.path_nodes.map(nodeId => intersectionCoords[nodeId]).filter(c => c !== undefined);
    
    if (latlngs.length < 2) return;

    const color = getColor(route.count);
    
    const polyline = L.polyline(latlngs, {
        color: color,
        weight: 3,
        opacity: 0.6,
        dashArray: '5, 10'
    }).bindPopup(`<b>Route ${route.id}</b><br>${route.desc}<br>Volume: ${route.count} vehicles`);
    
    polyline.addTo(map);
    routeLayers.push({ id: route.id, layer: polyline, data: route, latlngs: latlngs });

    // Add to control panel (top 10)
    if (activeRoutes.indexOf(route) < 10) {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.style.flexDirection = 'column';
        item.style.alignItems = 'flex-start';
        item.innerHTML = `
            <div style="display:flex;align-items:center;">
                <div class="legend-color" style="background:${color}"></div>
                <span><b>${route.count}</b> cars</span>
            </div>
            <div style="font-size:0.8em;color:#555;margin-left:17px;">${route.desc}</div>
        `;
        routeListContainer.appendChild(item);
    }
});

// Simulation Logic
function spawnVehicle(routeObj) {
    if (!simulationRunning) return;

    const vehicleMarker = L.circleMarker(routeObj.latlngs[0], {
        radius: 4,
        fillColor: 'black',
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 1
    }).addTo(map);

    let currentIndex = 0;
    let progress = 0;
    const speed = 0.005 * simulationSpeed; // SLOWER Base speed for smoother animation

    const vehicle = {
        marker: vehicleMarker,
        route: routeObj,
        update: () => {
            progress += speed;
            if (progress >= 1) {
                progress = 0;
                currentIndex++;
                if (currentIndex >= routeObj.latlngs.length - 1) {
                    // Reached end
                    map.removeLayer(vehicleMarker);
                    return false; // Remove from list
                }
            }

            const start = routeObj.latlngs[currentIndex];
            const end = routeObj.latlngs[currentIndex + 1];
            
            const lat = start[0] + (end[0] - start[0]) * progress;
            const lng = start[1] + (end[1] - start[1]) * progress;
            
            vehicleMarker.setLatLng([lat, lng]);
            return true; // Keep alive
        }
    };

    vehicles.push(vehicle);
}

// Spawner Loop
function animate() {
    requestAnimationFrame(animate);

    if (!simulationRunning) return;

    // Update simulation clock
    updateClock();

    // Update existing vehicles
    for (let i = vehicles.length - 1; i >= 0; i--) {
        const alive = vehicles[i].update();
        if (!alive) {
            vehicles.splice(i, 1);
        }
    }

    // Spawn new vehicles based on volume probability
    activeRoutes.forEach(route => {
        // Probability
        if (Math.random() < (route.count / 5000) * simulationSpeed) {
            spawnVehicle(routeLayers.find(r => r.id === route.id));
        }
    });
}

// Controls
document.getElementById('toggle-sim').addEventListener('click', (e) => {
    simulationRunning = !simulationRunning;
    e.target.innerText = simulationRunning ? "Pause Simulation" : "Resume Simulation";
});

document.getElementById('speed-range').addEventListener('input', (e) => {
    simulationSpeed = parseInt(e.target.value);
    document.getElementById('speed-val').innerText = simulationSpeed + 'x';
});

// Start loop
animate();