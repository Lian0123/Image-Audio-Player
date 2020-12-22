const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

let win
    //win = new BrowserWindow({ width: 800, height: 600, transparent: false, frame: false })
    //win.show()


function createWindow() {
    let win = new BrowserWindow({ width: 800, height: 600,webPreferences: {
        nodeIntegration: true
    }})

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'Index.html'),
        protocol: 'file:',
        slashes: true
    }))

    //win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})
