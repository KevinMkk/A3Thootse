let map;
let markers = [];
let selectedScene = null;
let unityInstance = null;
let retryTimeout = null;

// Default location (IMPORTANT: your requirement)
const DEFAULT_SCENE = "Qome";

// Unity ready handler
function setUnityInstance(instance) {
    unityInstance = instance;
    console.log("🟢 Unity is now READY");

    // flush pending selection if any
    if (selectedScene) {
        console.log("🚀 Sending stored selection to Unity:", selectedScene);
        sendToUnity(selectedScene);
    }
}

// INIT MAP
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -29.5, lng: 28.2 },
        zoom: 7
    });

    console.log("🗺 Map READY");

    createDefaultMarkers();
}

// CREATE MARKERS (you can expand later)
function createDefaultMarkers() {
    const locations = [
        {
            name: "Qome Caves",
            lat: -29.23767195757861,
            lng: 27.866112515336194,
            scene: "Qome"
        }
    ];

    locations.forEach(loc => {
        const marker = new google.maps.Marker({
            position: { lat: loc.lat, lng: loc.lng },
            map: map,
            title: loc.name
        });

        marker.sceneName = loc.scene;

        marker.addListener("click", () => {
            selectLocation(marker.sceneName);
        });

        markers.push(marker);
    });

    console.log("📍 Default markers created:", markers.length);
}

// MAIN SELECTION LOGIC
function selectLocation(sceneName) {
    console.log("🎯 Selected:", sceneName);

    selectedScene = null;

    const targetScene = sceneName || DEFAULT_SCENE;

    // ALWAYS close map immediately
    hideMap();

    console.log("🚀 Attempting teleport:", selectedScene);

    sendToUnity(targetScene);
}

// SEND TO UNITY (with retry safety)
function sendToUnity(sceneName) {
    if (unityInstance && unityInstance.SendMessage) {
        console.log("✅ Sending to Unity:", sceneName);

        unityInstance.SendMessage(
            "SceneController",
            "ReceiveSceneFromJS",
            sceneName
        );

        console.log("🎮 Sent successfully to Unity");

        selectedScene = null;
    } else {
        console.warn("⚠ Unity not ready → storing selection");

        selectedScene = sceneName;

        // retry until Unity loads
        setTimeout(() => {
            if (selectedScene) {
                sendToUnity(selectedScene);
            }
        }, 1000);
    }
}

// MAP UI
function showMap() {
    document.getElementById("mapOverlay").style.display = "block";
}

function hideMap() {
    document.getElementById("mapOverlay").style.display = "none";
}
