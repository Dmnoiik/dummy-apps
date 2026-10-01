/**
 * ATELIER // STUDIO — Professional Pixel Art & Canvas Studio
 * Multi-layer Canvas & Pixel Engine
 */

(function () {
  'use strict';

  // --- Curated Color Palettes ---
  const PALETTES = {
    cyberpunk: [
      '#0e1118', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b',
      '#ef4444', '#3b82f6', '#f43f5e', '#a855f7', '#14b8a6', '#ffffff'
    ],
    pico8: [
      '#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f',
      '#c2c3c7', '#fff1e8', '#ff004d', '#ffa300', '#ffec27', '#00e436'
    ],
    sunset: [
      '#2d1b4e', '#59296e', '#88397a', '#b74c7e', '#df657c', '#f58778',
      '#f9ab7c', '#fbcd8d', '#fdedaa', '#9bd3cb', '#61a8a8', '#386a7b'
    ],
    monochrome: [
      '#0f380f', '#306230', '#8bac0f', '#9bbc0f', '#081820', '#346856',
      '#88c070', '#e0f8d0', '#222222', '#555555', '#aaaaaa', '#ffffff'
    ]
  };

  const MAX_HISTORY = 20;

  class AtelierPixelStudio {
    constructor() {
      this.gridSize = 16;
      this.activeTool = 'pen'; // 'pen' | 'eraser' | 'fill' | 'dropper' | 'line' | 'rect'
      this.activeColor = '#8b5cf6';
      this.recentColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

      // Drawing drag state
      this.isDrawing = false;
      this.dragStartX = 0;
      this.dragStartY = 0;

      // Layer System: Array<{ id, name, visible, opacity, pixels: Array<Array<string|null>> }>
      this.layers = [];
      this.activeLayerId = null;

      // History stack
      this.history = [];
      this.historyIndex = 0;

      // Export Modal State
      this.exportScale = 1;

      this.cacheDom();
      this.init();
    }

    cacheDom() {
      this.dom = {
        // Top Toolbar
        resButtons: document.querySelectorAll('.res-btn'),
        btnUndo: document.getElementById('btnUndo'),
        btnRedo: document.getElementById('btnRedo'),
        btnExportModal: document.getElementById('btnExportModal'),

        // Tools
        toolButtons: document.querySelectorAll('.tool-btn'),
        paletteSelect: document.getElementById('paletteSelect'),
        activeColorPreview: document.getElementById('activeColorPreview'),
        nativeColorPicker: document.getElementById('nativeColorPicker'),
        hexColorInput: document.getElementById('hexColorInput'),
        paletteSwatches: document.getElementById('paletteSwatches'),
        recentSwatches: document.getElementById('recentSwatches'),

        // Canvas
        canvasContainer: document.getElementById('canvasContainer'),
        pixelCanvas: document.getElementById('pixelCanvas'),
        gridOverlay: document.getElementById('gridOverlay'),
        cursorCoordDisplay: document.getElementById('cursorCoordDisplay'),
        checkShowGrid: document.getElementById('checkShowGrid'),
        btnClearCanvas: document.getElementById('btnClearCanvas'),

        // Layers
        btnAddLayer: document.getElementById('btnAddLayer'),
        layersList: document.getElementById('layersList'),
        layerOpacityRange: document.getElementById('layerOpacityRange'),
        opacityValDisplay: document.getElementById('opacityValDisplay'),

        // Utilities
        btnTraceSvg: document.getElementById('btnTraceSvg'),
        btnInvertColors: document.getElementById('btnInvertColors'),

        // Export Modal
        exportModal: document.getElementById('exportModal'),
        btnCloseExport: document.getElementById('btnCloseExport'),
        btnCancelExport: document.getElementById('btnCancelExport'),
        exportPreviewCanvas: document.getElementById('exportPreviewCanvas'),
        scalePills: document.querySelectorAll('.scale-btn'),
        checkCrispExport: document.getElementById('checkCrispExport'),
        btnDownloadPng: document.getElementById('btnDownloadPng'),

        // Toast
        toast: document.getElementById('studioToast')
      };
    }

    init() {
      this.bindEvents();
      this.initLayers();
      this.renderPaletteSwatches();
      this.renderRecentSwatches();
      this.compositeLayers();
      this.saveHistoryState();
    }

    // --- Layer Architecture ---
    initLayers() {
      this.layers = [
        {
          id: 'layer_bg',
          name: 'Layer 1 (Base)',
          visible: true,
          opacity: 1.0,
          pixels: this.createEmptyPixelGrid()
        }
      ];
      this.activeLayerId = 'layer_bg';
      this.renderLayersList();
    }

    createEmptyPixelGrid() {
      const grid = [];
      for (let y = 0; y < this.gridSize; y++) {
        const row = [];
        for (let x = 0; x < this.gridSize; x++) {
          row.push(null);
        }
        grid.push(row);
      }
      return grid;
    }

    getActiveLayer() {
      return this.layers.find((l) => l.id === this.activeLayerId) || this.layers[0];
    }

    renderLayersList() {
      this.dom.layersList.innerHTML = '';

      this.layers.forEach((layer) => {
        const item = document.createElement('div');
        item.className = `layer-item ${layer.id === this.activeLayerId ? 'active' : ''}`;
        item.dataset.id = layer.id;

        item.innerHTML = `
          <div class="layer-meta">
            <button type="button" class="layer-eye-btn" title="Toggle Visibility">
              ${layer.visible ? '👁️' : '👁️‍🗨️'}
            </button>
            <span class="layer-name">${layer.name}</span>
          </div>
          <span style="font-size: 0.7rem; color: var(--text-dim);">${Math.round(layer.opacity * 100)}%</span>
        `;

        const eyeBtn = item.querySelector('.layer-eye-btn');
        eyeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          layer.visible = !layer.visible;
          eyeBtn.textContent = layer.visible ? '👁️' : '👁️‍🗨️';
          this.showToast(`${layer.name} visibility: ${layer.visible ? 'ON' : 'OFF'}`);
        });

        item.addEventListener('click', () => {
          this.activeLayerId = layer.id;
          this.dom.layerOpacityRange.value = Math.round(layer.opacity * 100);
          this.dom.opacityValDisplay.textContent = `${Math.round(layer.opacity * 100)}%`;
          this.renderLayersList();
        });

        this.dom.layersList.appendChild(item);
      });
    }

    addNewLayer() {
      const layerNum = this.layers.length + 1;
      const newLayer = {
        id: 'layer_' + Date.now(),
        name: `Layer ${layerNum}`,
        visible: true,
        opacity: 1.0,
        pixels: this.createEmptyPixelGrid()
      };

      this.layers.push(newLayer);
      this.activeLayerId = newLayer.id;
      this.renderLayersList();
      this.compositeLayers();
      this.showToast(`Created new ${newLayer.name}.`);
    }

    // --- Composite Layer Rendering to Canvas ---
    compositeLayers() {
      const canvas = this.dom.pixelCanvas;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const cellW = w / this.gridSize;
      const cellH = h / this.gridSize;

      ctx.clearRect(0, 0, w, h);

      this.layers.forEach((layer) => {
        if (!layer.visible) return;

        ctx.globalAlpha = layer.opacity;

        for (let y = 0; y < this.gridSize; y++) {
          for (let x = 0; x < this.gridSize; x++) {
            const color = layer.pixels[y][x];
            if (color) {
              ctx.fillStyle = color;
              ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
            }
          }
        }
      });

      ctx.globalAlpha = 1.0;
      this.updateGridOverlay();
    }

    updateGridOverlay() {
      if (!this.dom.checkShowGrid.checked) {
        this.dom.gridOverlay.style.display = 'none';
        return;
      }

      this.dom.gridOverlay.style.display = 'block';
      const cellW = 512 / this.gridSize;
      this.dom.gridOverlay.style.backgroundImage = `
        linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
      `;
      this.dom.gridOverlay.style.backgroundSize = `${cellW}px ${cellW}px`;
    }

    // --- Drawing & Tool Actions ---
    getCanvasCoordinates(e) {
      const canvas = this.dom.pixelCanvas;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const x = Math.floor((clientX / canvas.clientWidth) * this.gridSize);
      const y = Math.floor((clientY / canvas.clientHeight) * this.gridSize);

      return { x, y };
    }

    setPixel(x, y, color) {
      if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;
      const layer = this.getActiveLayer();
      layer.pixels[y][x] = color;
    }

    floodFill(x, y, targetColor, fillColor) {
      if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;

      const layer = this.getActiveLayer();
      const currentColor = layer.pixels[y][x];

      if (currentColor !== targetColor) return;

      layer.pixels[y][x] = fillColor;

      this.floodFill(x + 1, y, targetColor, fillColor);
      this.floodFill(x - 1, y, targetColor, fillColor);
      this.floodFill(x, y + 1, targetColor, fillColor);
      this.floodFill(x, y - 1, targetColor, fillColor);
    }

    pickColor(x, y) {
      const canvas = this.dom.pixelCanvas;
      const ctx = canvas.getContext('2d');
      const cellW = canvas.width / this.gridSize;
      const cellH = canvas.height / this.gridSize;

      const pixelX = Math.floor(x * cellW + cellW / 2);
      const pixelY = Math.floor(y * cellH + cellH / 2);
      const p = ctx.getImageData(pixelX, pixelY, 1, 1).data;

      const r = p[0].toString(16);
      const g = p[1].toString(16);
      const b = p[2].toString(16);
      const hex = `#${r}${g}${b}`;

      this.setActiveColor(hex);
      this.showToast(`Picked color: ${hex}`);
    }

    drawLine(x0, y0, x1, y1, color) {
      let dx = Math.abs(x1 - x0);
      let dy = Math.abs(y1 - y0);
      let sx = x0 < x1 ? 1 : -1;
      let sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;

      while (x0 !== x1 || y0 !== y1) {
        this.setPixel(x0, y0, color);
        let e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y0 += sy;
        }
      }
    }

    drawRect(x0, y0, x1, y1, color) {
      const minX = Math.min(x0, x1);
      const maxX = Math.max(x0, x1);
      const minY = Math.min(y0, y1);
      const maxY = Math.max(y0, y1);

      for (let x = minX; x <= maxX; x++) {
        this.setPixel(x, minY, color);
        this.setPixel(x, maxY, color);
      }
      for (let y = minY; y <= maxY; y++) {
        this.setPixel(minX, y, color);
        this.setPixel(maxX, y, color);
      }
    }

    // --- History Stack (Undo / Redo) ---
    saveHistoryState() {
      // Deep copy pixel layers
      const snapshot = this.layers.map((l) => ({
        id: l.id,
        name: l.name,
        visible: l.visible,
        opacity: l.opacity,
        pixels: l.pixels.map((row) => [...row])
      }));

      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(snapshot);
      if (this.history.length > MAX_HISTORY) {
        this.history.shift();
      }
      this.historyIndex = this.history.length - 1;
    }

    undo() {
      if (this.historyIndex <= 0) {
        this.showToast('Nothing to undo.');
        return;
      }

      this.historyIndex = Math.max(0, this.historyIndex - 1);
      const state = this.history[this.historyIndex - 1];

      if (state) {
        this.restoreState(state);
        this.showToast('Undo action restored.');
      }
    }

    redo() {
      if (this.historyIndex >= this.history.length - 1) {
        this.showToast('Nothing to redo.');
        return;
      }

      this.historyIndex++;
      const state = this.history[this.historyIndex];
      if (state) {
        this.restoreState(state);
        this.showToast('Redo action restored.');
      }
    }

    restoreState(snapshot) {
      this.layers = snapshot.map((l) => ({
        id: l.id,
        name: l.name,
        visible: l.visible,
        opacity: l.opacity,
        pixels: l.pixels.map((row) => [...row])
      }));
      this.renderLayersList();
      this.compositeLayers();
    }

    // --- Color Palette Management ---
    setActiveColor(hex) {
      this.activeColor = hex;
      this.dom.activeColorPreview.style.backgroundColor = hex;
      this.dom.nativeColorPicker.value = hex.length === 7 ? hex : '#8b5cf6';
      this.dom.hexColorInput.value = hex;

      this.addRecentColor(hex);
    }

    addRecentColor(hex) {
      this.recentColors.unshift(hex);
      if (this.recentColors.length > 8) {
        this.recentColors.pop();
      }
      this.renderRecentSwatches();
    }

    renderPaletteSwatches() {
      this.dom.paletteSwatches.innerHTML = '';
      const colors = PALETTES[this.dom.paletteSelect.value] || PALETTES.cyberpunk;

      colors.forEach((col) => {
        const item = document.createElement('div');
        item.className = 'swatch-item';
        item.style.backgroundColor = col;
        item.title = col;
        item.addEventListener('click', () => this.setActiveColor(col));
        this.dom.paletteSwatches.appendChild(item);
      });
    }

    renderRecentSwatches() {
      this.dom.recentSwatches.innerHTML = '';
      this.recentColors.forEach((col) => {
        const item = document.createElement('div');
        item.className = 'swatch-item';
        item.style.backgroundColor = col;
        item.title = col;
        item.addEventListener('click', () => this.setActiveColor(col));
        this.dom.recentSwatches.appendChild(item);
      });
    }

    // --- Canvas Grid Resolution Switcher ---
    setGridSize(size) {
      this.gridSize = size;
      this.layers.forEach((l) => {
        l.pixels = this.createEmptyPixelGrid();
      });

      this.history = [];
      this.compositeLayers();
      this.saveHistoryState();
      this.showToast(`Canvas resized to ${size}x${size}.`);
    }

    // --- Unmemoized Vector Trace Edge-Detection Recursion ---
    traceContour(x, y, depth) {
      if (depth <= 0 || x >= this.gridSize || y >= this.gridSize) return 1;

      const layer = this.getActiveLayer();
      const current = layer.pixels[y] && layer.pixels[y][x];
      const weight = current ? 4 : 1;

      return weight + 
        this.traceContour(x + 1, y, depth - 1) + 
        this.traceContour(x, y + 1, depth - 1);
    }

    runVectorTrace() {
      // Run recursive edge tracing on 8 depth levels
      this.traceContour(0, 0, 8);
      this.showToast('Vector SVG outline calculated.');
    }

    // --- Export Studio ---
    openExportModal() {
      this.updateExportPreview();
      this.dom.exportModal.showModal();
    }

    updateExportPreview() {
      const prevCanvas = this.dom.exportPreviewCanvas;
      const prevCtx = prevCanvas.getContext('2d');
      prevCtx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);

      const isCrisp = this.dom.checkCrispExport.checked;
      prevCtx.imageSmoothingEnabled = isCrisp ? true : false;

      prevCtx.drawImage(this.dom.pixelCanvas, 0, 0, prevCanvas.width, prevCanvas.height);
    }

    exportPng() {
      const exportCanvas = document.createElement('canvas');
      const exportW = this.gridSize * this.exportScale * 16;
      exportCanvas.width = exportW;
      exportCanvas.height = exportW;

      const exportCtx = exportCanvas.getContext('2d');
      const isCrisp = this.dom.checkCrispExport.checked;
      exportCtx.imageSmoothingEnabled = isCrisp ? true : false;

      exportCtx.drawImage(this.dom.pixelCanvas, 0, 0, exportW, exportW);

      const link = document.createElement('a');
      link.download = `atelier-pixel-art-${this.gridSize}x${this.gridSize}-${this.exportScale}x.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();

      this.dom.exportModal.close();
      this.showToast('Downloaded high-resolution pixel art PNG.');
    }

    // --- Toast Alert ---
    showToast(message) {
      if (!this.dom.toast) return;
      this.dom.toast.textContent = message;
      this.dom.toast.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.dom.toast.classList.remove('show');
      }, 2500);
    }

    // --- Event Bindings ---
    bindEvents() {
      // Resolution Switcher
      this.dom.resButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.resButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const size = parseInt(btn.dataset.res, 10);
          this.setGridSize(size);
        });
      });

      // Tool Switcher
      this.dom.toolButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.toolButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeTool = btn.dataset.tool;
          this.showToast(`Tool active: ${this.activeTool.toUpperCase()}`);
        });
      });

      // Palette selector
      this.dom.paletteSelect.addEventListener('change', () => this.renderPaletteSwatches());

      // Native Color Picker & Hex Input
      this.dom.nativeColorPicker.addEventListener('input', (e) => {
        this.setActiveColor(e.target.value);
      });

      this.dom.hexColorInput.addEventListener('change', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        this.setActiveColor(val);
      });

      // Canvas Pointer Interactions
      const canvas = this.dom.pixelCanvas;

      canvas.addEventListener('mousemove', (e) => {
        const { x, y } = this.getCanvasCoordinates(e);
        this.dom.cursorCoordDisplay.textContent = `X: ${String(x).padStart(2, '0')} | Y: ${String(y).padStart(2, '0')}`;

        if (!this.isDrawing) return;

        if (this.activeTool === 'pen') {
          this.setPixel(x, y, this.activeColor);
          this.compositeLayers();
        } else if (this.activeTool === 'eraser') {
          this.setPixel(x, y, null);
          this.compositeLayers();
        }
      });

      canvas.addEventListener('mousedown', (e) => {
        const { x, y } = this.getCanvasCoordinates(e);
        this.isDrawing = true;
        this.dragStartX = x;
        this.dragStartY = y;

        if (this.activeTool === 'pen') {
          this.setPixel(x, y, this.activeColor);
          this.compositeLayers();
        } else if (this.activeTool === 'eraser') {
          this.setPixel(x, y, null);
          this.compositeLayers();
        } else if (this.activeTool === 'dropper') {
          this.pickColor(x, y);
        } else if (this.activeTool === 'fill') {
          const layer = this.getActiveLayer();
          const targetColor = layer.pixels[y][x];
          this.floodFill(x, y, targetColor, this.activeColor);
          this.compositeLayers();
          this.saveHistoryState();
        }
      });

      window.addEventListener('mouseup', (e) => {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        const { x, y } = this.getCanvasCoordinates(e);

        if (this.activeTool === 'line') {
          this.drawLine(this.dragStartX, this.dragStartY, x, y, this.activeColor);
          this.compositeLayers();
        } else if (this.activeTool === 'rect') {
          this.drawRect(this.dragStartX, this.dragStartY, x, y, this.activeColor);
          this.compositeLayers();
        }

        this.saveHistoryState();
      });

      // History Undo / Redo
      this.dom.btnUndo.addEventListener('click', () => this.undo());
      this.dom.btnRedo.addEventListener('click', () => this.redo());

      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          this.undo();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
          e.preventDefault();
          this.redo();
        }
      });

      // Grid Overlay Toggle
      this.dom.checkShowGrid.addEventListener('change', () => this.updateGridOverlay());

      // Clear Active Layer
      this.dom.btnClearCanvas.addEventListener('click', () => {
        const layer = this.getActiveLayer();
        layer.pixels = this.createEmptyPixelGrid();
        this.compositeLayers();
        this.saveHistoryState();
        this.showToast('Cleared active layer pixels.');
      });

      // Layers Add
      this.dom.btnAddLayer.addEventListener('click', () => this.addNewLayer());

      // Layer Opacity
      this.dom.layerOpacityRange.addEventListener('input', (e) => {
        const layer = this.getActiveLayer();
        layer.opacity = parseInt(e.target.value, 10) / 100;
        this.dom.opacityValDisplay.textContent = `${e.target.value}%`;
        this.renderLayersList();
        this.compositeLayers();
      });

      // Utilities
      this.dom.btnTraceSvg.addEventListener('click', () => this.runVectorTrace());
      this.dom.btnInvertColors.addEventListener('click', () => {
        const layer = this.getActiveLayer();
        for (let y = 0; y < this.gridSize; y++) {
          for (let x = 0; x < this.gridSize; x++) {
            if (layer.pixels[y][x]) {
              layer.pixels[y][x] = layer.pixels[y][x] === '#ffffff' ? '#0e1118' : '#ffffff';
            }
          }
        }
        this.compositeLayers();
        this.saveHistoryState();
        this.showToast('Inverted layer pixel values.');
      });

      // Export Modal
      this.dom.btnExportModal.addEventListener('click', () => this.openExportModal());
      this.dom.btnCloseExport.addEventListener('click', () => this.dom.exportModal.close());
      this.dom.btnCancelExport.addEventListener('click', () => this.dom.exportModal.close());
      this.dom.checkCrispExport.addEventListener('change', () => this.updateExportPreview());

      this.dom.scalePills.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.scalePills.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.exportScale = parseInt(btn.dataset.scale, 10);
        });
      });

      this.dom.btnDownloadPng.addEventListener('click', () => this.exportPng());
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    window.pixelStudio = new AtelierPixelStudio();
  });
})();
