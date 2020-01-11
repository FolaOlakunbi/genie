/**
 * @copyright BBC 2018
 * @author BBC Children's D+E
 * @license Apache-2.0
 */
import fp from "../../../lib/lodash/fp/fp.js";
import { accessibilify } from "../accessibility/accessibilify.js";
import { GelButton } from "./gel-button.js";

export class GelGrid extends Phaser.GameObjects.Container {
    constructor(scene, metrics, safeArea) {
        super(scene, 0, 0);
        this._metrics = metrics;
        this._safeArea = safeArea;
        this._cells = [];
        this._columns = scene.theme.columns || 1;
        this._align = scene.theme.align || "center";
        this._rows = scene.theme.rows || 1;
        this._cellPadding = metrics.isMobile ? 16 : 24;
        this.eventChannel = `gel-buttons-${scene.scene.key}`;

        window.grid = this;
    }

    addGridCells() {
        this.scene.theme.choices.map((cell, idx) => {
            this.addCell(cell, idx);
        });
        this.makeAccessible();
        this.reset();
        return this._cells;
    }

    calculateCellSize() {
        const colPaddingCount = this._columns - 1;
        const rowPaddingCount = this._rows - 1;
        const paddingAdjustmentX = colPaddingCount * this._cellPadding;
        const paddingAdjustmentY = rowPaddingCount * this._cellPadding;
        return {
            width: (this._safeArea.width - paddingAdjustmentX) / this._columns,
            height: (this._safeArea.height - paddingAdjustmentY) / this._rows,
        };
    }

    resize(metrics, safeArea) {
        this._metrics = metrics;
        this._safeArea = safeArea;
        this._cellPadding = metrics.screenToCanvas(metrics.isMobile ? 16 : 24);

        this.reset();
    }

    makeAccessible() {
        this._cells.forEach(this.makeCellAccessible, this);
    }

    makeCellAccessible(cell, idx) {
        const config = {
            id: "__" + fp.kebabCase(cell.name),
            ariaLabel: cell.name,
            group: "grid",
            title: `Selection ${idx}`,
            key: `selection_${idx}`,
            order: 0,
            channel: this.eventChannel,
        };
        cell.input.enabled = true;

        return accessibilify(cell, config, true);
    }

    cellKeys() {
        return this._cells.map(cell => cell.key);
    }

    addCell(choice, idx) {
        const config = {
            id: fp.kebabCase(choice.title),
            key: choice.asset,
            name: choice.title ? choice.title : `option ${idx + 1}`,
            scene: this.scene.scene.key,
            channel: this.eventChannel,
            gameButton: true,
            group: "grid",
            order: 0,
            ariaLabel: "",
        };

        const newCell = new GelButton(this.scene, 0, 0, this._metrics, config);
        newCell.visible = Boolean(!idx);
        newCell.key = config.key;

        //TODO
        //newCell.addOverlay(300, 300, "character-select.lock")

        this._cells.push(newCell);
        this.addAt(newCell, this._cells.length);
    }

    setCellSize(cellIndex) {
        const cellSize = this.calculateCellSize();

        this._cells[cellIndex].displayWidth = cellSize.width;
        this._cells[cellIndex].displayHeight = cellSize.height;
    }

    setCellVisibility(cellIndex) {
        this._cells[cellIndex].visible = true;
    }

    setCellPosition(cellIndex, col, row) {
        const cellCount = this.rowCellsCount(row);
        const cell = this._cells[cellIndex];
        let alignmentFactor = 1;

        if (this._align == "right") {
            alignmentFactor = 2;
        } else if (this._align == "left") {
            alignmentFactor = 0;
        }

        const blankPadding = cellCount * ((cell.displayWidth + this._cellPadding) / 2) * alignmentFactor;
        const paddingXTotal = col * this._cellPadding;
        const leftBound = this._safeArea.left + col * cell.displayWidth;
        const cellXCentre = cell.displayWidth / 2;

        const paddingYTotal = row * this._cellPadding;
        const topBound = this._safeArea.top + row * cell.displayHeight;
        const cellYCentre = cell.displayHeight / 2;

        cell.x = leftBound + paddingXTotal + cellXCentre + blankPadding;
        cell.y = topBound + cellYCentre + paddingYTotal;
    }

    removeCell(cellToRemove) {
        this._cells = fp.remove(n => n === cellToRemove, this._cells);
        cellToRemove.destroy();
    }

    setLayoutLimits() {
        const columns = this._columns;
        const rows = this._rows;
        const maxColumns = rows == 1 ? 4 : 3;
        const maxRows = 2;
        this._columns = Math.min(columns, maxColumns);
        this._rows = Math.min(maxRows, rows);
    }

    getBoundingRect() {
        return this._safeArea;
    }

    rowCellsCount(row) {
        let count = 0;
        while (this._cells[row * this._columns + count] && count < this._columns) {
            count++;
        }
        return this._columns - count;
    }

    resetCell(cellIndex, col, row) {
        this.setCellSize(cellIndex, col, row);
        this.setCellVisibility(cellIndex, col, row);
        this.setCellPosition(cellIndex, col, row);
    }

    reset() {
        this.setLayoutLimits();

        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._columns; col++) {
                let cellIndex = row * this._columns + col;
                if (this._cells[cellIndex]) {
                    this.resetCell(cellIndex, col, row);
                }
            }
        }
    }
}
