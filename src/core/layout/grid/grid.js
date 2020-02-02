/**
 * @copyright BBC 2018
 * @author BBC Children's D+E
 * @license Apache-2.0
 */
import { create as createCell } from "./cell.js";

const defaults = {
    rows: 1,
    columns: 1,
    ease: "Cubic.easeInOut",
    duration: 500,
    align: "center",
};

const resetCell = cell => cell.reset();

export class GelGrid extends Phaser.GameObjects.Container {
    constructor(scene, metrics, safeArea, config) {
        super(scene, 0, 0);

        this._metrics = metrics;
        this._safeArea = safeArea;
        this._config = { ...defaults, ...config };
        this._cells = [];
        this._cellPadding = metrics.isMobile ? 16 : 24;
        this._page = 0;
        this.eventChannel = `gel-buttons-${scene.scene.key}`;
        this.enforceLimits();
    }

    addGridCells(gridCells) {
        this._cells = gridCells.map((cell, idx) => createCell(this, cell, idx));
        this.makeAccessible();
        this.reset();
        return this._cells;
    }

    calculateCellSize(scaleX = 1, scaleY = 1) {
        const colPaddingCount = this._config.columns - 1;
        const rowPaddingCount = this._config.rows - 1;
        const paddingAdjustmentX = colPaddingCount * this._cellPadding;
        const paddingAdjustmentY = rowPaddingCount * this._cellPadding;
        return [
            scaleX * ((this._safeArea.width - paddingAdjustmentX) / this._config.columns),
            scaleY * ((this._safeArea.height - paddingAdjustmentY) / this._config.rows),
        ];
    }

    resize(metrics, safeArea) {
        this._metrics = metrics;
        this._safeArea = safeArea;
        this._cellPadding = metrics.screenToCanvas(metrics.isMobile ? 16 : 24);
        this.reset();
    }

    cellIds() {
        return this._cells.map(cell => cell.button.config.id);
    }

    enforceLimits() {
        const maxColumns = this._config.rows === 1 ? 4 : 3;
        const maxRows = 2;
        this._config.columns = Math.min(this._config.columns, maxColumns);
        this._config.rows = Math.min(maxRows, this._config.rows);
        this.cellsPerPage = this._config.rows * this._config.columns;
    }

    getBoundingRect() {
        return this._safeArea;
    }

    getPageCount() {
        return Math.ceil(this._cells.length / this.cellsPerPage);
    }

    makeAccessible() {
        this._cells.forEach(cell => cell.makeAccessible());
    }

    pageTransition(goForwards = true) {
        const currentPage = this._page;
        const nextPage = goForwards ? this._page + 1 : this._page - 1 + this.getPageCount();

        this._page = nextPage % this.getPageCount();
        this.reset();
        this.setPageVisibility(currentPage, true);
        this.scene.input.enabled = false;

        this.getPageCells(this._page).forEach(cell => cell.addTweens({ ...this._config, tweenIn: true, goForwards }));
        this.getPageCells(currentPage).forEach(cell => cell.addTweens({ ...this._config, tweenIn: false, goForwards }));
        this.scene.time.addEvent({
            delay: this._config.duration + 1,
            callback: this.transitionCallback,
            callbackScope: this,
            args: [currentPage],
        });
    }

    transitionCallback(pageToDisable) {
        this.setPageVisibility(pageToDisable, false);
        this.scene.input.enabled = true;
    }

    nextPage() {
        this.pageTransition();
        return this._page;
    }

    getCurrentPageKey() {
        return this._cells[this._page].button.key;
    }

    previousPage() {
        const goForward = false;
        this.pageTransition(goForward);
        return this._page;
    }

    setPageVisibility(pageNum, visibility) {
        this.getPageCells(pageNum).forEach(cell => {
            cell.button.visible = visibility;
            cell.button.accessibleElement.update();
        });
    }

    getPageCells(pageNum) {
        const pageMax = this.cellsPerPage * (pageNum + 1);
        const pageMin = this.cellsPerPage * pageNum;
        return this._cells.filter((cell, idx) => idx >= pageMin && idx < pageMax);
    }

    reset() {
        this._cellSize = this.calculateCellSize();
        this._cells.forEach(resetCell);
        this.setPageVisibility(this._page, true);
    }
}
