/**
 * @module components/shop
 * @copyright BBC 2020
 * @author BBC Children's D+E
 * @license Apache-2.0 Apache-2.0
 */

import * as shopLayout from "../../../src/components/shop/shop-layout.js";

let mockLayout;
let mockContainer;
const mockSafeArea = { y: -150, width: 600 };
const mockPadding = 10;
const mockMetrics = {
    verticals: { top: -300 },
    verticalBorderPad: 15,
};
let mockBounds;

describe("shop element scaling functions", () => {
    beforeEach(() => {
        mockBounds = { width: 100, height: 100, y: 0, x: 0 };

        mockLayout = { getSafeArea: jest.fn() };
        mockContainer = {
            getBounds: jest.fn().mockReturnValue({ height: 100, width: 300 }),
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            setScale: jest.fn(),
            setY: jest.fn(),
            setX: jest.fn(),
            buttons: [],
            memoisedBounds: mockBounds,
        };
    });

    afterEach(() => jest.clearAllMocks());

    describe("getSafeArea()", () => {
        test("calls getSafeArea with no groups and no Y-mirroring", () => {
            shopLayout.getSafeArea(mockLayout);
            expect(mockLayout.getSafeArea).toHaveBeenCalledWith({}, false);
        });
    });

    describe("getXPos()", () => {
        test("returns an X value that is just inside the horizontal bounds of the safe area", () => {
            const xPos = shopLayout.getXPos(mockContainer, mockSafeArea, mockPadding);
            expect(mockContainer.getBounds).toHaveBeenCalled();
            expect(xPos).toBe(140);
        });
    });

    describe("getYPos()", () => {
        test("returns a Y position that is centered between the screen top and the safe area top", () => {
            const yPos = shopLayout.getYPos(mockMetrics, mockSafeArea);
            expect(yPos).toBe(-217.5);
        });
    });

    describe("getScaleFactor()", () => {
        let args;

        beforeEach(
            () =>
                (args = {
                    metrics: mockMetrics,
                    container: mockContainer,
                    safeArea: mockSafeArea,
                }),
        );
        describe("when called with fixedWidth: true", () => {
            test("returns a scale factor that will have the element fill the available vertical space", () => {
                args.fixedWidth = true;
                const scaleFactor = shopLayout.getScaleFactor(args);
                expect(scaleFactor).toBe(1.275);
            });
        });
        describe("when called with fixedWidth: false", () => {
            test("returns a scale factor that may constrain the element horizontally", () => {
                args.fixedWidth = false;
                const scaleFactor = shopLayout.getScaleFactor(args);
                expect(scaleFactor).toBe(0.5);
            });
        });
    });

    describe("getHalfRectBounds", () => {
        const safeAreaBounds = { width: 200, height: 100 };
        test("returns a object describing half the area passed in", () => {
            const result = shopLayout.getHalfRectBounds(safeAreaBounds, false);
            const expected = {
                x: -50,
                y: 0,
                width: 100,
                height: 100,
            };
            expect(result).toStrictEqual(expected);
        });
        test("is isOnRight is true, it's the right-hand half", () => {
            const result = shopLayout.getHalfRectBounds(safeAreaBounds, true);
            const expected = {
                x: 50,
                y: 0,
                width: 100,
                height: 100,
            };
            expect(result).toStrictEqual(expected);
        });
    });

    describe("resize()", () => {
        test("returns a scale factor that will have the element fill the available vertical space", () => {
            const textSpy = jest.fn();
            const imageSpy = jest.fn();

            mockContainer.scaleX = 0.5;
            mockContainer.scaleY = 2;
            mockContainer.elems = {
                item: [
                    {
                        set scaleX(val) {
                            textSpy(val);
                        },
                        type: "Text",
                    },
                    {
                        set scaleX(val) {
                            imageSpy(val);
                        },
                        type: "Image",
                    },
                ],
            };

            shopLayout.resize(mockContainer)(mockBounds);
            expect(imageSpy).not.toHaveBeenCalled();
            expect(textSpy).toHaveBeenCalledWith(0.25);
        });
    });

    describe("getPaneBackgroundKey()", () => {
        let mockScene;
        const { getPaneBackgroundKey } = shopLayout;

        beforeEach(() => {
            mockScene = {
                config: {
                    assetPrefix: "prefix",
                    assetKeys: {
                        background: "someBackground",
                    },
                },
            };
        });
        test("if a string is passed in config, concatenates with assetPrefix", () => {
            expect(getPaneBackgroundKey(mockScene, "shop")).toBe("prefix.someBackground");
        });
        test("if an empty string is passed, points to a transparent asset", () => {
            mockScene.config.assetKeys.background = "";
            expect(getPaneBackgroundKey(mockScene, "shop")).toBe("prefix.noBackground");
        });
        test("if an object is passed in config, asset key is contextual", () => {
            mockScene.config.assetKeys.background = { shop: "shopBackground" };
            expect(getPaneBackgroundKey(mockScene, "shop")).toBe("prefix.shopBackground");
        });
        test("empty strings can be passed to get the transparent BG", () => {
            mockScene.config.assetKeys.background = { shop: "" };
            expect(getPaneBackgroundKey(mockScene, "shop")).toBe("prefix.noBackground");
        });
    });
});
