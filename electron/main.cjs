const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// 保持对window对象的全局引用，避免JavaScript对象被垃圾回收时，窗口被自动关闭
let mainWindow;

function createWindow() {
    // 创建浏览器窗口
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, // 允许加载本地文件
        },
        icon: path.join(__dirname, '../public/favicon.ico')
    });

    // 加载应用
    let startUrl;

    if (isDev) {
        // 开发环境
        startUrl = 'http://localhost:3000';
    } else {
        // 生产环境 - 尝试多个可能的路径
        const buildPath = path.join(__dirname, '../build/index.html');
        const distPath = path.join(__dirname, '../dist/index.html');
        const rootBuildPath = path.join(process.resourcesPath, 'build/index.html');

        if (fs.existsSync(buildPath)) {
            startUrl = `file://${buildPath}`;
        } else if (fs.existsSync(distPath)) {
            startUrl = `file://${distPath}`;
        } else if (fs.existsSync(rootBuildPath)) {
            startUrl = `file://${rootBuildPath}`;
        } else {
            // 尝试查找应用根目录
            const appPath = path.dirname(app.getAppPath());
            const appBuildPath = path.join(appPath, 'build/index.html');

            if (fs.existsSync(appBuildPath)) {
                startUrl = `file://${appBuildPath}`;
            } else {
                console.error('找不到index.html文件');
                app.quit();
                return;
            }
        }
    }

    console.log('Loading URL:', startUrl);

    // 打印调试信息
    console.log('应用路径:', app.getAppPath());
    console.log('资源路径:', process.resourcesPath);

    // 检查资源文件是否存在
    const buildAssetsDir = path.join(path.dirname(startUrl.replace('file://', '')), 'assets');
    if (fs.existsSync(buildAssetsDir)) {
        console.log('资源目录存在:', buildAssetsDir);
        const files = fs.readdirSync(buildAssetsDir);
        console.log('资源文件列表:', files);
    } else {
        console.log('资源目录不存在:', buildAssetsDir);
    }

    mainWindow.loadURL(startUrl);

    // 开发环境下打开开发者工具
    if (isDev) {
        mainWindow.webContents.openDevTools();
    } else {
        // 生产环境也先打开开发者工具用于调试
        // mainWindow.webContents.openDevTools();
        // TODO: 调试完成后注释此行
    }

    // 捕获页面加载错误
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('页面加载失败:', errorCode, errorDescription);

        // 在窗口中显示错误信息
        mainWindow.webContents.executeJavaScript(`
            document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;">
                <h2>页面加载失败</h2>
                <p>错误代码: ${errorCode}</p>
                <p>错误描述: ${errorDescription}</p>
                <p>加载URL: ${startUrl}</p>
            </div>';
        `);
    });

    // 当窗口关闭时取消引用
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 创建应用菜单
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '退出',
                    accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                    click() {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { role: 'undo', label: '撤销' },
                { role: 'redo', label: '重做' },
                { type: 'separator' },
                { role: 'cut', label: '剪切' },
                { role: 'copy', label: '复制' },
                { role: 'paste', label: '粘贴' }
            ]
        },
        {
            label: '查看',
            submenu: [
                { role: 'reload', label: '重新加载' },
                { role: 'toggledevtools', label: '开发者工具' },
                { type: 'separator' },
                { role: 'resetzoom', label: '重置缩放' },
                { role: 'zoomin', label: '放大' },
                { role: 'zoomout', label: '缩小' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: '全屏' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于',
                    click() {
                        // 这里可以添加关于对话框
                        const { dialog } = require('electron');
                        dialog.showMessageBox({
                            title: '关于 文言文助手',
                            message: '文言文助手 v0.1.0\n虚词学习与查询工具\n© 2024',
                            buttons: ['确定']
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    // 在macOS上，除非用户使用Cmd + Q确定地退出
    // 否则应用及其菜单栏常驻
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // 在macOS上，当点击dock图标且没有其他窗口打开时
    // 通常在应用程序中重新创建一个窗口
    if (mainWindow === null) {
        createWindow();
    }
}); 