document.addEventListener('DOMContentLoaded', () => {
    const toggleShorts = document.getElementById('toggle-shorts');
    const toggleTelemetry = document.getElementById('toggle-telemetry');
    const statVideo = document.getElementById('stat-video');
    const statHome = document.getElementById('stat-home');
    const statSidebar = document.getElementById('stat-sidebar');

    // Load saved settings
    chrome.storage.local.get(['hideShorts', 'blockTelemetry', 'videoAdsBlocked', 'homeAdsBlocked', 'sideBarAdsBlocked'], (result) => {
        // Default to true (hiding shorts / blocking telemetry) if undefined
        toggleShorts.checked = result.hideShorts !== false;
        toggleTelemetry.checked = result.blockTelemetry !== false;
        
        // Populate stats metrics
        statVideo.textContent = result.videoAdsBlocked || 0;
        statHome.textContent = result.homeAdsBlocked || 0;
        statSidebar.textContent = result.sideBarAdsBlocked || 0;
    });

    // Save settings when toggled
    toggleShorts.addEventListener('change', () => {
        chrome.storage.local.set({ hideShorts: toggleShorts.checked });
    });
    
    toggleTelemetry.addEventListener('change', () => {
        chrome.storage.local.set({ blockTelemetry: toggleTelemetry.checked });
    });
});
