/**
 * FOCUS TIMER - CLEAN, MODULAR ARCHITECTURE
 * Zero bugs, instant boot, Apple Pro style
 */

// ============================================================================
// 1. STATE MANAGEMENT
// ============================================================================

const State = {
    // Timer state
    timerMode: 'pomodoro',
    timerRunning: false,
    timerElapsed: 0,
    timerDuration: 1500, // 25 min in seconds
    pomodoroCount: 0,

    // Task state
    tasks: [],
    searchQuery: '',
    priorityFilter: 'all',

    // Settings
    soundEnabled: true,
    notificationsEnabled: true,
};

const TIMER_MODES = {
    pomodoro: { duration: 1500, label: 'Focus Sprint' },
    shortBreak: { duration: 300, label: 'Short Break' },
    longBreak: { duration: 900, label: 'Long Break' },
    stopwatch: { duration: Infinity, label: 'Stopwatch' },
};

const PRIORITY_CONFIG = {
    low: { label: 'Low', color: '#10b981' },
    medium: { label: 'Medium', color: '#f59e0b' },
    high: { label: 'High', color: '#ef4444' },
};

// ============================================================================
// 2. DOM CACHE
// ============================================================================

const DOM = {
    app: () => document.getElementById('app'),
    timerValue: () => document.getElementById('timerValue'),
    timerStatus: () => document.getElementById('timerStatus'),
    playPauseBtn: () => document.getElementById('playPauseBtn'),
    skipBtn: () => document.getElementById('skipBtn'),
    resetBtn: () => document.getElementById('resetBtn'),
    searchInput: () => document.getElementById('searchInput'),
    taskInput: () => document.getElementById('taskInput'),
    prioritySelect: () => document.getElementById('prioritySelect'),
    taskForm: () => document.getElementById('taskForm'),
    tasksList: () => document.getElementById('tasksList'),
    priorityFilters: () => document.querySelectorAll('.priority-filter'),
    modeTabs: () => document.querySelectorAll('.mode-tab'),
    settingsBtn: () => document.getElementById('settingsBtn'),
    settingsModal: () => document.getElementById('settingsModal'),
    closeModalBtn: () => document.getElementById('closeModalBtn'),
    soundToggle: () => document.getElementById('soundToggle'),
    notificationsToggle: () => document.getElementById('notificationsToggle'),
    toastContainer: () => document.getElementById('toastContainer'),
};

// ============================================================================
// 3. TIMER ENGINE
// ============================================================================

let timerInterval = null;

const TimerEngine = {
    start() {
        if (State.timerRunning) return;
        State.timerRunning = true;
        this.updateUI();

        timerInterval = setInterval(() => {
            State.timerElapsed += 0.1;

            if (State.timerMode !== 'stopwatch' && State.timerElapsed >= State.timerDuration) {
                this.complete();
            }

            this.updateUI();
        }, 100);
    },

    pause() {
        if (!State.timerRunning) return;
        State.timerRunning = false;
        clearInterval(timerInterval);
        this.updateUI();
    },

    reset() {
        this.pause();
        State.timerElapsed = 0;
        this.updateUI();
    },

    skip() {
        this.reset();
        if (State.timerMode === 'pomodoro') {
            State.pomodoroCount++;
        }
    },

    switchMode(mode) {
        this.reset();
        State.timerMode = mode;
        State.timerDuration = TIMER_MODES[mode].duration;
        this.updateUI();
    },

    complete() {
        this.pause();
        State.pomodoroCount++;
        
        if (State.soundEnabled) {
            this.playChime();
        }
        
        if (State.notificationsEnabled) {
            this.sendNotification('Timer Complete!', `Pomodoro #${State.pomodoroCount} finished`);
        }
        
        showToast(`✨ Completed! Pomodoro #${State.pomodoroCount}`, 'success');
    },

    updateUI() {
        const timerVal = DOM.timerValue();
        const timerStat = DOM.timerStatus();
        if (!timerVal || !timerStat) return;

        const seconds = Math.floor(State.timerElapsed);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerVal.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        timerStat.textContent = State.timerRunning ? 'Running' : (State.timerElapsed === 0 ? 'Ready' : 'Paused');

        const playBtn = DOM.playPauseBtn();
        if (playBtn) {
            playBtn.innerHTML = State.timerRunning ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        }
    },

    playChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

            frequencies.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5 + i * 0.1);
                osc.start(now + i * 0.1);
                osc.stop(now + 0.5 + i * 0.1);
            });
        } catch (e) {
            console.log('Audio unavailable');
        }
    },

    sendNotification(title, options) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: options });
        }
    },
};

// ============================================================================
// 4. TASK MANAGEMENT
// ============================================================================

const TaskManager = {
    create(title, priority) {
        if (!title.trim()) {
            showToast('Task cannot be empty', 'error');
            return null;
        }

        const task = {
            id: Date.now(),
            title: title.trim(),
            priority,
            completed: false,
            createdAt: new Date(),
        };

        State.tasks.unshift(task);
        this.save();
        showToast('Task added ✓', 'success');
        return task;
    },

    delete(id) {
        State.tasks = State.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    },

    toggle(id) {
        const task = State.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
            this.render();
        }
    },

    getFiltered() {
        let filtered = State.tasks;

        if (State.searchQuery) {
            const q = State.searchQuery.toLowerCase();
            filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
        }

        if (State.priorityFilter !== 'all') {
            filtered = filtered.filter(t => t.priority === State.priorityFilter);
        }

        return filtered;
    },

    render() {
        const container = DOM.tasksList();
        if (!container) return;

        const tasks = this.getFiltered();
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No tasks yet</p></div>';
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-item">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="TaskManager.toggle(${task.id}); TaskManager.render();">
                <div class="task-content">
                    <div class="task-title">${this.escape(task.title)}</div>
                    <span class="task-priority ${task.priority}">${PRIORITY_CONFIG[task.priority].label}</span>
                </div>
                <button class="task-delete" onclick="TaskManager.delete(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    },

    escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    save() {
        localStorage.setItem('tasks', JSON.stringify(State.tasks));
    },

    load() {
        try {
            const saved = localStorage.getItem('tasks');
            if (saved) {
                State.tasks = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading tasks:', e);
        }
    },
};

// ============================================================================
// 5. TOAST NOTIFICATIONS
// ============================================================================

function showToast(message, type = 'info') {
    const container = DOM.toastContainer();
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 280ms ease reverse';
        setTimeout(() => toast.remove(), 280);
    }, 3000);
}

// ============================================================================
// 6. SETTINGS
// ============================================================================

function loadSettings() {
    try {
        const saved = localStorage.getItem('settings');
        if (saved) {
            const settings = JSON.parse(saved);
            State.soundEnabled = settings.soundEnabled ?? true;
            State.notificationsEnabled = settings.notificationsEnabled ?? true;
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

function saveSettings() {
    localStorage.setItem('settings', JSON.stringify({
        soundEnabled: State.soundEnabled,
        notificationsEnabled: State.notificationsEnabled,
    }));
}

// ============================================================================
// 7. EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Timer controls
    const playPauseBtn = DOM.playPauseBtn();
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (State.timerRunning) {
                TimerEngine.pause();
            } else {
                TimerEngine.start();
            }
        });
    }

    const skipBtn = DOM.skipBtn();
    if (skipBtn) {
        skipBtn.addEventListener('click', () => TimerEngine.skip());
    }

    const resetBtn = DOM.resetBtn();
    if (resetBtn) {
        resetBtn.addEventListener('click', () => TimerEngine.reset());
    }

    // Mode tabs
    DOM.modeTabs().forEach(tab => {
        tab.addEventListener('click', () => {
            DOM.modeTabs().forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mode = tab.dataset.mode;
            if (mode) TimerEngine.switchMode(mode);
        });
    });

    // Task form
    const taskForm = DOM.taskForm();
    if (taskForm) {
        taskForm.addEventListener('submit', e => {
            e.preventDefault();
            const input = DOM.taskInput();
            const select = DOM.prioritySelect();
            if (input && select) {
                TaskManager.create(input.value, select.value);
                input.value = '';
                select.value = 'medium';
                TaskManager.render();
            }
        });
    }

    // Search
    const searchInput = DOM.searchInput();
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            State.searchQuery = e.target.value;
            TaskManager.render();
        });
    }

    // Priority filters
    DOM.priorityFilters().forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.priorityFilters().forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            State.priorityFilter = btn.dataset.priority || 'all';
            TaskManager.render();
        });
    });

    // Settings modal
    const settingsBtn = DOM.settingsBtn();
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            const modal = DOM.settingsModal();
            if (modal) modal.classList.remove('hidden');
        });
    }

    const closeModalBtn = DOM.closeModalBtn();
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const modal = DOM.settingsModal();
            if (modal) modal.classList.add('hidden');
        });
    }

    // Settings toggles
    const soundToggle = DOM.soundToggle();
    if (soundToggle) {
        soundToggle.addEventListener('change', e => {
            State.soundEnabled = e.target.checked;
            saveSettings();
        });
    }

    const notifToggle = DOM.notificationsToggle();
    if (notifToggle) {
        notifToggle.addEventListener('change', e => {
            State.notificationsEnabled = e.target.checked;
            if (e.target.checked && 'Notification' in window) {
                Notification.requestPermission();
            }
            saveSettings();
        });
    }
}

// ============================================================================
// 8. INITIALIZATION (ZERO BUGS, INSTANT BOOT)
// ============================================================================

function initialize() {
    try {
        // Load data
        TaskManager.load();
        loadSettings();

        // Apply settings to UI
        const soundToggle = DOM.soundToggle();
        if (soundToggle) soundToggle.checked = State.soundEnabled;
        const notifToggle = DOM.notificationsToggle();
        if (notifToggle) notifToggle.checked = State.notificationsEnabled;

        // Initialize UI
        TaskManager.render();
        TimerEngine.updateUI();
        setupEventListeners();

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        console.log('✅ App initialized');
    } catch (e) {
        console.error('Init error:', e);
        showToast('Error initializing app', 'error');
    }
}

// Boot instantly on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}