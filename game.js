const SUPABASE_URL = "https://khafxktptrtrqhynxlzz.supabase.co";
const SUPABASE_KEY = "sb_publishable_5Ig8kJEw1og5slxQpiOjtw_osjqENrZ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
 );
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏配置
        this.gridSize = 20;
        this.cellCount = 20;
        this.canvasSize = this.gridSize * this.cellCount;
        
        // 游戏状态
        this.gameState = 'idle'; // idle, playing, paused, gameover
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        
        // 蛇的属性
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // 食物
        this.food = { x: 0, y: 0 };
        
        // 游戏速度
        this.speed = 120;
        this.gameLoop = null;
        
        // DOM元素
        this.currentScoreElement = document.getElementById('currentScore');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.startOverlay = document.getElementById('startOverlay');
        this.finalScoreElement = document.getElementById('finalScore');
        
        // 初始化
        this.init();
        this.bindEvents();
    }
    
    init() {
        // 设置canvas尺寸
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        
        // 更新最高分显示
        this.highScoreElement.textContent = this.highScore;
        
        // 显示开始界面
        this.startOverlay.classList.add('show');
        
        // 初始化游戏状态
        this.resetGame();
    }
    
    resetGame() {
        // 重置分数
        this.score = 0;
        this.currentScoreElement.textContent = this.score;
        
        // 重置蛇的位置（从中心开始，蛇头朝上）
        const center = Math.floor(this.cellCount / 2);
        this.snake = [
            { x: center, y: center },
            { x: center, y: center + 1 },
            { x: center, y: center + 2 }
        ];
        
        // 重置方向
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // 生成新食物
        this.generateFood();
        
        // 清空游戏结束界面
        this.gameOverOverlay.classList.remove('show');
        
        // 绘制初始状态
        this.draw();
    }
    
    generateFood() {
        // 确保食物不会生成在蛇身上
        let validPosition = false;
        while (!validPosition) {
            this.food.x = Math.floor(Math.random() * this.cellCount);
            this.food.y = Math.floor(Math.random() * this.cellCount);
            
            validPosition = !this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y);
        }
    }
    
    startGame() {
        if (this.gameState === 'playing') return;
        
        this.gameState = 'playing';
        this.startOverlay.classList.remove('show');
        
        // 开始游戏循环
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.speed);
    }
    
    pauseGame() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'paused';
        clearInterval(this.gameLoop);
    }
    
    resumeGame() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'playing';
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.speed);
    }
    
    gameOver() {
        this.gameState = 'gameover';
        clearInterval(this.gameLoop);
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
            this.highScoreElement.textContent = this.highScore;
        }
        
        // 显示游戏结束界面
        this.finalScoreElement.textContent = this.score;
      setTimeout(() => {
    this.gameOverOverlay.classList.add('show');
}, 100);

const playerName = prompt("请输入你的名字");

if (playerName) {
    supabaseClient
        .from('scores')
        .insert([
            {
                player: playerName,
                score: this.score
            }
        ])
        .then((result) => {
            console.log("分数上传成功", result);
        });
}

}
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // 更新方向（防止反向移动）
        if (this.nextDirection.x !== -this.direction.x || this.nextDirection.y !== -this.direction.y) {
            this.direction = { ...this.nextDirection };
        }
        
        // 创建新的蛇头
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        // 边界碰撞检测
        if (head.x < 0 || head.x >= this.cellCount || head.y < 0 || head.y >= this.cellCount) {
            this.gameOver();
            return;
        }
        
        // 自碰撞检测（排除当前蛇头位置）
        if (this.snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // 添加新头部
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.currentScoreElement.textContent = this.score;
            this.generateFood();
        } else {
            // 移除尾部
            this.snake.pop();
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制蛇
        this.drawSnake();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.cellCount; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvasSize);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvasSize, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 绘制食物光晕效果
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            0,
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            this.gridSize
        );
        gradient.addColorStop(0, 'rgba(255, 107, 107, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
        
        // 绘制食物主体
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 添加高光效果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 3,
            y + this.gridSize / 3,
            this.gridSize / 6,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // 计算颜色渐变（头部最亮）
            const brightness = 1 - (index * 0.08);
            const baseColor = index === 0 ? '#4ecdc4' : '#44a08d';
            
            // 绘制蛇身阴影
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(x + 2, y + 2, this.gridSize - 2, this.gridSize - 2);
            
            // 绘制蛇身主体
            const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
            gradient.addColorStop(0, this.adjustBrightness(baseColor, brightness));
            gradient.addColorStop(1, this.adjustBrightness(baseColor, brightness * 0.8));
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, this.gridSize - 2, this.gridSize - 2, 4);
            this.ctx.fill();
            
            // 绘制蛇头眼睛
            if (index === 0) {
                this.drawEyes(x, y);
            }
        });
    }
    
    drawEyes(x, y) {
        const eyeSize = 3;
        const eyeOffset = 5;
        
        this.ctx.fillStyle = '#1a1a2e';
        
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        if (this.direction.x === 1) {
            // 向右
            leftEyeX = x + this.gridSize - eyeOffset;
            leftEyeY = y + eyeOffset;
            rightEyeX = x + this.gridSize - eyeOffset;
            rightEyeY = y + this.gridSize - eyeOffset;
        } else if (this.direction.x === -1) {
            // 向左
            leftEyeX = x + eyeOffset;
            leftEyeY = y + eyeOffset;
            rightEyeX = x + eyeOffset;
            rightEyeY = y + this.gridSize - eyeOffset;
        } else if (this.direction.y === 1) {
            // 向下
            leftEyeX = x + eyeOffset;
            leftEyeY = y + this.gridSize - eyeOffset;
            rightEyeX = x + this.gridSize - eyeOffset;
            rightEyeY = y + this.gridSize - eyeOffset;
        } else {
            // 向上
            leftEyeX = x + eyeOffset;
            leftEyeY = y + eyeOffset;
            rightEyeX = x + this.gridSize - eyeOffset;
            rightEyeY = y + eyeOffset;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    adjustBrightness(color, factor) {
        // 解析颜色
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substring(0, 2), 16) * factor);
        const g = Math.min(255, parseInt(hex.substring(2, 4), 16) * factor);
        const b = Math.min(255, parseInt(hex.substring(4, 6), 16) * factor);
        
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
    }
    
    handleKeydown(e) {
        // 方向键控制
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                if (this.gameState === 'playing' || this.gameState === 'paused') {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                if (this.gameState === 'playing' || this.gameState === 'paused') {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                if (this.gameState === 'playing' || this.gameState === 'paused') {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                if (this.gameState === 'playing' || this.gameState === 'paused') {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
            case ' ':
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                } else if (this.gameState === 'idle') {
                    this.startGame();
                }
                break;
        }
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
