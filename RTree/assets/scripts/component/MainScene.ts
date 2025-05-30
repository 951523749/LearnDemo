import { _decorator, Component, EventKeyboard, input, Input, UITransform } from "cc";
import { RTree } from "../RTree/RTree";
import Building from "./Building";
import MyView from "./MyView";

const { ccclass, property } = _decorator;

@ccclass("MainScene")
export default class MainScene extends Component {

    @property({ type: MyView })
    myVeiw: MyView = null;

    public static instantce: MainScene;

    private readonly tree = new RTree<Building>();

    private allBuilding: Building[] = [];

    private get transform(): UITransform {
        return this.getComponent(UITransform);
    }

    private static buildingIndex: number = 0;
    public static insert(obj: Building) {
        obj.buildingId = "building_" + MainScene.buildingIndex;
        MainScene.instantce.allBuilding.push(obj);
        MainScene.instantce.tree.insert(obj);
        MainScene.buildingIndex++;
    }

    private count: number = 0;
    protected update(dt: number): void {
        this.playerMove(dt);
        if (this.count % 2 == 0) {
            this.allBuilding.forEach((item) => item.node.active = false);
            if (this.myVeiw) {
                let building = this.tree.search(this.myVeiw)
                building.forEach((item) => {
                    item.node.active = true;
                })
            }
        }
        this.count++;
    }

    protected onLoad(): void {
        MainScene.instantce = this;

    }

    protected start(): void {
        console.warn("1111");

        input.on(Input.EventType.KEY_DOWN, this.onDomKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onDomKeyUp, this);
        // document.addEventListener('keydown', this.onDomKeyDown);
        // document.addEventListener('keyup', this.onDomKeyUp);
    }

    private onDomKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case 65:
                this.canMoveLeft = true;
                this.canMoveRight = false;
                break;
            case 68:
                this.canMoveRight = true;
                this.canMoveLeft = false;
                break;
            case 87:
                this.canMoveUp = true;
                this.canMoveDown = false;
                break;
            case 83:
                this.canMoveDown = true;
                this.canMoveUp = false;
                break;
            default:
                break;
        }
    }

    private onDomKeyUp(event: EventKeyboard) {

        switch (event.keyCode) {
            case 65:
                this.canMoveLeft = false;
                break;
            case 68:
                this.canMoveRight = false;
                break;
            case 87:
                this.canMoveUp = false;
                break;
            case 83:
                this.canMoveDown = false;
                break;
            default:
                break;
        }
    }

    private canMoveDown: boolean = false;
    private canMoveLeft: boolean = false;
    private canMoveRight: boolean = false;
    private canMoveUp: boolean = false;
    private playerSpeed: number = 500;
    private playerMove(dt: number) {
        if (!this.canMoveDown && !this.canMoveLeft && !this.canMoveRight && !this.canMoveUp) {
            return;
        }
        let pos = this.myVeiw.node.position.clone();
        let width = this.myVeiw.width;
        let height = this.myVeiw.height;
        if (this.canMoveLeft) {
            pos.x -= this.playerSpeed * dt;
            if (pos.x - width * 0.5 < -this.transform.width * 0.5) {
                pos.x = -this.transform.width * 0.5 + width * 0.5;
            }
        }

        if (this.canMoveRight) {
            pos.x += this.playerSpeed * dt;
            if (pos.x + width * 0.5 > this.transform.width * 0.5) {
                pos.x = this.transform.width * 0.5 - width * 0.5;
            }
        }

        if (this.canMoveUp) {
            pos.y += this.playerSpeed * dt;
            if (pos.y + height * 0.5 > this.transform.height * 0.5) {
                pos.y = this.transform.height * 0.5 - height * 0.5;
            }
        }

        if (this.canMoveDown) {
            pos.y -= this.playerSpeed * dt;
            if (pos.y - height * 0.5 < -this.transform.height * 0.5) {
                pos.y = -this.transform.height * 0.5 + height * 0.5;
            }
        }

        this.myVeiw.node.setPosition(pos);
    }
}

