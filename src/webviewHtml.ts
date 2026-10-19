import * as vscode from 'vscode';

export function getWebviewContent(
    webview: vscode.Webview,
    config: {
        biosUrl: string;
        vgaBiosUrl: string;
        wasmUrl: string;
        libv86Url: string;
        osConfig: any;
        allPresets: any;
        memoryMB: number;
        vgaMemoryMB: number;
    }
): string {
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data: blob: https:; script-src ${webview.cspSource} 'unsafe-eval' 'unsafe-inline' https:; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; connect-src ${webview.cspSource} https: data: blob:; worker-src ${webview.cspSource} blob:;">
    <title>v86 Emulator</title>
    <style>
        :root {
            --vscode-bg: var(--vscode-editor-background, #1e1e1e);
            --vscode-fg: var(--vscode-editor-foreground, #d4d4d4);
            --vscode-card-bg: var(--vscode-sideBar-background, #252526);
            --vscode-border: var(--vscode-panel-border, #3c3c3c);
            --vscode-accent: var(--vscode-button-background, #0e639c);
            --vscode-accent-hover: var(--vscode-button-hoverBackground, #1177bb);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--vscode-bg);
            color: var(--vscode-fg);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
        }

        header.toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: var(--vscode-card-bg);
            border-bottom: 1px solid var(--vscode-border);
            padding: 8px 16px;
            gap: 12px;
            flex-wrap: wrap;
        }

        .toolbar-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .title-badge {
            font-weight: bold;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #888;
            display: inline-block;
            transition: background-color 0.3s;
        }

        .status-dot.running { background-color: #4ec9b0; }
        .status-dot.paused { background-color: #ce9178; }
        .status-dot.error { background-color: #f14c4c; }
        .status-dot.loading { background-color: #cca700; }

        select, button, input {
            background-color: var(--vscode-bg);
            color: var(--vscode-fg);
            border: 1px solid var(--vscode-border);
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            outline: none;
        }

        select:hover, button:hover {
            border-color: var(--vscode-accent);
        }

        button.primary {
            background-color: var(--vscode-accent);
            color: #ffffff;
            border: none;
        }

        button.primary:hover {
            background-color: var(--vscode-accent-hover);
        }

        #screen-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #000;
            position: relative;
            overflow: auto;
            min-height: 200px;
            outline: none;
            cursor: pointer;
        }

        #screen-container:focus {
            box-shadow: inset 0 0 0 2px var(--vscode-accent);
        }

        #screen-container canvas {
            display: block;
            image-rendering: pixelated;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            outline: none;
        }

        #text-screen {
            font-family: "Courier New", Courier, monospace;
            white-space: pre;
            line-height: 1.1;
            font-size: 14px;
            color: #aaa;
            background: #000;
            padding: 10px;
            overflow: auto;
            width: 100%;
            height: 100%;
            display: none;
        }

        .overlay-status {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85);
            padding: 20px 30px;
            border-radius: 8px;
            border: 1px solid var(--vscode-border);
            text-align: center;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            z-index: 10;
            min-width: 280px;
        }

        .spinner {
            width: 28px;
            height: 28px;
            border: 3px solid rgba(255,255,255,0.2);
            border-top-color: var(--vscode-accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .progress-bar-container {
            width: 100%;
            height: 8px;
            background-color: #333;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
            display: none;
        }

        .progress-bar {
            height: 100%;
            width: 0%;
            background-color: var(--vscode-accent);
            transition: width 0.2s ease;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        footer.statusbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: var(--vscode-card-bg);
            border-top: 1px solid var(--vscode-border);
            padding: 4px 12px;
            font-size: 0.8rem;
            color: #888;
        }
    </style>
</head>
<body>
    <header class="toolbar">
        <div class="toolbar-group">
            <span class="title-badge">
                <span id="status-dot" class="status-dot loading"></span>
                <span id="status-text">Initializing...</span>
            </span>
        </div>

        <div class="toolbar-group">
            <label for="os-select" style="font-size: 0.85rem;">OS:</label>
            <select id="os-select">
                ${Object.values(config.allPresets).map((preset: any) => `
                    <option value="${preset.id}" ${preset.id === config.osConfig.id ? 'selected' : ''}>
                        ${preset.name}
                    </option>
                `).join('')}
            </select>

            <button id="btn-play-pause" title="Play / Pause">Pause</button>
            <button id="btn-restart" title="Restart Emulator">Restart</button>
            <button id="btn-screenshot" title="Take Screenshot">Screenshot</button>
            <button id="btn-fullscreen" title="Toggle Fullscreen">Fullscreen</button>
        </div>
    </header>

    <div id="screen-container" tabindex="0" title="Click to focus emulator for keyboard input">
        <div id="overlay-status" class="overlay-status">
            <div class="spinner" id="overlay-spinner"></div>
            <div id="overlay-text">Loading v86 x86 Emulator & OS image...</div>
            <div class="progress-bar-container" id="progress-container">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
        </div>
        <!-- Canvas inserted dynamically by v86 -->
        <div id="text-screen"></div>
    </div>

    <footer class="statusbar">
        <span id="info-os">OS: ${config.osConfig.name} (Click screen to type)</span>
        <span id="info-mem">RAM: ${config.memoryMB} MB | VGA RAM: ${config.vgaMemoryMB} MB</span>
    </footer>

    <script nonce="${nonce}">
        // Ensure module and exports are undefined in Webview scope so libv86 attaches to window
        window._savedModule = window.module;
        window._savedExports = window.exports;
        window.module = undefined;
        window.exports = undefined;
    </script>
    <script src="${config.libv86Url}"></script>
    <script nonce="${nonce}">
        // Restore module / exports if necessary
        window.module = window._savedModule;
        window.exports = window._savedExports;

        // Ensure both V86Starter and V86 constructor aliases exist
        if (typeof window.V86Starter === 'undefined' && typeof window.V86 === 'function') {
            window.V86Starter = window.V86;
        }
        if (typeof window.V86 === 'undefined' && typeof window.V86Starter === 'function') {
            window.V86 = window.V86Starter;
        }

        const vscode = acquireVsCodeApi();

        const biosUrl = "${config.biosUrl}";
        const vgaBiosUrl = "${config.vgaBiosUrl}";
        const wasmUrl = "${config.wasmUrl}";
        const currentOsConfig = ${JSON.stringify(config.osConfig)};
        const memoryMB = ${config.memoryMB};
        const vgaMemoryMB = ${config.vgaMemoryMB};

        let emulator = null;
        let isRunning = false;

        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const overlayStatus = document.getElementById('overlay-status');
        const overlayText = document.getElementById('overlay-text');
        const overlaySpinner = document.getElementById('overlay-spinner');
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        const osSelect = document.getElementById('os-select');
        const btnPlayPause = document.getElementById('btn-play-pause');
        const btnRestart = document.getElementById('btn-restart');
        const btnScreenshot = document.getElementById('btn-screenshot');
        const btnFullscreen = document.getElementById('btn-fullscreen');
        const screenContainer = document.getElementById('screen-container');

        // Focus screen container automatically on click or load
        screenContainer.addEventListener('click', () => {
            screenContainer.focus();
        });

        // Prevent VS Code webview key bindings from intercepting emulator keystrokes when focused
        window.addEventListener('keydown', (e) => {
            if (document.activeElement === screenContainer || screenContainer.contains(document.activeElement) || document.activeElement === document.body) {
                // Prevent browser / VS Code default hotkey actions like Tab navigation or scrolling
                if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                    e.preventDefault();
                }
            }
        }, true);

        function setStatus(state, message) {
            statusDot.className = 'status-dot ' + state;
            statusText.textContent = message;
        }

        function showOverlay(message, showSpinner = true, progressPercent = null) {
            overlayStatus.style.display = 'flex';
            overlayText.textContent = message;
            overlaySpinner.style.display = showSpinner ? 'block' : 'none';

            if (progressPercent !== null && progressPercent >= 0) {
                progressContainer.style.display = 'block';
                progressBar.style.width = Math.min(100, Math.max(0, progressPercent)) + '%';
            } else {
                progressContainer.style.display = 'none';
            }
        }

        function hideOverlay() {
            overlayStatus.style.display = 'none';
        }

        function initEmulator() {
            setStatus('loading', 'Loading OS Image...');
            showOverlay('Booting ' + currentOsConfig.name + '...', true, 0);

            // Clear previous canvas if any
            const existingCanvas = screenContainer.querySelector('canvas');
            if (existingCanvas) {
                existingCanvas.remove();
            }

            const emulatorOptions = {
                wasm_path: wasmUrl,
                memory_size: memoryMB * 1024 * 1024,
                vga_memory_size: vgaMemoryMB * 1024 * 1024,
                screen_container: screenContainer,
                bios: { url: biosUrl },
                vga_bios: { url: vgaBiosUrl },
                autostart: true
            };

            if (currentOsConfig.initialStateUrl) {
                emulatorOptions.initial_state = { url: currentOsConfig.initialStateUrl };
            } else if (currentOsConfig.bzimageUrl) {
                emulatorOptions.bzimage = { url: currentOsConfig.bzimageUrl };
                if (currentOsConfig.initrdUrl) {
                    emulatorOptions.initrd = { url: currentOsConfig.initrdUrl };
                }
                if (currentOsConfig.cmdline) {
                    emulatorOptions.cmdline = currentOsConfig.cmdline;
                }
            } else if (currentOsConfig.cdromUrl) {
                emulatorOptions.cdrom = { url: currentOsConfig.cdromUrl };
            } else if (currentOsConfig.fdaUrl) {
                emulatorOptions.fda = { url: currentOsConfig.fdaUrl };
            } else if (currentOsConfig.hdaUrl) {
                emulatorOptions.hda = { url: currentOsConfig.hdaUrl };
            }

            try {
                const V86Constructor = window.V86Starter || window.V86;
                if (typeof V86Constructor !== 'function') {
                    throw new Error("V86Starter/V86 constructor is not available on window.");
                }

                emulator = new V86Constructor(emulatorOptions);

                emulator.add_listener("emulator-ready", function() {
                    setStatus('running', 'Running');
                    hideOverlay();
                    isRunning = true;
                    btnPlayPause.textContent = 'Pause';
                    screenContainer.focus();
                });

                emulator.add_listener("emulator-loaded", function() {
                    setStatus('running', 'Running');
                    hideOverlay();
                    isRunning = true;
                    btnPlayPause.textContent = 'Pause';
                    screenContainer.focus();
                });

                emulator.add_listener("download-progress", function(e) {
                    if (e && e.loaded && e.total) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        const fileLabel = e.file_name ? e.file_name.split('/').pop() : 'OS components';
                        showOverlay('Loading ' + fileLabel + '... (' + percent + '%)', true, percent);
                    } else if (e && e.loaded) {
                        const mbLoaded = (e.loaded / (1024 * 1024)).toFixed(1);
                        showOverlay('Loading OS components... (' + mbLoaded + ' MB)', true);
                    }
                });

                emulator.add_listener("download-error", function(e) {
                    setStatus('error', 'Download Failed');
                    showOverlay('Failed to download OS image files. Check internet connection or file path.', false);
                });

            } catch (err) {
                console.error("Failed to start v86 emulator:", err);
                setStatus('error', 'Initialization Error');
                showOverlay('Error starting v86 emulator: ' + err.message, false);
            }
        }

        // Controls
        btnPlayPause.addEventListener('click', () => {
            if (!emulator) return;
            if (isRunning) {
                emulator.stop();
                isRunning = false;
                setStatus('paused', 'Paused');
                btnPlayPause.textContent = 'Resume';
            } else {
                emulator.run();
                isRunning = true;
                setStatus('running', 'Running');
                btnPlayPause.textContent = 'Pause';
                screenContainer.focus();
            }
        });

        btnRestart.addEventListener('click', () => {
            if (emulator) {
                emulator.restart();
                setStatus('running', 'Running');
                screenContainer.focus();
            } else {
                initEmulator();
            }
        });

        btnScreenshot.addEventListener('click', () => {
            if (!emulator) return;
            try {
                const img = emulator.screen_make_screenshot();
                if (img && img.src) {
                    const link = document.createElement('a');
                    link.download = 'v86-screenshot.png';
                    link.href = img.src;
                    link.click();
                }
            } catch (e) {
                console.error("Screenshot error:", e);
            }
        });

        btnFullscreen.addEventListener('click', () => {
            if (screenContainer.requestFullscreen) {
                screenContainer.requestFullscreen();
            }
        });

        osSelect.addEventListener('change', (e) => {
            const selectedOS = e.target.value;
            vscode.postMessage({ command: 'switchOS', osId: selectedOS });
        });

        // Listen for messages from extension host
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'restart':
                    if (emulator) {
                        emulator.restart();
                        screenContainer.focus();
                    }
                    break;
                case 'stop':
                    if (emulator && isRunning) {
                        emulator.stop();
                        isRunning = false;
                        setStatus('paused', 'Paused');
                        btnPlayPause.textContent = 'Resume';
                    }
                    break;
            }
        });

        // Initialize emulator on load
        initEmulator();
    </script>
</body>
</html>`;
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
