import { _decorator, Component, instantiate, macro, Node, Prefab, UITransform } from "cc";
import Quadtree from "./Quadtree";
import QuadTreeNode from "./QuadTreeNode";
import Bullet from "./game/Bullet";
import Enemy from "./game/Enemy";

const { ccclass, property } = _decorator;

@ccclass('MainScene')
export default class MainScene extends Component {

    @property({ type: Node })
    fightLayer: Node = null;

    @property({ type: Prefab })
    enemyPrefab: Prefab = null;

    @property({ type: Prefab })
    bulletPrefab: Prefab = null;

    @property({ type: QuadTreeNode })
    player: QuadTreeNode = null;

    @property({ type: Component })
    timer: Component = null;

    private bullets: Bullet[] = [];

    private enemies: Enemy[] = [];

    private quadtree: Quadtree;

    private canMoveLeft: boolean = false;
    private canMoveRight: boolean = false;
    private canMoveUp: boolean = false;
    private canMoveDown: boolean = false;
    private playerFire: boolean = false;
    private isFighting: boolean = false;

    private get transform(): UITransform {
        return this.getComponent(UITransform);
    }

    protected onLoad(): void {
        this.quadtree = new Quadtree(0, { x: -this.transform.width * 0.5, y: - this.transform.height * 0.5, width: this.transform.width, height: this.transform.height });
    }

    protected start(): void {
        this.loopCall(1, 0.1, () => {
            this.createEnemy();
        });

        document.addEventListener('keydown', this.onDomKeyDown.bind(this));
        document.addEventListener('keyup', this.onDomKeyUp.bind(this));
    }

    private onDomKeyDown(event: KeyboardEvent) {
        switch (event.code) {
            case 'KeyA':
                this.canMoveLeft = true;
                this.canMoveRight = false;
                this.isFighting = true;
                break;
            case 'KeyD':
                this.canMoveRight = true;
                this.canMoveLeft = false;
                this.isFighting = true;
                break;
            case 'KeyW':
                this.canMoveUp = true;
                this.canMoveDown = false;
                this.isFighting = true;
                break;
            case 'KeyS':
                this.canMoveDown = true;
                this.canMoveUp = false;
                this.isFighting = true;
                break;
            case 'KeyJ':
                this.playerFire = true;
                this.isFighting = true;
                break;
            default:
                break;
        }
    }

    private onDomKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case 'a':
                this.canMoveLeft = false;
                break;
            case 'd':
                this.canMoveRight = false;
                break;
            case 'w':
                this.canMoveUp = false;
                break;
            case 's':
                this.canMoveDown = false;
                break;
            case 'j':
                this.playerFire = false;
                break;
            default:
                break;
        }

        if (!this.canMoveLeft && !this.canMoveRight && !this.canMoveUp && !this.canMoveDown) {
            this.isFighting = false;
        }
    }

    private timeCount: number = 0;

    update(dt: number) {
        let fram = dt * (this.isFighting ? 10 : 1);

        this.timeCount += dt;

        this.fire(fram);

        this.playerMove(fram);

        this.quadTreeCollid(fram);
        // this.narmalCollid(fram);
    }

    private narmalCollid(fram: number) {
        let bIndex = 0;
        while (bIndex < this.bullets.length) {
            let bullet = this.bullets[bIndex];
            if (bullet.isHide) {
                bullet.node.removeFromParent();
                bullet.destroy();
                this.bullets.splice(bIndex, 1);
                continue;
            }
            bullet.move(fram);
            bIndex++;
        }

        let eIndex = 0;
        while (eIndex < this.enemies.length) {
            let enemy = this.enemies[eIndex];
            if (enemy.isHide) {
                enemy.node.removeFromParent();
                enemy.destroy();
                this.enemies.splice(eIndex, 1);
                continue;
            }
            enemy.move(fram);
            eIndex++;
        }

        let hbIndex = 0;
        while (hbIndex < this.bullets.length) {
            let bullet = this.bullets[hbIndex];
            let heIndex = 0;
            while (heIndex < this.enemies.length) {
                let enemyRect = this.enemies[heIndex];
                if (this.isColliding(bullet, enemyRect)) {
                    bullet.isHide = true;
                    enemyRect.isHide = true;
                    bullet.node.active = false;
                    enemyRect.node.active = false;
                }
                heIndex++;
            }
            hbIndex++;
        }
    }

    private quadTreeCollid(fram: number) {
        this.quadtree.clear();

        // 插入敌人
        let eIndex = 0;
        while (eIndex < this.enemies.length) {
            let enemy = this.enemies[eIndex];
            if (enemy.isHide) {
                enemy.node.removeFromParent();
                enemy.destroy();
                this.enemies.splice(eIndex, 1);
                continue;
            }
            enemy.move(fram);
            this.quadtree.insert(enemy);
            eIndex++;
        }


        let bIndex = 0;
        // 遍历子弹，检测可能碰撞的敌人
        while (bIndex < this.bullets.length) {
            if (this.bullets[bIndex].isHide) {
                this.bullets[bIndex].node.removeFromParent();
                this.bullets[bIndex].destroy();
                this.bullets.splice(bIndex, 1);
                continue;
            }

            let bullet = this.bullets[bIndex];
            bullet.move(fram);

            const possibleEnemies: Enemy[] = this.quadtree.retrieve([], bullet) as Enemy[];

            let pIndex = 0;
            while (pIndex < possibleEnemies.length) {
                let enemyRect = possibleEnemies[pIndex];
                if (this.isColliding(bullet, enemyRect)) {
                    bullet.isHide = true;
                    enemyRect.isHide = true;
                    bullet.node.active = false;
                    enemyRect.node.active = false;
                    enemyRect.logQuadIndex();
                }
                pIndex++;
            }
            bIndex++;
        }
    }

    private isLog: boolean = true;
    private collidingCount: number = 0;
    private isColliding(a: QuadTreeNode, b: QuadTreeNode): boolean {
        let count = Math.PI * 2 / 0.1478;
        let count2 = Math.PI * 2 / 0.3698;
        let count3 = count2 / count;

        this.collidingCount++;
        if (this.timeCount > 10 && this.isLog) {
            console.log("count: ", this.collidingCount);
            this.isLog = false;
        }
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    private createEnemy() {
        const enemy = instantiate(this.enemyPrefab);
        enemy.parent = this.fightLayer;
        let enemyHeight = enemy.getComponent(UITransform).height;
        enemy.setPosition(Math.random() * this.transform.width - this.transform.width * 0.5, this.transform.height * 0.5 + enemyHeight * 0.5, 0);

        const enemyNode = enemy.getComponent(Enemy);
        this.enemies.push(enemyNode);
    }

    private createBullet() {
        const bullet = instantiate(this.bulletPrefab);
        bullet.parent = this.fightLayer;

        bullet.setPosition(this.player.node.position.clone());
        const bulletNode = bullet.getComponent(Bullet);
        this.bullets.push(bulletNode);
    }

    private loopCall(delayDuration: number, loopInterval: number, callback: Function) {
        delayDuration = Math.max(delayDuration, 0.0001);
        if (this.timer) {
            this.timer.schedule(callback, loopInterval, macro.REPEAT_FOREVER, delayDuration);
        }
    }

    private readonly playerSpeed: number = 50;

    private playerMove(dt: number) {
        if (!this.canMoveDown && !this.canMoveLeft && !this.canMoveRight && !this.canMoveUp) {
            return;
        }
        let pos = this.player.node.position.clone();
        if (this.canMoveLeft) {
            pos.x -= this.playerSpeed * dt;
            if (pos.x < -this.transform.width * 0.5) {
                pos.x = -this.transform.width * 0.5;
            }
        }

        if (this.canMoveRight) {
            pos.x += this.playerSpeed * dt;
            if (pos.x > this.transform.width * 0.5) {
                pos.x = this.transform.width * 0.5;
            }
        }

        if (this.canMoveUp) {
            pos.y += this.playerSpeed * dt;
            if (pos.y > this.transform.height * 0.5) {
                pos.y = this.transform.height * 0.5;
            }
        }

        if (this.canMoveDown) {
            pos.y -= this.playerSpeed * dt;
            if (pos.y < -this.transform.height * 0.5) {
                pos.y = -this.transform.height * 0.5;
            }
        }

        this.player.node.setPosition(pos);
    }

    private readonly enemyFireSpeed: number = 0.5;
    private fireCount: number = 0;
    private fire(dt: number) {
        if (this.playerFire == false) {
            return;
        }
        this.fireCount += dt;
        if (this.fireCount > this.enemyFireSpeed) {
            this.createBullet();
            this.fireCount = 0;
        }
    }
}