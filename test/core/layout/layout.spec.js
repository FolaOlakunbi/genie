import { assert } from "chai";
import * as sinon from "sinon";

import { Layout } from "../../../src/core/layout/layout";
import { Group } from "../../../src/core/layout/group";

describe("Layout", () => {
    const sandbox = sinon.sandbox.create();
    const randomKey = "1d67c228681df6ad7f0b05f069cd087c442934ab5e4e86337d70c832e110c61b";
    let mockGame;
    let mockScaler;

    beforeEach(() => {
        return initialiseGame().then(game => {
            mockGame = game;
            mockGame.world = {
                addChild: sandbox.spy(),
                children: [],
                shutdown: () => {},
            };
            mockGame.add = {
                sprite: sandbox.spy(() => new Phaser.Sprite(mockGame, 0, 0)),
                group: sandbox.spy(),
            };
            mockGame.renderer = { resolution: 1, destroy: () => {} };
            mockGame.input = {
                interactiveItems: { add: sandbox.spy() },
                reset: () => {},
                destroy: () => {},
            };

            mockScaler = {
                getSize: sandbox.spy(() => ({ width: 200, height: 200 })),
                onScaleChange: { add: sandbox.spy() },
            };
        });
    });

    afterEach(() => {
        sandbox.restore();
        mockGame.destroy();
    });

    //Currently suffers from a "game instanceof Phaser.Game" typecheck issue
    it("should add the correct number of GEL buttons for a given config", () => {
        const layout1 = new Layout(mockGame, mockScaler, ["achievements"]);
        assert(Object.keys(layout1.buttons).length === 1);

        const layout2 = new Layout(mockGame, mockScaler, ["play", "audioOff", "settings"]);
        assert(Object.keys(layout2.buttons).length === 3);

        const layout3 = new Layout(mockGame, mockScaler, [
            "achievements",
            "exit",
            "howToPlay",
            "play",
            "audioOff",
            "settings",
        ]);
        assert(Object.keys(layout3.buttons).length === 6);
    });

    it("Should create 9 Gel Groups", () => {
        const layout = new Layout(mockGame, mockScaler, []);
        assert(layout.root.children.length === 9);
    });

    it("Should add items to the correct group", () => {
        const layout = new Layout(mockGame, mockScaler, []);
        const testElement = new Phaser.Sprite(mockGame, 0, 0);

        layout.addToGroup("middleRight", testElement);

        const groupsWithChildren = layout.root.children.filter(element => element.length);

        assert(groupsWithChildren.length === 1);
        assert(groupsWithChildren[0].name === "middleRight");
    });

    it("Should correctly insert an item using the index position property", () => {
        const layout = new Layout(mockGame, mockScaler, []);
        const testElement = new Phaser.Sprite(mockGame, 0, 0);
        testElement.randomKey = randomKey;

        layout.addToGroup("topLeft", new Phaser.Sprite(mockGame, 0, 0));
        layout.addToGroup("topLeft", new Phaser.Sprite(mockGame, 0, 0));
        layout.addToGroup("topLeft", new Phaser.Sprite(mockGame, 0, 0));

        layout.addToGroup("topLeft", testElement, 2);

        const leftTopGroup = layout.root.children.find(element => element.name === "topLeft");
        assert(leftTopGroup.children[2].randomKey === randomKey);
    });

    //Currently suffers from a "game instanceof Phaser.Game" typecheck issue
    it("Should set button callbacks using the 'setAction' method", () => {
        const layout = new Layout(mockGame, mockScaler, ["achievements", "exit", "settings"]);

        const testAction = sandbox.spy();

        layout.setAction("exit", testAction);

        layout.buttons.exit.events.onInputUp.dispatch({}, {});
        layout.buttons.exit.events.onInputUp.dispatch({}, {});
        layout.buttons.exit.events.onInputUp.dispatch({}, {});

        assert(testAction.callCount === 3);
    });

    //Currently suffers from a "game instanceof Phaser.Game" typecheck issue
    it("Should add buttons using the correct tab order", () => {
        const rndOrder = [
            "exit",
            "home",
            "achievements",
            "howToPlay",
            "play",
            "settings",
            "audioOff",
            "audioOn",
            "previous",
            "next",
            "continue",
            "restart",
            "back",
            "pause",
        ];
        const tabOrder = [
            "exit",
            "home",
            "back",
            "audioOff",
            "audioOn",
            "settings",
            "pause",
            "previous",
            "play",
            "next",
            "achievements",
            "restart",
            "continue",
            "howToPlay",
        ];

        const layout = new Layout(mockGame, mockScaler, rndOrder);
        assert.deepEqual(Object.keys(layout.buttons), tabOrder);
    });

    it("Should reset the groups after they have been added to the layout", () => {
        const resizeFuncSpy = sandbox.spy(Layout.prototype, "resize");
        const groupResetStub = sandbox.stub(Group.prototype, "reset");

        new Layout(mockGame, mockScaler, []);

        sinon.assert.calledOnce(resizeFuncSpy);
        assert(groupResetStub.callCount === 9);
    });
});

function initialiseGame() {
    return new Promise(resolve => {
        // tslint:disable-next-line:no-unused-expression
        new Phaser.Game({
            state: new class extends Phaser.State {
                create() {
                    resolve(this.game);
                }
            }(),
        });
    });
}