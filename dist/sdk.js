function loadScript(url) {
    return new Promise(function (resolve, reject) {
        var script = document.createElement('script')
        script.src = url
        script.onload = function () {
            resolve(url)
        }
        script.onerror = function () {
            reject(new Error('Script load error: ' + url))
        }
        document.head.appendChild(script)
    })
}

Promise.all([
    loadScript(
        'https://flyingdogsoftware.github.io/gyre-ui-dist/dist/node_modules/%40fds-components/fds-image-editor-button/dist/fds-image-editor-button.js'
    ),
    loadScript(
        'https://flyingdogsoftware.github.io/gyre-ui-dist/dist/node_modules/%40fds-components/fds-image-editor-toggle/dist/fds-image-editor-toggle.js'
    ),
    loadScript(
        'https://flyingdogsoftware.github.io/gyre-ui-dist/dist/node_modules/%40fds-components/fds-image-editor-slider/dist/fds-image-editor-slider.js'
    ),
    loadScript(
        'https://flyingdogsoftware.github.io/gyre-ui-dist/dist/node_modules/%40fds-components/fds-image-editor-menu/dist/fds-image-editor-menu.js'
    ),
    loadScript(
        'https://flyingdogsoftware.github.io/gyre-ui-dist/dist/node_modules/%40fds-components/fds-image-editor-progress-bar/dist/fds-image-editor-progress-bar.js'
    ),
    loadScript(
        'https://flyingdogsoftware.github.io/gyre-ui-dist/dist/node_modules/%40fds-components/fds-ai-image-editor/dist/fds-ai-image-editor.js'
    ),
    loadScript('https://flyingdogsoftware.github.io/gyre-ui-dist/dist/fds-image-editor-canvas.js'),
])
    .then(function () {
        console.log('All scripts loaded successfully.')
        // Your initialization code can go here
    })
    .catch(function (error) {
        console.error(error)
    })
