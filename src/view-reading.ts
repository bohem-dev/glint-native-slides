import { MarkdownRenderChild, TFile, App } from 'obsidian';

export class PptxRenderChild extends MarkdownRenderChild {
    constructor(containerEl: HTMLElement, public file: TFile, public app: App) {
        super(containerEl);
    }
    async onload() {
        // Currently empty
    }
}