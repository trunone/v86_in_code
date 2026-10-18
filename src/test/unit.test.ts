import * as assert from 'assert';
import { OS_PRESETS } from '../osProfiles';
import { getWebviewContent } from '../webviewHtml';

describe('v86 Extension Unit Tests', () => {
    describe('OS Profiles & Presets', () => {
        it('should have Arch Linux as default preset', () => {
            assert.strictEqual(OS_PRESETS.archlinux.id, 'archlinux');
            assert.strictEqual(OS_PRESETS.archlinux.name, 'Arch Linux x86');
            assert.ok(OS_PRESETS.archlinux.initialStateUrl);
        });

        it('should contain preset profiles for alpine, freedos, kolibrios, and custom', () => {
            assert.ok(OS_PRESETS.alpine);
            assert.ok(OS_PRESETS.freedos);
            assert.ok(OS_PRESETS.kolibrios);
            assert.ok(OS_PRESETS.custom);
        });
    });

    describe('Webview Content Generator', () => {
        it('should generate valid webview HTML containing libv86 script and OS configuration', () => {
            const mockWebview: any = {
                cspSource: 'https://test-csp-source',
                asWebviewUri: (uri: any) => uri
            };

            const html = getWebviewContent(mockWebview, {
                biosUrl: 'https://test/seabios.bin',
                vgaBiosUrl: 'https://test/vgabios.bin',
                wasmUrl: 'https://test/v86.wasm',
                libv86Url: 'https://test/libv86.js',
                osConfig: OS_PRESETS.archlinux,
                allPresets: OS_PRESETS,
                memoryMB: 512,
                vgaMemoryMB: 8
            });

            assert.ok(html.includes('<!DOCTYPE html>'));
            assert.ok(html.includes('src="https://test/libv86.js"'));
            assert.ok(html.includes('Arch Linux x86'));
            assert.ok(html.includes('V86Starter'));
            assert.ok(html.includes('switchOS'));
        });
    });
});
