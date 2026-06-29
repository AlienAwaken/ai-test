// 游戏主循环
import Mech from './mech.js';
import Renderer from './renderer.js';
import UI from './ui.js';
import { InputHandler } from './input.js';

const GameState = {
    MENU: 'menu',
    SELECT: 'select',
    READY: 'ready',
    FIGHTING: 'fighting',
    END: 'end'
};

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.ui = new UI(canvas);
        this.input = new InputHandler();
        
        this.state = GameState.MENU;
        this.lastTime = 0;
        this.countdownTime = 0;
        this.countdownStart = 0;
        
        this.mech1 = null;
        this.mech2 = null;
        
        // 角色选择
        this.p1Selection = null;
        this.p2Selection = null;
        this.selectionConfirm1 = false;
        this.selectionConfirm2 = false;
        
        // 特效
        this.hitEffects = [];
        
        // 音效 (简单Web Audio)
        this.audioCtx = null;
        this.initAudio();
        
        // 绑定选择按键
        this.bindSelectKeys();
    }

    initAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio not supported');
        }
    }

    playSound(type) {
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        switch(type) {
            case 'attack':
                osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
                osc.start();
                osc.stop(this.audioCtx.currentTime + 0.1);
                break;
            case 'hit':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, this.audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
                osc.start();
                osc.stop(this.audioCtx.currentTime + 0.15);
                break;
            case 'defend':
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
                osc.frequency.setValueAtTime(200, this.audioCtx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
                osc.start();
                osc.stop(this.audioCtx.currentTime + 0.1);
                break;
            case 'victory':
                osc.type = 'square';
                osc.frequency.setValueAtTime(262, this.audioCtx.currentTime);
                osc.frequency.setValueAtTime(330, this.audioCtx.currentTime + 0.1);
                osc.frequency.setValueAtTime(392, this.audioCtx.currentTime + 0.2);
                osc.frequency.setValueAtTime(523, this.audioCtx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);
                osc.start();
                osc.stop(this.audioCtx.currentTime + 0.5);
                break;
        }
    }

    bindSelectKeys() {
        window.addEventListener('keydown', (e) => {
            if (this.state === GameState.SELECT) {
                if (e.code === 'KeyQ' && !this.selectionConfirm1) {
                    this.p1Selection = 'flame';
                    this.selectionConfirm1 = true;
                }
                if (e.code === 'KeyL' && !this.selectionConfirm2) {
                    this.p2Selection = 'frost';
                    this.selectionConfirm2 = true;
                }
            }
        });
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaTime) {
        switch (this.state) {
            case GameState.MENU:
                if (this.input.getStartKey()) {
                    this.audioCtx?.resume();
                    this.state = GameState.SELECT;
                    this.resetSelections();
                }
                break;
                
            case GameState.SELECT:
                if (this.p1Selection && this.p2Selection && this.input.getStartKey()) {
                    this.startBattle();
                }
                break;
                
            case GameState.READY:
                const elapsed = Date.now() - this.countdownStart;
                this.countdownTime = 3 - Math.floor(elapsed / 1000);
                if (this.countdownTime <= 0) {
                    this.state = GameState.FIGHTING;
                }
                break;
                
            case GameState.FIGHTING:
                this.updateBattle(deltaTime);
                break;
                
            case GameState.END:
                if (this.input.getStartKey()) {
                    this.state = GameState.MENU;
                }
                break;
        }
    }

    resetSelections() {
        this.p1Selection = null;
        this.p2Selection = null;
        this.selectionConfirm1 = false;
        this.selectionConfirm2 = false;
    }

    startBattle() {
        // 创建机甲
        this.mech1 = new Mech(this.p1Selection, 200, this.canvas.height - 100, 1);
        this.mech2 = new Mech(this.p2Selection, 600, this.canvas.height - 100, 2);
        
        // 面对彼此
        this.mech1.facing = 'right';
        this.mech2.facing = 'left';
        
        this.state = GameState.READY;
        this.countdownStart = Date.now();
    }

    updateBattle(deltaTime) {
        // 输入处理
        const p1Actions = this.input.getPlayerActions(1);
        const p2Actions = this.input.getPlayerActions(2);
        
        // 移动
        let p1Move = 0;
        if (p1Actions.left) p1Move -= 1;
        if (p1Actions.right) p1Move += 1;
        this.mech1.move(p1Move);
        
        let p2Move = 0;
        if (p2Actions.left) p2Move -= 1;
        if (p2Actions.right) p2Move += 1;
        this.mech2.move(p2Move);
        
        // 防御
        this.mech1.defend(p1Actions.defend);
        this.mech2.defend(p2Actions.defend);
        
        // 攻击
        if (p1Actions.attack) {
            if (this.mech1.attack(this.mech2)) {
                this.playSound('attack');
            }
        }
        if (p2Actions.attack) {
            if (this.mech2.attack(this.mech1)) {
                this.playSound('attack');
            }
        }
        
        // 更新机甲
        this.mech1.update(deltaTime);
        this.mech2.update(deltaTime);
        
        // 碰撞检测 (推挤)
        this.handleCollision();
        
        // 胜负判定
        if (this.mech1.hp <= 0) {
            this.endBattle(this.mech2);
        } else if (this.mech2.hp <= 0) {
            this.endBattle(this.mech1);
        }
        
        // 播放防御音效
        if (p1Actions.defend && !this.mech1.wasDefending) {
            this.playSound('defend');
        }
        if (p2Actions.defend && !this.mech2.wasDefending) {
            this.playSound('defend');
        }
        this.mech1.wasDefending = p1Actions.defend;
        this.mech2.wasDefending = p2Actions.defend;
    }

    handleCollision() {
        const box1 = this.mech1.getHitbox();
        const box2 = this.mech2.getHitbox();
        
        const overlapX = Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x);
        
        if (overlapX > 0) {
            const push = overlapX / 2 + 1;
            if (this.mech1.x < this.mech2.x) {
                this.mech1.x -= push;
                this.mech2.x += push;
            } else {
                this.mech1.x += push;
                this.mech2.x -= push;
            }
        }
    }

    endBattle(winner) {
        winner.victory();
        this.winner = winner;
        this.state = GameState.END;
        this.playSound('victory');
    }

    render() {
        this.renderer.clear();
        this.renderer.renderBackground();
        
        switch (this.state) {
            case GameState.MENU:
                this.renderer.renderArena();
                this.ui.drawMenu('像素风机甲', 'MECHA BATTLE');
                break;
                
            case GameState.SELECT:
                this.renderer.renderArena();
                this.ui.drawSelectScreen(this.p1Selection, this.p2Selection);
                break;
                
            case GameState.READY:
                this.mech1.update(16);
                this.mech2.update(16);
                this.renderer.renderMech(this.mech1);
                this.renderer.renderMech(this.mech2);
                this.ui.drawBattleUI(this.mech1, this.mech2);
                this.ui.drawCountdown(this.countdownTime);
                break;
                
            case GameState.FIGHTING:
                this.renderer.renderArena();
                this.renderer.renderMech(this.mech1);
                this.renderer.renderMech(this.mech2);
                this.ui.drawBattleUI(this.mech1, this.mech2);
                break;
                
            case GameState.END:
                this.renderer.renderArena();
                this.renderer.renderMech(this.mech1);
                this.renderer.renderMech(this.mech2);
                this.ui.drawBattleUI(this.mech1, this.mech2);
                this.ui.drawVictoryScreen(this.winner);
                break;
        }
    }
}

export default Game;
