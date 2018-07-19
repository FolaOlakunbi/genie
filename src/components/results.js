import { buttonsChannel } from "../core/layout/gel-defaults.js";
import { Screen } from "../core/screen.js";
import * as signal from "../core/signal-bus.js";
import { createTestHarnessDisplay } from "./test-harness/layout-harness.js";
import { sendStats } from "../core/gmi.js";

export class Results extends Screen {
    constructor() {
        super();
    }

    fireGameCompleteStat(result) {
        const score = parseInt(result);
        const scoreObject = score ? { game_score: score } : undefined;
        sendStats("game_complete", scoreObject);
    }

    create() {
        const theme = this.context.config.theme[this.game.state.current];

        const backgroundImage = this.game.add.image(0, 0, "results.background");
        this.scene.addToBackground(backgroundImage);

        const titleImage = this.scene.addToBackground(this.game.add.image(0, -150, "results.title"));
        this.scene.addToBackground(titleImage);

        const resultsText = this.game.add.text(0, 50, this.transientData.results, theme.resultText.style);
        this.scene.addToBackground(resultsText);

        this.scene.addLayout(["pause", "restart", "continueGame"]);
        createTestHarnessDisplay(this.game, this.context, this.scene);

        this.fireGameCompleteStat(this.transientData.results);

        signal.bus.subscribe({
            name: "continue",
            channel: buttonsChannel,
            callback: () => {
                this.navigation.next();
            },
        });

        signal.bus.subscribe({
            name: "restart",
            channel: buttonsChannel,
            callback: () => {
                this.navigation.game(this.transientData);
            },
        });
    }
}
