// 机甲类
import Sprites from './sprites.js';

class Mech {
    constructor(type, x, y, playerId) {
        this.type = type;
        this.playerId = playerId;
        this.name = type === 'flame' ? '烈焰风暴' : '冰霜巨兽';
        
        // 位置
        this.x = x;
        this.y = y;
        this.baseY = y;
        
        // 属性
        const stats = type === 'flame' 
            ? { hp: 100, attack: 25, defense: 0.1, speed: 5, attackCooldown: 800, defendReduction: 0.3 }
            : { hp: 120, attack: 18, defense: 0.25, speed: 4, attackCooldown: 1000, defendReduction: 0.5 };
        
        this.maxHp = stats.hp;
        this.hp = stats.hp;
        this.attack = stats.attack;
        this.defense = stats.defense;
        this.speed = stats.speed;
        this.attackCooldown = stats.attackCooldown;
        this.defendReduction = stats.defendReduction;
        
        // 状态
        this.state = 'idle';
        this.facing = playerId === 1 ? 'right' : 'left';
        this.isDefending = false;
        this.isAttacking = false;
        this.lastAttackTime = 0;
        this.hurtTime = 0;
        this.victoryTime = 0;
        
        // 动画
        this.frame = 0;
        this.frameTimer = 0;
        this.animState = 'idle';
        
        // 碰撞箱
        this.width = 80;
        this.height = 120;
        this.hitboxOffsetX = 10;
        this.hitboxOffsetY = 20;
        
        // 缓存精灵图
        this.sprites = {};
        this.cacheSprites();
    }

    cacheSprites() {
        const states = ['idle', 'walk', 'attack', 'defend', 'hurt', 'victory'];
        const facings = ['left', 'right'];
        
        states.forEach(state => {
            this.sprites[state] = {};
            facings.forEach(facing => {
                const frames = state === 'walk' ? 4 : state === 'idle' ? 2 : 1;
                this.sprites[state][facing] = [];
                for (let i = 0; i < frames; i++) {
                    this.sprites[state][facing].push(
                        Sprites.createMechSprite(this.type, i, facing, state)
                    );
                }
            });
        });
    }

    getHitbox() {
        return {
            x: this.x - this.width / 2 + this.hitboxOffsetX,
            y: this.y - this.height + this.hitboxOffsetY,
            width: this.width - this.hitboxOffsetX * 2,
            height: this.height - this.hitboxOffsetY
        };
    }

    getAttackHitbox() {
        const attackRange = 60;
        const direction = this.facing === 'right' ? 1 : -1;
        return {
            x: this.x + (direction > 0 ? this.width / 2 : -this.width / 2 - attackRange),
            y: this.y - this.height / 2,
            width: attackRange,
            height: 50
        };
    }

    move(dx) {
        if (this.state === 'hurt' || this.state === 'victory') return;
        
        this.x += dx * this.speed;
        
        // 边界限制
        const minX = 60;
        const maxX = 740;
        this.x = Math.max(minX, Math.min(maxX, this.x));
        
        // 更新朝向
        if (dx > 0) this.facing = 'right';
        else if (dx < 0) this.facing = 'left';
        
        // 更新状态
        if (this.state !== 'attack') {
            this.state = 'walk';
        }
    }

    attack(target) {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) return false;
        if (this.state === 'hurt' || this.state === 'victory') return false;
        
        this.lastAttackTime = now;
        this.state = 'attack';
        this.isAttacking = true;
        this.frame = 0;
        
        // 攻击判定延迟到动画中段
        setTimeout(() => {
            if (this.state === 'attack') {
                this.checkAttackHit(target);
            }
        }, 150);
        
        return true;
    }

    checkAttackHit(target) {
        const attackBox = this.getAttackHitbox();
        const targetBox = target.getHitbox();
        
        if (this.boxCollision(attackBox, targetBox)) {
            target.takeDamage(this.attack, this.isDefending ? this.defendReduction : 0);
        }
    }

    boxCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    defend(isDefending) {
        if (this.state === 'hurt' || this.state === 'victory') return;
        this.isDefending = isDefending;
        if (isDefending && this.state !== 'attack') {
            this.state = 'defend';
        } else if (!isDefending && this.state === 'defend') {
            this.state = 'idle';
        }
    }

    takeDamage(baseDamage, defenseReduction) {
        const totalReduction = this.defense + defenseReduction;
        const actualDamage = Math.floor(baseDamage * (1 - totalReduction));
        this.hp = Math.max(0, this.hp - actualDamage);
        
        this.state = 'hurt';
        this.hurtTime = Date.now();
        this.isAttacking = false;
        this.isDefending = false;
        
        setTimeout(() => {
            if (this.state === 'hurt') {
                this.state = 'idle';
            }
        }, 300);
    }

    victory() {
        this.state = 'victory';
        this.victoryTime = Date.now();
    }

    update(deltaTime) {
        // 动画更新
        this.frameTimer += deltaTime;
        if (this.frameTimer > 150) {
            this.frameTimer = 0;
            const maxFrames = this.sprites[this.state]?.[this.facing]?.length || 1;
            this.frame = (this.frame + 1) % maxFrames;
        }
        
        // 攻击状态结束
        if (this.state === 'attack' && Date.now() - this.lastAttackTime > 300) {
            this.state = 'idle';
            this.isAttacking = false;
        }
        
        // 待机状态
        if (this.state !== 'walk' && this.state !== 'attack' && 
            this.state !== 'hurt' && this.state !== 'defend' && this.state !== 'victory') {
            this.state = 'idle';
        }
        
        // 轻微浮动
        if (this.state === 'idle') {
            this.y = this.baseY + Math.sin(Date.now() / 500) * 2;
        } else {
            this.y = this.baseY;
        }
    }

    getSprite() {
        const stateSprites = this.sprites[this.state]?.[this.facing];
        if (!stateSprites || stateSprites.length === 0) {
            return this.sprites['idle'][this.facing][0];
        }
        return stateSprites[this.frame % stateSprites.length];
    }

    render(ctx) {
        const sprite = this.getSprite();
        const drawX = this.x - sprite.width / 2;
        const drawY = this.y - sprite.height;
        
        ctx.drawImage(sprite, drawX, drawY);
        
        // 防御护盾效果
        if (this.isDefending) {
            const shield = Sprites.createDefendEffect(this.type);
            ctx.globalAlpha = 0.6;
            ctx.drawImage(shield, this.x - shield.width / 2, this.y - this.height - 10);
            ctx.globalAlpha = 1;
        }
        
        // 攻击特效
        if (this.isAttacking && this.frame === 1) {
            const effect = Sprites.createAttackEffect(this.type);
            const effectX = this.facing === 'right' ? this.x + 30 : this.x - 30 - effect.width;
            ctx.drawImage(effect, effectX, this.y - this.height / 2 - effect.height / 2);
        }
    }
}

export default Mech;
