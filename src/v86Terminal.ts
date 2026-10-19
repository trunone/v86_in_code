import * as vscode from 'vscode';

export class V86Terminal implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    public onDidWrite: vscode.Event<string> = this.writeEmitter.event;

    private closeEmitter = new vscode.EventEmitter<number>();
    public onDidClose?: vscode.Event<number> = this.closeEmitter.event;

    private onInputDataCallback?: (data: string) => void;

    public setOnInput(callback: (data: string) => void) {
        this.onInputDataCallback = callback;
    }

    public handleSerialOutput(data: string) {
        // Convert LF to CRLF for VS Code terminal rendering
        const formatted = data.replace(/\r?\n/g, '\r\n');
        this.writeEmitter.fire(formatted);
    }

    public open(_initialDimensions: vscode.TerminalDimensions | undefined): void {
        this.writeEmitter.fire('\r\n--- v86 Serial Terminal Connected ---\r\n');
    }

    public close(): void {
        this.closeEmitter.fire(0);
    }

    public handleInput(data: string): void {
        if (this.onInputDataCallback) {
            this.onInputDataCallback(data);
        }
    }
}
