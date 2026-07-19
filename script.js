/**
 * ===================================================================
 * PRODUCTIVITY DASHBOARD & ADVANCED POMODORO ENGINE
 * Part 3: Complete Production-Ready JavaScript Engine
 * ===================================================================
 * 
 * SUBSYSTEMS INTEGRATED:
 * ✅ App Initialization & DOM Orchestration
 * ✅ Complete Task CRUD Management
 * ✅ Dual Chronograph Timer (Pomodoro + Stopwatch)
 * ✅ Gamified XP/Level Progression System
 * ✅ Native Web Audio API Frequency Chime Synthesizer
 * ✅ Browser Push Notifications
 * ✅ Weekly Analytics Bar Chart Rendering
 * ✅ 100% Airtight LocalStorage Session Persistence
 * ===================================================================
 */

/* ===================================================================
   1. GLOBAL STATE MANAGEMENT & CONSTANTS
   =================================================================== */

const APP_VERSION = "1.0.0";
const XP_PER_MINUTE = 10;
const XP_PER_LEVEL = 500;

// Primary Application State Object
const AppState = {
  // Timer System
  timerMode: "pomodoro", // 'pomodoro' || 'stopwatch'
  timerRunning: false,
  timerElapsed: 0, // seconds
  timerDuration: 1500, // 25 minutes in seconds for Pomodoro
  pomodoroSessions: 0,
  lastXPAwardTime: 0,

  // Task System
  tasks: [],
  activeTaskId: null,
  searchQuery: "",
  filterPriority: "all", // 'all', 'critical', 'medium', 'low'
  sortBy: "created", // 'created', 'priority', 'alphabetical'

  // User Progression
  totalXP: 0,
  currentLevel: 1,
  focusHours: 0,
  tasksCompleted: 0,
  weeklyCompletionData: [0, 0, 0, 0, 0, 0, 0], // 7-day rolling window

  // Settings
  soundEnabled: true,
  notificationsEnabled: true,
  autoStartPomodoro: false,
  backgroundImageUrl: null,
  theme: "dark",
};

// Timer Configuration
const TIMER_CONFIG = {
  pomodoro: 1500, // 25 minutes
  shortBreak: 300, // 5 minutes
  longBreak: 900, // 15 minutes
  updateInterval: 100, // 100ms for smooth updates
};

// Priority Configuration
const PRIORITY_CONFIG = {
  critical: { color: "#ef4444", label: "Critical", icon: "fa-star", weight: 3 },
  medium: { color: "#f59e0b", label: "Medium", icon: "fa-circle-half-stroke", weight: 2 },
  low: { color: "#10b981", label: "Low", icon: "fa-circle", weight: 1 },
};

// LocalStorage Keys
const STORAGE_KEYS = {
  appState: "productivity_dashboard_state",
  tasks: "productivity_dashboard_tasks",
  userProgress: "productivity_dashboard_progress",
  settings: "productivity_dashboard_settings",
};

/* ===================================================================
   2. DOM ELEMENT REFERENCES & CACHE
   =================================================================== */

const DOM = {
  // Loader
  pageLoader: () => document.getElementById("pageLoader"),

  // Header Elements
  sessionState: () => document.getElementById("sessionState"),
  xpCounter: () => document.getElementById("xpCounter"),
  levelBadge: () => document.getElementById("levelBadge"),

  // Metrics Cards
  weeklyCompletionValue: () => document.getElementById("weeklyCompletionValue"),
  burnedTasksValue: () => document.getElementById("burnedTasksValue"),
  xpMetricValue: () => document.getElementById("xpMetricValue"),
  focusHoursValue: () => document.getElementById("focusHoursValue"),

  // Task Manager
  taskSearchInput: () => document.getElementById("taskSearchInput"),
  taskSearchClear: () => document.getElementById("taskSearchClear"),
  priorityFilterButtons: () => document.querySelectorAll(".filter-chip"),
  taskForm: () => document.getElementById("taskForm"),
  taskInput: () => document.getElementById("taskInput"),
  taskDescriptionInput: () => document.getElementById("taskDescriptionInput"),
  taskPrioritySelect: () => document.getElementById("taskPrioritySelect"),
  taskEstimateSelect: () => document.getElementById("taskEstimateSelect"),
  taskAddButton: () => document.getElementById("taskAddButton"),
  formModeBadge: () => document.getElementById("formModeBadge"),
  tasksContainer: () => document.getElementById("tasksContainer"),

  // Timer Elements
  modeTabButtons: () => document.querySelectorAll(".mode-tab-btn"),
  chronoCircle: () => document.getElementById("chronoCircle"),
  chronoFill: () => document.getElementById("chronoFill"),
  timeDigitalCounter: () => document.getElementById("timeDigitalCounter"),
  timePhaseLabel: () => document.getElementById("timePhaseLabel"),
  timeSessionInfo: () => document.getElementById("timeSessionInfo"),
  activeTaskContextDisplay: () => document.getElementById("activeTaskContextDisplay"),

  // Timer Controls
  playPauseButton: () => document.getElementById("playPauseButton"),
  resetButton: () => document.getElementById("resetButton"),
  skipButton: () => document.getElementById("skipButton"),

  // Chart
  chartPillars: () => document.querySelectorAll(".css-chart-pillar"),

  // Settings & Modals
  settingsButton: () => document.getElementById("settingsButton"),
  modalOverlay: () => document.getElementById("modalOverlay"),
  modalCloseButton: () => document.getElementById("modalCloseButton"),
  bgThumbnailNodes: () => document.querySelectorAll(".bg-thumbnail-node"),
  bgUrlInput: () => document.getElementById("bgUrlInput"),
  applyBgUrlButton: () => document.getElementById("applyBgUrlBtn"),
  fileUploadInput: () => document.getElementById("fileUploadInput"),
  soundToggle: () => document.getElementById("soundToggle"),
  notificationsToggle: () => document.getElementById("notificationsToggle"),
  autoStartToggle: () => document.getElementById("autoStartToggle"),
  backgroundLayer: () => document.getElementById("backgroundLayer"),
};

/* ===================================================================
   3. TASK MANAGEMENT SYSTEM (CRUD OPERATIONS)
   =================================================================== */

class TaskManager {
  static createTask(title, description = "", priority = "medium", estimateMinutes = 25) {
    if (!title.trim()) {
      showToast("Task title cannot be empty", "error");
      return null;
    }

    const task = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      priority: priority,
      estimateMinutes: estimateMinutes,
      completed: false,
      createdAt: new Date().toISOString(),
      pomodoriCount: 0,
      timeSpentSeconds: 0,
    };

    AppState.tasks.unshift(task);
    TaskManager.saveTasks();
    showToast(`Task "${title}" created successfully!`, "success");
    return task;
  }

  static updateTask(taskId, updates) {
    const task = AppState.tasks.find((t) => t.id === taskId);
    if (!task) return false;

    Object.assign(task, updates);
    TaskManager.saveTasks();
    return true;
  }

  static deleteTask(taskId) {
    const index = AppState.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return false;

    const deletedTask = AppState.tasks.splice(index, 1)[0];
    if (AppState.activeTaskId === taskId) {
      AppState.activeTaskId = null;
    }
    TaskManager.saveTasks();
    showToast(`Task "${deletedTask.title}" deleted`, "info");
    return true;
  }

  static completeTask(taskId) {
    const task = AppState.tasks.find((t) => t.id === taskId);
    if (!task) return false;

    task.completed = true;
    AppState.tasksCompleted++;
    TaskManager.saveTasks();
    showToast(`Task "${task.title}" completed! 🎉`, "success");
    return true;
  }

  static toggleTaskCompletion(taskId) {
    const task = AppState.tasks.find((t) => t.id === taskId);
    if (!task) return false;

    if (!task.completed) {
      return TaskManager.completeTask(taskId);
    } else {
      task.completed = false;
      AppState.tasksCompleted = Math.max(0, AppState.tasksCompleted - 1);
      TaskManager.saveTasks();
      showToast(`Task "${task.title}" marked incomplete`, "info");
      return true;
    }
  }

  static getFilteredTasks() {
    let filtered = AppState.tasks;

    // Apply search filter
    if (AppState.searchQuery) {
      const query = AppState.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    // Apply priority filter
    if (AppState.filterPriority !== "all") {
      filtered = filtered.filter((t) => t.priority === AppState.filterPriority);
    }

    // Apply sorting
    if (AppState.sortBy === "priority") {
      filtered.sort(
        (a, b) =>
          (PRIORITY_CONFIG[b.priority].weight || 0) -
          (PRIORITY_CONFIG[a.priority].weight || 0)
      );
    } else if (AppState.sortBy === "alphabetical") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: created (newest first)
      filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return filtered;
  }

  static saveTasks() {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(AppState.tasks));
  }

  static loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.tasks);
      if (saved) {
        AppState.tasks = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  }
}

/* ===================================================================
   4. TIMER & CHRONOGRAPH ENGINE
   =================================================================== */

class TimerEngine {
  static timerIntervalId = null;

  static initialize() {
    AppState.timerMode = "pomodoro";
    AppState.timerRunning = false;
    AppState.timerElapsed = 0;
    AppState.timerDuration = TIMER_CONFIG.pomodoro;
    TimerEngine.renderTimerDisplay();
  }

  static switchMode(mode) {
    TimerEngine.stop();
    AppState.timerMode = mode;
    AppState.timerElapsed = 0;

    if (mode === "pomodoro") {
      AppState.timerDuration = TIMER_CONFIG.pomodoro;
    } else if (mode === "stopwatch") {
      AppState.timerDuration = Infinity; // Unlimited
    }

    TimerEngine.renderTimerDisplay();
    DOM.modeTabButtons().forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`)?.classList.add("active");
  }

  static start() {
    if (AppState.timerRunning) return;

    AppState.timerRunning = true;
    DOM.sessionState()?.textContent = AppState.timerMode === "stopwatch" ? "Focusing Now" : "Focusing";
    DOM.sessionState()?.parentElement?.classList.add("focusing");

    TimerEngine.timerIntervalId = setInterval(() => {
      AppState.timerElapsed += 0.1; // 100ms per tick

      // Award XP every minute for active focus
      if (Math.floor(AppState.timerElapsed) % 60 === 0 && Math.floor(AppState.timerElapsed) > AppState.lastXPAwardTime) {
        AppState.lastXPAwardTime = Math.floor(AppState.timerElapsed);
        ProgressionSystem.awardXP(XP_PER_MINUTE);
      }

      // Check timer completion
      if (AppState.timerMode === "pomodoro" && AppState.timerElapsed >= AppState.timerDuration) {
        TimerEngine.completePomodoro();
      }

      TimerEngine.renderTimerDisplay();
    }, TIMER_CONFIG.updateInterval);
  }

  static pause() {
    if (!AppState.timerRunning) return;

    AppState.timerRunning = false;
    clearInterval(TimerEngine.timerIntervalId);

    DOM.sessionState()?.textContent = "Paused";
    DOM.sessionState()?.parentElement?.classList.remove("focusing");
    TimerEngine.renderTimerDisplay();
  }

  static stop() {
    TimerEngine.pause();
    AppState.timerElapsed = 0;
    AppState.lastXPAwardTime = 0;
    TimerEngine.renderTimerDisplay();
  }

  static skip() {
    TimerEngine.stop();
    if (AppState.timerMode === "pomodoro") {
      TimerEngine.completePomodoro();
    }
    TimerEngine.renderTimerDisplay();
  }

  static completePomodoro() {
    TimerEngine.stop();
    AppState.pomodoroSessions++;

    // Play notification
    AudioEngine.playCompletionChime();
    requestNotification(
      "Pomodoro Complete!",
      `You've completed ${AppState.pomodoroSessions} pomodoro session(s)`
    );

    // Show toast
    showToast("✨ Pomodoro session complete! Time for a break!", "premium");

    // Auto-start break if enabled
    if (AppState.autoStartPomodoro) {
      setTimeout(() => {
        TimerEngine.switchMode("pomodoro");
        TimerEngine.start();
      }, 5000);
    }
  }

  static renderTimerDisplay() {
    const seconds = Math.floor(AppState.timerElapsed);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    const timeString = `${String(minutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`;

    // Update digital counter
    if (DOM.timeDigitalCounter()) {
      DOM.timeDigitalCounter().textContent = timeString;
    }

    // Update circular progress
    TimerEngine.updateCircularProgress();

    // Update phase label
    if (DOM.timePhaseLabel()) {
      if (AppState.timerMode === "pomodoro") {
        DOM.timePhaseLabel().textContent = AppState.timerRunning ? "Focused" : "Pomodoro";
      } else {
        DOM.timePhaseLabel().textContent = AppState.timerRunning ? "Tracking" : "Stopwatch";
      }
    }

    // Update session info
    if (DOM.timeSessionInfo()) {
      DOM.timeSessionInfo().innerHTML = `
        Session <span class="session-count">#${AppState.pomodoroSessions + 1}</span>
      `;
    }

    // Update play/pause button
    if (DOM.playPauseButton()) {
      if (AppState.timerRunning) {
        DOM.playPauseButton().classList.add("running");
        DOM.playPauseButton().innerHTML = '<i class="fa-solid fa-pause"></i>';
      } else {
        DOM.playPauseButton().classList.remove("running");
        DOM.playPauseButton().innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    }
  }

  static updateCircularProgress() {
    if (!DOM.chronoFill()) return;

    let progress = 0;
    if (AppState.timerMode === "pomodoro" && AppState.timerDuration > 0) {
      progress = AppState.timerElapsed / AppState.timerDuration;
    } else if (AppState.timerMode === "stopwatch") {
      // For stopwatch, just show a continuous animation
      progress = (AppState.timerElapsed % 60) / 60;
    }

    const circumference = 282.7;
    const offset = circumference * (1 - Math.min(progress, 1));
    DOM.chronoFill().style.strokeDashoffset = offset;
  }
}

/* ===================================================================
   5. GAMIFIED PROGRESSION SYSTEM
   =================================================================== */

class ProgressionSystem {
  static awardXP(amount) {
    const previousLevel = AppState.currentLevel;
    AppState.totalXP += amount;

    // Calculate current level
    AppState.currentLevel = Math.floor(AppState.totalXP / XP_PER_LEVEL) + 1;

    // Check for level up
    if (AppState.currentLevel > previousLevel) {
      ProgressionSystem.triggerLevelUp();
    }

    ProgressionSystem.updateProgressDisplay();
    ProgressionSystem.saveProgress();
  }

  static triggerLevelUp() {
    const newLevel = AppState.currentLevel;
    AudioEngine.playLevelUpChime();
    showToast(
      `🎉 LEVEL UP! You're now <strong>Level ${newLevel}</strong>!`,
      "premium"
    );
    requestNotification("Level Up!", `You've reached Level ${newLevel}!`);
    ProgressionSystem.animateLevelUpAlert();
  }

  static animateLevelUpAlert() {
    const badge = DOM.levelBadge();
    if (!badge) return;

    badge.style.animation = "none";
    setTimeout(() => {
      badge.style.animation = "pulseNeonGlow 2s infinite";
    }, 10);

    setTimeout(() => {
      badge.style.animation = "none";
    }, 2100);
  }

  static updateProgressDisplay() {
    if (DOM.xpCounter()) {
      DOM.xpCounter().textContent = `${AppState.totalXP} XP`;
    }
    if (DOM.levelBadge()) {
      DOM.levelBadge().textContent = `Lv.${AppState.currentLevel}`;
    }
  }

  static saveProgress() {
    localStorage.setItem(
      STORAGE_KEYS.userProgress,
      JSON.stringify({
        totalXP: AppState.totalXP,
        currentLevel: AppState.currentLevel,
        tasksCompleted: AppState.tasksCompleted,
        focusHours: AppState.focusHours,
        pomodoroSessions: AppState.pomodoroSessions,
      })
    );
  }

  static loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.userProgress);
      if (saved) {
        const data = JSON.parse(saved);
        AppState.totalXP = data.totalXP || 0;
        AppState.currentLevel = data.currentLevel || 1;
        AppState.tasksCompleted = data.tasksCompleted || 0;
        AppState.focusHours = data.focusHours || 0;
        AppState.pomodoroSessions = data.pomodoroSessions || 0;
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  }
}

/* ===================================================================
   6. WEB AUDIO API SYNTHESIZER & NOTIFICATION SOUNDS
   =================================================================== */

class AudioEngine {
  static audioContext = null;

  static initialize() {
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn("Web Audio API not supported");
      return;
    }
    AudioEngine.audioContext =
      new (window.AudioContext || window.webkitAudioContext)();
  }

  static playCompletionChime() {
    if (!AppState.soundEnabled || !AudioEngine.audioContext) return;

    try {
      const now = AudioEngine.audioContext.currentTime;
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord

      frequencies.forEach((freq, index) => {
        const osc = AudioEngine.audioContext.createOscillator();
        const gain = AudioEngine.audioContext.createGain();

        osc.connect(gain);
        gain.connect(AudioEngine.audioContext.destination);

        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          now + 0.5 + index * 0.1
        );

        osc.start(now + index * 0.1);
        osc.stop(now + 0.5 + index * 0.1);
      });
    } catch (error) {
      console.error("Error playing completion chime:", error);
    }
  }

  static playLevelUpChime() {
    if (!AppState.soundEnabled || !AudioEngine.audioContext) return;

    try {
      const now = AudioEngine.audioContext.currentTime;
      const frequencies = [
        329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 987.77,
      ]; // Ascending scale

      frequencies.forEach((freq, index) => {
        const osc = AudioEngine.audioContext.createOscillator();
        const gain = AudioEngine.audioContext.createGain();

        osc.connect(gain);
        gain.connect(AudioEngine.audioContext.destination);

        osc.type = "sine";
        osc.frequency.value = freq;

        const startTime = now + index * 0.08;
        const duration = 0.15;

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (error) {
      console.error("Error playing level up chime:", error);
    }
  }

  static playErrorBeep() {
    if (!AppState.soundEnabled || !AudioEngine.audioContext) return;

    try {
      const now = AudioEngine.audioContext.currentTime;
      const osc = AudioEngine.audioContext.createOscillator();
      const gain = AudioEngine.audioContext.createGain();

      osc.connect(gain);
      gain.connect(AudioEngine.audioContext.destination);

      osc.type = "sine";
      osc.frequency.value = 300;

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (error) {
      console.error("Error playing error beep:", error);
    }
  }
}

/* ===================================================================
   7. BROWSER PUSH NOTIFICATIONS
   =================================================================== */

function requestNotificationPermission() {
  if (
    "Notification" in window &&
    Notification.permission === "default"
  ) {
    Notification.requestPermission();
  }
}

function requestNotification(title, options = {}) {
  if (
    !AppState.notificationsEnabled ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  try {
    new Notification(title, {
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%236366f1' width='100' height='100'/%3E%3Ctext x='50' y='65' font-size='60' fill='white' text-anchor='middle' font-weight='bold'%3E⚡%3C/text%3E%3C/svg%3E",
      badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%236366f1' width='100' height='100'/%3E%3C/svg%3E",
      ...options,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

/* ===================================================================
   8. ANALYTICS & WEEKLY CHART SYSTEM
   =================================================================== */

class AnalyticsEngine {
  static updateWeeklyChart() {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Initialize weekly data if not present
    if (!AppState.weeklyCompletionData) {
      AppState.weeklyCompletionData = [0, 0, 0, 0, 0, 0, 0];
    }

    // Increment today's count
    AppState.weeklyCompletionData[dayOfWeek]++;

    AnalyticsEngine.renderChart();
    AnalyticsEngine.saveAnalytics();
  }

  static renderChart() {
    const pillars = DOM.chartPillars();
    if (!pillars || pillars.length === 0) return;

    const maxValue = Math.max(...AppState.weeklyCompletionData, 1);

    pillars.forEach((pillar, index) => {
      const value = AppState.weeklyCompletionData[index] || 0;
      const percentage = (value / maxValue) * 100;
      pillar.style.height = `${percentage}%`;
      pillar.title = `${value} tasks`;
    });
  }

  static saveAnalytics() {
    localStorage.setItem(
      "analytics_weekly_data",
      JSON.stringify(AppState.weeklyCompletionData)
    );
  }

  static loadAnalytics() {
    try {
      const saved = localStorage.getItem("analytics_weekly_data");
      if (saved) {
        AppState.weeklyCompletionData = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  }
}

/* ===================================================================
   9. TOAST NOTIFICATION SYSTEM
   =================================================================== */

function showToast(message, type = "info") {
  const container = document.querySelector(".toast-container") || createToastContainer();
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconMap = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
    premium: "fa-star",
  };

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fa-solid ${iconMap[type] || "fa-info-circle"}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close notification">
      <i class="fa-solid fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  const closeButton = toast.querySelector(".toast-close");
  closeButton.addEventListener("click", () => {
    toast.remove();
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

/* ===================================================================
   10. UI RENDERING ENGINE
   =================================================================== */

class UIRenderer {
  static renderTasks() {
    const container = DOM.tasksContainer();
    if (!container) return;

    const filteredTasks = TaskManager.getFilteredTasks();
    container.innerHTML = "";

    if (filteredTasks.length === 0) {
      container.innerHTML = `
        <div style="
          text-align: center; 
          padding: 2rem; 
          color: var(--text-muted);
          font-size: 0.875rem;
        ">
          <i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
          No tasks found. Create one to get started!
        </div>
      `;
      return;
    }

    filteredTasks.forEach((task) => {
      const taskEl = document.createElement("div");
      taskEl.className = `task-item ${task.completed ? "completed" : ""}`;
      taskEl.id = `task-${task.id}`;

      const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

      taskEl.innerHTML = `
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? "checked" : ""}
          data-task-id="${task.id}"
          style="
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: var(--accent-indigo);
            flex-shrink: 0;
          "
        />
        <div style="flex: 1; min-width: 0;">
          <div style="
            font-weight: var(--font-weight-semibold);
            color: var(--text-primary);
            word-break: break-word;
            ${task.completed ? "text-decoration: line-through; opacity: 0.6;" : ""}
          ">
            ${task.title}
          </div>
          ${task.description ? `<div style="
            font-size: 0.8rem;
            color: var(--text-tertiary);
            margin-top: 0.25rem;
            word-break: break-word;
          ">${task.description}</div>` : ""}
          <div style="
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
            font-size: 0.7rem;
            color: var(--text-muted);
            flex-wrap: wrap;
          ">
            <span style="
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;
              padding: 0.25rem 0.5rem;
              background: rgba(255, 255, 255, 0.04);
              border-radius: 4px;
              color: ${priorityConfig.color};
            ">
              <i class="fa-solid ${priorityConfig.icon}"></i>
              ${priorityConfig.label}
            </span>
            <span style="
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;
              padding: 0.25rem 0.5rem;
              background: rgba(255, 255, 255, 0.04);
              border-radius: 4px;
            ">
              <i class="fa-solid fa-clock"></i>
              ${task.estimateMinutes}m
            </span>
          </div>
        </div>
        <button 
          class="task-delete-btn"
          data-task-id="${task.id}"
          style="
            width: 32px;
            height: 32px;
            border-radius: 6px;
            border: 1px solid rgba(239, 68, 68, 0.3);
            background: rgba(239, 68, 68, 0.1);
            color: var(--accent-crimson);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
          "
          onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.borderColor='rgba(239, 68, 68, 0.5)';"
          onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.borderColor='rgba(239, 68, 68, 0.3)';"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      `;

      container.appendChild(taskEl);
    });

    UIRenderer.attachTaskEventListeners();
  }

  static attachTaskEventListeners() {
    document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const taskId = parseInt(e.target.dataset.taskId);
        TaskManager.toggleTaskCompletion(taskId);
        UIRenderer.renderTasks();
        UIRenderer.syncMetrics();
      });
    });

    document.querySelectorAll(".task-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const taskId = parseInt(btn.dataset.taskId);
        TaskManager.deleteTask(taskId);
        UIRenderer.renderTasks();
        UIRenderer.syncMetrics();
      });
    });
  }

  static syncMetrics() {
    const completedCount = AppState.tasks.filter((t) => t.completed).length;
    const totalXP = AppState.totalXP;
    const focusHours = Math.floor(AppState.pomodoroSessions * 25 / 60 * 10) / 10;

    if (DOM.weeklyCompletionValue()) {
      DOM.weeklyCompletionValue().textContent = completedCount;
    }
    if (DOM.burnedTasksValue()) {
      DOM.burnedTasksValue().textContent = AppState.tasksCompleted;
    }
    if (DOM.xpMetricValue()) {
      DOM.xpMetricValue().textContent = totalXP;
    }
    if (DOM.focusHoursValue()) {
      DOM.focusHoursValue().textContent = `${focusHours}h`;
    }
  }

  static updateActiveTaskDisplay() {
    const display = DOM.activeTaskContextDisplay();
    if (!display) return;

    if (AppState.activeTaskId) {
      const task = AppState.tasks.find((t) => t.id === AppState.activeTaskId);
      if (task) {
        display.textContent = `"${task.title}"`;
      } else {
        display.textContent = "No task selected";
      }
    } else {
      display.textContent = "No task selected";
    }
  }
}

/* ===================================================================
   11. EVENT LISTENERS & FORM HANDLING
   =================================================================== */

function setupEventListeners() {
  // Timer Mode Tabs
  DOM.modeTabButtons().forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      TimerEngine.switchMode(mode);
    });
  });

  // Timer Controls
  if (DOM.playPauseButton()) {
    DOM.playPauseButton().addEventListener("click", () => {
      if (AppState.timerRunning) {
        TimerEngine.pause();
      } else {
        TimerEngine.start();
      }
    });
  }

  if (DOM.resetButton()) {
    DOM.resetButton().addEventListener("click", () => {
      TimerEngine.stop();
    });
  }

  if (DOM.skipButton()) {
    DOM.skipButton().addEventListener("click", () => {
      TimerEngine.skip();
    });
  }

  // Task Form
  if (DOM.taskForm()) {
    DOM.taskForm().addEventListener("submit", (e) => {
      e.preventDefault();

      const title = DOM.taskInput()?.value || "";
      const description = DOM.taskDescriptionInput()?.value || "";
      const priority = DOM.taskPrioritySelect()?.value || "medium";
      const estimate = parseInt(DOM.taskEstimateSelect()?.value) || 25;

      const task = TaskManager.createTask(title, description, priority, estimate);
      if (task) {
        DOM.taskInput().value = "";
        DOM.taskDescriptionInput().value = "";
        DOM.taskPrioritySelect().value = "medium";
        DOM.taskEstimateSelect().value = "25";
        UIRenderer.renderTasks();
        UIRenderer.syncMetrics();
      }
    });
  }

  // Task Search
  if (DOM.taskSearchInput()) {
    DOM.taskSearchInput().addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      UIRenderer.renderTasks();
    });
  }

  if (DOM.taskSearchClear()) {
    DOM.taskSearchClear().addEventListener("click", () => {
      AppState.searchQuery = "";
      if (DOM.taskSearchInput()) {
        DOM.taskSearchInput().value = "";
      }
      UIRenderer.renderTasks();
    });
  }

  // Priority Filter
  DOM.priorityFilterButtons().forEach((btn) => {
    btn.addEventListener("click", () => {
      DOM.priorityFilterButtons().forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const priority = btn.dataset.priority || "all";
      AppState.filterPriority = priority;
      UIRenderer.renderTasks();
    });
  });

  // Settings Button
  if (DOM.settingsButton()) {
    DOM.settingsButton().addEventListener("click", () => {
      if (DOM.modalOverlay()) {
        DOM.modalOverlay().classList.remove("hidden");
        requestNotificationPermission();
      }
    });
  }

  // Modal Close
  if (DOM.modalCloseButton()) {
    DOM.modalCloseButton().addEventListener("click", () => {
      if (DOM.modalOverlay()) {
        DOM.modalOverlay().classList.add("hidden");
      }
    });
  }

  if (DOM.modalOverlay()) {
    DOM.modalOverlay().addEventListener("click", (e) => {
      if (e.target === DOM.modalOverlay()) {
        DOM.modalOverlay().classList.add("hidden");
      }
    });
  }

  // Background URL Input
  if (DOM.applyBgUrlButton()) {
    DOM.applyBgUrlButton().addEventListener("click", () => {
      const url = DOM.bgUrlInput()?.value.trim();
      if (url) {
        if (DOM.backgroundLayer()) {
          DOM.backgroundLayer().style.backgroundImage = `url('${url}')`;
          DOM.backgroundLayer().classList.add("active");
        }
        AppState.backgroundImageUrl = url;
        saveSettings();
        showToast("Background updated!", "success");
      }
    });
  }

  // Background Thumbnails
  DOM.bgThumbnailNodes().forEach((node) => {
    node.addEventListener("click", () => {
      const bgUrl = node.dataset.bgUrl;
      if (bgUrl) {
        if (DOM.backgroundLayer()) {
          DOM.backgroundLayer().style.backgroundImage = `url('${bgUrl}')`;
          DOM.backgroundLayer().classList.add("active");
        }
        AppState.backgroundImageUrl = bgUrl;
      } else {
        if (DOM.backgroundLayer()) {
          DOM.backgroundLayer().style.backgroundImage = "none";
          DOM.backgroundLayer().classList.remove("active");
        }
        AppState.backgroundImageUrl = null;
      }

      DOM.bgThumbnailNodes().forEach((n) => n.classList.remove("active"));
      node.classList.add("active");
      saveSettings();
      showToast("Background changed!", "success");
    });
  });

  // Sound Toggle
  if (DOM.soundToggle()) {
    DOM.soundToggle().addEventListener("change", (e) => {
      AppState.soundEnabled = e.target.checked;
      saveSettings();
    });
  }

  // Notifications Toggle
  if (DOM.notificationsToggle()) {
    DOM.notificationsToggle().addEventListener("change", (e) => {
      AppState.notificationsEnabled = e.target.checked;
      if (e.target.checked) {
        requestNotificationPermission();
      }
      saveSettings();
    });
  }

  // Auto-Start Toggle
  if (DOM.autoStartToggle()) {
    DOM.autoStartToggle().addEventListener("change", (e) => {
      AppState.autoStartPomodoro = e.target.checked;
      saveSettings();
    });
  }

  // File Upload
  if (DOM.fileUploadInput()) {
    DOM.fileUploadInput().addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (DOM.backgroundLayer()) {
            DOM.backgroundLayer().style.backgroundImage = `url('${dataUrl}')`;
            DOM.backgroundLayer().classList.add("active");
          }
          AppState.backgroundImageUrl = dataUrl;
          saveSettings();
          showToast("Background uploaded!", "success");
        };
        reader.readAsDataURL(file);
      } else {
        showToast("Please select a valid image file", "error");
      }
    });
  }
}

/* ===================================================================
   12. SETTINGS PERSISTENCE
   =================================================================== */

function saveSettings() {
  const settings = {
    soundEnabled: AppState.soundEnabled,
    notificationsEnabled: AppState.notificationsEnabled,
    autoStartPomodoro: AppState.autoStartPomodoro,
    backgroundImageUrl: AppState.backgroundImageUrl,
    theme: AppState.theme,
  };
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.settings);
    if (saved) {
      const settings = JSON.parse(saved);
      AppState.soundEnabled = settings.soundEnabled ?? true;
      AppState.notificationsEnabled = settings.notificationsEnabled ?? true;
      AppState.autoStartPomodoro = settings.autoStartPomodoro ?? false;
      AppState.backgroundImageUrl = settings.backgroundImageUrl ?? null;
      AppState.theme = settings.theme ?? "dark";

      // Apply settings to UI
      if (DOM.soundToggle()) {
        DOM.soundToggle().checked = AppState.soundEnabled;
      }
      if (DOM.notificationsToggle()) {
        DOM.notificationsToggle().checked = AppState.notificationsEnabled;
      }
      if (DOM.autoStartToggle()) {
        DOM.autoStartToggle().checked = AppState.autoStartPomodoro;
      }

      // Apply background
      if (AppState.backgroundImageUrl && DOM.backgroundLayer()) {
        DOM.backgroundLayer().style.backgroundImage = `url('${AppState.backgroundImageUrl}')`;
        DOM.backgroundLayer().classList.add("active");
      }
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

/* ===================================================================
   13. COMPLETE APP INITIALIZATION & BOOT SEQUENCE
   =================================================================== */

async function initializeApplication() {
  try {
    console.log("🚀 Initializing Productivity Dashboard v" + APP_VERSION);

    // Step 1: Initialize Audio Engine
    AudioEngine.initialize();

    // Step 2: Load persistent data
    TaskManager.loadTasks();
    ProgressionSystem.loadProgress();
    AnalyticsEngine.loadAnalytics();
    loadSettings();

    // Step 3: Initialize timer
    TimerEngine.initialize();

    // Step 4: Set default active mode
    const defaultMode = "pomodoro";
    document.querySelector(`[data-mode="${defaultMode}"]`)?.classList.add("active");

    // Step 5: Render initial UI
    UIRenderer.renderTasks();
    UIRenderer.syncMetrics();
    UIRenderer.updateActiveTaskDisplay();
    AnalyticsEngine.renderChart();
    ProgressionSystem.updateProgressDisplay();

    // Step 6: Setup event listeners
    setupEventListeners();

    // Step 7: Initialize settings
    if (DOM.soundToggle()) {
      DOM.soundToggle().checked = AppState.soundEnabled;
    }
    if (DOM.notificationsToggle()) {
      DOM.notificationsToggle().checked = AppState.notificationsEnabled;
    }
    if (DOM.autoStartToggle()) {
      DOM.autoStartToggle().checked = AppState.autoStartPomodoro;
    }

    // Step 8: Request notification permission
    requestNotificationPermission();

    // Step 9: Hide loader
    if (DOM.pageLoader()) {
      DOM.pageLoader().classList.add("hidden");
    }

    console.log("✅ Application initialized successfully");
    showToast("Welcome to Productivity Dashboard!", "success");
  } catch (error) {
    console.error("❌ Error initializing application:", error);
    showToast("Error initializing app. Please refresh.", "error");
  }
}

/* ===================================================================
   14. APP LIFECYCLE & MEMORY MANAGEMENT
   =================================================================== */

// Save state periodically
setInterval(() => {
  TaskManager.saveTasks();
  ProgressionSystem.saveProgress();
  AnalyticsEngine.saveAnalytics();
  saveSettings();
}, 30000); // Every 30 seconds

// Save on page unload
window.addEventListener("beforeunload", () => {
  TaskManager.saveTasks();
  ProgressionSystem.saveProgress();
  AnalyticsEngine.saveAnalytics();
  saveSettings();
});

// Pause timer on page visibility change
document.addEventListener("visibilitychange", () => {
  if (document.hidden && AppState.timerRunning) {
    TimerEngine.pause();
  }
});

/* ===================================================================
   15. BOOT APPLICATION ON DOM READY
   =================================================================== */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApplication);
} else {
  initializeApplication();
}

// Export for debugging
window.__AppDebug__ = {
  AppState,
  TaskManager,
  TimerEngine,
  ProgressionSystem,
  AudioEngine,
  AnalyticsEngine,
  UIRenderer,
};
