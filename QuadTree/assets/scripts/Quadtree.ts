import QuadTreeNode from "./QuadTreeNode";

export interface QuadTreeRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default class Quadtree {

    private readonly MAX_OBJECTS = 6;
    private readonly MAX_LEVELS = 5;

    private level: number = 0;
    private objects: QuadTreeNode[] = []
    private bounds: QuadTreeRect;

    private nodes: Quadtree[] = [];

    constructor(level: number, bounds: QuadTreeRect) {
        this.level = level;
        this.bounds = bounds;
    }

    clear() {
        this.objects = [];
        for (const node of this.nodes) {
            node.clear();
        }
        this.nodes = [];
    }

    private split() {
        const { x, y, width, height } = this.bounds;
        const halfW = width / 2;
        const halfH = height / 2;

        // 右上
        this.nodes[0] = new Quadtree(this.level + 1, { x: x + halfW, y: y + halfH, width: halfW, height: halfH });
        // 左上
        this.nodes[1] = new Quadtree(this.level + 1, { x: x, y: y + halfH, width: halfW, height: halfH });
        // 左下
        this.nodes[2] = new Quadtree(this.level + 1, { x: x, y: y, width: halfW, height: halfH });
        // 右下
        this.nodes[3] = new Quadtree(this.level + 1, { x: x + halfW, y: y, width: halfW, height: halfH });
    }

    private getIndex(rect: QuadTreeNode): number {
        const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

        const top = rect.y > horizontalMidpoint;
        const bottom = rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint;

        if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
            if (top) return 1; // 左上
            if (bottom) return 2; // 左下
        } else if (rect.x > verticalMidpoint) {
            if (top) return 0; // 右上
            if (bottom) return 3; // 右下
        }

        return -1; // 跨区域
    }

    insert(rect: QuadTreeNode) {
        if (this.nodes.length > 0) {
            const index = this.getIndex(rect);
            if (index !== -1) {
                rect.setIndex(index, this.level);
                this.nodes[index].insert(rect);
                return;
            }
        }

        this.objects.push(rect);

        if (this.objects.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
            if (this.nodes.length === 0) this.split();

            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    const obj = this.objects.splice(i, 1)[0];
                    rect.setIndex(index, this.level);
                    this.nodes[index].insert(obj);
                } else {
                    i++;
                }
            }
        }
    }

    retrieve(returnObjects: QuadTreeNode[], rect: QuadTreeNode): QuadTreeNode[] {
        const index = this.getIndex(rect);
        if (index !== -1 && this.nodes.length > 0) {
            this.nodes[index].retrieve(returnObjects, rect);
        }

        returnObjects.push(...this.objects);
        return returnObjects;
    }
}