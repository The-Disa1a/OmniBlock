document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggle-shorts');

    // Load saved settings
    chrome.storage.local.get(['hideShorts'], (result) => {
        // Default to true (hiding shorts) if undefined
        toggle.checked = result.hideShorts !== false;
    });

    // Save setting when toggled
    toggle.addEventListener('change', () => {
        chrome.storage.local.set({ hideShorts: toggle.checked });
    });
});
