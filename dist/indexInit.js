class indexInit {
    init() {
        // @ts-ignore
        console.image = (url, height = 200) => {
            const image = new Image()
            image.crossOrigin = 'anonymous'
            image.onload = function () {
                // build a data url
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                canvas.height = height || image.naturalHeight
                canvas.width = (canvas.height * image.naturalWidth) / image.naturalHeight
                // @ts-ignore
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
                const dataUrl = canvas.toDataURL()
                const style = [
                    'font-size: 1px;',
                    `padding: ${canvas.height}px ${canvas.width}px;`,
                    `background: url(${dataUrl}) no-repeat;`,
                    'background-size: contain;',
                ].join(' ')
                console.log('%c ', style)
            }
            image.src = url
        }
        // @ts-ignore
        window.demomode = !window.postMessageAdapter
        // @ts-ignore
        window.developmode = false
        let documentInfo = { width: 2301, height: 1536 }
        let layers = []
        let Config = {}
        let serverFeatures = {}

        globalThis.gyre.registerPlugin('fds-ai-editor', {
            type: 'asset',
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp', '.gyre'],
            hasClone: true,
            createEmpty: true,
            name: 'Gyre Document',
            //    contextMenu: [{ name: 'test', method: 'testMethod' }],
            openAsset: 'default',
        })
        globalThis.gyre.registerPlugin('fds-waveform-editor', {
            type: 'asset',
            allowedTypes: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'],
            hasClone: true,
            createEmpty: true,
            name: 'Audio',
            ComfyUITags: ['AudioGenerate'],
            //    contextMenu: [{ name: 'test', method: 'testMethod' }],
            openAsset: 'default',
        })

        globalThis.gyre.registerPlugin('fds-image-editor-selection', {
            type: 'tool',
            floatingToolBar: true,
            floatingToolBarWidth: 425,
            refreshOnScroll: true,
            title: 'Selection Tools',
            layerTypes: ['image'],
            tools: [
                {
                    name: 'freeform',
                    title: 'Freeform Selection',
                    icon: 'fds-image-editor-selection-freeform',
                    floatingToolBarWidth: 440,
                },
                {
                    name: 'rectangle',
                    title: 'Rectangle Selection',
                    icon: 'fds-image-editor-selection-rectangle',
                    floatingToolBarWidth: 440,
                },
                {
                    name: 'ellipse',
                    title: 'Ellipse Selection',
                    icon: 'fds-image-editor-selection-ellipse',
                    floatingToolBarWidth: 440,
                },
            ],
            icons: {
                'toolbar-icon': {
                    body: '  <path d="M 6.67 32.124 Q 32 8 52 42 C 41.838 52.018 28.144 62.39 14.802 61.282 C 4.596 55.365 4.054 37.498 6.599 32.053" stroke-width="3" fill="none" stroke-dasharray="3,3"/><circle cx="48" cy="32" r="5" />',
                    width: 64,
                    height: 64,
                },
                freeform: {
                    body: '  <path d="M 6.67 32.124 Q 32 8 52 42 C 41.838 52.018 28.144 62.39 14.802 61.282 C 4.596 55.365 4.054 37.498 6.599 32.053" stroke-width="3" fill="none" stroke-dasharray="3,3"/><circle cx="48" cy="32" r="5" />',
                    width: 64,
                    height: 64,
                },
                rectangle: {
                    body: '<rect x="4" y="4" width="56" height="56"  stroke-width="3" fill="none" stroke-dasharray="4,4"/>',
                    width: 64,
                    height: 64,
                },
                ellipse: {
                    body: '<ellipse cx="32" cy="32" rx="28" ry="20"  stroke-width="3" fill="none" stroke-dasharray="4,4"/>',
                    width: 64,
                    height: 64,
                },
            },
        })
        if (!window.uxpHost && window.demomode) {
            if (!component) return
            // @ts-ignore
            component.document = documentInfo
            // @ts-ignore
            component.layers = layers
            // @ts-ignore
            component.paletteValues.Config = Config
            // @ts-ignore
            component.paletteValues.generate = Config.generalConfig.dlgData
            component.paletteValues.generate.prompt = Config.globalData.prompt
            component.paletteValues.generate.modifiers = Config.globalData.modifiers
            component.paletteValues.generate.mode = ''
            component.paletteValues.serverFeatures = serverFeatures
        }
        // handle unhandled promise rejections
        window.addEventListener('unhandledrejection', function (event) {
            console.log(event.reason)
            console.log(event.promise)
            alert(event.reason)
        })
    }
    registerBrushes() {
        let component = window.document.querySelector('fds-ai-editor')
        // @ts-ignore
        component.registerBrush(new brush_Default(), 'brush_Default')
        // @ts-ignore
        component.registerBrush(new brush_FromLayers(), 'brush_FromLayers')
        // @ts-ignore
        component.registerBrush(new brush_Oil_A(), 'brush_Oil_A')
    }
    async initAsset(assetId, docId) {
        // @ts-ignore
        let res = await globalThis.broadcast.fetchConfig() // init gyre and everything else
        if (!res) return
        let doc = window.document
        let pluginComponent = doc.createElement(globalThis.gyre.asset.type)
        pluginComponent.classList.add('darkColorScheme')
        doc.body.appendChild(pluginComponent)
        await pluginComponent.ready
    }
}
