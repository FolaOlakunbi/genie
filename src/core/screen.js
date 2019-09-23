/**
 * @copyright BBC 2018
 * @author BBC Children's D+E
 * @license Apache-2.0
 */
import _ from "../../lib/lodash/lodash.js";

import { gmi } from "../core/gmi/gmi.js";
import * as signal from "../core/signal-bus.js";
import * as GameSound from "../core/game-sound.js";
import * as a11y from "../core/accessibility/accessibility-layer.js";
import * as VisibleLayer from "../core/visible-layer.js";
import fp from "../../lib/lodash/fp/fp.js";

/**
 * The `Screen` class extends `Phaser.State`, providing the `Context` to objects that extend from it.
 * All the game screens will extend from this class.
 */
export class Screen extends Phaser.Scene {
    get context() {
        return this._context;
    }

    set context(newContext) {
        this._context = _.merge({}, this._context, newContext);
    }

    getAsset(name) {
        return this.game.state.current + "." + name;
    }

    //TODO P3 only one argument is now passed to init
    //init(transientData, layoutManager, context, navigation) {
    init(config) {
        this.layoutManager = config.layoutManager;
        this._context = config.context;

        //TODO P3 remove debug line - currently useful to know which screen has been started NT
        console.log(`SCREEN INIT ${this.scene.key}:`, config);

        //TODO P3 This centers the camera - we don't necessarily have to do this anymore. Most people are used to top left being origin NT
        this.cameras.main.scrollX = -700;
        this.cameras.main.scrollY = -300;

        //TODO P3 commented out lines need re-enabling
        //this.navigation = config.navigation[this.scene.key].routes;
        //const themeScreenConfig = this.context.config.theme[this.game.state.current];
        //if (this.game.state.current !== "loadscreen") {
        //    gmi.setStatsScreen(this.game.state.current);
        //}
        //GameSound.setupScreenMusic(this.game, themeScreenConfig);
        this.transientData = config.transientData;
        a11y.clearAccessibleButtons();
        //a11y.clearElementsFromDom();
        //this.overlaySetup();

        //TODO P3 these might not be needed anymore NT
        //const routes = navigation[this.game.state.current].routes;
        //this.navigation = fp.mapValues(value => () => value(this.transientData || {}), routes);
    }

    overlaySetup() {
        signal.bus.subscribe({
            channel: "overlays",
            name: "overlay-closed",
            callback: this.onOverlayClosed.bind(this),
        });
    }

    onOverlayClosed(data) {
        a11y.clearElementsFromDom();
        a11y.clearAccessibleButtons(this);
        this.context.popupScreens.pop();
        a11y.appendElementsToDom(this);
        if (data.firePageStat) {
            gmi.setStatsScreen(this.game.state.current);
        }
        signal.bus.removeChannel("overlays");
        this.overlaySetup();
    }

    get visibleLayer() {
        return VisibleLayer.get(this.game, this.context);
    }
}
