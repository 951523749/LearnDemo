import { _decorator } from "cc";
import BaseItem from "./BaseItem";

const { ccclass } = _decorator;

@ccclass("MyView")
export default class MyView extends BaseItem<MyView> {

    get data(): MyView {
        return this
    }

    onLoad(): void {

    }

    start(): void {

    }

}