import { onClick } from "./scrollable-list-helpers.js";
import { eventBus } from "../../event-bus.js";
import { overlays1Wide } from "./button-overlays.js";

export const createGelButton = (scene, item, config) => {

    const id = `shop_id_${item.id}`;

    const gelConfig = {
        gameButton: true,
        accessibilityEnabled: true,
        ariaLabel: item.ariaLabel, 
        channel: config.eventChannel,
        group: "middleCenter",
        id,
        key: config.assetKeys.itemBackground,
        scene: config.assetKeys.prefix,
    };

    const gelButton = scene.add.gelButton(0, 0, gelConfig);

    eventBus.subscribe({ 
        callback: () => onClick(gelButton), 
        channel: gelConfig.channel, 
        name: id 
    });
    
    scaleButton(scene, gelButton, config);

    return overlays1Wide(scene, gelButton, item, config);
};

export const scaleButton = (scene, button, config) => {
    const safeArea = scene.layout.getSafeArea();
    const scaleFactor = (safeArea.width - config.space * 2) / button.width;
    button.setScale(scaleFactor);
    return button;
};
