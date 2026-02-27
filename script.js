let map, panorama, actualLoc, guessMarker, actualMarker, polyLine;
let pool = [];
let selection = null;
let gameActive = false;
let round = 1;
let totalScore = 0;
let maxRounds = 5;
let isHardMode = false;
let isCountryMode = false;
let isApiLoaded = false;

// 1. Load coordinates
fetch('likeacw.json')
    .then(res => res.json())
    .then(data => {
        pool = data.customCoordinates || data;
    });

function onGoogleMapsLoaded() {
    isApiLoaded = true;
}

// 2. Start Game Logic
function startGame() {
    if (!isApiLoaded || pool.length === 0) return;

    const mode = document.getElementById("initial-mode").value;
    isHardMode = document.getElementById("initial-hard").checked;
    isCountryMode = document.getElementById("initial-country").checked;

    applyGameSettings(mode, isHardMode, isCountryMode);

    document.getElementById("start-screen").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("start-screen").style.display = "none";
        initMap();
        setupRound();
    }, 500);
}

function applyGameSettings(mode, hard, country) {
    const indicator = document.getElementById("round-indicator");
    const badge = document.getElementById("mode-badge");

    if (mode === "endless") {
        maxRounds = Infinity;
        indicator.style.display = "none";
    } else {
        maxRounds = parseInt(mode);
        document.getElementById("max-r").innerText = maxRounds;
        indicator.style.display = "block";
    }

    isHardMode = hard;
    isCountryMode = country;
    badge.style.display = isCountryMode ? "block" : "none";

    // Sync Panel
    document.getElementById("panel-mode").value = mode;
    document.getElementById("panel-hard").checked = hard;
    document.getElementById("panel-country").checked = country;
}

// 3. Map Initialization
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 }, zoom: 2,
        streetViewControl: false, mapTypeControl: true, fullscreenControl: false
    });
    google.maps.event.addListener(map, "click", (e) => {
        if (!gameActive) return;
        handleMapClick(e.latLng);
    });
}

function setupRound() {
    gameActive = true;
    document.getElementById("loading").style.display = "flex";
    const spot = pool[Math.floor(Math.random() * pool.length)];
    actualLoc = { lat: spot.lat, lng: spot.lng };

    const sv = new google.maps.StreetViewService();
    sv.getPanorama({ location: actualLoc, radius: 2000, source: google.maps.StreetViewSource.OUTDOOR }, (data, status) => {
        if (status === "OK") {
            document.getElementById("loading").style.display = "none";
            panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), {
                pano: data.location.pano,
                addressControl: false, showRoadLabels: false,
                clickToGo: !isHardMode, zoomControl: !isHardMode, scrollwheel: !isHardMode
            });
        } else { setupRound(); }
    });
}

function handleMapClick(latLng) {
    selection = latLng;
    if (guessMarker) guessMarker.setPosition(latLng);
    else guessMarker = new google.maps.Marker({ position: latLng, map: map, icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" });
    document.getElementById("confirm-btn").style.display = "inline-block";
}

// 4. Reverse Geocoding (Helper function)
async function getCountryName(latLng) {
    const geocoder = new google.maps.Geocoder();
    try {
        const response = await geocoder.geocode({ location: latLng });
        if (response.results && response.results.length > 0) {
            const countryComp = response.results.find(r => r.types.includes("country"));
            return countryComp ? countryComp.address_components[0].long_name : "Water/Unknown";
        }
        return "Unknown";
    } catch (e) {
        return "Unknown";
    }
}

// 5. Scoring Logic (Updated for Country Mode)
async function confirmGuess() {
    gameActive = false;
    document.getElementById("confirm-btn").style.display = "none";
    document.getElementById("info-text").innerText = "Checking location...";

    const target = new google.maps.LatLng(actualLoc.lat, actualLoc.lng);

    // Markers and Line
    actualMarker = new google.maps.Marker({ position: target, map: map, icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" });
    polyLine = new google.maps.Polyline({ path: [selection, target], geodesic: true, strokeColor: "#e74c3c", strokeWeight: 4, map: map });

    if (isCountryMode) {
        const actualCountry = await getCountryName(target);
        const guessedCountry = await getCountryName(selection);

        document.getElementById("info-text").style.display = "none";
        document.getElementById("result-box").style.display = "block";

        if (actualCountry === guessedCountry && actualCountry !== "Unknown") {
            document.getElementById("score-val").innerText = "CORRECT!";
            document.getElementById("score-val").style.color = "var(--primary)";
            document.getElementById("dist-text").innerText = `It was indeed ${actualCountry}`;
            totalScore += 5000;
        } else {
            document.getElementById("score-val").innerText = "WRONG";
            document.getElementById("score-val").style.color = "#e74c3c";
            document.getElementById("dist-text").innerText = `It was ${actualCountry}, not ${guessedCountry}`;
        }
    } else {
        const dist = google.maps.geometry.spherical.computeDistanceBetween(selection, target);
        const score = Math.round(5000 * Math.exp(-dist / 2000000));
        totalScore += score;

        document.getElementById("info-text").style.display = "none";
        document.getElementById("result-box").style.display = "block";
        document.getElementById("score-val").innerText = score + " pts";
        document.getElementById("score-val").style.color = "var(--primary)";
        document.getElementById("dist-text").innerText = `${(dist/1000).toFixed(1)} km away`;
    }

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(selection); bounds.extend(target);
    map.fitBounds(bounds, { padding: 80 });
    document.getElementById("next-btn").style.display = "inline-block";
}

function nextRound() {
    if (round >= maxRounds && maxRounds !== Infinity) {
        alert(`Game Over! Total Score: ${totalScore.toLocaleString()}`);
        location.reload();
        return;
    }
    round++;
    document.getElementById("cur-r").innerText = round;
    resetRoundUI();
    setupRound();
}

function resetRoundUI() {
    selection = null;
    if (guessMarker) guessMarker.setMap(null);
    if (actualMarker) actualMarker.setMap(null);
    if (polyLine) polyLine.setMap(null);
    guessMarker = null;
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("result-box").style.display = "none";
    document.getElementById("info-text").style.display = "block";
    document.getElementById("info-text").innerText = "Analyze the environment...";
    map.setCenter({ lat: 20, lng: 0 }); map.setZoom(2);
}

function toggleSettings() {
    const p = document.getElementById("settings-panel");
    p.style.display = p.style.display === "block" ? "none" : "block";
}

function restartWithNewSettings() {
    const mode = document.getElementById("panel-mode").value;
    const hard = document.getElementById("panel-hard").checked;
    const country = document.getElementById("panel-country").checked;
    round = 1; totalScore = 0;
    document.getElementById("cur-r").innerText = round;
    applyGameSettings(mode, hard, country);
    toggleSettings();
    resetRoundUI();
    setupRound();
}

const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=geometry&callback=onGoogleMapsLoaded`;
script.defer = true;
document.head.appendChild(script);