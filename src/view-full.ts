import { FileView, WorkspaceLeaf, TFile } from 'obsidian';
import { init } from 'pptx-preview';

export const VIEW_TYPE_PPTX = "pptx-view";

export class PptxView extends FileView {
    previewer: any;
    wrapperEl: HTMLElement | null = null;
    loaderEl: HTMLElement | null = null;
    
    baseWidth = 1200; 
    currentZoom = 1.0; 

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.navigation = true; 
    }

    getViewType() { return VIEW_TYPE_PPTX; }
    getDisplayText() { return this.file ? this.file.basename : "Glint Native Slides"; }

    async onOpen() {
        this.contentEl.empty();
        this.contentEl.addClass("pptx-view-workspace");
        
        this.createLoader();
        this.wrapperEl = this.contentEl.createDiv({ cls: 'pptx-viewer-container' });
        
        // Zoom Handler
        this.contentEl.addEventListener("wheel", (evt) => {
            if (evt.ctrlKey) {
                evt.preventDefault();
                let delta = 0;
                
                if (Math.abs(evt.deltaY) > 50) {
                     delta = evt.deltaY > 0 ? -0.1 : 0.1;
                } else {
                     delta = -evt.deltaY / 200;
                }

                const oldZoom = this.currentZoom;
                let newZoom = oldZoom + delta;
                if (newZoom < 0.1) newZoom = 0.1;
                if (newZoom > 5.0) newZoom = 5.0;

                const rect = this.contentEl.getBoundingClientRect();
                const mouseX = evt.clientX - rect.left;
                const mouseY = evt.clientY - rect.top;
                
                const startScrollLeft = this.contentEl.scrollLeft;
                const startScrollTop = this.contentEl.scrollTop;

                const ratio = newZoom / oldZoom;
                const newScrollLeft = (startScrollLeft + mouseX) * ratio - mouseX;
                const newScrollTop = (startScrollTop + mouseY) * ratio - mouseY;

                this.currentZoom = newZoom;
                this.applyZoom();
                
                this.contentEl.scrollLeft = newScrollLeft;
                this.contentEl.scrollTop = newScrollTop;
            }
        }, { passive: false });

        const height = (this.baseWidth * 9) / 16;
        this.previewer = init(this.wrapperEl, { 
            width: this.baseWidth, 
            height: height
        });

        this.registerDomEvent(window, 'resize', () => {});
    }

    createLoader() {
        this.loaderEl = this.contentEl.createDiv({ cls: 'pptx-loader-overlay' });
        const wrapper = this.loaderEl.createDiv({ cls: 'pptx-glass-wrapper' });
        
        wrapper.createDiv({ cls: 'pptx-liquid-blob' });
        
        const card = wrapper.createDiv({ cls: 'pptx-glass-card' });
        for(let i=0; i<5; i++) {
            card.createDiv({ cls: 'pptx-glass-line' });
        }
        
        this.loaderEl.createDiv({ cls: 'pptx-loading-text', text: "Loading Slides..." });
    }

    showLoader() {
        if (this.loaderEl && this.wrapperEl) {
            // FADE IN
            this.loaderEl.addClass("active");
            // Hide content visually
            this.wrapperEl.addClass("hidden");
        }
    }

    hideLoader() {
        if (this.loaderEl && this.wrapperEl) {
            // FADE OUT
            this.loaderEl.removeClass("active");
            // Show content
            this.wrapperEl.removeClass("hidden");
        }
    }

    async onLoadFile(file: TFile) {
        this.showLoader();

        // Wait for fade in
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const buffer = await this.app.vault.readBinary(file);
            
            await this.previewer.preview(buffer);
            this.fitToScreen();
            
            // FADE OUT SEQUENCE (Restored)
            setTimeout(() => {
                this.hideLoader();
            }, 200);

        } catch (e) {
            console.error("PPTX Render Error:", e);
            this.hideLoader(); 
        }
        return super.onLoadFile(file);
    }

    fitToScreen() {
        if (!this.wrapperEl) return;
        const availableWidth = this.contentEl.clientWidth - 40; 
        this.currentZoom = availableWidth / this.baseWidth;
        if (this.currentZoom > 1.2) this.currentZoom = 1.0; 
        if (this.currentZoom < 0.1) this.currentZoom = 0.1;
        this.applyZoom();
    }

    applyZoom() {
        if (this.wrapperEl) {
            (this.wrapperEl.style as any).zoom = this.currentZoom.toString();
        }
    }

    async onClose() {
        this.contentEl.empty();
    }
}