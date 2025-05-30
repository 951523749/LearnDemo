import { Component, UITransform } from "cc";

export default abstract class BaseItem<T> extends Component {

    private get trf(): UITransform {
        return this.getComponent(UITransform);
    }

    get minX(): number {
        return this.node.position.x - this.trf.width / 2;
    }

    get minY(): number {
        return this.node.position.y - this.trf.height / 2;
    }

    get maxX(): number {
        return this.node.position.x + this.trf.width / 2;
    }

    get maxY(): number {
        return this.node.position.y + this.trf.height / 2;
    }

    get width(): number {
        return this.trf.width;
    }

    get height(): number {
        return this.trf.height;
    }

    private get transform(): UITransform {
        return this.getComponent(UITransform);
    }

    abstract get data(): T;

    abstract onLoad(): void;

    abstract start(): void;
}