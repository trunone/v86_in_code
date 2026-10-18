import * as assert from 'assert';
import * as vscode from 'vscode';

describe('v86 Extension Integration Tests', () => {
    it('should register all v86 commands in VS Code extension host', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('v86.start'), 'v86.start command registered');
        assert.ok(commands.includes('v86.switchOS'), 'v86.switchOS command registered');
        assert.ok(commands.includes('v86.restart'), 'v86.restart command registered');
        assert.ok(commands.includes('v86.stop'), 'v86.stop command registered');
    });

    it('should have correct default workspace configuration for v86', () => {
        const config = vscode.workspace.getConfiguration('v86');
        assert.strictEqual(config.get('defaultOS'), 'archlinux');
        assert.strictEqual(config.get('memoryMB'), 512);
        assert.strictEqual(config.get('vgaMemoryMB'), 8);
    });
});
