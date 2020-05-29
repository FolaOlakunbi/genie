/**
 * @copyright BBC 2020
 * @author BBC Children's D+E
 * @license Apache-2.0
 */
import { nextPage } from "../../../src/core/background/pages.js";

describe("Background Pages", () => {
    let mockScene;
    let mockTimedItem;
    let mockSound;
    let mockTween;

    beforeEach(() => {
        mockTimedItem = { stop: jest.fn() };
        mockSound = { play: jest.fn(), testKey: "mockSound" };
        mockTween = { play: jest.fn(), testKey: "mockTween" };
        mockScene = {
            pageIdx: -1,
            timedItems: [mockTimedItem],
            context: { theme: { background: { pages: [] } } },
            navigation: { next: jest.fn() },
            sound: {
                add: jest.fn(() => mockSound),
            },
            tweens: {
                add: jest.fn(() => mockTween),
            },
        };
    });

    afterEach(jest.clearAllMocks);

    describe("nextPage", () => {
        test("increments page index", () => {
            mockScene.pageIdx = 2;
            nextPage(mockScene)();
            expect(mockScene.pageIdx).toBe(3);
        });

        test("calls stop with value of 1 on timedItems", () => {
            nextPage(mockScene)();
            expect(mockTimedItem.stop).toHaveBeenCalledWith(1);
        });

        test("calls navigation.next if last page", () => {
            mockScene.context.theme.background.pages = [1, 2, 3];
            mockScene.pageIdx = 2;
            nextPage(mockScene)();
            expect(mockScene.navigation.next).toHaveBeenCalled();
        });

        test("adds a Phaser sound to timedItems if configured in page", () => {
            mockScene.context.theme.background.pages = [["testAudio"]];
            mockScene.context.theme.background.audio = [{ name: "testAudio" }];
            nextPage(mockScene)();
            expect(mockScene.timedItems[0]).toBe(mockSound);
        });

        test("adds a Phaser tween to timedItems if configured in page", () => {
            mockScene.context.theme.background.pages = [["testTween"]];
            mockScene.context.theme.background.tweens = [{ name: "testTween", targets: [] }];
            nextPage(mockScene)();
            expect(mockScene.timedItems[0]).toBe(mockTween);
        });

        describe("Non Narrative screen usage", () => {
            beforeEach(() => {
                delete mockScene.context.theme.background.pages;
            });
            test("adds all audio and tweens if no pages configured", () => {
                mockScene.context.theme.background.tweens = [{ name: "testTween", targets: [] }];
                mockScene.context.theme.background.audio = [{ name: "testAudio" }];
                nextPage(mockScene)();
                expect(mockScene.timedItems).toEqual([mockTween, mockSound]);
            });

            test("adds all tweens if no pages and no audio configured", () => {
                mockScene.context.theme.background.tweens = [{ name: "testTween", targets: [] }];
                nextPage(mockScene)();
                expect(mockScene.timedItems).toEqual([mockTween]);
            });

            test("adds all audio if no pages configured and no tweens configured", () => {
                mockScene.context.theme.background.audio = [{ name: "testAudio" }];
                nextPage(mockScene)();
                expect(mockScene.timedItems).toEqual([mockSound]);
            });
        });
    });
});
