import "../../node_modules/webfontloader/webfontloader.js";

export const loadFonts = (game, done) => {
    WebFont.load({
        active: () => {
            // --- Hack start ---
            /** Phaser has an issue when attempting to use bold and italic fonts. The first time these fonts are loaded
             *  they will not be rendered and Phaser will then fall back on the default browser font. We can circumvent
             *  this issue by adding some some small non-visible text to the game at startup to force our bold and italic
             *  variants of ReithSans to load before the first screen.
             */
            const boldReithSans = { font: "bold 1px ReithSans" };
            game.add.text(-10000, -10000, ".", boldReithSans);

            const italicReithSans = { font: "italic 1px ReithSans" };
            game.add.text(-10000, -10000, ".", italicReithSans);
            // --- Hack end ---

            done();
        },
        custom: {
            families: ["ReithSans"],
            urls: ["../../fonts/fonts.css"],
        },
    });
};
