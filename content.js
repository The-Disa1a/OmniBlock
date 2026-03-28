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

// Helper to increment extension stats locally
function incrementCounter(type) {
    if (!chrome.runtime?.id) return;
    try {
        chrome.storage.local.get([type], function(result) {
            if (chrome.runtime.lastError) return;
            const count = (result[type] || 0) + 1;
            chrome.storage.local.set({ [type]: count });
        });
    } catch (e) {
        // Suppress invalid context errors
    }
}

// Inject CSS to instantly hide ads before JS removes them
const style = document.createElement('style');
style.textContent = `
    ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
    ytd-rich-item-renderer:has(ytd-in-feed-ad-layout-renderer),
    ytd-statement-banner-renderer,
    ytd-banner-promo-renderer-background,
    ytd-player-legacy-desktop-watch-ads-renderer,
    ytd-companion-slot-renderer,
    ytd-popup-container:has(ytd-enforcement-message-view-model),
    ytd-brand-video-shelf-renderer,
    yt-slimline-survey-view-model,
    #player-ads {
        display: none !important;
    }
`;
document.head.appendChild(style);

const mainLoopId = setInterval(() => {
    // If extension was reloaded/updated, the old content script's context is dead. Stop the loop.
    if (!chrome.runtime?.id) {
        clearInterval(mainLoopId);
        return;
    }

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
        ".ytp-ad-survey-answer-button", // Auto-clicks an answer to instantly jump past surveys
        "ytd-enforcement-message-view-model .yt-spec-button-shape-next[aria-label='Close']" // Dismisses enforcement dialogs
    ];

    // Click all skip and close buttons found
    skipButtonSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] && typeof elements[i].click === "function") {
                console.log("Clicked:", selector);
                
                if (selector.includes("ytd-enforcement-message-view-model")) {
                    // Start video by clicking the Youtube play button to avoid state-machine errors
                    setTimeout(() => {
                        const playBtn = document.querySelector('.ytp-play-button');
                        if (playBtn && (playBtn.getAttribute('aria-label') || '').includes('Play')) {
                            console.log("Auto-resuming via play button");
                            playBtn.click();
                        } else {
                            const video = document.querySelector('video');
                            if (video && video.paused) {
                                console.log("Auto-resuming via HTML5 video element");
                                video.play().catch(e => console.log(e));
                            }
                        }
                    }, 100);
                } else if (!selector.includes("ytp-ad-overlay-close-button")) {
                    incrementCounter('videoAdsBlocked');
                }
                
                elements[i].click();
            }
        }
    });

    // Strategy for unskippable video ads: accelerate and skip to end without stalling player
    const adPlayer = document.querySelector('.ad-showing video') || document.querySelector('.ad-interrupting video');
    if (adPlayer && adPlayer.duration > 0) {
        if (adPlayer.playbackRate !== 16.0) {
            console.log("Fast-forwarding unskippable ad");
        }
        adPlayer.muted = true;
        adPlayer.playbackRate = 16.0;
        
        // Jump almost to the exact end so YouTube's engine natively fires the 'ad ended' event.
        // If we set it perfectly to duration, YouTube's player sometimes freezes trying to buffer the void.
        if (adPlayer.currentTime < adPlayer.duration - 0.1) {
            adPlayer.currentTime = adPlayer.duration - 0.1;
            // Only increment if we actively jumped the timeline, preventing log spam
            incrementCounter('videoAdsBlocked');
        }
    }

    // Remove static ad banners and sponsored feed items
    const staticAdSelectors = [
        "ytd-statement-banner-renderer",
        "ytd-ad-slot-renderer",
        "ytd-in-feed-ad-layout-renderer",
        "ytd-banner-promo-renderer-background",
        "ytd-player-legacy-desktop-watch-ads-renderer",
        "ytd-companion-slot-renderer",
        "ytd-popup-container:has(ytd-enforcement-message-view-model)",
        "ytd-brand-video-shelf-renderer",
        "yt-slimline-survey-view-model",
        "#player-ads"
    ];

    staticAdSelectors.forEach(selector => {
        const adElements = document.querySelectorAll(selector);
        for (let i = 0; i < adElements.length; i++) {
            if (selector.includes("ytd-enforcement-message-view-model")) {
                console.log("Bypassed enforcement popup via static DOM deletion");
                adElements[i].remove();
                
                setTimeout(() => {
                    const playBtn = document.querySelector('.ytp-play-button');
                    if (playBtn && (playBtn.getAttribute('aria-label') || '').includes('Play')) {
                        console.log("Auto-resuming via play button");
                        playBtn.click();
                    } else {
                        const video = document.querySelector('video');
                        if (video && video.paused) {
                            console.log("Auto-resuming via HTML5 video element");
                            video.play().catch(e => console.log(e));
                        }
                    }
                }, 100);
                continue;
            }

            const isHome = selector.includes("in-feed") || selector.includes("promo-renderer") || selector.includes("ytd-ad-slot-renderer") || selector.includes("ytd-brand-video-shelf-renderer");

            // Remove the parent rich-item-renderer if it exists to avoid leaving an empty gap in the video feed
            const container = adElements[i].closest("ytd-rich-item-renderer");
            if (container) {
                console.log("Removed ad container:", selector);
                container.remove();
                incrementCounter('homeAdsBlocked');
            } else {
                console.log("Removed ad element:", selector);
                adElements[i].remove();
                if (isHome) incrementCounter('homeAdsBlocked');
                else incrementCounter('sideBarAdsBlocked');
            }
        }
    });

}, 500); // Check every 500ms
