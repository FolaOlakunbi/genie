/**
 * Overlay Layout
 * @module components/overlays/overlay-layout
 */

import fp from "../../../lib/lodash/fp/fp.js";

/**
 * Provides some shared behaviour common to all overlay screens such as:
 * - Adding a background
 * - Disabling buttons underneath the overlay when the overlay is opened
 * - Restoring buttons underneath the overlay when the overlay is when closed
 * - Moving GEL buttons to the top
 */

export function create(screen, backgroundImage) {
    const backgroundPriorityID = 999;
    const priorityID = backgroundPriorityID + screen.context.popupScreens.length;
    const previousLayouts = screen.scene.getLayouts();
    const gameAccessibleButtons = screen.scene.getButtons();
    const disabledButtons = disableExistingButtons();

    return {
        addBackground,
        restoreDisabledButtons,
        moveGelButtonsToTop,
        moveButtonToTop,
    };

    function addBackground(backgroundImage) {
        backgroundImage.inputEnabled = true;
        backgroundImage.input.priorityID = priorityID - 1;
        return screen.scene.addToBackground(backgroundImage);
    }

    function disableExistingButtons() {
        const disabledButtons = [];
        fp.forOwn(layout => {
            fp.forOwn(button => {
                if (button.input.enabled) {
                    button.input.enabled = false;
                    disabledButtons.push(button);
                    button.update();
                }
            }, layout.buttons);
        }, previousLayouts);

        fp.forOwn(button => {
            if (button.input.enabled) {
                console.log("Disabling game accessible button");
                button.input.enabled = false;
                disabledButtons.push(button);
                button.update();
            }
        }, gameAccessibleButtons);
        

        return disabledButtons;
    }

    function restoreDisabledButtons() {
        fp.forOwn(button => {
            button.input.enabled = true;
            button.update();
        }, disabledButtons);
    }

    function moveGelButtonsToTop(gelLayout) {
        fp.forOwn(button => {
            button.input.priorityID = priorityID;
            button.parent.updateTransform();
            button.parent.parent.updateTransform();
            button.update();
        }, gelLayout.buttons);
    }

    function moveButtonToTop(button) {
        button.inputEnabled = true;
        button.input.priorityID = priorityID;
    }
}
