class App {
    static instance = new App()

    canvas = null
    context = null
    imageKV = {}
    showRect = null

    needLoadCount = 0
    isAllowDraw = false

    lastY = 0
    deltaY = 0

    start() {
        this.canvas = wx.getSharedCanvas();
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = "high";

        wx.onMessage(this.onMessage.bind(this))

        wx.onTouchMove(res => {
            if (!this.showRect) {
                return
            }

            let touch = res.changedTouches[0]
            console.log(touch);

            if (this.lastY) {
                this.deltaY += (touch.pageY - this.lastY)
            }
            this.lastY = touch.pageY

            console.log(this.deltaY);

            this.drawItem()

            // console.log(touch.pageX > this.showRect.x, touch.pageY > this.showRect.y, touch.pageX < (this.showRect.x + this.showRect.width), touch.pageY < (this.showRect.y + this.showRect.height))

            // if (touch.pageX > this.showRect.x && touch.pageY > this.showRect.y && touch.pageX < (this.showRect.x + this.showRect.width) && touch.pageY < (this.showRect.y + this.showRect.height)) {

            // }
        })

        wx.onTouchEnd(res => {
            this.lastY = 0
        })
    }

    onMessage(msg) {
        console.log(msg)
        switch (msg.event) {
            case "viewport":
                this.showRect = msg
                break;
            case "mainLoop":
                this.isAllowDraw = true
                break;
            case "frameRate":
                break;
        }
        this.drawItem()
    }

    loadImages(images) {
        this.needLoadCount = images.length

        images.forEach(f => {
            const image = wx.createImage()
            image.src = `open-data/res/${f}.png`
            image.onload = (e) => {
                this.imageKV[f] = image
                this.needLoadCount--
                this.drawItem()
            }
        })
    }

    drawItem() {
        if (this.needLoadCount !== 0 || !this.isAllowDraw) {
            return
        }

        this.context.clearRect(0, 0, 480, 480)
        this.context.fillStyle = '#1aad19'
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

        for (let i = 0; i < 6; i++) {
            this.drawOne(i, 10, i * 90 + this.deltaY)
        }
    }

    drawOne(index, offsetX, offsetY) {
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
}

App.instance.start()
App.instance.loadImages(['a0', 'a1', 'no1', 'no2', 'no3'])