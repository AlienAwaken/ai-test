// 游戏主入口
import Game from './game.js';

const canvas = document.getElementById('gameCanvas');

// 设置画布尺寸
canvas.width = 800;
canvas.height = 500;

// 创建并启动游戏
const game = new Game(canvas);
game.start();

// 阻止默认右键菜单
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

console.log('像素风机甲对战游戏已启动');
console.log('P1: WASD移动 | J攻击 | K防御');
console.log('P2: 方向键移动 | 1攻击 | 2防御');
