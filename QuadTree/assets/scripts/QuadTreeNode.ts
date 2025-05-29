
import { _decorator, Component, UITransform } from 'cc';
const { ccclass } = _decorator;

@ccclass('QuadTreeNode')
export default class QuadTreeNode extends Component {

    private level: number = 0;
    private index: number = 0;

    public isHide: boolean = false;

    setIndex(i: number, l: number) {
        this.index = i;
        this.level = l;
    }

    logQuadIndex() {
        console.log("level: ", this.level, "index: ", this.index);
    }

    private get transform(): UITransform {
        return this.getComponent(UITransform);
    }

    get x(): number {
        return this.node.position.x - this.width * 0.5;
    }

    get y(): number {
        return this.node.position.y - this.height * 0.5;
    }

    get width(): number {
        return this.transform.width;
    }

    get height(): number {
        return this.transform.height;
    }

    get name(): string {
        return this.node.name;
    }
}