import * as vscode from 'vscode';
import { V86Panel } from './v86Panel';
import { OS_PRESETS } from './osProfiles';

export function activate(context: vscode.ExtensionContext) {
    console.log('v86 x86 Emulator extension activated.');

    const startCommand = vscode.commands.registerCommand('v86.start', () => {
        V86Panel.createOrShow(context.extensionUri);
    });

    const switchOSCommand = vscode.commands.registerCommand('v86.switchOS', async () => {
        const items = Object.values(OS_PRESETS).map(preset => ({
            label: preset.name,
            description: preset.description,
            id: preset.id
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select Operating System to launch in v86 emulator'
        });

        if (selected) {
            V86Panel.createOrShow(context.extensionUri, selected.id);
        }
    });

    const restartCommand = vscode.commands.registerCommand('v86.restart', () => {
        if (V86Panel.currentPanel) {
            V86Panel.currentPanel.restart();
        } else {
            V86Panel.createOrShow(context.extensionUri);
        }
    });

    const stopCommand = vscode.commands.registerCommand('v86.stop', () => {
        if (V86Panel.currentPanel) {
            V86Panel.currentPanel.stop();
        }
    });

    context.subscriptions.push(startCommand, switchOSCommand, restartCommand, stopCommand);
}

export function deactivate() {}
