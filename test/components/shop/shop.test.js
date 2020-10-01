import { Shop } from "../../../src/components/shop/shop.js";
import * as scroller from "../../../src/core/layout/scrollable-list/scrollable-list.js";

describe("Shop", () => {
    let shopScreen;
    let mockData;

    beforeEach(() => {
        shopScreen = new Shop();
        mockData = {
            config: { shop: {}, home: {}, furniture: []}
        }
        shopScreen.setData(mockData);
        shopScreen.scene = { key: "shop" };
        shopScreen.addBackgroundItems = jest.fn();
        shopScreen.setLayout = jest.fn();
        scroller.scrollableList = jest.fn().mockReturnValue("foo");
    });

    afterEach(() => jest.clearAllMocks());

    describe("create()", () => {
        beforeEach(() => {
            shopScreen.create();
        });

        test("adds background items", () => {
            expect(shopScreen.addBackgroundItems).toHaveBeenCalled();
        });

        test("adds GEL buttons to layout", () => {
            const expectedButtons = ["exit", "audio"];
            expect(shopScreen.setLayout).toHaveBeenCalledWith(expectedButtons);
        });

        test("adds a scrollable list panel", () => {
            expect(scroller.scrollableList).toHaveBeenCalled();
            expect(shopScreen.panel).toBe("foo");
        });
    });
});