// 宣告變數用來存放站立(stop)、走路(walk)、魔法(magic)與跳躍(jump)的圖片精靈圖檔
let stopSheet;
let walkSheet;
let magicSheet;
let jumpSheet;

// 宣告陣列用來存放切割後的每一幀（張）角色圖片
let stopFrames = [];
let walkFrames = [];
let magicFrames = [];
let jumpFrames = [];

// 設定站立(stop)圖片精靈的規格（總寬585、總高183、共5張）
const STOP_TOTAL_FRAMES = 5;
const STOP_SHEET_WIDTH = 585;
const STOP_SHEET_HEIGHT = 183;
const STOP_FRAME_WIDTH = STOP_SHEET_WIDTH / STOP_TOTAL_FRAMES; // 117
const STOP_FRAME_HEIGHT = STOP_SHEET_HEIGHT;                 // 183

// 設定走路(walk)圖片精靈的規格（總寬1019、總高195、共8張）
const WALK_TOTAL_FRAMES = 8;
const WALK_SHEET_WIDTH = 1019;
const WALK_SHEET_HEIGHT = 195;
const WALK_FRAME_WIDTH = WALK_SHEET_WIDTH / WALK_TOTAL_FRAMES; // 127.375
const WALK_FRAME_HEIGHT = WALK_SHEET_HEIGHT;                   // 195

// 設定魔法(magic)圖片精靈的規格（總寬2215、總高185、共10張）
const MAGIC_TOTAL_FRAMES = 10;
const MAGIC_SHEET_WIDTH = 2215;
const MAGIC_SHEET_HEIGHT = 185;
const MAGIC_FRAME_WIDTH = MAGIC_SHEET_WIDTH / MAGIC_TOTAL_FRAMES; // 221.5
const MAGIC_FRAME_HEIGHT = MAGIC_SHEET_HEIGHT;                   // 185

// 設定跳躍(jump)圖片精靈的規格（總寬926、總高214、共7張）
const JUMP_TOTAL_FRAMES = 7;
const JUMP_SHEET_WIDTH = 926;
const JUMP_SHEET_HEIGHT = 214;
const JUMP_FRAME_WIDTH = JUMP_SHEET_WIDTH / JUMP_TOTAL_FRAMES; // ~132.285
const JUMP_FRAME_HEIGHT = JUMP_SHEET_HEIGHT;                 // 214

// 動畫與位置控制變數
let currentFrame = 0;
const ANIMATION_DELAY = 6;  // 數字越大動畫越慢
let charX = 0;              // 角色X座標
let moveSpeed = 5;          // 移動速度
let facingDirection = 1;    // 1 為朝右，-1 為朝左

// 狀態變數：記錄當前是否正在施放魔法或跳躍
let isDoingMagic = false;
let isJumping = false;

// preload 函式會在畫面開始前預先載入圖片
function preload() {
  // 載入指定的圖片精靈檔案
  stopSheet = loadImage('1/stop/stop.png');
  walkSheet = loadImage('1/walk/walk.png');
  magicSheet = loadImage('1/magic/magic.png');
  jumpSheet = loadImage('1/jump/jump.png');
}

// setup 函式初始化畫布與切割圖片
function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化角色位置在整個畫布的 2/3 處
  charX = width * (2 / 3);

  // 切割站立(stop)圖片精靈
  for (let i = 0; i < STOP_TOTAL_FRAMES; i++) {
    let x = i * STOP_FRAME_WIDTH;
    let img = stopSheet.get(x, 0, STOP_FRAME_WIDTH, STOP_FRAME_HEIGHT);
    stopFrames.push(img);
  }

  // 切割走路(walk)圖片精靈
  for (let i = 0; i < WALK_TOTAL_FRAMES; i++) {
    let x = i * WALK_FRAME_WIDTH;
    let img = walkSheet.get(x, 0, WALK_FRAME_WIDTH, WALK_FRAME_HEIGHT);
    walkFrames.push(img);
  }

  // 切割魔法(magic)圖片精靈
  for (let i = 0; i < MAGIC_TOTAL_FRAMES; i++) {
    let x = i * MAGIC_FRAME_WIDTH;
    let img = magicSheet.get(x, 0, MAGIC_FRAME_WIDTH, MAGIC_FRAME_HEIGHT);
    magicFrames.push(img);
  }

  // 切割跳躍(jump)圖片精靈
  for (let i = 0; i < JUMP_TOTAL_FRAMES; i++) {
    let x = i * JUMP_FRAME_WIDTH;
    let img = jumpSheet.get(x, 0, JUMP_FRAME_WIDTH, JUMP_FRAME_HEIGHT);
    jumpFrames.push(img);
  }
}

// draw 函式每秒重複執行，負責處理互動與繪製
function draw() {
  // 設定天空藍背景
  background(135, 206, 235);

  // 計算角色在畫布上的固定高度（佔畫布 1/3）
  let displayHeight = height / 3;

  // 宣告當前要用的變數
  let activeFrames;
  let totalFrames;
  let frameW;
  let frameH;

  // 宣告垂直方向的位移量（預設為 0，跳躍時計算往上抬升的距離）
  let jumpOffsetY = 0;

  // 優先判斷特殊動作（跳躍中）
  if (isJumping) {
    activeFrames = jumpFrames;
    totalFrames = JUMP_TOTAL_FRAMES;
    frameW = JUMP_FRAME_WIDTH;
    frameH = JUMP_FRAME_HEIGHT;

    // 利用二次函數（拋物線原理）計算跳躍時的 Y 軸往上拉起與落下高度
    // 當 progress 從 0 跑到 1 時，jumpProgress 呈現「先升高、到頂點、再落下」的對稱曲線
    let progress = currentFrame / (totalFrames - 1);
    let maxJumpHeight = displayHeight * 0.5; // 設定最大跳躍高度為角色高度的一半
    jumpOffsetY = -4 * maxJumpHeight * progress * (1 - progress); 

    // 控制跳躍動畫的播放進度
    if (frameCount % ANIMATION_DELAY === 0) {
      currentFrame++;
      // 當 7 張圖片完整播放完畢一次時
      if (currentFrame >= totalFrames) {
        currentFrame = 0;
        isJumping = false; // 結束跳躍狀態，恢復正常
      }
    }
  } 
  // 其次判斷特殊動作（魔法施放中）
  else if (isDoingMagic) {
    activeFrames = magicFrames;
    totalFrames = MAGIC_TOTAL_FRAMES;
    frameW = MAGIC_FRAME_WIDTH;
    frameH = MAGIC_FRAME_HEIGHT;

    // 控制魔法動畫的播放進度
    if (frameCount % ANIMATION_DELAY === 0) {
      currentFrame++;
      // 當 10 張圖片完整播放完畢一次時
      if (currentFrame >= totalFrames) {
        currentFrame = 0;
        isDoingMagic = false; // 結束魔法狀態，恢復正常
      }
    }
  } 
  else {
    // 透過 keyIsDown 即時判斷左右鍵是否被按住
    let pressingRight = keyIsDown(RIGHT_ARROW);
    let pressingLeft = keyIsDown(LEFT_ARROW);

    if (pressingRight && !pressingLeft) {
      // 往右走
      facingDirection = 1;
      activeFrames = walkFrames;
      totalFrames = WALK_TOTAL_FRAMES;
      frameW = WALK_FRAME_WIDTH;
      frameH = WALK_FRAME_HEIGHT;

      let displayWidth = displayHeight * (frameW / frameH);
      let halfWidth = displayWidth / 2;

      charX += moveSpeed;
      if (charX >= width - halfWidth) {
        charX = width - halfWidth; // 碰到最右端停止
      }

      // 走路動畫影格循環
      if (frameCount % ANIMATION_DELAY === 0) {
        currentFrame = (currentFrame + 1) % totalFrames;
      }
    } 
    else if (pressingLeft && !pressingRight) {
      // 往左走
      facingDirection = -1;
      activeFrames = walkFrames;
      totalFrames = WALK_TOTAL_FRAMES;
      frameW = WALK_FRAME_WIDTH;
      frameH = WALK_FRAME_HEIGHT;

      let displayWidth = displayHeight * (frameW / frameH);
      let halfWidth = displayWidth / 2;

      charX -= moveSpeed;
      if (charX <= halfWidth) {
        charX = halfWidth; // 碰到最左端停止
      }

      // 走路動畫影格循環
      if (frameCount % ANIMATION_DELAY === 0) {
        currentFrame = (currentFrame + 1) % totalFrames;
      }
    } 
    else {
      // 停止（站立）
      activeFrames = stopFrames;
      totalFrames = STOP_TOTAL_FRAMES;
      frameW = STOP_FRAME_WIDTH;
      frameH = STOP_FRAME_HEIGHT;

      // 站立動畫影格循環
      if (frameCount % ANIMATION_DELAY === 0) {
        currentFrame = (currentFrame + 1) % totalFrames;
      }
    }
  }

  // 計算當前精靈圖的顯示寬度
  let currentDisplayWidth = displayHeight * (frameW / frameH);

  // 計算角色最底端剛好貼齊畫布底部的基本 Y 座標，再加上跳躍時產生的往上拉起位移 (jumpOffsetY)
  let posY = (height - (displayHeight / 2)) + jumpOffsetY;

  // 繪製角色
  push();
  translate(charX, posY);
  scale(facingDirection, 1); // 支援左右轉向鏡像翻轉
  imageMode(CENTER);
  
  // 確保索引不會溢出
  let safeIndex = constrain(currentFrame, 0, totalFrames - 1);
  image(activeFrames[safeIndex], 0, 0, currentDisplayWidth, displayHeight);
  pop();
}

// 當按下鍵盤按鍵時觸發
function keyPressed() {
  // 檢查是否按下「往上鍵」（UP_ARROW），且目前不在跳躍或施放魔法中
  if (keyCode === UP_ARROW && !isJumping && !isDoingMagic) {
    isJumping = true;     // 進入跳躍狀態
    currentFrame = 0;     // 從第 0 張開始播放跳躍動畫
  }
  // 檢查是否按下「空白鍵」，且目前不在跳躍或施放魔法中
  else if ((key === ' ' || keyCode === 32) && !isJumping && !isDoingMagic) {
    isDoingMagic = true;  // 進入魔法施放狀態
    currentFrame = 0;     // 從第 0 張開始播放魔法動畫
  }
}

// 當瀏覽器視窗大小改變時自動調整
function windowResized() {
  let oldWidth = width;
  resizeCanvas(windowWidth, windowHeight);
  // 維持原本在畫面上的相對比例位置
  if (oldWidth > 0) {
    charX = (charX / oldWidth) * width;
  }
}