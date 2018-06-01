/**
 * How To Play Screen.
 * @module components/overlays/how-to-play
 */

import fp from "../../../lib/lodash/fp/fp.js";

import * as signal from "../../core/signal-bus.js";
import * as OverlayLayout from "../../components/overlays/overlay-layout.js";
import * as Book from "../../core/book.js";

/**
 * @param {Phaser.Game} game - The Phaser Game instance
 */
export function create({ game }) {
    const screen = game.state.states[game.state.current];
    const theme = screen.context.config.theme["how-to-play"];
    const channel = "how-to-play-gel-buttons";

    let panels = [];
    let currentIndex = 0;
    let numberOfPanels = Object.keys(theme.panels).length;

    screen.context.popupScreens.push("how-to-play");

    const overlayLayout = OverlayLayout.create(screen);
    const background = overlayLayout.addBackground(game.add.image(0, 0, "howToPlay.background"));
    const title = screen.scene.addToBackground(game.add.image(0, -230, "howToPlay.title"));

    let book = Book.Start("howToPlay", theme, game, screen.scene, overlayLayout);

    let pips = addPips(book);
    addSignals();

    function previousButtonClick() {
        book = Book.PreviousPage(book);
        updatePips(book);
    }

    function nextButtonClick() {
        book = Book.NextPage(book);
        updatePips(book);
    }

    function goToPanel(index, pipIsOn, book) {
        if (!pipIsOn) {
            book = Book.GoToPage(index + 1, book);
            updatePips(book);
        }
    }

    function addPips(book) {
        let pipsGroup = game.add.group();
        const spacing = 15;
        const pipWidth = 16;
        const pipsLength = pipWidth * numberOfPanels + spacing * (numberOfPanels - 1);
        let currentPosition = -Math.abs(pipsLength / 2);

        book.pages.forEach((page, index) => {
            const pipImage = page.visible ? "howToPlay.pipOn" : "howToPlay.pipOff";
            const pip = game.add.button(
                currentPosition,
                240,
                pipImage,
                () => goToPanel(index, page.visible, book),
                this,
            );
            overlayLayout.moveToTop(pip);
            pipsGroup.add(pip);
            currentPosition += pipWidth + spacing;
        });
        screen.scene.addToBackground(pipsGroup);
        return pipsGroup;
    }

    function destroyPips() {
        pips.callAll("kill");
        pips.callAll("destroy");
    }

    function updatePips(book) {
        destroyPips();
        pips = addPips(book);
    }

    function addSignals() {
        signal.bus.subscribe({ channel, name: "back", callback: destroy });
        signal.bus.subscribe({ channel, name: "previous", callback: previousButtonClick });
        signal.bus.subscribe({ channel, name: "next", callback: nextButtonClick });
    }

    function destroy() {
        signal.bus.removeChannel(channel);
        overlayLayout.restoreDisabledButtons();
        book.destroy();
        destroyPips();
        title.destroy();
        background.destroy();
        screen.context.popupScreens = fp.pull("how-to-play", screen.context.popupScreens);
    }
}