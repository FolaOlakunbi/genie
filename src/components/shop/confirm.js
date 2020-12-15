/**
 * @module components/shop
 * @copyright BBC 2020
 * @author BBC Children's D+E
 * @license Apache-2.0
 */

import {
    setVisible,
    resize,
    getInnerRectBounds,
    createRect,
    getSafeArea,
    createPaneBackground,
} from "./shop-layout.js";
import { createConfirmButtons } from "./menu-buttons.js";
import { doTransaction } from "./transact.js";
import { collections } from "../../core/collections.js";

export const createConfirm = scene => {
    const config = scene.config;
    const balance = scene.balance;
    const bounds = getSafeArea(scene.layout);

    const { styleDefaults } = config;

    const container = scene.add.container();
    container.config = config;
    container.memoisedBounds = bounds;

    const innerBounds = getOffsetBounds(bounds, getInnerRectBounds(scene));
    const yOffset = bounds.height / 2 + bounds.y;

    container.setY(yOffset);
    container.buttons = createConfirmButtons(container, handleClick(scene, container));

    container.elems = {
        background: [createRect(scene, innerBounds, 0x0000ff), createPaneBackground(scene, bounds, "confirm")],
        prompt: scene.add
            .text(innerBounds.x, promptY(bounds), config.confirm.prompts.shop, styleDefaults)
            .setOrigin(0.5),
        price: scene.add.text(innerBounds.x + 28, currencyY(bounds), "PH", styleDefaults).setOrigin(0.5),
        priceIcon: scene.add.image(
            innerBounds.x - 20,
            currencyY(bounds),
            `${config.assetPrefix}.${config.assetKeys.currency}`,
        ),
        item: itemView(scene, undefined, config, bounds),
    };

    populate(container);

    container.setVisible = setVisible(container);
    container.resize = resize(container);
    container.update = update(scene, container);
    container.prepTransaction = prepTransaction(scene, container);
    container.doTransaction = doTransaction(scene);
    container.setBalance = bal => balance.setText(bal);
    container.getBalance = () => balance.getValue();
    container.setLegal = setLegal(container);
    return container;
};

const handleClick = (scene, container) => button => {
    if (button === "Confirm" && !container.transaction.isLegal) return;
    const cost = button === "Confirm" && confirm(container);
    cost && container.setBalance(container.getBalance() - cost);
    scene.back();
};

const isTransactionLegal = (container, item, title) => {
    const isShop = title === "shop";
    const itemState = getItemState(container, item, title);
    return isShop ? container.getBalance() >= parseInt(item.price) : itemState !== "equipped";
};

const confirm = container => container.transaction && container.doTransaction(container.transaction);

const update = (scene, container) => (item, title) => {
    const isLegal = isTransactionLegal(container, item, title);
    container.removeAll(false);
    container.elems.priceIcon.setVisible(title === "shop");
    container.elems.price.setText(title === "shop" ? item.price : "");
    container.elems.item = itemView(scene, item, container.config, container.memoisedBounds);
    container.transaction = { item, title, isLegal };
    container.setLegal(title, isLegal);
    populate(container);
};

const setLegal = container => (title, isLegal) => {
    const prompt = isLegal
        ? container.config.confirm.prompts[title].legal
        : container.config.confirm.prompts[title].illegal;
    container.elems.prompt.setText(prompt);
    container.buttons[0].setLegal(isLegal);
};

const populate = container =>
    container.add([
        ...container.elems.background,
        container.elems.prompt,
        container.elems.price,
        container.elems.priceIcon,
        ...container.elems.item,
    ]);

const prepTransaction = (scene, container) => (item, title) => {
    container.update(item, title);
    scene.stack("confirm");
};

const itemView = (scene, item, config, bounds) =>
    config.confirm.detailView
        ? itemDetailView(scene, item, config, bounds)
        : itemImageView(scene, item, config, bounds);

const itemImageView = (scene, item, config, bounds) => {
    const image = scene.add.image(imageX(config, bounds), 0, assetKey(config, item));
    image.setScale((bounds.width / 2 / image.width) * 0.9);
    return [image];
};

const itemDetailView = (scene, item, config, bounds) => {
    const x = imageX(config, bounds);
    const itemImage = scene.add.image(x, imageY(bounds), assetKey(config, item));
    itemImage.setScale(bounds.height / 3 / itemImage.height);
    const itemTitle = scene.add.text(x, 0, getItemDetail(item), config.styleDefaults).setOrigin(0.5);
    const itemBlurb = scene.add.text(x, blurbY(bounds), getItemBlurb(item), config.styleDefaults, 0).setOrigin(0.5);
    return [itemImage, itemTitle, itemBlurb];
};

const getItemState = (container, item, title) =>
    collections.get(getCollectionsKey(container, title)).get(item.id).state;
const getCollectionsKey = (container, title) => container.config.paneCollections[title];
const getItemDetail = item => getItemTitle(item) + "\n" + getItemDescription(item);
const getItemTitle = item => (item ? item.title : "Item Default Title");
const getItemDescription = item => (item ? item.description : "Item Default Description");
const getItemBlurb = item => (item ? item.longDescription : "");
const assetKey = (config, item) => (item ? `${config.assetPrefix}.${item.icon}` : "shop.itemIcon");
const imageY = bounds => -bounds.height / 4;
const promptY = outerBounds => -outerBounds.height * (3 / 8);
const currencyY = outerBounds => -outerBounds.height / 4;
const blurbY = bounds => bounds.height / 4;
const getOffsetBounds = (outerBounds, innerBounds) => ({
    ...innerBounds,
    y: innerBounds.y + (outerBounds.height - innerBounds.height) * 0.38,
});
const imageX = (config, bounds) =>
    config.menu.buttonsRight ? bounds.x + bounds.width / 4 : bounds.x + (bounds.width / 4) * 3;