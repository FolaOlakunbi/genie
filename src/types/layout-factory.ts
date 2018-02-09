declare interface LayoutFactory {
    getSize: any;
    keyLookup: ScreenMap;
    create(buttons: string[], keyLookup: { [s: string]: string }): any; //TODO - end should be Layout but the below import breaks the declaration.
    addToBackground(object: PIXI.DisplayObject): PIXI.DisplayObject;
    removeAll(): void;
    addLookups(keyLookups: ScreenMap): void;
}
