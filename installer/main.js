const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');

// Logger function
function log(msg) {
    const logPath = path.join(process.env.TEMP, 'parsomen_install_log.txt');
    try {
        const time = new Date().toISOString();
        fs.appendFileSync(logPath, `[${time}] ${msg}\n`);
    } catch (e) { }
}

let mainWindow;

// Default installation path (user folder - no admin needed)
let installPath = path.join(process.env['LOCALAPPDATA'] || path.join(process.env['USERPROFILE'], 'AppData', 'Local'), 'Parsomen');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 500,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'build', 'icon.png')
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

// IPC Handlers
ipcMain.handle('get-install-path', () => installPath);
ipcMain.handle('get-is-uninstall', () => process.argv.includes('--uninstall'));

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        defaultPath: installPath
    });
    if (!result.canceled && result.filePaths[0]) {
        installPath = path.join(result.filePaths[0], 'Parsomen');
        return installPath;
    }
    return installPath;
});

ipcMain.handle('start-installation', async (event) => {
    try {
        // Get the app package from resources
        const resourcePath = process.resourcesPath || path.join(__dirname, 'app-package');
        const sourcePath = path.join(resourcePath, 'app-package');

        // Check if source exists (for dev mode, use parent dist)
        let actualSource = sourcePath;
        if (!fs.existsSync(sourcePath)) {
            actualSource = path.join(__dirname, '..', 'dist', 'win-unpacked');
        }

        if (!fs.existsSync(actualSource)) {
            throw new Error('Uygulama paketi bulunamadı');
        }

        // Create install directory
        if (!fs.existsSync(installPath)) {
            fs.mkdirSync(installPath, { recursive: true });
        }

        // Copy files
        const files = getAllFiles(actualSource);
        const totalFiles = files.length;
        let copied = 0;

        for (const file of files) {
            const relativePath = path.relative(actualSource, file);
            const destPath = path.join(installPath, relativePath);
            const destDir = path.dirname(destPath);

            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            fs.copyFileSync(file, destPath);
            copied++;

            // Send progress
            mainWindow.webContents.send('install-progress', {
                percent: Math.round((copied / totalFiles) * 100),
                file: relativePath
            });
        }

        // Copy Uninstaller (Self)
        // Only works in production build, in dev process.execPath is electron.exe
        if (app.isPackaged) {
            const uninstallerPath = path.join(installPath, 'Uninstall Parsomen.exe');
            fs.copyFileSync(process.execPath, uninstallerPath);
            await registerUninstall(installPath, uninstallerPath);
        }

        // Create shortcuts
        const createDesktopShortcut = event && event.createDesktopShortcut !== false; // Default true if undefined, checking arg
        // Note: ipcMain.handle receives (event, ...args). validation needed.
        // Actually ipcMain.handle('channel', (event, arg) => ...)

        // Let's get options from the second argument (the first is event)
        // We will update the handle signature below.

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.message };
    }
});

// We need to redefine the handler to accept options properly
// Redefine handler with logging
ipcMain.removeHandler('start-installation');
ipcMain.handle('start-installation', async (event, options = {}) => {
    log('start-installation called with options: ' + JSON.stringify(options));
    try {
        const { createDesktopShortcut } = options;

        const resourcePath = process.resourcesPath || path.join(__dirname, 'app-package');
        // Dev vs Prod source path logic
        const sourcePath = path.join(resourcePath, 'app-package');
        let actualSource = sourcePath;
        if (!fs.existsSync(sourcePath)) {
            actualSource = path.join(__dirname, '..', 'dist', 'win-unpacked');
        }

        log(`Paths: Resource=${resourcePath}, ActualSource=${actualSource}, Install=${installPath}`);

        // KILL RUNNING APP IF EXISTS
        try {
            log('Checking for running instances...');
            // Force kill Parsomen.exe to prevent EBUSY errors
            execSync('taskkill /F /IM Parsomen.exe /T', { stdio: 'ignore' });
            log('Killed running Parsomen.exe process.');
            // Give it a second to release file locks
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
            // Process probably wasn't running, which is fine
            log('No running process found or kill check skipped.');
        }

        if (!fs.existsSync(actualSource)) throw new Error('Uygulama paketi bulunamadı');
        if (!fs.existsSync(installPath)) fs.mkdirSync(installPath, { recursive: true });

        const files = getAllFiles(actualSource);
        const totalFiles = files.length;
        let copied = 0;

        for (const file of files) {
            const relativePath = path.relative(actualSource, file);
            const destPath = path.join(installPath, relativePath);
            const destDir = path.dirname(destPath);
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(file, destPath);
            copied++;

            // Progress is frequent, maybe don't log every file to keep log small
            mainWindow.webContents.send('install-progress', {
                percent: Math.round((copied / totalFiles) * 100),
                file: relativePath
            });
        }
        log('Files copied successfully.');

        if (app.isPackaged) {
            const uninstallerPath = path.join(installPath, 'Uninstall Parsomen.exe');
            log(`Copying uninstaller to ${uninstallerPath}`);
            fs.copyFileSync(process.execPath, uninstallerPath);
            await registerUninstall(installPath, uninstallerPath);
        } else {
            log('App not packaged, skipping uninstaller generation');
        }

        log(`Creating shortcuts (Desktop=${createDesktopShortcut})`);
        await createShortcuts(createDesktopShortcut);

        return { success: true };
    } catch (error) {
        log(`Installation Error: ${error.message}\n${error.stack}`);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('start-uninstallation', async () => {
    try {
        const targetDir = path.dirname(process.execPath);

        // Remove Registry Key
        try {
            const { spawnSync } = require('child_process');
            spawnSync('reg', ['delete', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Parsomen', '/f'], { stdio: 'ignore' });
        } catch (e) { console.error('Reg delete failed', e); }

        // Remove Shortcuts
        const desktopPath = path.join(process.env.USERPROFILE, 'Desktop', 'Parsomen.lnk');
        // CORRECT PATH: Inside 'Parsomen' folder
        const startMenuFolder = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Parsomen');
        const startMenuPath = path.join(startMenuFolder, 'Parsomen.lnk');

        if (fs.existsSync(desktopPath)) fs.unlinkSync(desktopPath);
        if (fs.existsSync(startMenuPath)) fs.unlinkSync(startMenuPath);
        // Try removing the folder too
        if (fs.existsSync(startMenuFolder)) {
            try { fs.rmdirSync(startMenuFolder); } catch (e) { }
        }

        // Remove Files (Everything except the running executable)
        // We will schedule self-deletion after exit
        const files = getAllFiles(targetDir);
        const currentExe = process.execPath;

        let deleted = 0;
        const total = files.length;

        for (const file of files) {
            if (file.toLowerCase() !== currentExe.toLowerCase()) {
                try {
                    fs.unlinkSync(file);
                } catch (e) { /* ignore folders or locked files */ }
            }
            deleted++;
            // Send progress if window still exists
            try {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('uninstall-progress', {
                        percent: Math.round((deleted / total) * 100),
                        file: path.basename(file)
                    });
                }
            } catch (e) { }
        }

        // Self destruct script
        const batchPath = path.join(process.env.TEMP, 'parsomen_cleanup.bat');
        const batchScript = `
@echo off
:loop
ping 127.0.0.1 -n 2 > nul
del "${currentExe}"
if exist "${currentExe}" goto loop
del "${batchPath}"
        `;
        fs.writeFileSync(batchPath, batchScript);

        // Store batch path to run on close
        global.cleanupScript = batchPath;

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('launch-app', () => {
    const exePath = path.join(installPath, 'Parsomen.exe');
    if (fs.existsSync(exePath)) {
        spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref();
    }
    app.quit();
});

ipcMain.handle('close-installer', () => {
    if (global.cleanupScript) {
        // Run self destruct
        spawn('cmd.exe', ['/c', global.cleanupScript], {
            detached: true,
            stdio: 'ignore'
        }).unref();
    }
    app.quit();
});

// Helper: Register Uninstall in Registry (Using reg.exe with spawnSync for safety)
async function registerUninstall(installDir, uninstallerPath) {
    const keyPath = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Parsomen';
    const iconPath = path.join(installDir, 'Parsomen.exe');
    const uninstallCmd = `"${uninstallerPath}" --uninstall`; // Value inside registry

    const entries = [
        { name: 'DisplayName', value: 'Parsomen' },
        { name: 'DisplayIcon', value: iconPath },
        { name: 'UninstallString', value: uninstallCmd },
        { name: 'DisplayVersion', value: '1.0.0' },
        { name: 'Publisher', value: 'Midnight Inc.' },
        { name: 'InstallLocation', value: installDir },
        { name: 'NoModify', type: 'REG_DWORD', value: 1 },
        { name: 'NoRepair', type: 'REG_DWORD', value: 1 }
    ];

    try {
        log('Registering uninstaller via reg.exe...');
        // 1. Create Key
        const { spawnSync } = require('child_process');
        spawnSync('reg', ['add', keyPath, '/f'], { stdio: 'ignore' });

        // 2. Add Values
        for (const entry of entries) {
            const args = ['add', keyPath, '/v', entry.name, '/t', entry.type || 'REG_SZ', '/d', entry.value.toString(), '/f'];
            const res = spawnSync('reg', args, { encoding: 'utf8' });
            if (res.error || res.status !== 0) {
                log(`Reg Error (${entry.name}): ${res.error || res.stderr}`);
            }
        }
        log('Registry registration finished.');
    } catch (e) {
        log(`Registry Critical Error: ${e.message}`);
        dialog.showErrorBox('Kayıt Defteri Hatası', 'Uninstaller kaydedilemedi:\n' + e.message);
    }
}

// Helper: Get all files recursively
function getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllFiles(fullPath, files);
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

// Helper: Create shortcuts using VBScript (Most reliable method)
async function createShortcuts(createDesktop = true) {
    const exePath = path.join(installPath, 'Parsomen.exe');
    const desktopPath = path.join(process.env.USERPROFILE, 'Desktop', 'Parsomen.lnk');
    const startMenuFolder = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Parsomen');

    if (!fs.existsSync(startMenuFolder)) {
        try { fs.mkdirSync(startMenuFolder, { recursive: true }); } catch (e) { }
    }
    const startMenuPath = path.join(startMenuFolder, 'Parsomen.lnk');

    // Create a temporary VBS script
    const vbsPath = path.join(process.env.TEMP, 'parsomen_shortcuts.vbs');

    // VBScript content - Use ASCII description to avoid encoding issues
    const vbsContent = `
        Set oWS = WScript.CreateObject("WScript.Shell")
        
        ' 1. Desktop Shortcut
        ${createDesktop ? `
        sLinkFile = "${desktopPath}"
        Set oLink = oWS.CreateShortcut(sLinkFile)
        oLink.TargetPath = "${exePath}"
        oLink.WorkingDirectory = "${installPath}"
        oLink.Description = "Parsomen Digital Library"
        oLink.IconLocation = "${exePath},0"
        oLink.Save
        ` : ''}
        
        ' 2. Start Menu Shortcut
        sLinkFile = "${startMenuPath}"
        Set oLink = oWS.CreateShortcut(sLinkFile)
        oLink.TargetPath = "${exePath}"
        oLink.WorkingDirectory = "${installPath}"
        oLink.Description = "Parsomen Digital Library"
        oLink.IconLocation = "${exePath},0"
        oLink.Save
    `;

    try {
        fs.writeFileSync(vbsPath, vbsContent, 'utf8');
        log('Executing VBScript for shortcuts...');

        const { spawnSync } = require('child_process');
        const res = spawnSync('cscript', ['//Nologo', vbsPath], { encoding: 'utf8' });

        if (res.error || res.status !== 0) {
            throw new Error(res.error ? res.error.message : res.stderr || 'Unknown VBScript error');
        }

        log('Shortcuts created successfully (VBS).');

        // Cleanup VBS
        try { fs.unlinkSync(vbsPath); } catch (e) { }

    } catch (e) {
        log(`Shortcut Error: ${e.message}`);
        dialog.showErrorBox('Kısayol Hatası', 'Kısayollar oluşturulamadı:\n' + e.message);
    }
}
