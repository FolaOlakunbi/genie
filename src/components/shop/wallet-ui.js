/**
 * Wallet UI component
 * @module components/shop
 * @copyright BBC 2020
 * @author BBC Children's D+E
 * @license Apache-2.0
 */

import { getSafeArea, getXPos, getYPos, getScaleFactor } from "./shop-scaling.js";

const styleDefaults = {
    fontFamily: "ReithSans",
    fontSize: "24px",
    resolution: 4,
};

const makeElement = makerFns => conf => makerFns[conf.type](conf).setOrigin(0.5);

export const createWallet = (scene, metrics) => {
    const image = conf => scene.add.image(0, 0, `${scene.assetPrefix}.${conf.key}`);
    const text = conf => {
        const textStyle = { ...styleDefaults, ...conf.styles };
        return scene.add.text(0, 0, conf.value, textStyle);
    };
    const container = scene.add.container();
    const configs = scene.config.wallet || [];
    const padding = scene.config.walletPadding || 0;

    const { background, icon, value } = Object.entries(configs).reduce(
        (els, [key, config]) => ({ ...els, [key]: makeElement({ image, text })(config)}),
        {},
    );

    const width = value.getBounds().width + icon.getBounds().width + padding * 3;
    value.setPosition(width / 4 - padding, 0);
    icon.setPosition(-width / 4, 0);
    background.setScale(width / background.getBounds().width);

    container.add([background, icon, value]);

    const safeArea = getSafeArea(scene.layout);
    container.setScale(getScaleFactor({ metrics, container, safeArea }));
    container.setPosition(getXPos(container, safeArea, scene.config.listPadding.x), getYPos(metrics, safeArea));

    return container;
};
