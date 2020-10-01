/**
 * @copyright BBC 2018
 * @author BBC Children's D+E
 * @license Apache-2.0
 */
import { eventBus } from "../event-bus.js";
import * as GameSound from "../game-sound.js";
import { gmi } from "../gmi/gmi.js";
import { assetPath } from "./asset-paths.js";
import { Indicator } from "./gel-indicator.js";
import { getMetrics } from "../scaler.js";

const defaults = {
    shiftX: 0,
    shiftY: 0,
};

export class GelButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        const metrics = getMetrics();
        super(scene, x, y);
        this.sprite = scene.add.sprite(0, 0, assetPath(Object.assign({}, config, { isMobile: metrics.isMobile })));
        this.setScrollFactor(0);
        if (!config.inScrollable) {
            this.sprite.setScrollFactor(0); // resolves glitch
        }
        this.add(this.sprite);

        this.config = { ...defaults, ...config };
        this.isMobile = metrics.isMobile;
        config.indicator && this.setIndicator();

        if (config.anim) {
            config.anim.frames = this.scene.anims.generateFrameNumbers(config.anim.key);
            this.scene.anims.create(config.anim);
            this.sprite.play(config.anim.key);
        }

        this.setInteractive({
            hitArea: this.sprite,
            useHandCursor: true,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        });

        this.setHitArea(metrics);
        this.setupMouseEvents(config, scene);
    }

    overlays = {
        set: (key, asset) => {
            this.overlays.list[key] = asset;
            this.add(this.overlays.list[key]);
        },
        remove: key => {
            if (!this.overlays.list[key]) {
                return;
            }
            this.remove(this.overlays.list[key]);
            this.overlays.list[key].destroy();
            delete this.overlays.list[key];
        },
        list: {},
    };

    onPointerUp(config, screen) {
        // Prevents button sounds from being paused by overlays (Pause Overlay specifically)
        GameSound.Assets.buttonClick.once(Phaser.Sound.Events.PAUSE, () => {
            GameSound.Assets.buttonClick.resume();
        });

        GameSound.Assets.buttonClick.play();

        const inputManager = this.scene.sys.game.input;
        inputManager.updateInputPlugins("", inputManager.pointers);
        publish(config, { screen })();
    }

    setupMouseEvents(config, screen) {
        this.on("pointerup", () => this.onPointerUp(config, screen));
        this.on("pointerout", () => this.sprite.setFrame(0));
        this.on("pointerover", () => this.sprite.texture.frames["1"] && this.sprite.setFrame(1));
    }

    setHitArea(metrics) {
        const hitPad = Math.max(metrics.hitMin - this.sprite.width, metrics.hitMin - this.sprite.height, 0);
        const width = this.sprite.width + hitPad;
        const height = this.sprite.height + hitPad;

        this.input.hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);

        this.setSize(width, height);
    }

    getHitAreaBounds() {
        const scale = this.parentContainer?.scale ?? 1;
        const x = this.parentContainer?.x ?? 0;
        const y = this.parentContainer?.y ?? 0;

        const width = this.input.hitArea.width * scale * this.scale;
        const height = this.input.hitArea.height * scale * this.scale;

        return new Phaser.Geom.Rectangle(
            x + this.x * scale - width / 2,
            y + this.y * scale - height / 2,
            width,
            height,
        );
    }

    setImage(key) {
        this.config.key = key;
        this.sprite.setTexture(assetPath({ ...this.config, key, isMobile: this.isMobile }));
    }

    resize(metrics) {
        this.isMobile = metrics.isMobile;
        this.sprite.setTexture(assetPath({ key: this.config.key, isMobile: metrics.isMobile }));
        this.setHitArea(metrics);

        Object.values(this.overlays.list)
            .filter(overlay => Boolean(overlay.resize))
            .map(overlay => overlay.resize());
    }

    setIndicator() {
        this.overlays.remove("indicator");
        if (!gmi.achievements.unseen) {
            return;
        }

        this.overlays.set("indicator", new Indicator(this));
        this.overlays.list.indicator.resize();
    }
}

const publish = (config, data) => () => {
    eventBus.publish({
        channel: config.channel,
        name: config.id,
        data,
    });
};
