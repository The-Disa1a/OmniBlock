// Function to update Shorts visibility based on settings
let isHideShortsEnabled = true;

function evaluateShortsVisibility() {
    // Only hide shorts on home page and when watching a video
    const isHomeOrWatch = window.location.pathname === '/' || window.location.pathname.startsWith('/watch');
    const shouldHide = isHideShortsEnabled && isHomeOrWatch;

    let shortsStyle = document.getElementById('adblock-shorts-style');
    if (shouldHide) {
        if (!shortsStyle) {
            shortsStyle = document.createElement('style');
            shortsStyle.id = 'adblock-shorts-style';
            shortsStyle.textContent = `
                ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
                ytd-reel-shelf-renderer,
                ytm-shorts-lockup-view-model-v2 {
                    display: none !important;
                }
            `;
            document.head.appendChild(shortsStyle);
        }
    } else {
        if (shortsStyle) {
            shortsStyle.remove();
        }
    }
}

// Load initial setting
chrome.storage.local.get(['hideShorts'], function(result) {
    // Default to hiding shorts if not set
    isHideShortsEnabled = result.hideShorts !== false; 
    evaluateShortsVisibility();
});

// Listen for changes from the popup
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.hideShorts) {
        isHideShortsEnabled = changes.hideShorts.newValue;
        evaluateShortsVisibility();
    }
});

// Inject CSS to instantly hide ads before JS removes them
const style = document.createElement('style');
style.textContent = `
    ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
    ytd-rich-item-renderer:has(ytd-in-feed-ad-layout-renderer),
    ytd-statement-banner-renderer,
    ytd-banner-promo-renderer-background,
    ytd-player-legacy-desktop-watch-ads-renderer,
    ytd-companion-slot-renderer,
    #player-ads {
        display: none !important;
    }
`;
document.head.appendChild(style);

setInterval(() => {
    // Continuously check URL to adapt shorts visibility dynamically for SPA navigation
    evaluateShortsVisibility();

    // List of CSS selectors for various skip ad and close overlay buttons
    const skipButtonSelectors = [
        ".videoAdUiSkipButton",
        ".ytp-ad-skip-button",
        ".ytp-ad-skip-button-modern",
        ".ytp-skip-ad-button",
        ".ytp-ad-overlay-close-button",
        ".ytp-ad-skip-button-slot button", // Specifically catches survey skip buttons
        ".ytp-ad-survey-answer-button" // Auto-clicks an answer to instantly jump past surveys
    ];

    // Click all skip and close buttons found
    skipButtonSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] && typeof elements[i].click === "function") {
                elements[i].click();
            }
        }
    });

    // Strategy for unskippable video ads: accelerate and skip to end
    const adPlayer = document.querySelector('.ad-showing video');
    if (adPlayer && !isNaN(adPlayer.duration)) {
        adPlayer.playbackRate = 16.0;
        adPlayer.currentTime = adPlayer.duration || 0;
    }

    // Remove static ad banners and sponsored feed items
    const staticAdSelectors = [
        "ytd-statement-banner-renderer",
        "ytd-ad-slot-renderer",
        "ytd-in-feed-ad-layout-renderer",
        "ytd-banner-promo-renderer-background",
        "ytd-player-legacy-desktop-watch-ads-renderer",
        "ytd-companion-slot-renderer",
        "#player-ads"
    ];

    staticAdSelectors.forEach(selector => {
        const adElements = document.querySelectorAll(selector);
        for (let i = 0; i < adElements.length; i++) {
            // Remove the parent rich-item-renderer if it exists to avoid leaving an empty gap in the video feed
            const container = adElements[i].closest("ytd-rich-item-renderer");
            if (container) {
                container.remove();
            } else {
                adElements[i].remove();
            }
        }
    });

}, 500); // Check every 500ms
