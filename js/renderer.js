// 游戏渲染器
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 预渲染背景
        this.bgCanvas = this.createBackground();
    }

    createBackground() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#0a0a0f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // 背景管道
        ctx.strokeStyle = '#2a2a3e';
        ctx.lineWidth = 8;
        
        // 顶部管道
        ctx.beginPath();
        ctx.moveTo(0, 50);
        ctx.lineTo(150, 50);
        ctx.lineTo(180, 80);
        ctx.lineTo(300, 80);
        ctx.lineTo(320, 50);
        ctx.lineTo(500, 50);
        ctx.lineTo(530, 80);
        ctx.lineTo(650, 80);
        ctx.lineTo(680, 50);
        ctx.lineTo(800, 50);
        ctx.stroke();
        
        // 霓虹灯管
        const neonColors = ['#FF6B35', '#00D4AA', '#FF6B35'];
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = neonColors[i];
            ctx.lineWidth = 3;
            ctx.shadowColor = neonColors[i];
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(100 + i * 250, 30);
            ctx.lineTo(200 + i * 250, 30);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        
        // 竞技场地板
        const floorY = this.height - 100;
        
        // 地板渐变
        const floorGradient = ctx.createLinearGradient(0, floorY, 0, this.height);
        floorGradient.addColorStop(0, '#2a2a3e');
        floorGradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, floorY, this.width, 100);
        
        // 金属网格
        ctx.strokeStyle = '#3a3a4e';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, floorY);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = floorY; y < this.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        
        // 地板边界线
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FF6B35';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, floorY);
        ctx.lineTo(this.width, floorY);
        ctx.stroke();
        
        ctx.strokeStyle = '#00D4AA';
        ctx.shadowColor = '#00D4AA';
        ctx.beginPath();
        ctx.moveTo(0, this.height - 2);
        ctx.lineTo(this.width, this.height - 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // 边界标记
        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(50, floorY - 5, 4, 10);
        ctx.fillRect(this.width - 54, floorY - 5, 4, 10);
        
        return canvas;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    renderBackground() {
        this.ctx.drawImage(this.bgCanvas, 0, 0);
    }

    renderArena() {
        // 额外渲染一些粒子效果
        const time = Date.now() / 1000;
        
        // 浮动粒子
        this.ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = (time * 30 + i * 150) % this.width;
            const y = 100 + Math.sin(time + i) * 30;
            this.ctx.fillRect(x, y, 2, 2);
        }
        
        this.ctx.fillStyle = 'rgba(0, 212, 170, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = (time * 25 + i * 160 + 80) % this.width;
            const y = 120 + Math.cos(time + i) * 40;
            this.ctx.fillRect(x, y, 2, 2);
        }
    }

    renderMech(mech) {
        mech.render(this.ctx);
    }

    renderHitEffect(x, y, type) {
        const palette = type === 'flame' 
            ? { primary: '#FF6B35', highlight: '#FFD93D' }
            : { primary: '#00D4AA', highlight: '#7FFFFF' };
        
        const time = Date.now();
        const alpha = 1 - (time % 300) / 300;
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = palette.highlight;
        
        // 星星形状
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time / 100;
            const dist = 20 + (time % 200) / 10;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            this.ctx.fillRect(px - 2, py - 2, 4, 4);
        }
        
        this.ctx.globalAlpha = 1;
    }
}

export default Renderer;
