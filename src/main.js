/**
 * @copyright BBC 2018
 * @author BBC Children's D+E
 * @license Apache-2.0
 */
import { Home } from "./components/home.js";
import { Loadscreen } from "./components/loader/loadscreen.js";
import { Results } from "./components/results.js";
import { Select } from "./components/select.js";
import { phaserTestHarnessConfig } from "./components/test-harness/test-harness-main.js";
import { GameTest } from "./components/test-harness/test-screens/game.js";
import { parseUrlParams } from "./core/parseUrlParams.js";
import { settingsChannel } from "./core/settings.js";
import * as signal from "./core/signal-bus.js";
import { startup } from "./core/startup.js";

const settingsConfig = {
    pages: [
        {
            title: "Custom Settings",
            settings: [
                {
                    key: "custom1",
                    type: "toggle",
                    title: "Custom setting",
                    description: "Description of custom setting",
                },
            ],
        },
    ],
};

//TODO P3 - re-enable below once signal bus work is complete NT
//signal.bus.subscribe({
//    channel: settingsChannel,
//    name: "custom1",
//    callback: value => {
//        console.log("Custom 1 setting changed to " + value); // eslint-disable-line no-console
//    },
//});

const navigationConfigX = goToScreen => {
    if (parseUrlParams(window.location.search).sanityCheck === true) {
        return phaserTestHarnessConfig(goToScreen);
    }

    const home = data => goToScreen("home", data);
    const characterSelect = data => goToScreen("character-select", data);
    const levelSelect = data => goToScreen("level-select", data);
    const game = data => goToScreen("game", data);
    const results = data => goToScreen("results", data);

    //TODO P3 re-enabling all these screens will also make the asset packs load. See spike for P3 formatted asset packs if needed
    //TODO P3 state should be renamed to screen?
    return {
        loadscreen: {
            state: Loadscreen,
            routes: {
                next: home,
            },
        },
        home: {
            state: Home,
            routes: {
                next: characterSelect,
            },
        },
        //"character-select": {
        //    state: Select,
        //    routes: {
        //        next: levelSelect,
        //        home: home,
        //        restart: home,
        //    },
        //},
        //"level-select": {
        //    state: Select,
        //    routes: {
        //        next: game,
        //        home: home,
        //        restart: home,
        //    },
        //},
        //game: {
        //    state: GameTest,
        //    routes: {
        //        next: results,
        //        home: home,
        //        restart: game,
        //    },
        //},
        //results: {
        //    state: Results,
        //    routes: {
        //        next: home,
        //        game: game,
        //        restart: game,
        //        home: home,
        //    },
        //},
    };
};

const navigationConfig = {
    loadscreen: {
        state: Loadscreen,
        routes: {
            next: "home",
        },
    },
    home: {
        state: Home,
        routes: {
            next: "character-select",
        },
    },
    //"character-select": {
    //    state: Select,
    //    routes: {
    //        next: levelSelect,
    //        home: home,
    //        restart: home,
    //    },
    //},
    //"level-select": {
    //    state: Select,
    //    routes: {
    //        next: game,
    //        home: home,
    //        restart: home,
    //    },
    //},
    //game: {
    //    state: GameTest,
    //    routes: {
    //        next: results,
    //        home: home,
    //        restart: game,
    //    },
    //},
    //results: {
    //    state: Results,
    //    routes: {
    //        next: home,
    //        game: game,
    //        restart: game,
    //        home: home,
    //    },
    //},
};

startup(settingsConfig, navigationConfig);
