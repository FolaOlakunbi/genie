/**
 * Placeholder for shop screen.
 *
 * @module components/shop
 * @copyright BBC 2020
 * @author BBC Children's D+E
 * @license Apache-2.0
 */
import { Screen } from "../../core/screen.js";
import { scrollableList } from "../../core/layout/scrollable-list/scrollable-list.js";
import RexUIPlugin from "../../../lib/rexuiplugin.min.js";
import { getMetrics, onScaleChange } from "../../core/scaler.js";

export class Shop extends Screen {
    preload() {
        this.plugins.installScenePlugin("rexUI", RexUIPlugin, "rexUI", this);
    }

    create() {
        this.addBackgroundItems();
        const buttons = ["home", "pause"];
        this.setLayout(buttons);
        const metrics = getMetrics();
        this.title = this.createTitle(metrics);
        this.wallet = this.createWallet(metrics);
        this.panel = scrollableList(this);
        this.setupEvents();
    }

    createTitle(metrics) {
        const { title } = this.config;

        const titleBackground = this.add.image(0, 0, title.background);
        const titleText = this.add.text(0, 0, title.text, title.font).setOrigin(0.5);
        const titleContainer = this.add.container();

        const titleWidth = titleText.getBounds().width + title.titlePadding * 2;
        const titleBackgroundWidth = titleBackground.getBounds().width;
        titleBackground.setScale(titleWidth / titleBackgroundWidth);
        titleContainer.add([titleBackground, titleText]);

        titleContainer.setScale(this.getScaleFactor(metrics, titleContainer));
        titleContainer.setPosition(0, this.getYPos(metrics, titleContainer));

        return titleContainer;
    }

    createWallet(metrics) {
        const { wallet } = this.config;

        const walletBackground = this.add.image(0, 0, wallet.background);
        const walletIcon = this.add.image(0, 0, wallet.icon);
        const walletBalance = this.add.text(0, 0, wallet.defaultBalance, wallet.font).setOrigin(1, 0.5);
        const walletContainer = this.add.container();
        
        const walletWidth = walletBalance.getBounds().width + walletIcon.getBounds().width + wallet.iconPadding * 3;
        walletBalance.setPosition(walletWidth / 4 + wallet.iconPadding, 0);
        walletIcon.setPosition(-walletWidth / 4, 0);
        walletBackground.setScale(walletWidth / walletBackground.getBounds().width);
        walletContainer.add([walletBackground, walletIcon, walletBalance]);

        walletContainer.setScale(this.getScaleFactor(metrics, walletContainer));
        walletContainer.setPosition(this.getXPos(walletContainer), this.getYPos(metrics));

        return walletContainer;
    }

    getScaleFactor(metrics, container) {
        const { verticals, verticalBorderPad, buttonPad } = metrics;
        container.setScale(1);
        const topEdge = verticals.top;
        const safeArea = this.layout.getSafeArea({}, false);
        const availableSpace = safeArea.y - topEdge - buttonPad;
        const scaleFactorY = availableSpace / container.getBounds().height;
        const scaleFactorX = safeArea.width / 4 / container.getBounds().width;
        return Math.min(scaleFactorY, scaleFactorX);
    }
    
    getYPos(metrics) {
        const { verticals, buttonPad, verticalBorderPad } = metrics;
        const safeArea = this.layout.getSafeArea({}, false);
        const padding = (safeArea.y - verticals.top) / 2 + verticalBorderPad / 2;
        return verticals.top + padding;
    }
    
    getXPos(container) {
        const safeArea = this.layout.getSafeArea({}, false);
        return safeArea.width / 2 - container.getBounds().width / 2 - this.config.space;    
    }

    setupEvents() {
        const resize = this.resize.bind(this);
        const scaleEvent = onScaleChange.add(() => resize());
        this.events.once("shutdown", scaleEvent.unsubscribe);
    }

    resize() {
        const metrics = getMetrics();
        this.title.setScale(this.getScaleFactor(metrics, this.title));
        this.title.setPosition(0, this.getYPos(metrics));
        this.wallet.setScale(this.getScaleFactor(metrics, this.wallet));
        this.wallet.setPosition(this.getXPos(this.wallet), this.getYPos(metrics));
    }
}
