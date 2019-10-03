/**
 * Pause is an overlay screen created every time the pause button is pressed.
 *
 * @module components/overlays/pause
 * @copyright BBC 2019
 * @author BBC Children's D+E
 * @license Apache-2.0
 */

import { Screen } from "../../core/screen.js";

export class Pause extends Screen {
    create() {
        console.log("Loaded Pause");
        this.add.image(0, 0, "home.background");
        this.addLayout(["home", "audio", "settings", "pausePlay", "howToPlay"]);
    }
}
