// 像素精灵生成器
const Sprites = {
    pixelSize: 4,
    
    palettes: {
        flame: {
            primary: '#FF6B35',
            secondary: '#FF9F1C',
            dark: '#8B2500',
            dark2: '#5C1A00',
            highlight: '#FFD93D',
            eye: '#FFFFFF'
        },
        frost: {
            primary: '#00D4AA',
            secondary: '#00A3CC',
            dark: '#006666',
            dark2: '#003333',
            highlight: '#7FFFFF',
            eye: '#FFFFFF'
        }
    },

    // 创建机甲精灵图像
    createMechSprite(type, frame = 0, facing = 'right', state = 'idle') {
        const canvas = document.createElement('canvas');
        const palette = this.palettes[type];
        
        // 机甲尺寸 (单位: 像素块)
        const width = 24;  // 24像素块宽
        const height = 32; // 32像素块高
        
        canvas.width = width * this.pixelSize;
        canvas.height = height * this.pixelSize;
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 计算动画偏移
        const animOffset = this.getAnimOffset(state, frame);
        
        // 绘制机甲
        this.drawMech(ctx, palette, width, height, animOffset, facing, state);
        
        return canvas;
    },

    getAnimOffset(state, frame) {
        const offsets = {
            idle: { y: [0, 2], loop: true },
            walk: { y: [0, 4, 0, 6], loop: true },
            attack: { y: [0, -4, 0], loop: false },
            defend: { y: [0], loop: true },
            hurt: { y: [0, 4], loop: false },
            victory: { y: [0], loop: true }
        };
        const anim = offsets[state] || offsets.idle;
        const index = frame % anim.y.length;
        return anim.y[index];
    },

    drawMech(ctx, palette, width, height, yOffset, facing, state) {
        const ps = this.pixelSize;
        const cx = width * ps / 2;
        
        ctx.save();
        if (facing === 'left') {
            ctx.translate(width * ps, 0);
            ctx.scale(-1, 1);
        }
        
        const drawPixel = (x, y, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x * ps, (y + yOffset) * ps, ps, ps);
        };
        
        const px = (x, y, color) => drawPixel(x, y, color);
        
        // 颜色定义
        const P = palette.primary;
        const S = palette.secondary;
        const D = palette.dark;
        const D2 = palette.dark2;
        const H = palette.highlight;
        const E = palette.eye;
        
        // === 头部 (8-16行) ===
        // 头盔顶部
        for (let x = 8; x <= 15; x++) px(x, 6, D);
        for (let x = 8; x <= 15; x++) px(x, 7, P);
        
        // 头盔侧面
        px(7, 8, D); px(8, 8, P); px(9, 8, P); px(10, 8, P); px(11, 8, P); px(12, 8, P); px(13, 8, P); px(14, 8, P); px(15, 8, P); px(16, 8, D);
        
        // 面罩
        px(8, 9, D2); px(9, 9, D2); px(10, 9, D2); px(11, 9, D2); px(12, 9, D2); px(13, 9, D2); px(14, 9, D2); px(15, 9, D2);
        px(8, 10, D2); px(9, 10, H); px(10, 10, E); px(11, 10, D2); px(12, 10, E); px(13, 10, E); px(14, 10, H); px(15, 10, D2);
        px(8, 11, D2); px(9, 11, E); px(10, 11, E); px(11, 11, D2); px(12, 11, E); px(13, 11, E); px(14, 11, E); px(15, 11, D2);
        px(8, 12, D2); px(9, 12, D2); px(10, 12, D2); px(11, 12, D2); px(12, 12, D2); px(13, 12, D2); px(14, 12, D2); px(15, 12, D2);
        
        // 头部侧面装甲
        px(7, 9, D); px(7, 10, D); px(7, 11, D); px(7, 12, D); px(16, 9, D); px(16, 10, D); px(16, 11, D); px(16, 12, D);
        
        // 肩部装甲
        px(5, 12, D); px(6, 12, D); px(7, 12, D); px(8, 12, P); px(9, 12, P); px(10, 12, P); px(11, 12, P); px(12, 12, P); px(13, 12, P); px(14, 12, P); px(15, 12, P); px(16, 12, D); px(17, 12, D); px(18, 12, D);
        px(4, 13, D); px(5, 13, P); px(6, 13, P); px(7, 13, S); px(8, 13, S); px(9, 13, P); px(10, 13, P); px(11, 13, P); px(12, 13, P); px(13, 13, P); px(14, 13, S); px(15, 13, S); px(16, 13, P); px(17, 13, P); px(18, 13, P); px(19, 13, D);
        
        // === 身体 (13-24行) ===
        // 躯干
        for (let y = 14; y <= 20; y++) {
            px(6, y, D);
            px(7, y, S);
            px(8, y, P);
            px(9, y, P);
            px(10, y, P);
            px(11, y, P);
            px(12, y, P);
            px(13, y, P);
            px(14, y, P);
            px(15, y, P);
            px(16, y, P);
            px(17, y, S);
            px(18, y, D);
        }
        
        // 核心/胸部高光
        px(10, 16, H); px(11, 16, H); px(12, 16, H); px(13, 16, H);
        px(10, 17, H); px(11, 17, S); px(12, 17, S); px(13, 17, H);
        px(10, 18, S); px(11, 18, D2); px(12, 18, D2); px(13, 18, S);
        
        // 腰带
        for (let x = 7; x <= 16; x++) px(x, 21, D2);
        px(10, 21, H); px(13, 21, H);
        
        // 手臂 (22-28行)
        // 左臂
        px(3, 14, D); px(4, 14, D); px(5, 14, D);
        px(2, 15, D); px(3, 15, P); px(4, 15, P); px(5, 15, P);
        px(2, 16, D); px(3, 16, S); px(4, 16, P); px(5, 16, P);
        px(2, 17, D); px(3, 17, S); px(4, 17, P); px(5, 17, P);
        px(2, 18, D); px(3, 18, S); px(4, 18, P); px(5, 18, P);
        px(2, 19, D); px(3, 19, P); px(4, 19, P); px(5, 19, P);
        px(3, 20, D); px(4, 20, P); px(5, 20, P);
        px(3, 21, D); px(4, 21, D); px(5, 21, D);
        
        // 右臂 (攻击/防御状态不同)
        if (state === 'attack') {
            px(19, 14, D); px(20, 14, D); px(21, 14, D);
            px(19, 15, P); px(20, 15, P); px(21, 15, H);
            px(19, 16, P); px(20, 16, H); px(21, 16, H);
            px(19, 17, P); px(20, 16, H); px(21, 17, H);
            px(19, 18, P); px(20, 18, H); px(21, 18, H);
            px(19, 19, P); px(20, 19, P); px(21, 19, H);
            px(19, 20, D); px(20, 20, P); px(21, 21, D);
            px(19, 21, D); px(20, 21, D); px(21, 21, D);
        } else if (state === 'defend') {
            px(19, 13, H); px(20, 13, H); px(21, 13, H);
            px(19, 14, H); px(20, 14, H); px(21, 14, H);
            px(19, 15, H); px(20, 15, H); px(21, 15, H);
            px(19, 16, S); px(20, 16, S); px(21, 16, S);
            px(19, 17, S); px(20, 17, S); px(21, 17, S);
            px(19, 18, S); px(20, 18, S); px(21, 18, S);
            px(19, 19, P); px(20, 19, P); px(21, 19, P);
            px(19, 20, P); px(20, 20, P); px(21, 20, P);
            px(19, 21, D); px(20, 21, D); px(21, 21, D);
        } else {
            px(19, 14, D); px(20, 14, D); px(21, 14, D);
            px(19, 15, P); px(20, 15, P); px(21, 15, P);
            px(19, 16, P); px(20, 16, S); px(21, 16, D);
            px(19, 17, P); px(20, 17, S); px(21, 17, D);
            px(19, 18, P); px(20, 18, S); px(21, 18, D);
            px(19, 19, P); px(20, 19, P); px(21, 19, P);
            px(19, 20, D); px(20, 20, P); px(21, 20, P);
            px(19, 21, D); px(20, 21, D); px(21, 21, D);
        }
        
        // === 腿部 (22-31行) ===
        // 左腿
        px(7, 22, D2); px(8, 22, P); px(9, 22, P); px(10, 22, P); px(11, 22, P);
        px(7, 23, D2); px(8, 23, S); px(9, 23, P); px(10, 23, P); px(11, 23, P);
        px(7, 24, D2); px(8, 24, S); px(9, 24, P); px(10, 24, P); px(11, 24, P);
        px(7, 25, D); px(8, 25, D); px(9, 25, P); px(10, 25, P); px(11, 25, D);
        px(6, 26, D); px(7, 26, D); px(8, 26, P); px(9, 26, P); px(10, 26, P); px(11, 26, P); px(12, 26, D);
        px(6, 27, D); px(7, 27, D); px(8, 27, P); px(9, 27, P); px(10, 27, P); px(11, 27, P); px(12, 27, D);
        px(6, 28, D); px(7, 28, D); px(8, 28, D); px(9, 28, D); px(10, 28, D); px(11, 28, D); px(12, 28, D);
        px(6, 29, H); px(7, 29, D2); px(8, 29, D2); px(9, 29, D2); px(10, 29, D2); px(11, 29, D2); px(12, 29, H);
        px(6, 30, H); px(7, 30, H); px(8, 30, D2); px(9, 30, D2); px(10, 30, D2); px(11, 30, H); px(12, 30, H);
        
        // 右腿
        px(13, 22, P); px(14, 22, P); px(15, 22, P); px(16, 22, P); px(17, 22, D2);
        px(13, 23, P); px(14, 23, P); px(15, 23, P); px(16, 23, S); px(17, 23, D2);
        px(13, 24, P); px(14, 24, P); px(15, 24, P); px(16, 24, S); px(17, 24, D2);
        px(12, 25, D); px(13, 25, P); px(14, 25, P); px(15, 25, D); px(16, 25, D);
        px(12, 26, D); px(13, 26, P); px(14, 26, P); px(15, 26, P); px(16, 26, P); px(17, 26, D); px(18, 26, D);
        px(12, 27, D); px(13, 27, P); px(14, 27, P); px(15, 27, P); px(16, 27, P); px(17, 27, D); px(18, 27, D);
        px(12, 28, D); px(13, 28, D); px(14, 28, D); px(15, 28, D); px(16, 28, D); px(17, 28, D); px(18, 28, D);
        px(12, 29, H); px(13, 29, D2); px(14, 29, D2); px(15, 29, D2); px(16, 29, D2); px(17, 29, H);
        px(12, 30, H); px(13, 30, H); px(14, 30, D2); px(15, 30, D2); px(16, 30, H); px(17, 30, H);
        
        ctx.restore();
    },

    // 创建攻击特效
    createAttackEffect(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const palette = this.palettes[type];
        ctx.fillStyle = palette.primary;
        
        // 绘制冲击波线条
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = 32 + Math.cos(angle) * 10;
            const y1 = 32 + Math.sin(angle) * 10;
            const x2 = 32 + Math.cos(angle) * 28;
            const y2 = 32 + Math.sin(angle) * 28;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 3;
            ctx.strokeStyle = i % 2 === 0 ? palette.primary : palette.highlight;
            ctx.stroke();
        }
        
        // 中心光点
        ctx.fillStyle = palette.highlight;
        ctx.fillRect(28, 28, 8, 8);
        
        return canvas;
    },

    // 创建防御护盾
    createDefendEffect(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const palette = this.palettes[type];
        
        // 半透明护盾
        ctx.fillStyle = palette.secondary + '60';
        ctx.beginPath();
        ctx.ellipse(24, 32, 20, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 护盾边缘
        ctx.strokeStyle = palette.highlight;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        return canvas;
    },

    // 创建火花粒子
    createSparkParticle() {
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFD93D';
        ctx.fillRect(2, 2, 4, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(3, 3, 2, 2);
        
        return canvas;
    }
};

export default Sprites;
