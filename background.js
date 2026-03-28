chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['blockTelemetry'], (res) => {
        // Default telemetry blocking to true
        if (res.blockTelemetry === false) {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ["ad_block_rules"]
            });
        } else {
            chrome.storage.local.set({ blockTelemetry: true });
        }
    });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.blockTelemetry) {
        if (changes.blockTelemetry.newValue) {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ["ad_block_rules"]
            });
        } else {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ["ad_block_rules"]
            });
        }
    }
});
