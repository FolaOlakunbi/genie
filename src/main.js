import { Loadscreen } from "./components/loadscreen.js";
import { Home } from "./components/home.js";
import { Select } from "./components/select.js";
import { GameTest } from "./components/test-harness/test-screens/game.js";
import { Results } from "./components/results.js";
import { startup } from "./core/startup.js";
import * as settings from "./core/settings.js";


settings.setCloseCallback(() => {
    //Called when settings screen has been closed
})

const settingsConfig = {
    pages: [
        {
            title: "Global Settings",
            settings: [
                {
                    key: "audio",
                    type: "toggle",
                    title: "Audio",
                    description: "Turn off/on sound and music",
                },
            ],
        },
    ],
};

const transitions = [
    {
        name: "loadscreen",
        state: new Loadscreen(),
        nextScreenName: () => "home",
    },
    {
        name: "home",
        state: new Home(),
        nextScreenName: () => "characterSelect",
    },
    {
        name: "characterSelect",
        state: new Select(),
        nextScreenName: state => {
            if (state.transient.home) {
                state.transient.home = false;
                return "home";
            }
            return "game";
        },
    },
    {
        name: "game",
        state: new GameTest(),
        nextScreenName: state => {
            if (state.transient.home) {
                state.transient.home = false;
                return "home";
            }
            if (state.transient.restart) {
                state.transient.restart = false;
                return "game";
            }
            return "results";
        },
    },
    {
        name: "results",
        state: new Results(),
        nextScreenName: state => {
            if (state.transient.game || state.transient.restart) {
                state.transient.game = false;
                state.transient.restart = false;
                return "game";
            }
            if (state.transient.home) {
                state.transient.home = false;
            }
            return "home";
        },
    },
];

startup(transitions, {}, settingsConfig);
