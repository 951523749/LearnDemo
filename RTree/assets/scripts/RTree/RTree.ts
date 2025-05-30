import { Item, Rect } from "./Define";
import { RTreeNode } from "./RTreeNode";

export class RTree<T = any> {

    private root: RTreeNode<T>;

    constructor(private maxEntries = 4) {
        this.root = new RTreeNode<T>(maxEntries);
    }

    insert(item: Item<T>) {
        const node = this.chooseLeaf(this.root, item);
        node.children.push(item);
        node.updateBounds();

        if (node.children.length > this.maxEntries) {
            this.splitIntoFour(node);
        }
    }

    search(area: Rect): T[] {
        const result: T[] = [];
        this._search(this.root, area, result);
        return result;
    }

    private _search(node: RTreeNode<T>, area: Rect, result: T[]) {
        
        if (!this.intersects(node.bounds, area)) {
            return;
        }

        for (const child of node.children) {
            if ('data' in child) {
                if (this.intersects(child, area)) {
                    result.push(child.data);
                }
            } else {
                this._search(child, area, result);
            }
        }
    }

    private chooseLeaf(node: RTreeNode<T>, item: Item<T>): RTreeNode<T> {
        if (node.leaf) return node;

        let bestChild: RTreeNode<T> | null = null;
        let minEnlargement = Infinity;

        for (const child of node.children) {
            if (child instanceof RTreeNode) {
                const oldArea = this.area(child.bounds);
                const newBounds = this.extend(child.bounds, item);
                const enlargement = this.area(newBounds) - oldArea;

                if (enlargement < minEnlargement) {
                    minEnlargement = enlargement;
                    bestChild = child;
                }
            }
        }

        return this.chooseLeaf(bestChild!, item);
    }

    private splitIntoFour(node: RTreeNode<T>) {
        const items = node.children as Item<T>[];

        // 计算所有元素的中心点的平均值
        const centers = items.map(item => ({
            x: (item.minX + item.maxX) / 2,
            y: (item.minY + item.maxY) / 2,
        }));

        const avgX = centers.reduce((sum, c) => sum + c.x, 0) / centers.length;
        const avgY = centers.reduce((sum, c) => sum + c.y, 0) / centers.length;

        // 4 个新节点（象限）
        const q1 = new RTreeNode<T>(this.maxEntries); // 右上
        const q2 = new RTreeNode<T>(this.maxEntries); // 左上
        const q3 = new RTreeNode<T>(this.maxEntries); // 左下
        const q4 = new RTreeNode<T>(this.maxEntries); // 右下

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const cx = centers[i].x;
            const cy = centers[i].y;

            if (cx >= avgX && cy >= avgY) q1.children.push(item); // 右上
            else if (cx < avgX && cy >= avgY) q2.children.push(item); // 左上
            else if (cx < avgX && cy < avgY) q3.children.push(item); // 左下
            else q4.children.push(item); // 右下
        }

        for (const q of [q1, q2, q3, q4]) q.updateBounds();

        // 若是根节点，提升为内部节点
        if (node === this.root) {
            const newRoot = new RTreeNode<T>(this.maxEntries);
            newRoot.leaf = false;
            newRoot.children = [q1, q2, q3, q4];
            newRoot.updateBounds();
            this.root = newRoot;
        } else {
            throw new Error("非根 split 暂未处理");
        }
    }

    private split(node: RTreeNode<T>) {
        const newNode = new RTreeNode<T>(this.maxEntries);
        newNode.leaf = node.leaf;

        // 简单分裂（把一半分出去）
        node.children.sort((a, b) => ('minX' in a ? a.minX : 0) - ('minX' in b ? b.minX : 0));
        const half = Math.ceil(node.children.length / 2);
        newNode.children = node.children.splice(half);
        node.updateBounds();
        newNode.updateBounds();

        if (node === this.root) {
            const newRoot = new RTreeNode<T>(this.maxEntries);
            newRoot.leaf = false;
            newRoot.children = [node, newNode];
            newRoot.updateBounds();
            this.root = newRoot;
        } else {
            throw new Error("Non-root splitting is not fully implemented in this simple demo.");
        }
    }

    private area(rect: Rect) {
        return (rect.maxX - rect.minX) * (rect.maxY - rect.minY);
    }

    private extend(a: Rect, b: Rect): Rect {
        return {
            minX: Math.min(a.minX, b.minX),
            minY: Math.min(a.minY, b.minY),
            maxX: Math.max(a.maxX, b.maxX),
            maxY: Math.max(a.maxY, b.maxY),
        };
    }

    private intersects(a: Rect, b: Rect): boolean {
        return a.minX <= b.maxX && a.maxX >= b.minX &&
            a.minY <= b.maxY && a.maxY >= b.minY;
    }
}