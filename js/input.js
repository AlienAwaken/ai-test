// 输入处理模块
export class InputHandler {
    constructor() {
        this.keys = {};
        this.players = {
            1: {
                left: 'KeyA',
                right: 'KeyD',
                attack: 'KeyJ',
                defend: 'KeyK'
            },
            2: {
                left: 'ArrowLeft',
                right: 'ArrowRight',
                attack: 'Digit1',
                defend: 'Digit2'
            }
        };
        
        this.playerActions = {
            1: { left: false, right: false, attack: false, defend: false },
            2: { left: false, right: false, attack: false, defend: false }
        };
        
        this.attackPressed = {
            1: false,
            2: false
        };
        
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // 防止方向键滚动页面
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            // 重置攻击按键状态
            if (e.code === this.players[1].attack) this.attackPressed[1] = false;
            if (e.code === this.players[2].attack) this.attackPressed[2] = false;
        });
    }

    getPlayerActions(playerId) {
        const mapping = this.players[playerId];
        const actions = this.playerActions[playerId];
        
        actions.left = !!this.keys[mapping.left];
        actions.right = !!this.keys[mapping.right];
        
        // 攻击和防御使用边缘触发
        if (this.keys[mapping.attack] && !this.attackPressed[playerId]) {
            actions.attack = true;
            this.attackPressed[playerId] = true;
        } else {
            actions.attack = false;
        }
        
        actions.defend = !!this.keys[mapping.defend];
        
        return actions;
    }

    isAnyKeyPressed() {
        return Object.values(this.keys).some(v => v);
    }

    getStartKey() {
        return this.keys['Space'] || this.keys['Enter'];
    }
}

export default InputHandler;
