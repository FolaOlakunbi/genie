/**
 * @module components/shop
 * @copyright BBC 2020
 * @author BBC Children's D+E
 * @license Apache-2.0 Apache-2.0
 */
import { createMenu } from "../../../src/components/shop/menu.js";
import * as buttons from "../../../src/components/shop/menu-buttons.js";
import * as layout from "../../../src/components/shop/shop-layout.js";

jest.mock("../../../src/components/shop/shop-layout.js");
jest.mock("../../../src/components/shop/menu-buttons.js");

describe("shop menu", () => {
    let menu;
    let mockInnerRectBounds;
    let mockSafeArea;
    let mockPaneBackground;
    let mockRectangle;
    let mockMenuButtons;
    let mockScene;

    beforeEach(() => {
        mockMenuButtons = { mock: "buttons" };
        mockPaneBackground = { mock: "background" };
        mockRectangle = { mock: "rectangle", setY: jest.fn() };
        mockInnerRectBounds = { width: 100, height: 100, x: 0, y: 0 };
        mockScene = {
            add: {
                rectangle: jest.fn().mockReturnValue(mockRectangle),
                image: jest.fn(),
            },
            config: {
                menu: { buttonsRight: true },
                assetKeys: {
                    background: "background",
                },
            },
        };
        mockSafeArea = { width: 800, height: 600, x: 0, y: -100 };
        layout.getInnerRectBounds = () => mockInnerRectBounds;
        layout.getSafeArea = () => mockSafeArea;
        layout.createPaneBackground = jest.fn().mockReturnValue(mockPaneBackground);
        buttons.createMenuButtons = jest.fn().mockReturnValue(mockMenuButtons);
        menu = createMenu(mockScene);
    });
    afterEach(() => jest.clearAllMocks());

    describe("createMenu()", () => {
        test("with a rect added", () => {
            expect(mockScene.add.rectangle).toHaveBeenCalledTimes(1);
            expect(mockScene.add.rectangle).toHaveBeenCalledWith(
                mockInnerRectBounds.x,
                mockInnerRectBounds.y,
                mockInnerRectBounds.width,
                mockInnerRectBounds.height,
                0x000000,
                0,
            );
        });
        test("calls setY on the rect with an appropriate Y offset", () => {
            expect(mockRectangle.setY).toHaveBeenCalledWith(200);
        });
        test("menu resize function calls resizeGelButtons", () => {
            jest.clearAllMocks();
            menu.resize();
            expect(buttons.resizeGelButtons).toHaveBeenCalledWith({
                buttons: mockMenuButtons,
                rect: mockRectangle,
            });
        });
    });
});
