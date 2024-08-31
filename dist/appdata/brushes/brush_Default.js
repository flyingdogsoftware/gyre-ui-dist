class brush_Default {
    constructor() {
        this.setUI()
        this.setDefault()
    }

    setDefault() {
        this.values = {}
        if (!this.ui || !this.ui.props) return
        for (let propName in this.ui.props) {
            let prop = this.ui.props[propName]
            this.values[propName] = prop.default
        }
    }

    setUI() {
        this.ui = {
            url: 'appdata/brushes/img/brush_Default.jpg',
            name: 'Default Brush',
            props: {
                hardness: { label: 'Hardness', type: 'slider', from: 0, to: 100, stepCount: 1, default: 100 },
            },
        }
    }

    refresh(globalValues) {
        this.globalValues = globalValues
    }

    draw(context, point) {
        if (!this.values) return
        // context = context.contextList[0]
        const hardness = this.values.hardness / 100
        const brushSize = this.globalValues.brushSize
        const radius = brushSize / 2

        let x = this.lastPoint[0]
        let y = this.lastPoint[1]
        let x1 = point[0]
        let y1 = point[1]

        // Save the current context state
        context.save()

        // Maintain the brush size and add a shadow for softness
        context.shadowBlur = radius * (1 - hardness)
        context.shadowColor = this.globalValues.brushColor

        // Draw the stroke with full brush size
        context.lineWidth = brushSize
        context.strokeStyle = this.globalValues.brushColor
        context.lineCap = 'round'
        context.lineJoin = 'round'

        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x1, y1)
        context.stroke()

        // Restore the original context state
        context.restore()

        this.lastPoint = point
    }

    start(context, point) {
        this.lastPoint = point
    }

    continue(context, newPoint) {
        this.draw(context, newPoint)
    }

    end() {
        // Any cleanup if necessary
    }
}
