class broadcast {
    constructor(type, docId = '', assetId = '') {
        this.type = type
        this.docId = docId
        this.assetId = assetId
        this.channel = new BroadcastChannel('gyre')
    }
    async sendRequest(message, data = null) {
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
            let sendObj = {
                requestId: requestId,
                payload: message,
                docId: this.docId,
                assetId: this.assetId,
            }
            if (data) {
                sendObj.data = data
            }
            console.log('postMessage', sendObj)
            this.channel.postMessage(sendObj)
        })
    }
    sendWithoutResponse(message, data = null) {
        let sendObj = {
            payload: message,
            docId: this.docId,
            assetId: this.assetId,
        }
        if (data) {
            sendObj.data = data
        }
        console.log('postMessage (fire and forget)', sendObj)
        this.channel.postMessage(sendObj)
    }
    async fetchConfig() {
        let config
        try {
            config = await this.sendRequest('getConfig')
        } catch (error) {
            console.error('fetchConfig - Error,:', error)
            alert(error)
            return false
        }
        console.log('config', config)
        const doc = window.document
        let assetInit = doc.createElement('fds-ai-editor-asset-init')
        doc.body.appendChild(assetInit)
        // @ts-ignore
        await assetInit.ready

        // @ts-ignore
        assetInit.initGyre(config.toolsLayers)
        let gyre = globalThis.gyre
        gyre.docId = this.docId
        gyre.assetId = this.assetId
        // gyre.changeCanvas(config.asset.meta.width, config.asset.meta.height)
        gyre.asset = await this.processWithPlugin(config.asset.type, 'prepareAssetAfterLoad', config.asset)
        gyre.assets = config.assets
        gyre.plugins = config.plugins
        gyre.ComfyUI.workflowList = config.workflowList
        gyre.paletteValues = config.paletteValues
        return true
    }

    deepCloneAndFilter(obj) {
        if (obj instanceof HTMLElement || typeof obj === 'function') {
            // Exclude HTMLElements (or replace with a placeholder)
            return undefined
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.deepCloneAndFilter(item))
        }
        if (obj && typeof obj === 'object') {
            const result = {}
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = this.deepCloneAndFilter(obj[key])
                }
            }
            return result
        }
        return obj // primitive values are returned as-is
    }

    async messageHandler() {
        let gyre = globalThis.gyre
        this.channel.onmessage = async (e) => {
            console.log('onmessage', e.data)
            if (e.data.docId !== this.docId) return
            // asset successfully opened
            if (e.data.payload === 'opened') {
                let asset = gyre.assetManager.getAssetById(e.data.assetId)
                asset.isOpen = true
                return
            }
            // provide environment for slave tab
            if (e.data.payload === 'getConfig' && this.type === 'master') {
                let config = {
                    toolsLayers: gyre.toolsLayers,
                    plugins: gyre.plugins,
                    workflowList: gyre.ComfyUI.workflowList,
                    paletteValues: (({ tools, selectedLayer, _controlnetLayers, _controlnetLayersTxt2Img, ...rest }) => rest)(gyre.paletteValues),
                }
                config.assets = gyre.assetManager.getAssetsMeta() // no full asset data of all assets here

                let assetWithInstances = gyre.assetManager.getAssetById(e.data.assetId)
                if (!assetWithInstances) {
                    alert('Can not find asset with ID ' + e.data.assetI)
                    return
                }
                config.asset = await this.processWithPlugin(assetWithInstances.type, 'prepareAssetForSave', assetWithInstances)
                if (!config.asset) {
                    alert('Unable to prepare asset for sending to another tab - see console for more info')
                    console.log('asset:', assetWithInstances)
                    return
                }
                config = this.deepCloneAndFilter(config)
                console.log('sending now ', config)
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

        if (!pluginComponent[methodName]) {
            alert('Method ' + methodName + ' is missing at plugin ' + tag)
            return
        }
        let res = await pluginComponent[methodName](...methodParams)

        if (isNewComponent) {
            doc.body.removeChild(pluginComponent)
        }
        return res
    }
}
