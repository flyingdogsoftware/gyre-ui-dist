class broadcast {
    constructor(type, docId = '', assetId = '') {
        this.type = type
        this.docId = docId
        this.assetId = assetId
        this.channel = new BroadcastChannel('gyre')
    }
    async sendRequest(message) {
        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36).substr(2) // Eindeutige ID

            // Timeout für fehlende Antwort
            const timeout = setTimeout(() => {
                reject(new Error('Timeout: Keine Antwort erhalten'))
                this.channel.removeEventListener('message', responseHandler)
            }, 5000) // 5 Sekunden

            // Temporärer Listener für die Antwort
            const responseHandler = (event) => {
                if (event.data.requestId === requestId) {
                    clearTimeout(timeout)
                    this.channel.removeEventListener('message', responseHandler)
                    resolve(event.data.payload)
                }
            }

            this.channel.addEventListener('message', responseHandler)

            this.channel.postMessage({
                requestId: requestId,
                payload: message,
                docId: this.docId,
                assetId: this.assetId,
            })
        })
    }

    async fetchConfig() {
        let config
        try {
            config = await this.sendRequest('getConfig')
        } catch (error) {
            console.error('fetchConfig - Error,:', error)
            return
        }
        console.log('config', config)
        const doc = window.document
        let assetInit = doc.createElement('fds-ai-editor-asset-init')
        doc.body.appendChild(assetInit)
        // @ts-ignore
        assetInit.initGyre(config.toolsLayers)
        let gyre = globalThis.gyre
        gyre.changeCanvas(config.asset.meta.width, config.asset.meta.height)
        gyre.asset = await this.processWithPlugin(config.asset.type, 'prepareAssetAfterLoad', config.asset)
        gyre.assets = config.assets
        gyre.plugins = config.plugins
        gyre.ComfyUI.workflowList = config.workflowList
        gyre.paletteValues = config.paletteValues
    }

    async messageHandler() {
        let gyre = globalThis.gyre
        this.channel.onmessage = async (e) => {
            if (e.data.docId !== this.docId) return
            // provide environment for slave tab
            if (e.data === 'getConfig' && this.type === 'master') {
                let config = {
                    plugins: gyre.plugins,
                    workflowList: gyre.workflowList,
                    paletteValues: gyre.paletteValues,
                }
                config.assets = gyre.assetManager.getAssetsMeta() // no full asset data of all assets here

                let assetWithInstances = gyre.assetManager.getAssetById(e.data.assetId)
                config.asset = await this.processWithPlugin(assetWithInstances.type, 'prepareAssetForSave', assetWithInstances)
                this.channel.postMessage({
                    requestId: e.data.requestId,
                    payload: config,
                })
            }
        }
    }
    async processWithPlugin(tag, methodName, ...methodParams) {
        const doc = window.document
        let pluginComponent = doc.body.querySelector(`:scope > ${tag}`)
        let isNewComponent = false

        if (!pluginComponent) {
            pluginComponent = doc.createElement(tag)
            if (!pluginComponent) return
            doc.body.appendChild(pluginComponent)
            isNewComponent = true
        }
        if (!pluginComponent) return
        // @ts-ignore
        await pluginComponent.ready
        let res = await pluginComponent[methodName](...methodParams)

        if (isNewComponent) {
            doc.body.removeChild(pluginComponent)
        }
        return res
    }
}
