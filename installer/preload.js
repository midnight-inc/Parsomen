const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('installer', {
    getInstallPath: () => ipcRenderer.invoke('get-install-path'),
    getIsUninstall: () => ipcRenderer.invoke('get-is-uninstall'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    startInstallation: (options) => ipcRenderer.invoke('start-installation', options),
    startUninstallation: () => ipcRenderer.invoke('start-uninstallation'),
    launchApp: () => ipcRenderer.invoke('launch-app'),
    closeInstaller: () => ipcRenderer.invoke('close-installer'),
    onProgress: (callback) => ipcRenderer.on('install-progress', (event, data) => callback(data)),
    onUninstallProgress: (callback) => ipcRenderer.on('uninstall-progress', (event, data) => callback(data))
});
