const { app, BrowserWindow, shell, Tray, Menu, nativeImage, Notification } = require('electron');
const path = require('path');

let tray = null;
let isQuitting = false;

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: "Parşomen v1.2", // Version indicator for debugging
        icon: path.join(__dirname, '../public/icons/icon-512x512.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true,
        backgroundColor: '#0f172a',
        show: false
    });

    win.maximize(); // Force maximize immediately

    // 1. DIRECT STARTUP TO STORE
    // Dev mode: localhost, Production (Packaged): Vercel URL
    const appUrl = app.isPackaged
        ? 'https://parsomen.vercel.app/store'
        : 'http://localhost:3000/store';

    // Set custom UserAgent
    win.webContents.setUserAgent(win.webContents.getUserAgent() + ' ParsomenDesktop');

    // 2. NAVIGATION GUARD
    // If somewhere in the app tries to go back to root '/', force it to '/store'
    const handleRedirect = (url) => {
        try {
            const u = new URL(url);
            if (u.pathname === '/' || u.pathname === '') {
                return true; // Needed redirect
            }
        } catch (e) { /* ignore invalid urls */ }
        return false;
    };

    win.webContents.on('will-navigate', (event, url) => {
        if (handleRedirect(url)) {
            event.preventDefault();
            win.loadURL(appUrl);
        }
    });

    win.webContents.on('did-navigate', (event, url) => {
        if (handleRedirect(url)) {
            win.loadURL(appUrl);
        }
    });

    // Catch in-page navigations (History API) too
    win.webContents.on('did-navigate-in-page', (event, url) => {
        if (handleRedirect(url)) {
            win.loadURL(appUrl);
        }
    });

    win.loadURL(appUrl).catch((err) => {
        console.error('Failed to load URL:', err);
    });

    // 3. TRAY & CLOSE BEHAVIOR
    win.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            win.hide();

            // Show Notification
            new Notification({
                title: 'Parşomen',
                body: 'Uygulama simge durumuna küçültüldü.',
                icon: path.join(__dirname, '../public/icons/icon-512x512.png')
            }).show();
        }
        return false;
    });

    // External links
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:') || url.startsWith('http:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    // 4. SHOW ON READY
    win.once('ready-to-show', () => {
        win.show();
    });

    return win;
}

function createTray(win) {
    const iconPath = path.join(__dirname, '../public/icons/icon-512x512.png');
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

    tray = new Tray(trayIcon);
    tray.setToolTip('Parşomen');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Göster',
            click: () => win.show()
        },
        { type: 'separator' },
        {
            label: 'Çıkış',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        win.show();
    });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        const wins = BrowserWindow.getAllWindows();
        if (wins.length > 0) {
            if (wins[0].isMinimized()) wins[0].restore();
            if (!wins[0].isVisible()) wins[0].show();
            wins[0].focus();
        }
    });

    app.whenReady().then(() => {
        if (process.platform === 'win32') {
            app.setAppUserModelId('Parşomen'); // Required for Notifications on Windows
        }

        const win = createWindow();
        createTray(win);

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    });
}

app.on('before-quit', () => {
    isQuitting = true;
});

app.on('window-all-closed', () => {
    // Keep active for tray
});
