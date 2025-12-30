import { Plugin } from 'obsidian';
import { PptxView, VIEW_TYPE_PPTX } from './view-full';

export default class PptxPlugin extends Plugin {
    onload() {
        // 1. Register Full Page View
        this.registerView(VIEW_TYPE_PPTX, (leaf) => new PptxView(leaf));
        
        // 2. Register the extension to open .pptx files
        this.registerExtensions(["pptx"], VIEW_TYPE_PPTX);
    }

    onunload() {

    }
}