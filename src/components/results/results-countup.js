/**
 * @copyright BBC 2020
 * @author BBC Children's D+E
 * @license Apache-2.0
 */

import fp from "../../../lib/lodash/fp/fp.js";

export class ResultsCountup extends Phaser.GameObjects.Text {
    constructor(scene, countupConfig) {
        super(scene, 0, 0, undefined, countupConfig.textStyle);
        this.countupConfig = countupConfig;
        this.startCount = this.textFromTemplate(countupConfig.startCount, scene.transientData);
        this.endCount = this.textFromTemplate(countupConfig.endCount, scene.transientData);
        this.text = this.startCount;
        this.setFixedSize(this.getFinalWidth(this.endCount), 0);
        this.startCountWithDelay(countupConfig.startDelay);
    }

    getFinalWidth(finalText) {
        const text = this.text;
        this.text = finalText;
        const width = this.width;
        this.text = text;
        return width;
    }

    textFromTemplate(templateString, transientData) {
        const template = fp.template(templateString);
        return template(transientData[this.scene.scene.key]);
    }

    incrementTextByOne() {
        this.text = parseInt(this.text) + 1;
    }

    startCountWithDelay(startDelay) {
        this.scene.time.delayedCall(startDelay, this.startCountingUp, undefined, this);
    }

    startCountingUp() {
        if (this.startCount === this.endCount) {
            return;
        }
        const repeat = this.endCount - this.startCount - 1;
        const delay = repeat ? this.countupConfig.countupDuration / repeat : this.countupConfig.countupDuration;
        this.scene.time.addEvent({
            delay,
            callback: this.incrementTextByOne,
            callbackScope: this,
            repeat,
        });
    }
}
