/**
 * Phaser button with text overlay
 *
 * @example game.add.existing(new DebugButton( ...parameters).sprite)
 */
const gelStyle: Phaser.PhaserTextStyle = {
    font: "ReithSans",
    fontSize: 20, //40,
    fill: "#FFFFFF",
    fontWeight: "bold",
};

export class DebugButton {
    public sprite: Phaser.Sprite;

    /**
     * remaps event add calls to the debug sprite
     */
    get onInputUp() {
        const context = this;
        return {
            add(callback: any, thisVal: any) {
                context.sprite.events.onInputUp.add(callback, thisVal);
            },
        };
    }

    /**
     * remaps event calls to the debug sprite
     */
    get events() {
        const context = this;
        return {
            onInputUp: {
                dispatch() {
                    context.sprite.events.onInputUp.dispatch();
                },
            },
        };
    }

    constructor(game: Phaser.Game, spec: GelSpec) {
        const backdrop = new Phaser.Graphics(game)
            .beginFill(0xf6931e)
            .drawRect(0, 0, spec.width, spec.height)
            .endFill()
            .generateTexture();

        const backdropHover = new Phaser.Graphics(game)
            .beginFill(0xffaa46, 1)
            .drawRect(0, 0, spec.width, spec.height)
            .endFill()
            .generateTexture();

        this.sprite = game.add.sprite(0, 0, backdrop);
        this.sprite.anchor.setTo(0.5, 0.5);

        this.sprite.inputEnabled = true;
        this.sprite.input.useHandCursor = true;

        this.sprite.events.onInputDown.add(spec.click);

        this.sprite.events.onInputOver.add(() => {
            this.sprite.setTexture(backdropHover);
        });

        this.sprite.events.onInputOut.add(() => {
            this.sprite.setTexture(backdrop);
        });

        const text = new Phaser.Text(game, 0, 0, spec.text, gelStyle);
        text.anchor.setTo(0.5, 0.5);

        this.sprite.addChild(text);
    }

    /**
     * Disables input and makes button semi-transparent
     */
    public setEnabled(bool: boolean = true) {
        this.sprite.inputEnabled = bool;
        this.sprite.alpha = bool ? 1 : 0.5;
    }
}
