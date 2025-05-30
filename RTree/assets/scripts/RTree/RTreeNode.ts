import { Item, Rect } from "./Define";

export class RTreeNode<T = any> {

    children: Array<RTreeNode<T> | Item<T>> = [];

    leaf: boolean = true;

    bounds: Rect = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

    get minX() { return this.bounds.minX; }
    get minY() { return this.bounds.minY; }
    get maxX() { return this.bounds.maxX; }
    get maxY() { return this.bounds.maxY; }

    constructor(public maxEntries: number) { }

    updateBounds() {

        const b = this.bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

        for (const child of this.children) {
            b.minX = Math.min(b.minX, child.minX);
            b.minY = Math.min(b.minY, child.minY);
            b.maxX = Math.max(b.maxX, child.maxX);
            b.maxY = Math.max(b.maxY, child.maxY);
        }
    }
}