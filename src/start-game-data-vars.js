/** 游戏关键数据的全局变量脚本：该文件会被作为游戏数据模板处理，sence-creator.html 中会读取这些模板数据，然后进行打包生成一份新的配置数据 */

let GAME_SENCE_BACKGROUND_IMAGE = '' // 整个游戏场景的背景图（为了游戏效果，背景图不会自适应，游戏场景中的每个物体目前均以px为单位进行布局，位置需要与背景图相对应）
let PLAYER_X_START_SPEED = 4 // 玩家移动初速度
let PLAYER_Y_FREE_FALL_STEP_SPEED = 8 // 控制玩家下落速度的单位值
let PLAYER_Y_JUMP_START_SPEED = 20 // 玩家跳跃的初速度值
let PLAYER_BORTH_POSITION = [250, 0] // 玩家出生位置
let COIN_COLLISION_OFFSET = 10 // 玩家与金币碰撞的边缘计算偏移量（为了体验更好，玩家需要进入金币div一定的范围内部才会让金币被碰撞而消失）

// 玩家尺寸
let playerSize = [54, 32]
// 玩家角色图片
let playerSpritesBackgrundImageUrl = 'url("./imgs/cat-sprites.jpg")'
// 用于播放玩家跑步运动时，雪碧图不断切换的一些参数（目前仅支持 x 轴，即仅支持行上的动作切换）(这里的属性都是百分比值，即使用在 background-position:0% 0% 中)
let playerSpritesRunActionAnimationOptions = {
  // 角色动画新方案
  start: [5.5, 7], // 开始坐标
  end: [95.5, 30], // 结束坐标
  rowEndX: 95.5, // 行尾坐标
  frameLen: [30, 23], // 切换一帧对应的x和y的步长（动画目前从start坐标依次向左切换，若当前行切换x在坐标到了设置的rowEndX，则切换到下一行的最左侧，再继续，直到到达坐标end）
  playMs: 80 // 动画播放速度（单位：毫秒）
}

// 游戏画面中的砖块集合
let blocksData = undefined // [] 使用undefined是为了游戏创建场景物体时进行识别使用demo数据还是配置数据
// 金币集合
let coinsData = {
  value: undefined, // [] 使用undefined是为了游戏创建场景物体时进行识别使用demo数据还是配置数据
  removeCoinId: null // 通过对 coinsDataProxy.removeDomId = 1; 这种方式传值可以实现删除 value 中指定的数组元素，且会自动移除对应的dom元素
}

