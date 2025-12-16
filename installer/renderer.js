// Step management
let currentStep = 1;
const totalSteps = 4;

// DOM Elements
const steps = document.querySelectorAll('.step');
const indicators = document.querySelectorAll('.indicator');
const installPathInput = document.getElementById('installPath');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const currentFileEl = document.getElementById('currentFile');

// Uninstall Elements
const uninstallProgressFill = document.getElementById('uninstallProgressFill');
const uninstallProgressText = document.getElementById('uninstallProgressText');
const uninstallCurrentFile = document.getElementById('uninstallCurrentFile');

// Initialize
async function init() {
    const isUninstall = await window.installer.getIsUninstall();

    if (isUninstall) {
        // Switch to Uninstall Mode
        document.querySelector('.title-text').innerHTML = '<span class="logo">🗑️</span> Parşomen Kaldırma Sihirbazı';
        document.querySelector('.step-indicator').style.display = 'none';
        goToUninstallStep(1);

        // Setup uninstall progress listener
        window.installer.onUninstallProgress((data) => {
            if (uninstallProgressFill) {
                uninstallProgressFill.style.width = data.percent + '%';
                uninstallProgressText.textContent = data.percent + '%';
                uninstallCurrentFile.textContent = data.file;
            }
        });
    } else {
        // Normal Install Mode
        const path = await window.installer.getInstallPath();
        installPathInput.value = path;

        // Setup progress listener
        window.installer.onProgress((data) => {
            progressFill.style.width = data.percent + '%';
            progressText.textContent = data.percent + '%';
            currentFileEl.textContent = data.file;
        });
    }
}

// Navigate to step
function goToStep(stepNum) {
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById('step' + stepNum).classList.add('active');

    indicators.forEach((ind, i) => {
        ind.classList.remove('active', 'completed');
        if (i + 1 < stepNum) {
            ind.classList.add('completed');
        } else if (i + 1 === stepNum) {
            ind.classList.add('active');
        }
    });
    currentStep = stepNum;
}

function goToUninstallStep(stepNum) {
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById('step-uninstall-' + stepNum).classList.add('active');
}

// Event Listeners
document.getElementById('closeBtn').addEventListener('click', () => {
    window.installer.closeInstaller();
});

// INSTALL EVENTS
document.getElementById('toStep2').addEventListener('click', () => goToStep(2));
document.getElementById('backToStep1').addEventListener('click', () => goToStep(1));

document.getElementById('browsePath').addEventListener('click', async () => {
    const newPath = await window.installer.selectDirectory();
    installPathInput.value = newPath;
});

document.getElementById('toStep3').addEventListener('click', async () => {
    goToStep(3);

    // Get options
    const createDesktopShortcut = document.getElementById('createDesktopShortcut').checked;

    // Start installation
    const result = await window.installer.startInstallation({
        createDesktopShortcut
    });

    if (result.success) {
        setTimeout(() => goToStep(4), 500);
    } else {
        alert('Kurulum başarısız: ' + result.error);
        goToStep(2);
    }
});

document.getElementById('launchApp').addEventListener('click', () => window.installer.launchApp());
document.getElementById('closeFinish').addEventListener('click', () => window.installer.closeInstaller());

// UNINSTALL EVENTS
const startUninstallBtn = document.getElementById('startUninstall');
if (startUninstallBtn) {
    startUninstallBtn.addEventListener('click', async () => {
        goToUninstallStep(2);
        const result = await window.installer.startUninstallation();

        if (result.success) {
            setTimeout(() => goToUninstallStep(3), 500);
        } else {
            alert('Kaldırma işlemi başarısız: ' + result.error);
            window.installer.closeInstaller();
        }
    });
}

const cancelUninstallBtn = document.getElementById('cancelUninstall');
if (cancelUninstallBtn) {
    cancelUninstallBtn.addEventListener('click', () => window.installer.closeInstaller());
}

const closeUninstallBtn = document.getElementById('closeUninstall');
if (closeUninstallBtn) {
    closeUninstallBtn.addEventListener('click', () => window.installer.closeInstaller());
}

// Enable title bar dragging
const titleBar = document.getElementById('titleBar');
titleBar.addEventListener('mousedown', (e) => {
    if (e.target === titleBar || e.target.classList.contains('title-text') || e.target.classList.contains('logo')) {
    }
});

init();
