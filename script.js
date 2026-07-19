/**
 * ==========================================================================
 * PRODUCTIVITY DASHBOARD & ADVANCED POMODORO ENGINE
 * FULL INTEGRATED PRODUCTION WORKSPACE ARCHITECTURE
 * File: script.js (Complete Document)
 * ==========================================================================
 */

"use strict";

// ==========================================================================
// 1. ARCHITECTURAL GLOBAL APP STATE CONFIGURATION
// ==========================================================================

/**
 * Default initial system configurations for fallback generation
 * @type {Object}
 */
const DEFAULT_SYSTEM_THEME = {
    tasks: [
        {
            id: "task-init-1111",
            title: "Welcome to your Elite Workspace! Try finishing this initial sprint.",
            priority: "medium",
            estimatedPomodoros: 2,
            completedPomodoros: 0,
            completed: false,
            createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: "task-init-2222",
            title: "Configure a custom high-end glassmorphic background layer.",
            priority: "low",
            estimatedPomodoros: 1,
            completedPomodoros: 1,
            completed: true,
            createdAt: new Date(Date.now() - 7200000).toISOString()
        }
    ],
    historyLogs: [
        {
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
            completedCount: 4,
            xpEarned: 120,
            focusMinutes: 100
        },
        {
            date: new Date().toISOString().split('T')[0], // Today
            completedCount: 1,
            xpEarned: 30,
            focusMinutes: 25
        }
    ],
    timer: {
        mode: "pomodoro", // "pomodoro" | "shortBreak" | "longBreak" | "stopwatch"
        durationMinutes: 25,
        secondsRemaining: 1500,
        isRunning: false,
        currentTaskId: null,
        sessionCount: 0
    },
    userMetrics: {
        totalXp: 150,
        level: 1,
        xpProgressToNextLevel: 50,
        xpRequiredForNextLevel: 200,
        totalFocusHours: 2.08,
        totalTasksBurned: 1
    },
    wallpaper: {
        type: "default", // "default" | "custom-url" | "custom-upload"
        source: "", 
        blurAmount: 4,
        overlayOpacity: 0.2
    },
    uiPreferences: {
        themeMode: "system", // "dark" | "light" | "system"
        soundEnabled: true,
        autoStartBreaks: false,
        autoStartPomodoros: false
    }
};

/**
 * Global App State Management Object
 * Acts as the Single Source of Truth for the entire workspace layout canvas.
 */
let appState = {
    tasks: [],
    historyLogs: [],
    timer: {},
    userMetrics: {},
    wallpaper: {},
    uiPreferences: {}
};

// ==========================================================================
// 2. STORAGE SYSTEM PERSISTENCE PIPELINES (LOCALSTORAGE)
// ==========================================================================

const LOCAL_STORAGE_KEY = "WORKSPACE_ENGINE_DATA_V1";

/**
 * Verifies the absolute logical structure of an object to ensure no corrupted data breaks the UI
 * @param {Object} data - The parsed configuration candidate object
 * @returns {boolean} True if data adheres perfectly to validation metrics
 */
function validateStateSchema(data) {
    if (!data || typeof data !== "object") return false;
    
    const requiredKeys = ["tasks", "historyLogs", "timer", "userMetrics", "wallpaper", "uiPreferences"];
    const hasAllKeys = requiredKeys.every(key => Object.prototype.hasOwnProperty.call(data, key));
    
    if (!hasAllKeys) return false;
    
    // Deeper schema checks for array attributes
    if (!Array.isArray(data.tasks) || !Array.isArray(data.historyLogs)) return false;
    
    // Ensure vital numeric runtime engine indicators exist
    if (typeof data.userMetrics.totalXp !== "number" || typeof data.userMetrics.level !== "number") return false;
    if (typeof data.timer.secondsRemaining !== "number" || typeof data.timer.isRunning !== "boolean") return false;
    
    return true;
}

/**
 * Synchronizes the runtime global application state into the LocalStorage layer
 */
function saveStateToStorage() {
    try {
        const payload = JSON.stringify(appState);
        localStorage.setItem(LOCAL_STORAGE_KEY, payload);
    } catch (storageError) {
        console.error("Critical State Error: Failed to commit workspace modifications to LocalStorage.", storageError);
        showSystemToast("error", "Failed to preserve session data automatically.");
    }
}

/**
 * Parses and reconstructs the global workspace state object upon execution initialization
 */
function loadStateFromStorage() {
    try {
        const storedPayload = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (storedPayload) {
            const parsedCandidate = JSON.parse(storedPayload);
            
            if (validateStateSchema(parsedCandidate)) {
                // Ensure active runner runtime attributes are reset safely to avoid loops on boot
                parsedCandidate.timer.isRunning = false;
                appState = parsedCandidate;
                console.log("State Engine: Workspace loaded successfully from secure system storage partition.");
                return;
            }
        }
        
        console.warn("State Engine: No valid workspace profile data found. Reverting canvas to master design fallbacks.");
        appState = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_THEME));
        saveStateToStorage();
        
    } catch (parseError) {
        console.error("Critical Recovery Error: Storage sequence corrupted. Building fresh environment state.", parseError);
        appState = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_THEME));
        saveStateToStorage();
    }
}

// ==========================================================================
// 3. BACKGROUND WALLPAPER DESIGN ENGINE
// ==========================================================================

const BackgroundEngine = {
    imageLayer: document.getElementById("backgroundImageLayer") || document.querySelector(".background-image-layer"),
    glassOverlay: document.getElementById("glassOverlay") || document.querySelector(".glass-overlay"),
    gradientLayer: document.querySelector(".background-gradient"),
    
    initialize() {
        if (!this.imageLayer) {
            this.imageLayer = document.createElement("div");
            this.imageLayer.className = "background-image-layer";
            const engineContainer = document.querySelector(".background-engine");
            if (engineContainer) engineContainer.appendChild(this.imageLayer);
        }
        this.applyWallpaperSettings();
    },

    applyWallpaperSettings() {
        const config = appState.wallpaper;
        
        if (!config || config.type === "default" || !config.source) {
            this.imageLayer.style.backgroundImage = "none";
            this.imageLayer.classList.remove("active");
            if (this.gradientLayer) this.gradientLayer.style.opacity = "1";
            this.updateBlurEngine(4, 0.2);
            return;
        }

        const imgPreloader = new Image();
        imgPreloader.src = config.source;
        
        imgPreloader.onload = () => {
            this.imageLayer.style.backgroundImage = `url('${config.source}')`;
            this.imageLayer.classList.add("active");
            if (this.gradientLayer) this.gradientLayer.style.opacity = "0.3";
            this.updateBlurEngine(config.blurAmount, config.overlayOpacity);
        };

        imgPreloader.onerror = () => {
            console.error(`Wallpaper Engine: Asset at target URL path failed to resolve: ${config.source}`);
            showSystemToast("error", "Configured wallpaper image could not be verified.");
            appState.wallpaper.type = "default";
            appState.wallpaper.source = "";
            saveStateToStorage();
            this.applyWallpaperSettings();
        };
    },

    setCustomUrlWallpaper(urlString) {
        if (!urlString || urlString.trim() === "") {
            showSystemToast("warning", "Please provide a valid asset URL link path.");
            return false;
        }

        const urlExpression = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?(.*?)$/i;
        if (!urlExpression.test(urlString.trim())) {
            showSystemToast("error", "URL format invalid. Ensure link includes secure transfer rules.");
            return false;
        }

        appState.wallpaper.type = "custom-url";
        appState.wallpaper.source = urlString.trim();
        saveStateToStorage();
        this.applyWallpaperSettings();
        showSystemToast("success", "Custom workspace environment context rendered successfully.");
        return true;
    },

    processFileUploadWallpaper(fileObject) {
        if (!fileObject) return;

        const MAX_BYTE_SIZE = 5 * 1024 * 1024;
        if (fileObject.size > MAX_BYTE_SIZE) {
            showSystemToast("error", "File footprint exceeds the secure 5MB threshold.");
            return;
        }

        if (!fileObject.type.startsWith("image/")) {
            showSystemToast("error", "Asset rejected. Provided file structure is not a standardized image type.");
            return;
        }

        const dataReader = new FileReader();
        dataReader.onload = (event) => {
            const dataBase64 = event.target.result;
            appState.wallpaper.type = "custom-upload";
            appState.wallpaper.source = dataBase64;
            saveStateToStorage();
            this.applyWallpaperSettings();
            showSystemToast("success", "Local wallpaper asset bound and applied perfectly.");
        };

        dataReader.onerror = () => {
            showSystemToast("error", "Internal asset preloader system error during file compression.");
        };

        dataReader.readAsDataURL(fileObject);
    },

    updateBlurEngine(pxBlur, opacityRatio) {
        appState.wallpaper.blurAmount = Number(pxBlur);
        appState.wallpaper.overlayOpacity = Number(opacityRatio);
        
        if (this.glassOverlay) {
            const styleFilterValue = `blur(${pxBlur}px)`;
            this.glassOverlay.style.backdropFilter = styleFilterValue;
            this.glassOverlay.style.webkitBackdropFilter = styleFilterValue;
            this.glassOverlay.style.background = `rgba(9, 13, 22, ${opacityRatio})`;
        }
    }
};

// ==========================================================================
// 4. ADVANCED TASK CRUD INTERACTION SYSTEM
// ==========================================================================

const TaskDOM = {
    form: document.getElementById("taskForm") || document.querySelector(".task-creator-box form"),
    inputTitle: document.getElementById("taskTitle") || document.querySelector(".form-input-text"),
    selectPriority: document.getElementById("taskPriority") || document.querySelector(".form-select-native"),
    selectEstPomodoros: document.getElementById("taskEstPomodoros"),
    container: document.getElementById("tasksContainer") || document.querySelector(".tasks-container"),
    searchInput: document.getElementById("taskSearch") || document.querySelector(".search-input"),
    filterChips: document.querySelectorAll(".filter-chip"),
    sortSelect: document.getElementById("taskSort") || document.querySelector(".sort-select")
};

let activePriorityFilter = "all";
let activeSearchQuery = "";

/**
 * Initializes Task Listeners and maps initial UI layout bindings
 */
function initializeTaskManager() {
    if (TaskDOM.form) {
        TaskDOM.form.addEventListener("submit", (e) => {
            e.preventDefault();
            handleTaskCreation();
        });
    }

    if (TaskDOM.searchInput) {
        TaskDOM.searchInput.addEventListener("input", (e) => {
            activeSearchQuery = e.target.value.toLowerCase().trim();
            renderTasksDynamicMatrix();
        });
    }

    if (TaskDOM.sortSelect) {
        TaskDOM.sortSelect.addEventListener("change", () => {
            renderTasksDynamicMatrix();
        });
    }

    // Filtration Chip Matrix Configuration Loop
    TaskDOM.filterChips.forEach(chip => {
        chip.addEventListener("click", () => {
            TaskDOM.filterChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            
            activePriorityFilter = chip.getAttribute("data-filter") || chip.textContent.toLowerCase().trim();
            renderTasksDynamicMatrix();
        });
    }); // <-- Syntactic closure perfectly applied here
    
    renderTasksDynamicMatrix();
}

function handleTaskCreation() {
    const titleVal = TaskDOM.inputTitle ? TaskDOM.inputTitle.value.trim() : "";
    const priorityVal = TaskDOM.selectPriority ? TaskDOM.selectPriority.value : "medium";
    const estPomodorosVal = TaskDOM.selectEstPomodoros ? parseInt(TaskDOM.selectEstPomodoros.value, 10) : 1;

    if (!titleVal) {
        showSystemToast("warning", "Task title description context cannot remain empty.");
        return;
    }

    const newTaskInstance = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: titleVal,
        priority: priorityVal,
        estimatedPomodoros: isNaN(estPomodorosVal) ? 1 : estPomodorosVal,
        completedPomodoros: 0,
        completed: false,
        createdAt: new Date().toISOString()
    };

    appState.tasks.unshift(newTaskInstance);
    saveStateToStorage();
    
    if (TaskDOM.inputTitle) TaskDOM.inputTitle.value = "";
    if (TaskDOM.selectPriority) TaskDOM.selectPriority.value = "medium";
    if (TaskDOM.selectEstPomodoros) TaskDOM.selectEstPomodoros.value = "1";

    syncDashboardMetricsEngine();
    renderTasksDynamicMatrix();
    showSystemToast("success", "New workspace task milestone compiled cleanly.");
}

function toggleTaskCompletionState(taskId) {
    const targetIndex = appState.tasks.findIndex(t => t.id === taskId);
    if (targetIndex === -1) return;

    const task = appState.tasks[targetIndex];
    task.completed = !task.completed;

    if (task.completed) {
        awardUserExperienceEngine(30);
        appState.userMetrics.totalTasksBurned += 1;
        showSystemToast("success", "Task burned! +30 XP synchronized.");
    } else {
        awardUserExperienceEngine(-30);
        if (appState.userMetrics.totalTasksBurned > 0) {
            appState.userMetrics.totalTasksBurned -= 1;
        }
    }

    saveStateToStorage();
    syncDashboardMetricsEngine();
    renderTasksDynamicMatrix();
}

function deleteTaskFromEngine(taskId) {
    const initialLength = appState.tasks.length;
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);

    if (appState.tasks.length !== initialLength) {
        if (appState.timer.currentTaskId === taskId) {
            appState.timer.currentTaskId = null;
            const contextDisplay = document.getElementById("activeTaskContextDisplay");
            if (contextDisplay) contextDisplay.textContent = "No Active Task Target Selected";
        }
        
        saveStateToStorage();
        syncDashboardMetricsEngine();
        renderTasksDynamicMatrix();
        showSystemToast("info", "Selected task removed from runtime list.");
    }
}

function renderTasksDynamicMatrix() {
    if (!TaskDOM.container) return;
    TaskDOM.container.innerHTML = "";

    let processedCollection = [...appState.tasks];

    if (activePriorityFilter !== "all") {
        processedCollection = processedCollection.filter(task => task.priority === activePriorityFilter);
    }

    if (activeSearchQuery) {
        processedCollection = processedCollection.filter(task => task.title.toLowerCase().includes(activeSearchQuery));
    }

    const activeSortRule = TaskDOM.sortSelect ? TaskDOM.sortSelect.value : "newest";
    if (activeSortRule === "newest") {
        processedCollection.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeSortRule === "oldest") {
        processedCollection.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (activeSortRule === "priority") {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        processedCollection.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
    }

    if (processedCollection.length === 0) {
        TaskDOM.container.innerHTML = `
            <div class="tasks-empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <p>No functional tasks matching current operational pipeline parameters found.</p>
            </div>
        `;
        return;
    }

    processedCollection.forEach(task => {
        const itemShell = document.createElement("div");
        itemShell.className = `task-item ${task.completed ? "completed" : ""}`;
        itemShell.setAttribute("data-id", task.id);

        let priorityTagClass = "priority-medium";
        if (task.priority === "high") priorityTagClass = "priority-high";
        if (task.priority === "low") priorityTagClass = "priority-low";

        itemShell.innerHTML = `
            <label class="checkbox-container">
                <input type="checkbox" ${task.completed ? "checked" : ""} data-action="toggle">
                <span class="checkmark"></span>
            </label>
            <div class="task-details">
                <span class="task-title-text">${escapeHtmlDataContent(task.title)}</span>
                <div class="task-meta-row">
                    <span class="task-tag ${priorityTagClass}">${task.priority}</span>
                    <span class="task-pomodoro-estimate">
                        <i class="fa-solid fa-tomato"></i> ${task.completedPomodoros}/${task.estimatedPomodoros} Pomodoros
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn play-task" title="Bind target to Active Time Keeper Engine" data-action="inject-timer">
                    <i class="fa-solid fa-play"></i>
                </button>
                <button class="task-action-btn delete-task" title="Purge Record" data-action="delete">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        itemShell.querySelector('input[data-action="toggle"]').addEventListener("change", () => {
            toggleTaskCompletionState(task.id);
        });

        itemShell.querySelector('[data-action="inject-timer"]').addEventListener("click", () => {
            bindTaskToTimerEngine(task.id);
        });

        itemShell.querySelector('[data-action="delete"]').addEventListener("click", () => {
            deleteTaskFromEngine(task.id);
        });

        TaskDOM.container.appendChild(itemShell);
    });
}

function escapeHtmlDataContent(rawString) {
    if (!rawString) return "";
    return rawString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================================================
// 5. ADVANCED CHRONOGRAPH ENGINE (POMODORO & STOPWATCH)
// ==========================================================================

const ChronoDOM = {
    digitalReadout: document.querySelector(".time-digital-counter"),
    phaseLabel: document.querySelector(".time-phase-label"),
    chronoFill: document.querySelector(".chrono-fill"),
    chronoStation: document.querySelector(".chronograph-station"),
    btnToggle: document.getElementById("startPauseBtn") || document.querySelector(".primary-trigger"),
    btnReset: document.getElementById("resetTimerBtn") || document.querySelector(".btn-control:nth-child(1)"),
    btnSkip: document.getElementById("skipTimerBtn") || document.querySelector(".btn-control:nth-child(3)"),
    modeTabs: document.querySelectorAll(".mode-tab-btn"),
    headerStatusText: document.querySelector(".focus-status span"),
    headerStatusNode: document.querySelector(".focus-status")
};

let internalTimerInterval = null;
let lastTickTimestamp = null;
const CHRONO_MAX_CIRCUMFERENCE = 220; 

function initializeChronographEngine() {
    ChronoDOM.modeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            if (appState.timer.isRunning) {
                showSystemToast("warning", "Pause the running clock before switching workspace modes.");
                return;
            }
            ChronoDOM.modeTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const selectedMode = tab.getAttribute("data-mode") || tab.textContent.toLowerCase().replace(" ", "");
            setTimerExecutionMode(selectedMode);
        });
    });

    if (ChronoDOM.btnToggle) {
        ChronoDOM.btnToggle.addEventListener("click", () => toggleChronographRunningState());
    }
    if (ChronoDOM.btnReset) {
        ChronoDOM.btnReset.addEventListener("click", () => resetChronographSession());
    }
    if (ChronoDOM.btnSkip) {
        ChronoDOM.btnSkip.addEventListener("click", () => executeManualSessionSkip());
    }

    synchronizeChronographDisplayView();
}

function setTimerExecutionMode(targetMode) {
    appState.timer.mode = targetMode;
    
    if (ChronoDOM.chronoStation) {
        ChronoDOM.chronoStation.classList.remove("active-break", "active-stopwatch");
    }

    switch (targetMode) {
        case "pomodoro":
            appState.timer.durationMinutes = 25;
            appState.timer.secondsRemaining = 25 * 60;
            if (ChronoDOM.phaseLabel) ChronoDOM.phaseLabel.textContent = "Focus Sprint";
            break;
        case "shortBreak":
            appState.timer.durationMinutes = 5;
            appState.timer.secondsRemaining = 5 * 60;
            if (ChronoDOM.chronoStation) ChronoDOM.chronoStation.classList.add("active-break");
            if (ChronoDOM.phaseLabel) ChronoDOM.phaseLabel.textContent = "Short Rest";
            break;
        case "longBreak":
            appState.timer.durationMinutes = 15;
            appState.timer.secondsRemaining = 15 * 60;
            if (ChronoDOM.chronoStation) ChronoDOM.chronoStation.classList.add("active-break");
            if (ChronoDOM.phaseLabel) ChronoDOM.phaseLabel.textContent = "Deep Rest";
            break;
        case "stopwatch":
            appState.timer.durationMinutes = 0;
            appState.timer.secondsRemaining = 0;
            if (ChronoDOM.chronoStation) ChronoDOM.chronoStation.classList.add("active-stopwatch");
            if (ChronoDOM.phaseLabel) ChronoDOM.phaseLabel.textContent = "Free Flow";
            break;
    }

    saveStateToStorage();
    synchronizeChronographDisplayView();
    updateSystemHeaderStatusIndicator();
}

function toggleChronographRunningState() {
    if (appState.timer.isRunning) {
        appState.timer.isRunning = false;
        clearInterval(internalTimerInterval);
        internalTimerInterval = null;
        
        if (ChronoDOM.btnToggle) {
            ChronoDOM.btnToggle.classList.remove("running");
            ChronoDOM.btnToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
        showSystemToast("info", "Chronograph paused.");
    } else {
        requestNotificationChannelsPermission();
        
        appState.timer.isRunning = true;
        lastTickTimestamp = Date.now();
        internalTimerInterval = setInterval(() => executeChronographTick(), 1000);
        
        if (ChronoDOM.btnToggle) {
            ChronoDOM.btnToggle.classList.add("running");
            ChronoDOM.btnToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
        showSystemToast("success", "Chronograph loop engaged successfully.");
    }
    
    updateSystemHeaderStatusIndicator();
    saveStateToStorage();
}

function executeChronographTick() {
    const activeTime = Date.now();
    const elapsedSeconds = Math.round((activeTime - lastTickTimestamp) / 1000);
    
    if (elapsedSeconds <= 0) return;
    lastTickTimestamp = activeTime;

    if (appState.timer.mode === "stopwatch") {
        appState.timer.secondsRemaining += elapsedSeconds;
        appState.userMetrics.totalFocusHours += (elapsedSeconds / 3600);
    } else {
        appState.timer.secondsRemaining = Math.max(0, appState.timer.secondsRemaining - elapsedSeconds);
        appState.userMetrics.totalFocusHours += (elapsedSeconds / 3600);

        if (appState.timer.secondsRemaining === 0) {
            handleChronographSessionExpiration();
            return;
        }
    }

    synchronizeChronographDisplayView();
    
    if (appState.timer.secondsRemaining % 15 === 0) {
        syncDashboardMetricsEngine();
    }
}

function handleChronographSessionExpiration() {
    appState.timer.isRunning = false;
    clearInterval(internalTimerInterval);
    internalTimerInterval = null;

    if (ChronoDOM.btnToggle) {
        ChronoDOM.btnToggle.classList.remove("running");
        ChronoDOM.btnToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    const completedMode = appState.timer.mode;
    triggerWebAudioAlarm();
    
    dispatchSystemPushNotification(
        completedMode === "pomodoro" ? "Focus Sprint Resolved!" : "Rest Period Concluded!",
        completedMode === "pomodoro" ? "Excellent execution. Time to transition to an energy rest period." : "Your mind is restored. Time to re-engage workflow sprint tasks."
    );

    if (completedMode === "pomodoro") {
        appState.timer.sessionCount += 1;
        awardUserExperienceEngine(100);
        
        // Log task allocation count increment safely if a dynamic task binding exists
        if (appState.timer.currentTaskId) {
            const activeTask = appState.tasks.find(t => t.id === appState.timer.currentTaskId);
            if (activeTask) activeTask.completedPomodoros += 1;
        }

        appendHistoryLogDataChannel(25, 100, 0);
        
        if (appState.timer.sessionCount % 4 === 0) {
            setTimerExecutionMode("longBreak");
        } else {
            setTimerExecutionMode("shortBreak");
        }
    } else {
        setTimerExecutionMode("pomodoro");
    }

    saveStateToStorage();
    syncDashboardMetricsEngine();
}

function resetChronographSession() {
    if (appState.timer.isRunning) {
        toggleChronographRunningState();
    }
    setTimerExecutionMode(appState.timer.mode);
    showSystemToast("info", "Session metrics flushed to base markers.");
}

function executeManualSessionSkip() {
    if (appState.timer.mode === "stopwatch") {
        showSystemToast("warning", "Open stopwatch timelines cannot skip cycle segments.");
        return;
    }
    showSystemToast("info", "Session skipped by manual client command.");
    handleChronographSessionExpiration();
}

function synchronizeChronographDisplayView() {
    if (!ChronoDOM.digitalReadout) return;

    const totalSeconds = appState.timer.secondsRemaining;
    const computedMinutes = Math.floor(totalSeconds / 60);
    const computedSeconds = totalSeconds % 60;

    const textOutputString = `${String(computedMinutes).padStart(2, '0')}:${String(computedSeconds).padStart(2, '0')}`;
    ChronoDOM.digitalReadout.textContent = textOutputString;

    document.title = `(${textOutputString}) Productivity Dashboard`;

    if (ChronoDOM.chronoFill) {
        if (appState.timer.mode === "stopwatch") {
            const progressRatio = (totalSeconds % 60) / 60;
            ChronoDOM.chronoFill.style.strokeDashoffset = String(CHRONO_MAX_CIRCUMFERENCE * (1 - progressRatio));
        } else {
            const baseDurationSeconds = appState.timer.durationMinutes * 60;
            const progressRatio = baseDurationSeconds > 0 ? (totalSeconds / baseDurationSeconds) : 1;
            ChronoDOM.chronoFill.style.strokeDashoffset = String(CHRONO_MAX_CIRCUMFERENCE * (1 - progressRatio));
        }
    }
}

function updateSystemHeaderStatusIndicator() {
    if (!ChronoDOM.headerStatusNode || !ChronoDOM.headerStatusText) return;

    ChronoDOM.headerStatusNode.className = "focus-status";

    if (!appState.timer.isRunning) {
        ChronoDOM.headerStatusText.textContent = "System Idling";
        return;
    }

    switch (appState.timer.mode) {
        case "pomodoro":
            ChronoDOM.headerStatusNode.classList.add("focusing");
            ChronoDOM.headerStatusText.textContent = "Deep Flow Engaged";
            break;
        case "shortBreak":
        case "longBreak":
            ChronoDOM.headerStatusNode.classList.add("break");
            ChronoDOM.headerStatusText.textContent = "Rest Regeneration";
            break;
        case "stopwatch":
            ChronoDOM.headerStatusNode.classList.add("focusing");
            ChronoDOM.headerStatusText.textContent = "Free Tracking Flow";
            break;
    }
}

function bindTaskToTimerEngine(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.completed) {
        showSystemToast("warning", "Resolved tasks cannot receive active scheduling bindings.");
        return;
    }

    appState.timer.currentTaskId = taskId;
    
    const textTarget = document.getElementById("activeTaskContextDisplay");
    if (textTarget) {
        textTarget.textContent = `Target focus item: "${task.title}"`;
        textTarget.style.color = "var(--accent-indigo)";
    }

    showSystemToast("success", "Task target compiled securely into timing matrix buffers.");
    saveStateToStorage();
}

// ==========================================================================
// 6. WEB AUDIO API SYNTHESIZER ENGINE
// ==========================================================================

function triggerWebAudioAlarm() {
    if (!appState.uiPreferences.soundEnabled) return;

    try {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) return;

        const ctx = new AudioContextConstructor();
        const pitchArray = [523.25, 659.25, 783.99, 1046.50]; 
        const rhythmTimeDuration = 0.12;

        pitchArray.forEach((freq, idx) => {
            const oscillator = ctx.createOscillator();
            const volumeGainNode = ctx.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = freq;

            oscillator.connect(volumeGainNode);
            volumeGainNode.connect(ctx.destination);

            const executionStartTime = ctx.currentTime + (idx * rhythmTimeDuration);
            
            volumeGainNode.gain.setValueAtTime(0.2, executionStartTime);
            volumeGainNode.gain.exponentialRampToValueAtTime(0.0001, executionStartTime + 0.3);

            oscillator.start(executionStartTime);
            oscillator.stop(executionStartTime + 0.35);
        });

    } catch (audioSystemFailure) {
        console.error("Audio Engine: Browser sandbox restrictions blocked tone synthesis initialization.", audioSystemFailure);
    }
}

// ==========================================================================
// 7. WEB PUSH NOTIFICATION DESKTOP CHANNELS
// ==========================================================================

function requestNotificationChannelsPermission() {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "default") {
        Notification.requestPermission().then(userDecision => {
            if (userDecision === "granted") {
                showSystemToast("success", "System push permissions authorized successfully.");
            }
        });
    }
}

function dispatchSystemPushNotification(titleBanner, contentBody) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    try {
        const structuralNotificationOptions = {
            body: contentBody,
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E",
            silent: true 
        };
        new Notification(titleBanner, structuralNotificationOptions);
    } catch (pushChannelError) {
        console.warn("Notification Engine: Dynamic background thread push event initialization failed.", pushChannelError);
    }
}

function appendHistoryLogDataChannel(minutes, xp, itemsCount) {
    const systemDateKey = new Date().toISOString().split('T')[0];
    let logRecord = appState.historyLogs.find(log => log.date === systemDateKey);

    if (logRecord) {
        logRecord.focusMinutes += minutes;
        logRecord.xpEarned += xp;
        logRecord.completedCount += itemsCount;
    } else {
        appState.historyLogs.push({
            date: systemDateKey,
            focusMinutes: minutes,
            xpEarned: xp,
            completedCount: itemsCount
        });
    }
    
    if (appState.historyLogs.length > 7) {
        appState.historyLogs.shift();
    }
}

// ==========================================================================
// 8. MODAL MODERATION ENGINE & TOAST TELEPORTER
// ==========================================================================

const ModalDOM = {
    overlay: document.getElementById("modalOverlay") || document.querySelector(".modal-overlay"),
    closeTriggers: document.querySelectorAll(".modal-close-trigger"),
    settingsBtn: document.getElementById("settingsBtn") || document.querySelector(".icon-button:has(.fa-gear)"),
    bgInputUrl: document.getElementById("bgUrlInput"),
    bgInputFile: document.getElementById("bgFileInput"),
    bgThumbnails: document.querySelectorAll(".bg-thumbnail-node"),
    soundToggle: document.getElementById("soundToggle") || document.querySelector(".toggle-switch-input")
};

function initializeModalAndSystemPortals() {
    ModalDOM.closeTriggers.forEach(btn => {
        btn.addEventListener("click", () => closeActiveSystemModal());
    });

    if (ModalDOM.overlay) {
        ModalDOM.overlay.addEventListener("click", (e) => {
            if (e.target === ModalDOM.overlay) closeActiveSystemModal();
        });
    }

    if (ModalDOM.settingsBtn) {
        ModalDOM.settingsBtn.addEventListener("click", () => {
            openSystemModalWindow();
        });
    }

    const btnApplyUrl = document.getElementById("applyBgUrlBtn");
    if (btnApplyUrl && ModalDOM.bgInputUrl) {
        btnApplyUrl.addEventListener("click", () => {
            const success = BackgroundEngine.setCustomUrlWallpaper(ModalDOM.bgInputUrl.value);
            if (success) ModalDOM.bgInputUrl.value = "";
        });
    }

    if (ModalDOM.bgInputFile) {
        ModalDOM.bgInputFile.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                BackgroundEngine.processFileUploadWallpaper(e.target.files[0]);
            }
        });
    }

    ModalDOM.bgThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener("click", () => {
            ModalDOM.bgThumbnails.forEach(t => t.classList.remove("active"));
            thumbnail.classList.add("active");
            
            const targetSrc = thumbnail.getAttribute("data-source");
            if (targetSrc) {
                appState.wallpaper.type = "custom-url";
                appState.wallpaper.source = targetSrc;
                saveStateToStorage();
                BackgroundEngine.applyWallpaperSettings();
                showSystemToast("success", "Workspace canvas background updated.");
            }
        });
    });

    if (ModalDOM.soundToggle) {
        ModalDOM.soundToggle.checked = appState.uiPreferences.soundEnabled;
        ModalDOM.soundToggle.addEventListener("change", (e) => {
            appState.uiPreferences.soundEnabled = e.target.checked;
            saveStateToStorage();
            showSystemToast("info", e.target.checked ? "Audio sound alerts enabled." : "System alarms muted.");
        });
    }
}

function openSystemModalWindow() {
    if (ModalDOM.overlay) {
        ModalDOM.overlay.classList.remove("hidden");
        const trackingNode = document.getElementById("activeModal");
        if (trackingNode) trackingNode.value = "settings";
    }
}

function closeActiveSystemModal() {
    if (ModalDOM.overlay) {
        ModalDOM.overlay.classList.add("hidden");
        const trackingNode = document.getElementById("activeModal");
        if (trackingNode) trackingNode.value = "";
    }
}

function showSystemToast(type, message) {
    let mappedId = `${type}Toast`;
    if (type === "premium") mappedId = "infoToast"; 
    
    const targetToast = document.getElementById(mappedId) || document.querySelector(`.toast.${type}`);
    if (!targetToast) {
        console.log(`[Notification Fallback - ${type.toUpperCase()}]: ${message}`);
        return;
    }

    const textSpan = targetToast.querySelector(".toast-message") || targetToast.querySelector("span");
    if (textSpan) textSpan.textContent = message;

    targetToast.classList.remove("hidden");
    
    setTimeout(() => {
        targetToast.classList.add("hidden");
    }, 4500);
}

// ==========================================================================
// 9. NATIVE STRUCTURAL BAR CHART ANALYTICS CANVAS GENERATOR
// ==========================================================================

function renderWeeklyAnalyticsChartCanvas() {
    const chartWrapper = document.getElementById("weeklyChartMatrix") || document.querySelector(".css-chart-matrix");
    if (!chartWrapper) return;

    chartWrapper.innerHTML = "";
    const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const computedDaysDataset = [];
    const rightNow = new Date();
    
    let currentDayIndex = rightNow.getDay() - 1;
    if (currentDayIndex === -1) currentDayIndex = 6; 

    for (let i = 0; i < 7; i++) {
        const structuralOffset = i - currentDayIndex;
        const targetDate = new Date(rightNow);
        targetDate.setDate(rightNow.getDate() + structuralOffset);
        
        const dateIsoString = targetDate.toISOString().split('T')[0];
        const foundLog = appState.historyLogs.find(log => log.date === dateIsoString);
        
        computedDaysDataset.push({
            label: weekdayLabels[i],
            focusMinutes: foundLog ? foundLog.focusMinutes : 0,
            xpEarned: foundLog ? foundLog.xpEarned : 0
        });
    }

    const absolutePeakMinutes = Math.max(...computedDaysDataset.map(d => d.focusMinutes), 60);

    computedDaysDataset.forEach(dayRecord => {
        const columnShell = document.createElement("div");
        columnShell.className = "css-chart-column";

        const computedHeightPercentage = Math.min(100, (dayRecord.focusMinutes / absolutePeakMinutes) * 100);

        columnShell.innerHTML = `
            <div class="css-chart-pillar" style="height: 0%;" title="${dayRecord.focusMinutes} Focus Mins">
                <span class="css-chart-pillar-value">${Math.round(dayRecord.focusMinutes)}m</span>
            </div>
            <span class="css-chart-label">${dayRecord.label}</span>
        `;

        chartWrapper.appendChild(columnShell);

        requestAnimationFrame(() => {
            const pillarNode = columnShell.querySelector(".css-chart-pillar");
            if (pillarNode) {
                pillarNode.style.height = `${computedHeightPercentage}%`;
            }
        });
    });
}

// ==========================================================================
// 10. GAMIFIED USER EXPERIENCE PROGRESSION ENGINE
// ==========================================================================

function awardUserExperienceEngine(totalPointsEarned) {
    if (!appState.userMetrics) return;

    appState.userMetrics.totalXp = Math.max(0, appState.userMetrics.totalXp + totalPointsEarned);
    let trackingLoopActive = true;
    
    while (trackingLoopActive) {
        let currentTargetCeiling = appState.userMetrics.level * 200;
        
        if (appState.userMetrics.totalXp >= currentTargetCeiling) {
            appState.userMetrics.level += 1;
            showSystemToast("premium", `RANK ELEVATED! Welcome to Level Tier ${appState.userMetrics.level}.`);
        } else {
            trackingLoopActive = false;
        }
    }

    const structuralFloor = (appState.userMetrics.level - 1) * 200;
    const currentTargetCeiling = appState.userMetrics.level * 200;
    
    appState.userMetrics.xpProgressToNextLevel = appState.userMetrics.totalXp - structuralFloor;
    appState.userMetrics.xpRequiredForNextLevel = currentTargetCeiling - structuralFloor;

    saveStateToStorage();
    syncDashboardMetricsEngine();
}

function syncDashboardMetricsEngine() {
    if (!appState.userMetrics) return;
    const metrics = appState.userMetrics;

    const levelDisplayNode = document.querySelector(".level-panel strong") || document.getElementById("headerLevelText");
    if (levelDisplayNode) levelDisplayNode.textContent = `Lvl ${metrics.level}`;

    const xpSubTextDisplayNode = document.querySelector(".xp-panel strong") || document.getElementById("headerXpText");
    if (xpSubTextDisplayNode) xpSubTextDisplayNode.textContent = `${metrics.totalXp} XP`;

    const cardBurnedCount = document.querySelector("#burnedTasksCard .metric-value") || document.getElementById("burnedTasksCount");
    if (cardBurnedCount) cardBurnedCount.textContent = metrics.totalTasksBurned;

    const cardTotalXp = document.querySelector("#xpMetricCard .metric-value") || document.getElementById("globalXpCount");
    if (cardTotalXp) cardTotalXp.textContent = metrics.totalXp;

    const cardFocusHours = document.querySelector("#focusHoursCard .metric-value") || document.getElementById("focusHoursCount");
    if (cardFocusHours) cardFocusHours.textContent = metrics.totalFocusHours.toFixed(2);

    const cardWeeklyRate = document.querySelector("#weeklyCompletionCard .metric-value") || document.getElementById("weeklyCompletionRate");
    if (cardWeeklyRate) {
        const finishedCount = appState.tasks.filter(t => t.completed).length;
        const aggregateCount = appState.tasks.length;
        const scalingRatio = aggregateCount > 0 ? Math.round((finishedCount / aggregateCount) * 100) : 0;
        cardWeeklyRate.textContent = `${scalingRatio}%`;
    }

    renderWeeklyAnalyticsChartCanvas();
}

// ==========================================================================
// 11. UNIFIED BOOT & EVENT LOOP INITIALIZER
// ==========================================================================

function bootWorkspaceApplicationEngine() {
    console.log("Workspace Bootstrapper: Initiating high-fidelity environment initialization script loops...");

    loadStateFromStorage();
    BackgroundEngine.initialize();
    initializeTaskManager();
    initializeChronographEngine();
    initializeModalAndSystemPortals();
    syncDashboardMetricsEngine();

    const elementPageLoader = document.getElementById("pageLoader") || document.querySelector(".page-loader");
    if (elementPageLoader) {
        elementPageLoader.style.opacity = "0";
        elementPageLoader.style.transition = "opacity 0.4s ease-out, visibility 0.4s ease-out";
        setTimeout(() => {
            elementPageLoader.classList.add("hidden");
            elementPageLoader.style.display = "none";
            showSystemToast("success", "Premium Workspace initialized safely.");
        }, 400);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootWorkspaceApplicationEngine);
} else {
    bootWorkspaceApplicationEngine();
}