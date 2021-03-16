/**
 * @module components/shop
 * @copyright BBC 2020
 * @author BBC Children's D+E
 * @license Apache-2.0
 */
import fp from "../../../../lib/lodash/fp/fp.js";
import { addText } from "../../../core/layout/text.js";
import { collections } from "../../../core/collections.js";
import { createBackground } from "../backgrounds.js";
import { itemView } from "./item-view.js";
import { addConfirmButtons } from "./confirm-buttons.js";
import { itemIsInStock } from "./item-checks.js";
import { promptText } from "./prompt-text.js";
import { resizeFn } from "./confirm-resize.js";

const createElements = (scene, container, promptText, item) => ({
    background: createBackground(scene, scene.config.confirm?.background),
    prompt: addText(scene, 0, 0, promptText, scene.config).setOrigin(0.5),
    itemView: itemView(scene, item),
});

const createBuyElements = (scene, container, item) => ({
    text: addText(scene, 0, 0, item.price, scene.config).setOrigin(0.5),
    currency: scene.add.image(0, 0, `${scene.assetPrefix}.currencyIcon`),
});


const actions = {
    "shop": () => "buy",
    "manage": (scene, item) => getInventoryAction(scene, item)
}

const getInventoryAction = (scene, item) => {
    const inventory = collections.get(scene.transientData.shop.config.shopCollections.manage)
    const inventoryItem = inventory.get(item?.id);
    return getActionName(inventoryItem);
};

const getActionName = fp.cond([
    [i => Boolean(!i.slot), () => "use"],
    [i => i.state === "equipped", () => "unequip"],
    [i => i.state === "purchased", () => "equip"],
]);

export const createConfirm = scene => {
    const title = scene.transientData.shop.mode;
    const item = scene.transientData.shop.item;

    const action = actions[title](scene, item);
    scene.transientData[scene.scene.key] = { action };

    const container = scene.add.container();
    const elements = createElements(scene, container, promptText[action]({ scene, action, item }), item);
    const buyElements = action === "buy" && itemIsInStock(scene, item) && createBuyElements(scene, container, item);
    const buttons = addConfirmButtons(scene, title, action, item);

    const { itemView, ...otherElements } = elements;
    Object.values({ ...otherElements, ...itemView }).forEach(container.add.bind(container));
    Object.values(buyElements).forEach(container.add.bind(container));

    return resizeFn(scene, container, buyElements, buttons, elements);
};
