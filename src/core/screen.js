/**
 * @copyright BBC 2018
 * @author BBC Children's D+E
 * @license Apache-2.0
 */
import _ from "../../lib/lodash/lodash.js";

import { gmi } from "../core/gmi/gmi.js";
import { buttonsChannel } from "../core/layout/gel-defaults.js";
import * as signal from "../core/signal-bus.js";
import * as GameSound from "../core/game-sound.js";
import * as a11y from "../core/accessibility/accessibility-layer.js";
import fp from "../../lib/lodash/fp/fp.js";
import * as Scaler from "./scaler.js";
import * as Layout from "./layout/layout.js";

export const overlayChannel = "gel-overlays";

/**
 * The `Screen` class extends `Phaser.State`, providing the `Context` to objects that extend from it.
 * All the game screens will extend from this class.
 */
export class Screen extends Phaser.Scene {
    #data;
    #layouts = [];

    constructor(sceneConfig) {
        super(sceneConfig);
    }

    get context() {
        return {
            config: this.#data.config,
            parentScreens: this.#data.parentScreens,
            navigation: this.#data.navigation,
            transientData: this.#data.transient || {},
        };
    }

    get layouts() {
        return this.#layouts;
    }

    //TODO P3 the only context parts we want them to set is transient data
    //TODO P3 maybe it should be separate? [NT]
    set transientData(newData) {
        this.#data.transient = _.merge({}, this.#data.transient, newData);
    }

    get transientData() {
        return this.#data.transient;
    }

    init(data) {
        this.#data = data;

        //TODO P3 This centers the camera. Should this be hard-coded [NT]
        this.cameras.main.scrollX = -700;
        this.cameras.main.scrollY = -300;

        if (this.scene.key !== "loader" && this.scene.key !== "boot") {
            gmi.setStatsScreen(this.scene.key);

            const themeScreenConfig = this.#data.config.theme[this.scene.key];
            GameSound.setupScreenMusic(this.scene.scene, themeScreenConfig);
        }
        this.sys.accessibleButtons = [];
        a11y.clearAccessibleButtons();
        a11y.clearElementsFromDom();

        this.#makeNavigation();
    }

    setData(newData) {
        this.#data = newData;
    }

    setConfig(newConfig) {
        this.#data.config = newConfig;
    }

    #makeNavigation = () => {
        const routes = this.scene.key === "boot" ? { next: "loader" } : this.#data.navigation[this.scene.key].routes;
        this.navigation = fp.mapValues(
            route => () => {
                this._navigate(route);
            },
            routes,
        );
    };

    addOverlay(key) {
        this.events.emit("onoverlayadded");
        signal.bus.subscribe({
            channel: overlayChannel,
            name: key,
            callback: this._removeOverlay,
        });
        this.#data.parentScreens.push(this);
        this.scene.run(key, this.#data);
        this.scene.bringToTop(key);
    }

    removeOverlay = () => {
        this.events.emit("onscreenexit");
        this.#data.parentScreens.pop();
        signal.bus.publish({
            channel: overlayChannel,
            name: this.scene.key,
            data: { overlay: this },
        });
        signal.bus.removeSubscription({ channel: overlayChannel, name: this.scene.key });
    };

    _removeOverlay = data => {
        this.events.emit("onoverlayremoved");
        signal.bus.removeChannel(buttonsChannel(data.overlay));
        a11y.clearAccessibleButtons();
        a11y.clearElementsFromDom();
        data.overlay.removeAll();
        data.overlay.scene.stop();
        this.#layouts.forEach(layout => layout.makeAccessible());
        this.sys.accessibleButtons.forEach(button => a11y.addToAccessibleButtons(this, button));
        a11y.appendElementsToDom(this);
    };

    removeAll = () => {
        signal.bus.removeChannel(buttonsChannel(this));
        this.#layouts.forEach(layout => layout.destroy());
        this.#layouts = [];
    };

    _navigate = route => {
        this.events.emit("onscreenexit");
        this.scene.bringToTop(route);
        while (this.#data.parentScreens.length > 0) {
            this.#data.parentScreens.pop().removeAll();
        }
        this.removeAll();
        this.scene.start(route, this.#data);
    };

    /**
     * Create a new GEL layout for a given set of Gel Buttons
     * Called in the create method of a given screen
     *
     * @example
     * this.addLayout(["home", "restart", "continue", "pause"]);
     * @param {Array} buttons - Array of standard button names to include. See {@link layout/gel-defaults.js} for available names
     *
     * @memberof module:screen
     * @returns {Object}
     */
    addLayout(buttons) {
        //TODO P3 passing in the root here . Maybe it can be moved?
        const layoutRoot = this.add.container(0, 0);

        //P3 TODO passing in "this" smells [NT]
        const layout = Layout.create(this, Scaler.getMetrics(), buttons, layoutRoot);
        this.#layouts.push(layout);

        return layout;
    }
}
