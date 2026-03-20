# OmniBlock
A fast, lightweight, and customizable ad-blocking extension designed to give you complete control over your web experience. **Currently fully supporting YouTube**, OmniBlock is architected to soon scale into a universal content blocker for all websites.

## Current YouTube Features

### Seamless Ad Interception
* **Zero-Wait Auto-Skipping:** Detects and instantly clicks "Skip Ad" buttons across the YouTube player without you having to lift a finger.
* **Instant Survey Bypassing:** Automatically intercepts and answers intrusive YouTube player surveys so your content resumes without delay. 
* **Unskippable Ad Fast-Forwarding:** When confronted with unskippable video ads, OmniBlock accelerates the video speed to 16x and jumps right to the end.

### Clutter Eradication
* **Static Banners & Popups:** Finds and silently deletes promotional banners and embedded ad slots without leaving ugly pixel gaps on the page.
* **Responsive Feed Cleansing:** Strips out sponsored video posts from your YouTube feeds, collapsing the empty space to keep your layout naturally flowing.
* **Companion Ad Deletion:** Removes sidebar ads that hijack your recommendations column, restoring your suggested videos back where they belong.
* **Inline Previews De-Ghosted:** Using advanced CSS `:has()` selector injection, ads are obliterated so fast they can never be hovered over by accident, fixing annoying "ghost playback" bugs.

### Smart Customization
* **Context-Aware Shorts Toggling:** Features a sleek popup control panel that lets you banish distracting "Shorts" carousels. The blocker is intelligent enough to hide them purely from your Home and Watch feeds, while still letting you view them when explicitly browsing a creator's channel or searching.
* **Native Storage State:** Remembers your preferences securely using native Chrome extension storage APIs.

## Coming Soon (Other Sites)
* **General Web Support:** Full ad blocking support for all other websites is coming in an upcoming release!
* Custom filter list support (EasyList, uBlock filters).
* Element-picker UI to manually zap stubborn divs.

## Installation
1. Navigate to `chrome://extensions/` in your browser.
2. Toggle on **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the OmniBlock directory.
4. Pin the extension to your toolbar to easily access the quick-settings panel!
