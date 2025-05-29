import { _decorator } from "cc";
import QuadTreeNode from "../QuadTreeNode";

const { ccclass, property } = _decorator;

@ccclass('Bullet')
export default class Bullet extends QuadTreeNode {

    protected speed: number = 100;

    constructor() {
        super();
    }

    protected onLoad(): void {

    }

    protected start(): void {

    }

    move(dt: number): void {
        let pos = this.node.position.clone();
        pos.y += this.speed * dt;
        this.node.setPosition(pos);
    }
}