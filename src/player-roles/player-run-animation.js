
/**
 * 雪碧图切换控制器
 * (注：这里的计算方案是提供给 style.backgroundPosition = `${px}% ${py}%` 使用的)
 */
function SpritesAnimationController() {
  let interval = null
  let frame = null // [x,y] 每次动画帧移动都会改变这个坐标

  /**
   * 帧动画切换算法
   * @param {Array<number>} curFrame 当前帧坐标
   * @param {{ start:Array<number>, end:Array<number>, rowEndX:number, frameLen:Array<number> }} animationOptions
   * start=第一帧的截图坐标,如[0,0]；end=最后一帧的截图坐标,如[10,10]；rowEndX=一行结束的x坐标；frameLen=每一帧之间的间隔距离；
   */
  function getNextFrame(curFrame, options) {
    const { start, end, rowEndX, frameLen } = options
    let nextFrame = [0, 0]
    // 雪碧图切换
    if (!curFrame || (curFrame[0] >= end[0] && curFrame[1] >= end[1])) {
      nextFrame = [...start]
    } else {
      const [x, y] = curFrame
      let nextX = x + frameLen[0]
      let nextY = y
      if (x >= rowEndX) {
        nextX = start[0]
        nextY = y + frameLen[1]
      }
      nextFrame = [nextX, nextY]
    }
    return nextFrame
  }

  /**
   * 设置帧动画切换所需的参数
   * @param {{ start:Array<number>, end:Array<number>, rowEndX:number, frameLen:Array<number> }} frameOptions
   * start=第一帧的截图坐标,如[0,0]；end=最后一帧的截图坐标,如[10,10]；rowEndX=一行结束的x坐标；frameLen=每一帧之间的间隔距离；
   */
  this.setFrameOptions = (frameOptions) => {
    this.frameOptions = frameOptions
  }

  /**
   * 检测动画是否正在播放中
   * @returns
   */
  this.checkPlaying = () => interval !== null

  /**
   * 启动帧动画切换
   * @param {number} playMs 每一帧切换的间隔时间(单位：毫秒)
   * @param {(nextFrame:Array<number>)=>void} callback 每一帧切换时的回调函数，其中 nextFrame 即计算出的下一帧的坐标[x, y], 如[10,10]
   */
  this.start = (playMs, callback) => {
    if (interval) return
    interval = setInterval(() => {
      // 获取下一帧坐标
      frame = getNextFrame(frame, this.frameOptions)
      // 更新当前帧的回调
      callback && callback(frame)
    }, playMs)
  }

  /**
   * 启动帧动画
   * @param {Array<number>} start [0,0] 第一帧图片的坐标
   */
  this.stop = () => {
    interval && clearInterval(interval)
    interval = null
    frame = null
  }
}

// Object.create 兼容性处理（由于Object.create属于ES5，为了向下兼容，需要自己实现一个 Object.create）
if (!Object.create) {
  Object.create = function (proto) {
    function Fn() { }
    Fn.prototype = proto
    return new Fn()
  }
}

/**
 * 可左右移动和跳跃的玩家角色
 */
function PlatformPlayer() {
  // 禁止直接调用该构造函数
  if (!new.target) throw Error('can not invoke without new')
  // 组合继承方案
  SpritesAnimationController.call(this)

  this.setSpritesBox = (dom) => {
    this.spritesBoxDom = dom
  }

  this.startRun = (playMs, options = undefined) => {
    if (options) this.setFrameOptions(options)
    this.start(playMs, ([px, py]) => {
      this.spritesBoxDom.style.backgroundPosition = `${px}% ${py}%`
    })
  }

  this.stopRun = () => {
    this.stop()
    const [px, py] = this.frameOptions.start
    this.spritesBoxDom.style.backgroundPosition = `${px}% ${py}%`
  }
}
// 寄生组合继承的实现方案
PlatformPlayer.prototype = Object.create(SpritesAnimationController.prototype)
PlatformPlayer.constructor = new PlatformPlayer()

/**
 * 可四个方向自由移动玩家角色
 */
function FreemovePlayer() {
  // 禁止直接调用该构造函数
  if (!new.target) throw Error('can not invoke without new')
  // 组合继承方案
  SpritesAnimationController.call(this)
}
// 寄生组合继承的实现方案
FreemovePlayer.prototype = Object.create(SpritesAnimationController.prototype)
FreemovePlayer.constructor = new FreemovePlayer()
