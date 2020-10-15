/**
 * @module core/layout/scrollable-list
 * @copyright BBC 2020
 * @author BBC Children's D+E
 * @license Apache-2.0 Apache-2.0
 */
import * as buttons from "../../../../src/core/layout/scrollable-list/scrollable-list-buttons.js";
import * as overlays from "../../../../src/core/layout/scrollable-list/button-overlays.js";
import * as handlers from "../../../../src/core/layout/scrollable-list/scrollable-list-handlers.js";
import { eventBus } from "../../../../src/core/event-bus.js";
import * as a11y from "../../../../src/core/accessibility/accessibilify.js";

const mockContainer = { parent: { getTopmostSizer: jest.fn().mockReturnValue({ innerHeight: 100 }) } };

const mockButton = {
    width: 100,
    setScale: jest.fn(),
    rexContainer: mockContainer,
    config: { id: "foo" },
};

const mockScene = {
    add: {
        gelButton: jest.fn().mockReturnValue(mockButton),
    },
    layout: {
        getSafeArea: jest.fn().mockReturnValue({ width: 100 }),
    },
    config: {
        eventChannel: "mockChannel",
        assetKeys: {
            prefix: "mockScene",
            itemBackground: "itemBackground",
        },
    },
    input: { y: 50 },
    scale: { displaySize: { height: 100 } },
};

const mockItem = {
    id: "mockId",
    ariaLabel: "mockAriaLabel",
};

describe("Scrollable List Buttons", () => {
    overlays.overlays1Wide = jest.fn();

    beforeEach(() => {
        a11y.accessibilify = jest.fn();
    });

    afterEach(() => jest.clearAllMocks());

    describe("createGelButton()", () => {
        test("adds a gel button", () => {
            buttons.createGelButton(mockScene, mockItem);
            expect(mockScene.add.gelButton).toHaveBeenCalled();
        });

        test("provides it the correct config", () => {
            buttons.createGelButton(mockScene, mockItem);
            const expectedConfig = {
                accessibilityEnabled: true,
                ariaLabel: "mockAriaLabel",
                channel: "mockChannel",
                gameButton: true,
                group: "shop",
                id: "scroll_button_mockId",
                key: "itemBackground",
                scene: "mockScene",
                scrollable: true,
            };
            expect(mockScene.add.gelButton).toHaveBeenCalledWith(0, 0, expectedConfig);
        });

        test("subscribes to the event bus", () => {
            eventBus.subscribe = jest.fn();
            handlers.handleIfVisible = jest.fn();
            buttons.createGelButton(mockScene, mockItem);
            const args = eventBus.subscribe.mock.calls[0][0];
            expect(args.channel).toEqual("mockChannel");
            expect(args.name).toEqual("scroll_button_mockId");
            args.callback();
            expect(handlers.handleIfVisible).toHaveBeenCalledWith(mockButton, mockScene);
        });

        test("scales the button", () => {
            buttons.createGelButton(mockScene, mockItem);
            expect(mockButton.setScale).toHaveBeenCalled();
        });

        test("applies overlays", () => {
            buttons.createGelButton(mockScene, mockItem);
            expect(overlays.overlays1Wide).toHaveBeenCalled();
        });
    });
});
