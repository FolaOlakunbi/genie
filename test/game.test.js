/**
 * @copyright BBC 2018
 * @author BBC Children's D+E
 * @license Apache-2.0
 */

import { accessibilify } from "../src/core/accessibility/accessibilify.js";
import { Game } from "../src/components/game";

jest.mock("../src/core/accessibility/accessibilify.js");

describe("Game", () => {
    const expectedButtonStyle = {
        font: "40px ReithSans",
        fill: "#fff",
        align: "center",
        wordWrap: true,
        wordWrapWidth: 223,
    };

    let game;
    let mockData;
    let mockText;
    let mockTextSetOrigin;
    let mockTextSetInteractive;
    let mockTextOn;
    let mockImage;
    let mockImageSetOrigin;
    let mockImageSetInteractive;
    let mockImageOn;

    beforeEach(() => {
        game = new Game();

        mockTextOn = jest.fn();
        mockTextSetInteractive = { on: jest.fn(() => mockTextOn) };
        mockTextSetOrigin = { setInteractive: jest.fn(() => mockTextSetInteractive) };
        mockText = { setOrigin: jest.fn(() => mockTextSetOrigin) };

        mockImageOn = jest.fn();
        mockImageSetInteractive = { on: jest.fn(() => mockImageOn) };
        mockImageSetOrigin = { setInteractive: jest.fn(() => mockImageSetInteractive) };
        mockImage = { setOrigin: jest.fn(() => mockImageSetOrigin) };

        mockData = {
            config: { theme: { game: { achievements: undefined }, home: {} } },
        };
        game.setData(mockData);
        game.scene = {
            key: "game",
        };
        game.add = {
            image: jest.fn(() => mockImage),
            text: jest.fn(() => mockText),
        };
        game.setLayout = jest.fn();
        game.navigation = { next: jest.fn() };
        game.transientData = {
            "character-select": { choice: { title: "Kawabashi" } },
            "level-select": { choice: { title: "Hard level" } },
        };
    });

    afterEach(() => jest.clearAllMocks());

    describe("Layout", () => {
        beforeEach(() => game.create());

        test("adds a background image", () => {
            expect(game.add.image).toHaveBeenCalledWith(0, 0, "home.background");
        });

        test("adds animations", () => {
            game.addAnimations = jest.fn();
            game.create();
            expect(game.addAnimations).toHaveBeenCalled();
        });

        test("adds title text", () => {
            expect(game.add.text).toHaveBeenCalledWith(0, -190, "Test Game: Collect Items", {
                font: "65px ReithSans",
                fill: "#f6931e",
                align: "center",
            });
        });

        test("adds a pause button to the layout", () => {
            expect(game.setLayout).toHaveBeenCalled();
        });

        test("adds an image for keys, gems, and stars", () => {
            expect(game.add.image).toHaveBeenCalledWith(0, -70, "game.star");
            expect(game.add.image).toHaveBeenCalledWith(0, 20, "game.gem");
            expect(game.add.image).toHaveBeenCalledWith(0, 110, "game.key");
        });

        test("adds a score for keys, gems, and stars", () => {
            expect(game.add.text).toHaveBeenCalledWith(-50, -70, "0", expectedButtonStyle);
            expect(game.add.text).toHaveBeenCalledWith(-50, 20, "0", expectedButtonStyle);
            expect(game.add.text).toHaveBeenCalledWith(-50, 110, "0", expectedButtonStyle);
        });

        test("adds continue button", () => {
            expect(game.add.image).toHaveBeenCalledWith(300, 20, "game.basicButton");
            expect(game.add.text).toHaveBeenCalledWith(300, 20, "Continue", expectedButtonStyle);
        });

        test("adds collect star button", () => {
            expect(game.add.image).toHaveBeenCalledWith(-200, -70, "game.basicButton");
            expect(game.add.text).toHaveBeenCalledWith(-200, -70, "Collect Star", expectedButtonStyle);
        });

        test("adds collect gem button", () => {
            expect(game.add.image).toHaveBeenCalledWith(-200, 20, "game.basicButton");
            expect(game.add.text).toHaveBeenCalledWith(-200, 20, "Collect Gem", expectedButtonStyle);
        });

        test("adds collect key button", () => {
            expect(game.add.image).toHaveBeenCalledWith(-200, 110, "game.basicButton");
            expect(game.add.text).toHaveBeenCalledWith(-200, 110, "Collect Key", expectedButtonStyle);
        });

        test("displays the character selected", () => {
            const expectedCharacter = `Character Selected: ${game.transientData["character-select"].choice.title}`;
            expect(game.add.text).toHaveBeenCalledWith(0, 200, expectedCharacter, {
                font: "32px ReithSans",
                fill: "#f6931e",
                align: "center",
            });
        });

        test("displays the level selected", () => {
            const expectedLevel = `Level Selected: ${game.transientData["level-select"].choice.title}`;
            expect(game.add.text).toHaveBeenCalledWith(0, 250, expectedLevel, {
                font: "32px ReithSans",
                fill: "#f6931e",
                align: "center",
            });
        });
    });

    describe("Button behaviour", () => {
        describe("Star button", () => {
            let buttonConfig;
            let starButtonClickedOn;
            let starTextClickedOn;
            let starScore;

            beforeEach(() => {
                buttonConfig = {};
                starTextClickedOn = jest.fn();
                starButtonClickedOn = jest.fn(() => buttonConfig);
                starScore = { text: 0 };

                game.add.text = jest.fn((x, y, text) => {
                    if (x === -200 && y === -70 && text === "Collect Star") {
                        return {
                            setOrigin: jest.fn(() => ({
                                setInteractive: jest.fn(() => ({
                                    on: starTextClickedOn,
                                })),
                            })),
                        };
                    }
                    if (x === -50 && y === -70 && text === "0") {
                        return {
                            setOrigin: jest.fn(() => starScore),
                        };
                    }
                    return mockImage;
                });

                game.add.image = jest.fn((x, y, name) => {
                    if (x === -200 && y === -70 && name === "game.basicButton") {
                        return {
                            setOrigin: jest.fn(() => ({
                                setInteractive: jest.fn(() => ({
                                    on: starButtonClickedOn,
                                })),
                            })),
                        };
                    }
                    return mockImage;
                });
                game.create();
            });

            test("sets button config correctly", () => {
                const expectedButtonConfig = { config: { id: 1, ariaLabel: "Collect Star" } };
                expect(buttonConfig).toEqual(expectedButtonConfig);
            });

            test("adds a star when 'collect star' button is clicked", () => {
                starButtonClickedOn.mock.calls[0][1]();
                expect(starScore.text).toBe(1);
            });

            test("adds a star when 'collect star' text is clicked", () => {
                starTextClickedOn.mock.calls[0][1]();
                expect(starScore.text).toBe(1);
            });
        });

        describe("Gem button", () => {
            let buttonConfig;
            let gemButtonClickedOn;
            let gemTextClickedOn;
            let gemScore;

            beforeEach(() => {
                buttonConfig = {};
                gemButtonClickedOn = jest.fn(() => buttonConfig);
                gemTextClickedOn = jest.fn();
                gemScore = { text: 0 };

                game.add.text = jest.fn((x, y, text) => {
                    if (x === -50 && y === 20 && text === "0") {
                        return {
                            setOrigin: jest.fn(() => gemScore),
                        };
                    }
                    if (x === -200 && y === 20 && text === "Collect Gem") {
                        return {
                            setOrigin: jest.fn(() => ({
                                setInteractive: jest.fn(() => ({
                                    on: gemTextClickedOn,
                                })),
                            })),
                        };
                    }
                    return mockImage;
                });

                game.add.image = jest.fn((x, y, name) => {
                    if (x === -200 && y === 20 && name === "game.basicButton") {
                        return {
                            setOrigin: jest.fn(() => ({
                                setInteractive: jest.fn(() => ({
                                    on: gemButtonClickedOn,
                                })),
                            })),
                        };
                    }
                    return mockImage;
                });
                game.create();
            });

            test("sets button config correctly", () => {
                const expectedButtonConfig = { config: { id: 2, ariaLabel: "Collect Gem" } };
                expect(buttonConfig).toEqual(expectedButtonConfig);
            });

            test("adds a gem when 'collect gem' button is clicked", () => {
                gemButtonClickedOn.mock.calls[0][1]();
                expect(gemScore.text).toBe(1);
            });

            test("adds a gem when 'collect gem' text is clicked", () => {
                gemTextClickedOn.mock.calls[0][1]();
                expect(gemScore.text).toBe(1);
            });
        });

        describe("Key button", () => {
            let buttonConfig;
            let keyButtonClickedOn;
            let keyTextClickedOn;
            let keyScore;

            beforeEach(() => {
                buttonConfig = {};
                keyButtonClickedOn = jest.fn(() => buttonConfig);
                keyTextClickedOn = jest.fn();
                keyScore = { text: 0 };

                game.add.text = jest.fn((x, y, text) => {
                    if (x === -50 && y === 110 && text === "0") {
                        return {
                            setOrigin: jest.fn(() => keyScore),
                        };
                    }
                    if (x === -200 && y === 110 && text === "Collect Key") {
                        return {
                            setOrigin: jest.fn(() => ({
                                setInteractive: jest.fn(() => ({
                                    on: keyTextClickedOn,
                                })),
                            })),
                        };
                    }
                    return mockImage;
                });

                game.add.image = jest.fn((x, y, name) => {
                    if (x === -200 && y === 110 && name === "game.basicButton") {
                        return {
                            setOrigin: jest.fn(() => ({
                                setInteractive: jest.fn(() => ({
                                    on: keyButtonClickedOn,
                                })),
                            })),
                        };
                    }
                    return mockImage;
                });
                game.create();
            });

            test("sets button config correctly", () => {
                const expectedButtonConfig = { config: { id: 3, ariaLabel: "Collect Key" } };
                expect(buttonConfig).toEqual(expectedButtonConfig);
            });

            test("adds a key when 'collect key' button is clicked", () => {
                keyButtonClickedOn.mock.calls[0][1]();
                expect(keyScore.text).toBe(1);
            });

            test("adds a key when 'collect key' text is clicked", () => {
                keyTextClickedOn.mock.calls[0][1]();
                expect(keyScore.text).toBe(1);
            });
        });

        describe("Continue button", () => {
            let continueButtonClickedOn;
            let continueTextClickedOn;

            beforeEach(() => {
                continueButtonClickedOn = jest.fn(() => ({}));
                game.add.image = jest.fn((x, y, name) => {
                    if (x === 300 && y === 20 && name === "game.basicButton") {
                        return {
                            setOrigin: jest.fn(() => ({
                                setInteractive: jest.fn(() => ({
                                    on: continueButtonClickedOn,
                                })),
                            })),
                        };
                    }
                    return mockImage;
                });
                continueTextClickedOn = jest.fn();
                game.add.text = jest.fn((x, y, text) => {
                    if (x === 300 && y === 20 && text === "Continue") {
                        return {
                            setOrigin: jest.fn(() => ({
                                setInteractive: jest.fn(() => ({
                                    on: continueTextClickedOn,
                                })),
                            })),
                        };
                    }
                    return mockImage;
                });
                game.create();
            });

            test("saves data from the game when the continue button image is clicked", () => {
                continueButtonClickedOn.mock.calls[0][1]();
                expect(game.transientData.results).toEqual({ gems: 0, keys: 0, stars: 0 });
            });

            test("saves data from the game when the continue text is clicked", () => {
                continueTextClickedOn.mock.calls[0][1]();
                expect(game.transientData.results).toEqual({ gems: 0, keys: 0, stars: 0 });
            });

            test("navigates to the next screen when the continue button image is clicked", () => {
                continueButtonClickedOn.mock.calls[0][1]();
                expect(game.navigation.next).toHaveBeenCalled();
            });

            test("navigates to the next screen when the continue text is clicked", () => {
                continueTextClickedOn.mock.calls[0][1]();
                expect(game.navigation.next).toHaveBeenCalled();
            });
        });
    });
});