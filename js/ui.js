// UI渲染模块
export class UI {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.fontLoaded = false;
        this.loadFont();
    }

    loadFont() {
        document.fonts.ready.then(() => {
            this.fontLoaded = true;
        });
    }

    drawText(text, x, y, options = {}) {
        const {
            size = 16,
            color = '#FFFFFF',
            align = 'center',
            baseline = 'middle',
            shadow = true
        } = options;
        
        this.ctx.font = `${size}px 'Press Start 2P', monospace`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        
        if (shadow) {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillText(text, x + 2, y + 2);
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    drawHealthBar(x, y, width, height, currentHp, maxHp, color, label) {
        const ratio = currentHp / maxHp;
        const barWidth = width * ratio;
        
        // 背景
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(x, y, width, height);
        
        // 血条
        const gradient = this.ctx.createLinearGradient(x, y, x + barWidth, y);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.lightenColor(color, 30));
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, barWidth, height);
        
        // 边框
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // 标签
        if (label) {
            this.drawText(label, x + width / 2, y - 15, {
                size: 10,
                color: color
            });
        }
        
        // 数值
        this.drawText(`${Math.ceil(currentHp)}/${maxHp}`, x + width / 2, y + height / 2, {
            size: 8,
            color: '#FFFFFF',
            shadow: true
        });
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    drawMenu(title, subtitle) {
        // 标题闪烁效果
        const flicker = Math.sin(Date.now() / 300) > 0;
        
        this.drawText(title, this.width / 2, this.height / 3, {
            size: 32,
            color: flicker ? '#FF6B35' : '#00D4AA',
            shadow: true
        });
        
        this.drawText(subtitle, this.width / 2, this.height / 2, {
            size: 12,
            color: '#FFFFFF'
        });
        
        // 提示
        const blink = Math.sin(Date.now() / 500) > 0;
        if (blink) {
            this.drawText('按 SPACE 开始', this.width / 2, this.height * 0.7, {
                size: 10,
                color: '#FFD93D'
            });
        }
    }

    drawSelectScreen(selectedByP1, selectedByP2) {
        this.drawText('选择机甲', this.width / 2, 60, {
            size: 24,
            color: '#FFFFFF'
        });
        
        // P1选择
        const p1X = this.width / 4;
        const p1Color = selectedByP1 === 'flame' ? '#FF6B35' : '#00D4AA';
        this.drawText('P1', p1X, 120, { size: 14, color: '#FF6B35' });
        this.drawText(selectedByP1 === 'flame' ? '烈焰风暴' : '冰霜巨兽', p1X, 150, {
            size: 10,
            color: selectedByP1 ? p1Color : '#666666'
        });
        if (selectedByP1) {
            this.drawText('已选择', p1X, 170, { size: 8, color: '#FFD93D' });
        }
        
        // P2选择
        const p2X = this.width * 3 / 4;
        const p2Color = selectedByP2 === 'frost' ? '#00D4AA' : '#FF6B35';
        this.drawText('P2', p2X, 120, { size: 14, color: '#00D4AA' });
        this.drawText(selectedByP2 === 'frost' ? '冰霜巨兽' : '烈焰风暴', p2X, 150, {
            size: 10,
            color: selectedByP2 ? p2Color : '#666666'
        });
        if (selectedByP2) {
            this.drawText('已选择', p2X, 170, { size: 8, color: '#FFD93D' });
        }
        
        // 操作提示
        this.drawText('P1: Q选择  P2: L选择', this.width / 2, this.height - 60, {
            size: 10,
            color: '#888888'
        });
        
        if (selectedByP1 && selectedByP2) {
            const blink = Math.sin(Date.now() / 300) > 0;
            if (blink) {
                this.drawText('按 SPACE 开始战斗!', this.width / 2, this.height - 30, {
                    size: 12,
                    color: '#FFD93D'
                });
            }
        }
    }

    drawCountdown(count) {
        this.drawText(count.toString(), this.width / 2, this.height / 2, {
            size: 72,
            color: count === 0 ? '#FFD93D' : '#FFFFFF',
            shadow: true
        });
    }

    drawBattleUI(mech1, mech2) {
        // P1血条 (左上)
        this.drawHealthBar(20, 20, 200, 20, mech1.hp, mech1.maxHp, '#FF6B35', 'P1 烈焰风暴');
        
        // P2血条 (右上)
        this.drawHealthBar(this.width - 220, 20, 200, 20, mech2.hp, mech2.maxHp, '#00D4AA', 'P2 冰霜巨兽');
    }

    drawVictoryScreen(winner) {
        // 半透明遮罩
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const winnerColor = winner.playerId === 1 ? '#FF6B35' : '#00D4AA';
        const winnerName = winner.name;
        
        this.drawText('胜利!', this.width / 2, this.height / 3, {
            size: 48,
            color: winnerColor
        });
        
        this.drawText(`${winnerName} 获胜!`, this.width / 2, this.height / 2, {
            size: 20,
            color: '#FFFFFF'
        });
        
        const blink = Math.sin(Date.now() / 400) > 0;
        if (blink) {
            this.drawText('按 SPACE 重新开始', this.width / 2, this.height * 0.7, {
                size: 12,
                color: '#FFD93D'
            });
        }
    }

    drawFightStart() {
        const scale = 1 + Math.sin(Date.now() / 100) * 0.1;
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(scale, scale);
        
        this.drawText('FIGHT!', 0, 0, {
            size: 48,
            color: '#FF6B35',
            shadow: true
        });
        
        this.ctx.restore();
    }
}

export default UI;
