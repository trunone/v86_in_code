import * as vscode from 'vscode';
import * as path from 'path';
import { OS_PRESETS, OSProfile } from './osProfiles';
import { getWebviewContent } from './webviewHtml';

export class V86Panel {
    public static currentPanel: V86Panel | undefined;
    private static readonly viewType = 'v86Emulator';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _currentOSId: string;

    public static createOrShow(extensionUri: vscode.Uri, initialOSId?: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (V86Panel.currentPanel) {
            V86Panel.currentPanel._panel.reveal(column);
            if (initialOSId && initialOSId !== V86Panel.currentPanel._currentOSId) {
                V86Panel.currentPanel.switchOS(initialOSId);
            }
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            V86Panel.viewType,
            'v86 x86 Emulator',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(extensionUri.fsPath, 'media')),
                    vscode.Uri.file(path.join(extensionUri.fsPath, 'bios'))
                ]
            }
        );

        V86Panel.currentPanel = new V86Panel(panel, extensionUri, initialOSId);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, initialOSId?: string) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        const config = vscode.workspace.getConfiguration('v86');
        const defaultOS = config.get<string>('defaultOS') || 'archlinux';
        this._currentOSId = initialOSId || defaultOS;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'switchOS':
                        if (message.osId) {
                            await this.switchOS(message.osId);
                        }
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public async switchOS(osId: string) {
        this._currentOSId = osId;
        this._update();
    }

    public restart() {
        this._panel.webview.postMessage({ command: 'restart' });
    }

    public stop() {
        this._panel.webview.postMessage({ command: 'stop' });
    }

    private getOSProfile(osId: string): OSProfile {
        if (osId === 'custom') {
            const config = vscode.workspace.getConfiguration('v86');
            const customImage = config.get<any>('customImage') || {};
            return {
                ...OS_PRESETS.custom,
                cdromPath: customImage.cdromUrl || customImage.cdromPath || undefined,
                fdaPath: customImage.fdaUrl || customImage.fdaPath || undefined,
                hdaPath: customImage.hdaUrl || customImage.hdaPath || undefined
            };
        }
        return OS_PRESETS[osId] || OS_PRESETS.archlinux;
    }

    private resolveUri(relativePath?: string): string | undefined {
        if (!relativePath) {
            return undefined;
        }
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
        }
        const fileUri = vscode.Uri.file(path.join(this._extensionUri.fsPath, relativePath));
        return this._panel.webview.asWebviewUri(fileUri).toString();
    }

    private _update() {
        const webview = this._panel.webview;
        const osProfile = this.getOSProfile(this._currentOSId);

        const config = vscode.workspace.getConfiguration('v86');
        const memoryMB = osProfile.memoryMB || config.get<number>('memoryMB') || 512;
        const vgaMemoryMB = osProfile.vgaMemoryMB || config.get<number>('vgaMemoryMB') || 8;

        const biosUri = webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionUri.fsPath, 'bios', 'seabios.bin')));
        const vgaBiosUri = webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionUri.fsPath, 'bios', 'vgabios.bin')));
        const wasmUri = webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionUri.fsPath, 'bios', 'v86.wasm')));
        const libv86Uri = webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionUri.fsPath, 'media', 'libv86.js')));

        const osConfigResolved = {
            ...osProfile,
            initialStateUrl: this.resolveUri(osProfile.initialStatePath),
            cdromUrl: this.resolveUri(osProfile.cdromPath),
            fdaUrl: this.resolveUri(osProfile.fdaPath),
            hdaUrl: this.resolveUri(osProfile.hdaPath),
            bzimageUrl: this.resolveUri(osProfile.bzimagePath),
            initrdUrl: this.resolveUri(osProfile.initrdPath)
        };

        this._panel.title = `v86: ${osProfile.name}`;

        this._panel.webview.html = getWebviewContent(
            webview,
            {
                biosUrl: biosUri.toString(),
                vgaBiosUrl: vgaBiosUri.toString(),
                wasmUrl: wasmUri.toString(),
                libv86Url: libv86Uri.toString(),
                osConfig: osConfigResolved,
                allPresets: OS_PRESETS,
                memoryMB,
                vgaMemoryMB
            }
        );
    }

    public dispose() {
        V86Panel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
