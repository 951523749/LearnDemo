import { _decorator } from "cc";
import BaseItem from "./BaseItem";
import MainScene from "./MainScene";

const { ccclass } = _decorator;

@ccclass("Building")
export default class Building extends BaseItem<Building> {

    get data(): Building {
        return this;
    }

    buildingId: string = "";

    onLoad(): void {

    }

    start(): void {
        MainScene.insert(this);
    }
}
