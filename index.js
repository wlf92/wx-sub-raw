function App() {
    this.canvas = null
    this.context = null

    this.imageKV = {} // 加载的图片
    this.showRect = null // 主域传过来的显示大小

    this.needLoadCount = 0 // 需要下载的图片数量
    this.isAllowDraw = false // 是否允许绘制
    this.lastY = 0 // 上次的Y位置
    this.offsetY = 0 // Y的偏移值
    this.chageY = 0 // Y的改变值

    this.deviceInfo = null // 设备信息

    this.timer = null // 计时器标记
    this.frameRate = 60 // 刷新帧数
}

App.prototype.start = function () {
    this.deviceInfo = wx.getSystemInfoSync()

    this.canvas = wx.getSharedCanvas();
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = "high";

    wx.onMessage(this.onMessage.bind(this))

    wx.onTouchMove(this.onTouchMove.bind(this))
    wx.onTouchEnd(this.onTouchEnd.bind(this))
}

App.prototype.onTouchMove = function (res) {
    if (!this.showRect || !this.isAllowDraw) {
        this.lastY = 0
        return
    }

    if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
    }

    let touch = res.changedTouches[0]
    touch.pageX *= this.deviceInfo.pixelRatio
    touch.pageY *= this.deviceInfo.pixelRatio

    // 判断是否区域内滚动
    if (touch.pageX > this.showRect.x && touch.pageY > this.showRect.y && touch.pageX < (this.showRect.x + this.showRect.width) && touch.pageY < (this.showRect.y + this.showRect.height)) {
        if (this.lastY) {
            this.chageY = touch.pageY - this.lastY
            this.offsetY += this.chageY
        }
        this.lastY = touch.pageY
        this.drawItem()
    } else {
        this.lastY = 0
    }
}

App.prototype.onTouchEnd = function (res) {
    this.lastY = 0

    console.log(this.chageY)
    if (this.chageY > 0) {
        this.timer = setInterval(() => {
            this.chageY -= 2
            this.offsetY += this.chageY
            this.drawItem()

            if (this.chageY < 0) {
                this.chageY = 0

                clearInterval(this.timer)
                this.timer = null
            }
        }, 1000 / this.frameRate)
    } else if (this.chageY < 0) {
        this.timer = setInterval(() => {
            this.chageY += 2
            this.offsetY += this.chageY

            this.drawItem()

            if (this.chageY > 0) {
                this.chageY = 0

                clearInterval(this.timer)
                this.timer = null
            }
        }, 1000 / this.frameRate)
    }


    console.log("????")
}

App.prototype.onMessage = function (msg) {
    console.log(msg)
    switch (msg.event) {
        case "viewport":
            this.showRect = msg
            this.showRect.y = this.deviceInfo.screenHeight * this.deviceInfo.pixelRatio - this.showRect.y - this.showRect.width
            break;
        case "mainLoop":
            // true/false
            this.isAllowDraw = msg.value
            break;
        case "frameRate":
            this.frameRate = msg.value

            // wx.setPreferredFramesPerSecond(msg.value)
            break;
    }
    this.drawItem()
}

App.prototype.loadImages = function (images) {
    this.needLoadCount = images.length

    images.forEach(f => {
        const image = wx.createImage()
        image.src = `wx-sub-raw/res/${f}.png`
        image.onload = (e) => {
            this.imageKV[f] = image
            this.needLoadCount--
            this.drawItem()
        }
    })
}

App.prototype.drawItem = function () {
    if (this.needLoadCount !== 0 || !this.isAllowDraw) {
        return
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fillStyle = '#1aad19'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    let drawCount = 20
    let space = 90

    if (this.offsetY > 0) {
        this.offsetY = 0
    }

    let minDeltaY = -space * drawCount + this.canvas.height
    if (this.offsetY < minDeltaY) {
        this.offsetY = minDeltaY
    }

    for (let i = 0; i < drawCount; i++) {
        this.drawOne(i, 10, i * space + this.offsetY)
    }
}

App.prototype.drawOne = function (index, offsetX, offsetY) {
    if (index < 3) {
        this.context.drawImage(this.imageKV[`no${index + 1}`], offsetX, offsetY)
    } else {
        this.context.font = '48px sans-serif'
        this.context.fillStyle = 'red'
        this.context.textBaseline = 'top'
        this.context.fillText(`${index + 1}`, offsetX, offsetY)
    }

    this.context.font = '36px sans-serif'
    this.context.fillStyle = 'blue'
    this.context.textBaseline = 'top'
    this.context.fillText(`张xx`, offsetX + 100, offsetY)

    this.context.font = '36px sans-serif'
    this.context.fillStyle = 'white'
    this.context.textBaseline = 'top'
    this.context.fillText(`30分`, offsetX + 300, offsetY)
}

let app = new App()
app.start()
app.loadImages(['a0', 'a1', 'no1', 'no2', 'no3'])