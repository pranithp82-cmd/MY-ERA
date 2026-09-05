
    // ========================================================
    // 0. DATE HELPERS (REAL CURRENT DATE SUPPORT)
    // ========================================================
    const REAL_TODAY = new Date();
    let selectedDate = new Date(REAL_TODAY); // Active Lifestyle Date
    let calDisplayMonth = new Date(REAL_TODAY); // Lifestyle Month Drawer

    let tradingSelectedDate = new Date(REAL_TODAY); // Active Trading Date
    let tradingCalDisplayMonth = new Date(REAL_TODAY); // Trading Month Drawer

    let gymSelectedDate = new Date(REAL_TODAY); // Active Gym Date
    let gymCalDisplayMonth = new Date(REAL_TODAY); // Gym Month Drawer
    let showAllGymNotes = false;

    function getDateKey(d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function isSameDay(d1, d2) {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    }

    const MONTH_NAMES = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const SHORT_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    // ========================================================
    // 1. GLOBAL NAVIGATION & TAB SWITCHER
    // ========================================================
    const navTabBtns = document.querySelectorAll('.nav-tab-btn');
    const viewPanels = {
      lifestyle: document.getElementById('view-lifestyle'),
      trading: document.getElementById('view-trading'),
      gym: document.getElementById('view-gym')
    };

    function switchAppTab(tabKey) {
      Object.keys(viewPanels).forEach(key => {
        if (key === tabKey) {
          viewPanels[key].classList.remove('hidden');
          viewPanels[key].classList.add('flex');
        } else {
          viewPanels[key].classList.add('hidden');
          viewPanels[key].classList.remove('flex');
        }
      });

      navTabBtns.forEach(btn => {
        const path = btn.getAttribute('data-path');
        if (path === tabKey) {
          btn.setAttribute('aria-current', 'page');
          btn.classList.add('text-primary', 'font-bold');
          btn.classList.remove('text-on-surface-variant');
        } else {
          btn.removeAttribute('aria-current');
          btn.classList.remove('text-primary', 'font-bold');
          btn.classList.add('text-on-surface-variant');
        }
      });

      window.scrollTo(0, 0);
    }

    navTabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const path = btn.getAttribute('data-path');
        switchAppTab(path);
      });
    });

    // ========================================================
    // 2. THEME SWITCHER
    // ========================================================
    const shellThemeBtn = document.getElementById('theme-toggle-btn');
    if (shellThemeBtn) {
      shellThemeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const icon = shellThemeBtn.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
        }
      });
    }

    // ========================================================
    // 3. LIFESTYLE MODULE (HABITS PER CALENDAR DATE)
    // ========================================================
    const calendarToggleBtn = document.getElementById('calendar-toggle-btn');
    const calendarView = document.getElementById('calendar-view');
    const calendarMonthHeader = document.getElementById('calendar-month-header');
    const calendarDaysGrid = document.getElementById('calendar-days-grid');
    const calPrevBtn = document.getElementById('cal-prev-btn');
    const calNextBtn = document.getElementById('cal-next-btn');
    const taskList = document.getElementById('task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    const incompleteTaskList = document.getElementById('incomplete-task-list');
    const taskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const taskCounter = document.getElementById('task-counter');
    const taskDateIndicator = document.getElementById('task-date-indicator');
    const selectedDayLabel = document.getElementById('selected-day-label');
    const selectedDateSub = document.getElementById('selected-date-sub');
    const pendingCountLabel = document.getElementById('pending-count-label');
    const completedCountLabel = document.getElementById('completed-count-label');
    const incompleteCountLabel = document.getElementById('incomplete-count-label');
    const btnSaveLifestyle = document.getElementById('btn-save-lifestyle');

    function getTaskStatus(t) {
      if (t && t.status) return t.status;
      return t && t.completed ? 'completed' : 'pending';
    }

    let habitsStore = {};
    try {
      const stored = localStorage.getItem('era_habits_by_date');
      if (stored) habitsStore = JSON.parse(stored);
    } catch (e) {
      habitsStore = {};
    }

    const todayKey = getDateKey(REAL_TODAY);
    if (!habitsStore[todayKey]) {
      habitsStore[todayKey] = [
        { id: '1', text: 'GYM', completed: true, status: 'completed' },
        { id: '2', text: 'COLLEGE WORK', completed: false, status: 'pending' },
        { id: '3', text: 'PERSONAL WORK', completed: false, status: 'incomplete' },
        { id: '4', text: 'STUDY', completed: false, status: 'pending' }
      ];
      saveHabitsStore();
    }

    function saveHabitsStore(specificKey) {
      try {
        localStorage.setItem('era_habits_by_date', JSON.stringify(habitsStore));
      } catch (e) {}
      if (typeof syncLifestyleToCloud === 'function') {
        syncLifestyleToCloud(specificKey || getDateKey(selectedDate));
      }
    }

    function getTasksForDate(d) {
      const key = getDateKey(d);
      if (!habitsStore[key]) habitsStore[key] = [];
      return habitsStore[key];
    }

    calendarToggleBtn.addEventListener('click', () => {
      calendarView.classList.toggle('hidden');
      calendarView.classList.toggle('flex');
    });

    calPrevBtn.addEventListener('click', () => {
      calDisplayMonth.setMonth(calDisplayMonth.getMonth() - 1);
      renderCalendar();
    });

    calNextBtn.addEventListener('click', () => {
      calDisplayMonth.setMonth(calDisplayMonth.getMonth() + 1);
      renderCalendar();
    });

    function renderCalendar() {
      const year = calDisplayMonth.getFullYear();
      const month = calDisplayMonth.getMonth();
      calendarMonthHeader.textContent = `${MONTH_NAMES[month]} ${year}`;

      const firstDayIdx = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      let html = '';

      for (let i = firstDayIdx - 1; i >= 0; i--) {
        const num = daysInPrevMonth - i;
        html += `<span class="py-2 text-surface-container-highest select-none">${num}</span>`;
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const thisDate = new Date(year, month, day);
        const thisKey = getDateKey(thisDate);
        const isSelected = isSameDay(thisDate, selectedDate);
        const isTodayDate = isSameDay(thisDate, REAL_TODAY);
        
        const dayTasks = habitsStore[thisKey] || [];
        const hasCompleted = dayTasks.length > 0 && dayTasks.some(t => getTaskStatus(t) === 'completed');
        const hasIncomplete = dayTasks.length > 0 && dayTasks.some(t => getTaskStatus(t) === 'incomplete');

        let btnClass = 'cal-day py-2 rounded-lg transition-all relative select-none ';
        if (isSelected) {
          btnClass += 'bg-primary text-on-primary font-bold shadow-sm';
        } else if (isTodayDate) {
          btnClass += 'text-primary font-bold border border-primary/40 hover:bg-surface-container';
        } else {
          btnClass += 'text-on-surface-variant hover:text-primary hover:bg-surface-container';
        }

        let dotsHtml = '';
        if (!isSelected) {
          if (hasCompleted && hasIncomplete) {
            dotsHtml = '<div class="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span><span class="w-1.5 h-1.5 rounded-full border border-primary"></span></div>';
          } else if (hasCompleted) {
            dotsHtml = '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"></span>';
          } else if (hasIncomplete) {
            dotsHtml = '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-primary"></span>';
          }
        }

        html += `
          <button class="${btnClass}" data-date="${thisKey}">
            ${day}
            ${dotsHtml}
          </button>
        `;
      }

      calendarDaysGrid.innerHTML = html;

      calendarDaysGrid.querySelectorAll('.cal-day').forEach(btn => {
        btn.addEventListener('click', () => {
          const dateStr = btn.getAttribute('data-date');
          const [y, m, d] = dateStr.split('-').map(Number);
          selectedDate = new Date(y, m - 1, d);
          
          updateDayLabels();
          renderTasks();
          renderCalendar();
        });
      });
    }

    function updateDayLabels() {
      const isTodayDay = isSameDay(selectedDate, REAL_TODAY);
      const dayNum = selectedDate.getDate();
      const monthIdx = selectedDate.getMonth();
      const weekdayIdx = selectedDate.getDay();

      if (isTodayDay) {
        selectedDayLabel.textContent = 'TODAY';
        selectedDateSub.textContent = `${DAY_NAMES[weekdayIdx]}, ${SHORT_MONTHS[monthIdx]} ${dayNum}`;
      } else {
        selectedDayLabel.textContent = `${SHORT_MONTHS[monthIdx]} ${dayNum}`;
        selectedDateSub.textContent = `${DAY_NAMES[weekdayIdx]}, ${MONTH_NAMES[monthIdx]} ${dayNum}, ${selectedDate.getFullYear()}`;
      }
      taskDateIndicator.textContent = `${SHORT_MONTHS[monthIdx]} ${String(dayNum).padStart(2, '0')}`;
    }

    function renderTasks() {
      const tasks = getTasksForDate(selectedDate);
      const pendingTasks = tasks.filter(t => getTaskStatus(t) === 'pending');
      const completedTasks = tasks.filter(t => getTaskStatus(t) === 'completed');
      const incompleteTasks = tasks.filter(t => getTaskStatus(t) === 'incomplete');

      // 1. Render To-Do / Pending Tasks
      if (pendingTasks.length === 0) {
        taskList.innerHTML = `
          <div class="p-3 text-center text-xs font-semibold text-on-surface-variant/60 bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant/30">
            NO PENDING TASKS FOR THIS DAY
          </div>
        `;
      } else {
        taskList.innerHTML = pendingTasks.map(task => `
          <div class="task-item flex items-center justify-between p-space-md py-2.5 px-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors select-none border border-outline-variant/30 group" data-id="${task.id}">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <button type="button" class="btn-action-complete w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant hover:text-primary hover:bg-surface-container-high border border-outline-variant/40 active:scale-95 transition-all" title="Mark Completed (✓)">
                <span class="material-symbols-outlined text-[16px]">check</span>
              </button>
              <button type="button" class="btn-action-incomplete w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant hover:text-primary hover:bg-surface-container-high border border-outline-variant/40 active:scale-95 transition-all" title="Mark Incomplete / Cancelled (✕)">
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
              <span class="task-text text-xs font-bold text-primary truncate tracking-wide ml-0.5">${escapeHtml(task.text)}</span>
            </div>
            <button aria-label="Delete task" class="delete-task opacity-40 hover:opacity-100 text-on-surface-variant hover:text-primary transition-opacity p-1.5 rounded-lg hover:bg-surface-container-high" title="Delete Habit">
              <span class="material-symbols-outlined text-[18px]">delete_outline</span>
            </button>
          </div>
        `).join('');
      }

      // 2. Render Completed Tasks
      if (completedTasks.length === 0) {
        completedTaskList.innerHTML = `
          <div class="p-2.5 text-center text-[11px] font-semibold text-on-surface-variant/50 bg-surface-container-low/30 rounded-xl">
            NO COMPLETED TASKS YET
          </div>
        `;
      } else {
        completedTaskList.innerHTML = completedTasks.map(task => `
          <div class="task-item flex items-center justify-between p-space-md py-2.5 px-3 bg-surface-container-low/80 rounded-xl hover:bg-surface-container transition-colors select-none border border-outline-variant/30 group" data-id="${task.id}">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <button type="button" class="btn-action-undo w-7 h-7 rounded-lg bg-primary text-on-primary font-bold flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-transform" title="Mark as To-Do (Undo)">
                <span class="material-symbols-outlined text-[16px] font-bold">check</span>
              </button>
              <button type="button" class="btn-action-incomplete w-7 h-7 rounded-lg bg-surface-container/50 flex items-center justify-center shrink-0 text-on-surface-variant hover:text-primary hover:bg-surface-container-high border border-outline-variant/30 active:scale-95 transition-all" title="Switch to Incomplete">
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
              <span class="task-text text-xs font-bold text-on-surface-variant line-through truncate tracking-wide ml-0.5">${escapeHtml(task.text)}</span>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-primary border border-outline-variant/40 uppercase tracking-wider shrink-0 ml-auto mr-1">DONE</span>
            </div>
            <button aria-label="Delete task" class="delete-task opacity-40 hover:opacity-100 text-on-surface-variant hover:text-primary transition-opacity p-1.5 rounded-lg hover:bg-surface-container-high" title="Delete Habit">
              <span class="material-symbols-outlined text-[18px]">delete_outline</span>
            </button>
          </div>
        `).join('');
      }

      // 3. Render Incomplete / Cancelled Tasks
      if (incompleteTaskList) {
        if (incompleteTasks.length === 0) {
          incompleteTaskList.innerHTML = `
            <div class="p-2.5 text-center text-[11px] font-semibold text-on-surface-variant/50 bg-surface-container-low/30 rounded-xl">
              NO INCOMPLETE TASKS
            </div>
          `;
        } else {
          incompleteTaskList.innerHTML = incompleteTasks.map(task => `
            <div class="task-item flex items-center justify-between p-space-md py-2.5 px-3 bg-surface-container-low/80 rounded-xl hover:bg-surface-container transition-colors select-none border border-outline-variant/30 group" data-id="${task.id}">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <button type="button" class="btn-action-undo w-7 h-7 rounded-lg bg-surface-container-high text-primary border border-outline-variant/80 flex items-center justify-center shrink-0 active:scale-95 transition-transform" title="Mark as To-Do (Undo)">
                  <span class="material-symbols-outlined text-[16px] font-bold">close</span>
                </button>
                <button type="button" class="btn-action-complete w-7 h-7 rounded-lg bg-surface-container/50 flex items-center justify-center shrink-0 text-on-surface-variant hover:text-primary hover:bg-surface-container-high border border-outline-variant/30 active:scale-95 transition-all" title="Switch to Completed">
                  <span class="material-symbols-outlined text-[16px]">check</span>
                </button>
                <span class="task-text text-xs font-bold text-on-surface-variant line-through truncate tracking-wide ml-0.5">${escapeHtml(task.text)}</span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/40 uppercase tracking-wider shrink-0 ml-auto mr-1">MISSED</span>
              </div>
              <button aria-label="Delete task" class="delete-task opacity-40 hover:opacity-100 text-on-surface-variant hover:text-primary transition-opacity p-1.5 rounded-lg hover:bg-surface-container-high" title="Delete Habit">
                <span class="material-symbols-outlined text-[18px]">delete_outline</span>
              </button>
            </div>
          `).join('');
        }
      }

      const total = tasks.length;
      const completedCount = completedTasks.length;
      const incompleteCount = incompleteTasks.length;
      const pendingCount = pendingTasks.length;

      taskCounter.textContent = `${completedCount} DONE • ${incompleteCount} MISSED (${total} TOTAL)`;
      pendingCountLabel.textContent = `${pendingCount} PENDING`;
      completedCountLabel.textContent = `${completedCount} COMPLETED`;
      if (incompleteCountLabel) {
        incompleteCountLabel.textContent = `${incompleteCount} INCOMPLETE`;
      }
    }

    function handleTaskInteraction(container) {
      if (!container) return;
      container.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-task');
        const completeBtn = e.target.closest('.btn-action-complete');
        const incompleteBtn = e.target.closest('.btn-action-incomplete');
        const undoBtn = e.target.closest('.btn-action-undo');
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.getAttribute('data-id');
        const tasks = getTasksForDate(selectedDate);
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (deleteBtn) {
          e.stopPropagation();
          const updated = tasks.filter(t => t.id !== taskId);
          habitsStore[getDateKey(selectedDate)] = updated;
          saveHabitsStore();
          renderTasks();
          renderCalendar();
          showTradeToast('HABIT REMOVED');
          return;
        }

        if (completeBtn) {
          e.stopPropagation();
          task.completed = true;
          task.status = 'completed';
          saveHabitsStore();
          renderTasks();
          renderCalendar();
          showTradeToast(`COMPLETED: ${task.text}`);
          return;
        }

        if (incompleteBtn) {
          e.stopPropagation();
          task.completed = false;
          task.status = 'incomplete';
          saveHabitsStore();
          renderTasks();
          renderCalendar();
          showTradeToast(`MARKED INCOMPLETE: ${task.text}`, 'cancel');
          return;
        }

        if (undoBtn) {
          e.stopPropagation();
          task.completed = false;
          task.status = 'pending';
          saveHabitsStore();
          renderTasks();
          renderCalendar();
          showTradeToast(`MOVED TO TO-DO: ${task.text}`);
          return;
        }
      });
    }

    handleTaskInteraction(taskList);
    handleTaskInteraction(completedTaskList);
    handleTaskInteraction(incompleteTaskList);

    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = taskInput.value.trim().toUpperCase();
      if (!val) return;

      const tasks = getTasksForDate(selectedDate);
      tasks.push({
        id: 't-' + Date.now(),
        text: val,
        completed: false,
        status: 'pending'
      });

      saveHabitsStore();
      taskInput.value = '';
      renderTasks();
      renderCalendar();
      showTradeToast(`HABIT ADDED: ${val}`);
    });

    btnSaveLifestyle.addEventListener('click', () => {
      saveHabitsStore();
      btnSaveLifestyle.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span><span>SAVED!</span>';
      setTimeout(() => {
        btnSaveLifestyle.innerHTML = '<span class="material-symbols-outlined text-[16px]">save</span><span>SAVE</span>';
      }, 1500);
    });

    // ========================================================
    // 4. TRADING MODULE
    // ========================================================
    let currentPLType = 'profit';
    
    let tradesData = [
      { id: 'tr-1', date: '2026-09-04', time: '09:45 AM', entry: 'NVDA LONG @ $142.50', pl: '+$450.00', isProfit: true, amount: 450 },
      { id: 'tr-2', date: '2026-09-03', time: '02:15 PM', entry: 'TSLA SHORT @ $215.00', pl: '-$120.00', isProfit: false, amount: -120 },
      { id: 'tr-3', date: '2026-09-02', time: '10:30 AM', entry: 'SPY CALL @ $580.00', pl: '+$280.00', isProfit: true, amount: 280 }
    ];

    try {
      const storedTrades = localStorage.getItem('era_trades_data');
      if (storedTrades) tradesData = JSON.parse(storedTrades);
    } catch(e) {}

    function saveTrades() {
      try {
        localStorage.setItem('era_trades_data', JSON.stringify(tradesData));
      } catch(e) {}
      if (typeof syncTradingToCloud === 'function') {
        syncTradingToCloud();
      }
    }

    const tradingCalToggleBtn = document.getElementById('trading-calendar-toggle-btn');
    const tradingCalView = document.getElementById('trading-calendar-view');
    const tradingCalMonthHeader = document.getElementById('trading-calendar-month-header');
    const tradingCalDaysGrid = document.getElementById('trading-calendar-days-grid');
    const tradingCalPrevBtn = document.getElementById('trading-cal-prev-btn');
    const tradingCalNextBtn = document.getElementById('trading-cal-next-btn');
    const tradingSelectedDayLabel = document.getElementById('trading-selected-day-label');
    const tradingSelectedDateSub = document.getElementById('trading-selected-date-sub');
    const tradeActiveDateTag = document.getElementById('trade-active-date-tag');

    tradingCalToggleBtn.addEventListener('click', () => {
      tradingCalView.classList.toggle('hidden');
      tradingCalView.classList.toggle('flex');
    });

    tradingCalPrevBtn.addEventListener('click', () => {
      tradingCalDisplayMonth.setMonth(tradingCalDisplayMonth.getMonth() - 1);
      renderTradingCalendar();
    });

    tradingCalNextBtn.addEventListener('click', () => {
      tradingCalDisplayMonth.setMonth(tradingCalDisplayMonth.getMonth() + 1);
      renderTradingCalendar();
    });

    function renderTradingCalendar() {
      const year = tradingCalDisplayMonth.getFullYear();
      const month = tradingCalDisplayMonth.getMonth();
      tradingCalMonthHeader.textContent = `${MONTH_NAMES[month]} ${year}`;

      const firstDayIdx = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      let html = '';

      for (let i = firstDayIdx - 1; i >= 0; i--) {
        const num = daysInPrevMonth - i;
        html += `<span class="py-2 text-surface-container-highest select-none">${num}</span>`;
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const thisDate = new Date(year, month, day);
        const thisKey = getDateKey(thisDate);
        const isSelected = isSameDay(thisDate, tradingSelectedDate);
        const isTodayDate = isSameDay(thisDate, REAL_TODAY);
        
        const hasTrade = tradesData.some(t => t.date === thisKey);

        let btnClass = 'trading-cal-day py-2 rounded-lg transition-all relative select-none ';
        if (isSelected) {
          btnClass += 'bg-primary text-on-primary font-bold shadow-sm';
        } else if (isTodayDate) {
          btnClass += 'text-primary font-bold border border-primary/40 hover:bg-surface-container';
        } else {
          btnClass += 'text-on-surface-variant hover:text-primary hover:bg-surface-container';
        }

        html += `
          <button class="${btnClass}" data-date="${thisKey}">
            ${day}
            ${hasTrade && !isSelected ? '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>' : ''}
          </button>
        `;
      }

      tradingCalDaysGrid.innerHTML = html;

      tradingCalDaysGrid.querySelectorAll('.trading-cal-day').forEach(btn => {
        btn.addEventListener('click', () => {
          const dateStr = btn.getAttribute('data-date');
          const [y, m, d] = dateStr.split('-').map(Number);
          tradingSelectedDate = new Date(y, m - 1, d);
          
          updateTradingDayLabels();
          renderTradingCalendar();
        });
      });
    }

    function updateTradingDayLabels() {
      const isTodayDay = isSameDay(tradingSelectedDate, REAL_TODAY);
      const dayNum = tradingSelectedDate.getDate();
      const monthIdx = tradingSelectedDate.getMonth();
      const weekdayIdx = tradingSelectedDate.getDay();

      if (isTodayDay) {
        tradingSelectedDayLabel.textContent = 'TODAY';
        tradingSelectedDateSub.textContent = `${DAY_NAMES[weekdayIdx]}, ${SHORT_MONTHS[monthIdx]} ${dayNum}, ${tradingSelectedDate.getFullYear()}`;
      } else {
        tradingSelectedDayLabel.textContent = `${SHORT_MONTHS[monthIdx]} ${dayNum}`;
        tradingSelectedDateSub.textContent = `${DAY_NAMES[weekdayIdx]}, ${MONTH_NAMES[monthIdx]} ${dayNum}, ${tradingSelectedDate.getFullYear()}`;
      }
      tradeActiveDateTag.textContent = `DATE: ${getDateKey(tradingSelectedDate)}`;
    }

    function switchTradeTab(tab) {
      const recordView = document.getElementById('record-view');
      const logsView = document.getElementById('logs-view');
      const recordBtn = document.getElementById('tab-record-btn');
      const logsBtn = document.getElementById('tab-logs-btn');

      if (tab === 'record') {
        recordView.classList.remove('hidden');
        logsView.classList.add('hidden');
        
        recordBtn.classList.add('bg-primary', 'text-on-primary', 'font-bold');
        recordBtn.classList.remove('text-on-surface-variant');
        
        logsBtn.classList.remove('bg-primary', 'text-on-primary', 'font-bold');
        logsBtn.classList.add('text-on-surface-variant');
      } else {
        recordView.classList.add('hidden');
        logsView.classList.remove('hidden');
        
        logsBtn.classList.add('bg-primary', 'text-on-primary', 'font-bold');
        logsBtn.classList.remove('text-on-surface-variant');
        
        recordBtn.classList.remove('bg-primary', 'text-on-primary', 'font-bold');
        recordBtn.classList.add('text-on-surface-variant');
        
        updateSummaryMetrics();
      }
    }

    function setPLType(type) {
      currentPLType = type;
      const profitBtn = document.getElementById('type-profit');
      const lossBtn = document.getElementById('type-loss');
      const prefix = document.getElementById('pl-prefix');

      if (type === 'profit') {
        profitBtn.classList.add('bg-primary', 'text-on-primary', 'font-bold');
        profitBtn.classList.remove('text-on-surface-variant');
        lossBtn.classList.remove('bg-primary', 'text-on-primary', 'font-bold');
        lossBtn.classList.add('text-on-surface-variant');
        prefix.innerText = '+$';
      } else {
        lossBtn.classList.add('bg-primary', 'text-on-primary', 'font-bold');
        lossBtn.classList.remove('text-on-surface-variant');
        profitBtn.classList.remove('bg-primary', 'text-on-primary', 'font-bold');
        profitBtn.classList.add('text-on-surface-variant');
        prefix.innerText = '-$';
      }
    }

    function handleTradeSubmit(e) {
      e.preventDefault();
      const entryVal = document.getElementById('trade-entry').value.trim().toUpperCase();
      const rawPl = document.getElementById('trade-pl').value.replace(/[^0-9.]/g, '');

      if (!entryVal || !rawPl) return;

      const parsedNum = parseFloat(rawPl) || 0;
      const isProfit = currentPLType === 'profit';
      const formattedPL = (isProfit ? '+$' : '-$') + parsedNum.toFixed(2);

      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

      const newTrade = {
        id: 'tr-' + Date.now(),
        date: getDateKey(tradingSelectedDate),
        time: timeStr,
        entry: entryVal,
        pl: formattedPL,
        isProfit: isProfit,
        amount: isProfit ? parsedNum : -parsedNum
      };

      tradesData.unshift(newTrade);
      saveTrades();
      renderTrades();
      renderTradingCalendar();

      document.getElementById('trade-entry').value = '';
      document.getElementById('trade-pl').value = '';

      showTradeToast('TRADE LOGGED SUCCESSFULLY');
      switchTradeTab('logs');
    }

    function deleteTrade(id) {
      tradesData = tradesData.filter(t => t.id !== id);
      saveTrades();
      renderTrades();
      renderTradingCalendar();
      updateSummaryMetrics();
      showTradeToast('TRADE RECORD DELETED');
    }

    function renderTrades() {
      const list = document.getElementById('trades-list');
      list.innerHTML = '';

      if (tradesData.length === 0) {
        list.innerHTML = `
          <div class="p-4 text-center text-xs font-semibold text-on-surface-variant/60 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/30">
            NO RECORDED TRADES YET
          </div>
        `;
      } else {
        tradesData.forEach(t => {
          const card = document.createElement('div');
          card.className = 'flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low transition-colors border border-outline-variant/30';
          card.innerHTML = `
            <div class="flex flex-col min-w-0 pr-2">
              <span class="text-xs font-bold text-primary tracking-wide truncate">${t.entry}</span>
              <div class="flex items-center gap-2 mt-0.5 text-[10px] font-semibold text-on-surface-variant">
                <span>${t.date}</span>
                <span>•</span>
                <span>${t.time}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-bold ${t.isProfit ? 'text-primary bg-primary/10 border border-primary/20' : 'text-on-surface-variant bg-surface-container-high'} px-2 py-0.5 rounded">${t.pl}</span>
              <button onclick="deleteTrade('${t.id}')" aria-label="Delete trade" title="Delete Trade" class="p-1 text-on-surface-variant/50 hover:text-error hover:bg-surface-container-high rounded transition-colors">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          `;
          list.appendChild(card);
        });
      }

      const pill = document.getElementById('log-count-pill');
      if (pill) pill.innerText = tradesData.length;
      updateSummaryMetrics();
    }

    function updateSummaryMetrics() {
      const totalEl = document.getElementById('stat-total');
      const winlossEl = document.getElementById('stat-winloss');
      const netEl = document.getElementById('stat-net');

      const total = tradesData.length;
      const wins = tradesData.filter(t => t.isProfit).length;
      const losses = total - wins;
      const net = tradesData.reduce((acc, t) => acc + t.amount, 0);

      totalEl.innerText = total;
      winlossEl.innerText = `${wins} / ${losses}`;
      netEl.innerText = (net >= 0 ? '+$' : '-$') + Math.abs(net).toFixed(2);
    }

    function showTradeToast(msg = 'TRADE LOGGED SUCCESSFULLY') {
      const toast = document.getElementById('toast-message');
      toast.textContent = msg;
      toast.classList.remove('opacity-0', 'pointer-events-none');
      toast.classList.add('opacity-100');
      setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0', 'pointer-events-none');
      }, 2200);
    }

    // ========================================================
    // TRADING CALCULATOR LOGIC
    // ========================================================
    const calcBalance = document.getElementById('calc-balance');
    const calcRiskPct = document.getElementById('calc-risk-pct');
    const calcRiskResultBadge = document.getElementById('calc-risk-result-badge');
    const calcRiskAmt = document.getElementById('calc-risk-amt');
    const calcSlPips = document.getElementById('calc-sl-pips');
    const calcLotResultBadge = document.getElementById('calc-lot-result-badge');
    const calcLotDisplay = document.getElementById('calc-lot-display');

    function updateCalculator() {
      const balance = parseFloat(calcBalance.value) || 0;
      const riskPct = parseFloat(calcRiskPct.value) || 0;

      const riskAmount = (balance * (riskPct / 100));
      calcRiskResultBadge.textContent = `$${riskAmount.toFixed(2)} RISK`;

      if (document.activeElement !== calcRiskAmt) {
        calcRiskAmt.value = riskAmount.toFixed(2);
      }

      const customRiskAmt = parseFloat(calcRiskAmt.value) || 0;
      const pips = parseFloat(calcSlPips.value) || 1;

      const lotSize = (customRiskAmt / pips);
      const formattedLot = lotSize.toFixed(2);

      calcLotResultBadge.textContent = `${formattedLot} LOTS`;
      calcLotDisplay.textContent = `${formattedLot} LOTS`;
    }

    [calcBalance, calcRiskPct, calcSlPips].forEach(el => {
      el.addEventListener('input', updateCalculator);
    });

    calcRiskAmt.addEventListener('input', () => {
      const customRiskAmt = parseFloat(calcRiskAmt.value) || 0;
      const pips = parseFloat(calcSlPips.value) || 1;
      const lotSize = (customRiskAmt / pips);
      const formattedLot = lotSize.toFixed(2);
      calcLotResultBadge.textContent = `${formattedLot} LOTS`;
      calcLotDisplay.textContent = `${formattedLot} LOTS`;
    });

    // ========================================================
    // 5. GYM LOGIC (WITH PER-DATE WORKOUT NOTES & CALENDAR)
    // ========================================================
    const gymCalToggleBtn = document.getElementById('gym-calendar-toggle-btn');
    const gymCalView = document.getElementById('gym-calendar-view');
    const gymCalMonthHeader = document.getElementById('gym-calendar-month-header');
    const gymCalDaysGrid = document.getElementById('gym-calendar-days-grid');
    const gymCalPrevBtn = document.getElementById('gym-cal-prev-btn');
    const gymCalNextBtn = document.getElementById('gym-cal-next-btn');
    const gymSelectedDayLabel = document.getElementById('gym-selected-day-label');
    const gymSelectedDateSub = document.getElementById('gym-selected-date-sub');
    const gymEntryTitleTag = document.getElementById('gym-entry-title-tag');
    const btnShowAllGym = document.getElementById('btn-show-all-gym');

    let gymNotesStore = [
      {
        id: 'note-1',
        dateKey: '2026-09-02',
        title: "CHEST & TRICEPS",
        displayDate: `SEP 02, 2026`,
        content: "BENCH PRESS 60 KG × 10, 70 KG × 8, 80 KG × 5\nINCLINE DUMBBELL PRESS 28 KG × 10 REPS × 3 SETS\nDIPS: BODYWEIGHT × 12 REPS × 3 SETS"
      },
      {
        id: 'note-2',
        dateKey: '2026-08-31',
        title: "BACK & BICEPS",
        displayDate: `AUG 31, 2026`,
        content: "DEADLIFT 100 KG × 5, 120 KG × 5, 140 KG × 3\nPULL-UPS: 8, 8, 7 REPS\nBARBELL ROW: 70 KG × 8 REPS × 3 SETS"
      },
      {
        id: 'note-3',
        dateKey: '2026-08-28',
        title: "LEG DAY",
        displayDate: `AUG 28, 2026`,
        content: "SQUATS 90 KG × 8, 100 KG × 6, 110 KG × 5\nLEG PRESS: 180 KG × 10 REPS × 3 SETS"
      }
    ];

    try {
      const storedGym = localStorage.getItem('era_gym_notes_data');
      if (storedGym) gymNotesStore = JSON.parse(storedGym);
    } catch(e) {}

    function saveGymNotes() {
      try {
        localStorage.setItem('era_gym_notes_data', JSON.stringify(gymNotesStore));
      } catch(e) {}
      if (typeof syncGymToCloud === 'function') {
        syncGymToCloud();
      }
    }

    gymCalToggleBtn.addEventListener('click', () => {
      gymCalView.classList.toggle('hidden');
      gymCalView.classList.toggle('flex');
    });

    gymCalPrevBtn.addEventListener('click', () => {
      gymCalDisplayMonth.setMonth(gymCalDisplayMonth.getMonth() - 1);
      renderGymCalendar();
    });

    gymCalNextBtn.addEventListener('click', () => {
      gymCalDisplayMonth.setMonth(gymCalDisplayMonth.getMonth() + 1);
      renderGymCalendar();
    });

    function renderGymCalendar() {
      const year = gymCalDisplayMonth.getFullYear();
      const month = gymCalDisplayMonth.getMonth();
      gymCalMonthHeader.textContent = `${MONTH_NAMES[month]} ${year}`;

      const firstDayIdx = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      let html = '';

      for (let i = firstDayIdx - 1; i >= 0; i--) {
        const num = daysInPrevMonth - i;
        html += `<span class="py-2 text-surface-container-highest select-none">${num}</span>`;
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const thisDate = new Date(year, month, day);
        const thisKey = getDateKey(thisDate);
        const isSelected = isSameDay(thisDate, gymSelectedDate);
        const isTodayDate = isSameDay(thisDate, REAL_TODAY);
        
        const hasNote = gymNotesStore.some(n => n.dateKey === thisKey);

        let btnClass = 'gym-cal-day py-2 rounded-lg transition-all relative select-none ';
        if (isSelected) {
          btnClass += 'bg-primary text-on-primary font-bold shadow-sm';
        } else if (isTodayDate) {
          btnClass += 'text-primary font-bold border border-primary/40 hover:bg-surface-container';
        } else {
          btnClass += 'text-on-surface-variant hover:text-primary hover:bg-surface-container';
        }

        html += `
          <button class="${btnClass}" data-date="${thisKey}">
            ${day}
            ${hasNote && !isSelected ? '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>' : ''}
          </button>
        `;
      }

      gymCalDaysGrid.innerHTML = html;

      gymCalDaysGrid.querySelectorAll('.gym-cal-day').forEach(btn => {
        btn.addEventListener('click', () => {
          const dateStr = btn.getAttribute('data-date');
          const [y, m, d] = dateStr.split('-').map(Number);
          gymSelectedDate = new Date(y, m - 1, d);
          showAllGymNotes = false;
          
          updateGymDayLabels();
          renderGymCalendar();
          renderGymNotes();
        });
      });
    }

    function updateGymDayLabels() {
      const isTodayDay = isSameDay(gymSelectedDate, REAL_TODAY);
      const dayNum = gymSelectedDate.getDate();
      const monthIdx = gymSelectedDate.getMonth();
      const weekdayIdx = gymSelectedDate.getDay();

      if (isTodayDay) {
        gymSelectedDayLabel.textContent = 'TODAY';
        gymSelectedDateSub.textContent = `${DAY_NAMES[weekdayIdx]}, ${SHORT_MONTHS[monthIdx]} ${dayNum}, ${gymSelectedDate.getFullYear()}`;
      } else {
        gymSelectedDayLabel.textContent = `${SHORT_MONTHS[monthIdx]} ${dayNum}`;
        gymSelectedDateSub.textContent = `${DAY_NAMES[weekdayIdx]}, ${MONTH_NAMES[monthIdx]} ${dayNum}, ${gymSelectedDate.getFullYear()}`;
      }
      gymEntryTitleTag.textContent = `LOG FOR: ${SHORT_MONTHS[monthIdx]} ${String(dayNum).padStart(2, '0')}`;
    }

    btnShowAllGym.addEventListener('click', () => {
      showAllGymNotes = !showAllGymNotes;
      btnShowAllGym.textContent = showAllGymNotes ? 'SHOW SELECTED DATE ONLY' : 'SHOW ALL DATES';
      renderGymNotes();
    });

    const textarea = document.getElementById('notepad-input');
    const saveBtn = document.getElementById('btn-save');
    const clearBtn = document.getElementById('btn-clear');
    const templateBtn = document.getElementById('btn-insert-template');
    const container = document.getElementById('notes-container');
    const emptyState = document.getElementById('empty-state');
    const countBadge = document.getElementById('entries-count');
    const statLines = document.getElementById('stat-lines');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastIcon = document.getElementById('toast-icon');

    let toastTimeout = null;
    const showGymToast = (text, icon = 'check_circle') => {
      if (toastTimeout) clearTimeout(toastTimeout);
      toastMsg.textContent = text;
      toastIcon.textContent = icon;
      toast.classList.remove('opacity-0', 'translate-y-3');
      toast.classList.add('opacity-100', 'translate-y-0');
      toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-3');
      }, 2200);
    };

    const updateStats = () => {
      const text = textarea.value;
      if (!text.trim()) {
        statLines.textContent = '0 LINES';
        return;
      }
      const lines = text.split('\n').length;
      statLines.textContent = `${lines} ${lines === 1 ? 'LINE' : 'LINES'}`;
    };

    textarea.addEventListener('input', updateStats);

    templateBtn.addEventListener('click', () => {
      const sample = "SHOULDER PRESS\n40 KG × 10 REPS\n45 KG × 8 REPS\n50 KG × 6 REPS\nLATERAL RAISES: 12 KG × 12 REPS × 3 SETS";
      textarea.value = sample;
      textarea.focus();
      updateStats();
      showGymToast('TEMPLATE POPULATED', 'format_align_left');
    });

    clearBtn.addEventListener('click', () => {
      if (!textarea.value.trim()) return;
      textarea.value = '';
      textarea.focus();
      updateStats();
    });

    saveBtn.addEventListener('click', () => {
      const text = textarea.value.trim().toUpperCase();
      if (!text) {
        showGymToast('TYPE SOME NOTES FIRST', 'info');
        textarea.focus();
        return;
      }

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      let title = 'GYM WORKOUT';
      let bodyText = text;

      if (lines.length > 0 && lines[0].length < 40) {
        title = lines[0];
        bodyText = lines.slice(1).join('\n') || lines[0];
      }

      const dateKeyStr = getDateKey(gymSelectedDate);
      const isTodayDay = isSameDay(gymSelectedDate, REAL_TODAY);
      const displayStr = isTodayDay ? `TODAY, ${SHORT_MONTHS[gymSelectedDate.getMonth()]} ${gymSelectedDate.getDate()}` : `${SHORT_MONTHS[gymSelectedDate.getMonth()]} ${gymSelectedDate.getDate()}, ${gymSelectedDate.getFullYear()}`;

      const newNote = {
        id: 'note-' + Date.now(),
        dateKey: dateKeyStr,
        title: title,
        displayDate: displayStr,
        content: bodyText
      };

      gymNotesStore.unshift(newNote);
      saveGymNotes();

      textarea.value = '';
      updateStats();
      renderGymCalendar();
      renderGymNotes();
      showGymToast('WORKOUT NOTE SAVED');
    });

    function deleteGymNote(id) {
      gymNotesStore = gymNotesStore.filter(n => n.id !== id);
      saveGymNotes();
      renderGymCalendar();
      renderGymNotes();
      showGymToast('ENTRY REMOVED', 'delete');
    }

    function renderGymNotes() {
      const currentKey = getDateKey(gymSelectedDate);
      const filtered = showAllGymNotes 
        ? gymNotesStore 
        : gymNotesStore.filter(n => n.dateKey === currentKey);

      countBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'LOG' : 'LOGS'}`;

      if (filtered.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
      } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
      }

      container.innerHTML = filtered.map((n, i) => `
        <article class="workout-note-card group flex flex-col bg-surface-container rounded-xl p-space-base transition-all hover:bg-surface-container-high border border-outline-variant/30" data-id="${n.id}">
          <div class="flex items-center justify-between mb-space-xs">
            <div class="flex items-center gap-space-xs">
              <span class="w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-on-surface-variant'}"></span>
              <span class="text-xs font-bold text-primary tracking-wide">${n.title}</span>
            </div>
            <div class="flex items-center gap-space-2xs text-on-surface-variant">
              <time class="text-[11px] font-semibold mr-1">${n.displayDate}</time>
              <button type="button" class="btn-copy-note p-1.5 rounded hover:text-primary transition-colors" title="Copy to clipboard">
                <span class="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
              <button onclick="deleteGymNote('${n.id}')" type="button" class="btn-delete-note p-1.5 rounded hover:text-error transition-colors" title="Delete note">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
          <div class="note-content text-xs font-medium text-on-surface-variant whitespace-pre-wrap leading-relaxed">${n.content}</div>
        </article>
      `).join('');

      container.querySelectorAll('.btn-copy-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = e.target.closest('.workout-note-card');
          if (!card) return;
          const text = card.querySelector('.note-content').innerText;
          navigator.clipboard.writeText(text)
            .then(() => showGymToast('COPIED TO CLIPBOARD', 'content_paste'))
            .catch(() => showGymToast('COPIED TEXT'));
        });
      });
    }

    function escapeHtml(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // ========================================================
    // 6. REPORT MODAL PREVIEW & BULLETPROOF DIRECT FILE DOWNLOAD
    // ========================================================
    let currentReportFilename = 'ERA_REPORT.png';
    let currentReportDataUrl = null;

    const reportModal = document.getElementById('report-modal');
    const reportModalImg = document.getElementById('report-modal-img');
    const reportModalTitle = document.getElementById('report-modal-title');
    const closeReportModal = document.getElementById('close-report-modal');
    const btnModalDownloadPng = document.getElementById('btn-modal-download-png');
    const btnModalCopyImg = document.getElementById('btn-modal-copy-img');
    const btnModalOpenTab = document.getElementById('btn-modal-open-tab');

    closeReportModal.addEventListener('click', () => {
      reportModal.classList.add('hidden');
      reportModal.classList.remove('flex');
    });

    reportModal.addEventListener('click', (e) => {
      if (e.target === reportModal) {
        reportModal.classList.add('hidden');
        reportModal.classList.remove('flex');
      }
    });

    function dataURLtoBlob(dataurl) {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }

    function triggerDirectDownload(dataUrl, filename) {
      if (!filename.toLowerCase().endsWith('.png')) {
        filename += '.png';
      }
      const a = document.createElement('a');
      a.style.display = 'none';
      a.setAttribute('href', dataUrl);
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) {
          a.parentNode.removeChild(a);
        }
      }, 300);
    }

    function showReport(canvas, title, filename) {
      if (!filename.toLowerCase().endsWith('.png')) {
        filename += '.png';
      }
      currentReportFilename = filename;

      // 1. Synchronous canvas to PNG dataURL
      const dataUrl = canvas.toDataURL('image/png');
      currentReportDataUrl = dataUrl;

      // 2. Update and show modal (no automatic background download!)
      reportModalImg.src = dataUrl;
      reportModalTitle.textContent = title;
      reportModal.classList.remove('hidden');
      reportModal.classList.add('flex');
    }

    // Modal Action 1: Save PNG (Native Windows Save dialog when supported, or direct download)
    btnModalDownloadPng.addEventListener('click', async () => {
      if (!currentReportDataUrl) return;
      try {
        if ('showSaveFilePicker' in window) {
          const blob = dataURLtoBlob(currentReportDataUrl);
          const handle = await window.showSaveFilePicker({
            suggestedName: currentReportFilename,
            types: [{
              description: 'PNG Image (*.png)',
              accept: { 'image/png': ['.png'] }
            }]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          showTradeToast('IMAGE SAVED SUCCESSFULLY');
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
      triggerDirectDownload(currentReportDataUrl, currentReportFilename);
      showTradeToast('IMAGE SAVED TO DOWNLOADS');
    });

    // Modal Action 2: Copy to Clipboard
    if (btnModalCopyImg) {
      btnModalCopyImg.addEventListener('click', async () => {
        if (!currentReportDataUrl) return;
        try {
          const blob = dataURLtoBlob(currentReportDataUrl);
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showTradeToast('IMAGE COPIED TO CLIPBOARD');
        } catch (err) {
          showTradeToast('CLICK SAVE PNG TO DOWNLOAD');
        }
      });
    }

    // Modal Action 3: Open in New Tab
    btnModalOpenTab.addEventListener('click', () => {
      if (!currentReportDataUrl) return;
      const w = window.open('');
      if (w) {
        w.document.write(`<!DOCTYPE html><html><head><title>${currentReportFilename}</title><style>body{margin:0;background:#0e0e0e;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:24px;box-sizing:border-box;}img{max-width:100%;height:auto;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.8);}</style></head><body><img src="${currentReportDataUrl}" alt="Report" /></body></html>`);
        w.document.close();
      }
    });

    // 1. TRADING REPORT
    document.getElementById('btn-download-trading-report').addEventListener('click', () => {
      if (tradesData.length === 0) {
        showTradeToast('NO TRADES TO DOWNLOAD');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = 800;
      const rowHeight = 64;
      const height = 300 + (tradesData.length * rowHeight) + 60;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#0e0e0e';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#1c1b1b';
      roundRect(ctx, 30, 30, width - 60, height - 60, 24, true, false);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Outfit, Inter, sans-serif';
      ctx.fillText('ERA — TRADING JOURNAL REPORT', 60, 85);

      ctx.fillStyle = '#8e9192';
      ctx.font = '14px Outfit, Inter, sans-serif';
      ctx.fillText(`GENERATED ON: ${new Date().toLocaleString().toUpperCase()}`, 60, 115);

      ctx.fillStyle = '#201f1f';
      roundRect(ctx, 60, 135, width - 120, 80, 16, true, false);

      const wins = tradesData.filter(t => t.isProfit).length;
      const losses = tradesData.length - wins;
      const net = tradesData.reduce((acc, t) => acc + t.amount, 0);

      ctx.fillStyle = '#c4c7c8';
      ctx.font = 'bold 12px Outfit, Inter, sans-serif';
      ctx.fillText('TOTAL TRADES', 80, 165);
      ctx.fillText('WINS / LOSSES', 280, 165);
      ctx.fillText('NET P/L', 520, 165);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Outfit, Inter, sans-serif';
      ctx.fillText(`${tradesData.length}`, 80, 195);
      ctx.fillText(`${wins} / ${losses}`, 280, 195);

      ctx.fillStyle = net >= 0 ? '#52c41a' : '#ff4d4f';
      ctx.fillText((net >= 0 ? '+$' : '-$') + Math.abs(net).toFixed(2), 520, 195);

      ctx.fillStyle = '#2a2a2a';
      roundRect(ctx, 60, 240, width - 120, 40, 10, true, false);

      ctx.fillStyle = '#c4c7c8';
      ctx.font = 'bold 12px Outfit, Inter, sans-serif';
      ctx.fillText('DATE & TIME', 80, 265);
      ctx.fillText('ENTRY & INSTRUMENT', 260, 265);
      ctx.fillText('OUTCOME (P/L)', 580, 265);

      let y = 300;
      tradesData.forEach((t, i) => {
        ctx.fillStyle = i % 2 === 0 ? '#201f1f' : '#181717';
        roundRect(ctx, 60, y - 20, width - 120, 52, 10, true, false);

        ctx.fillStyle = '#8e9192';
        ctx.font = 'bold 12px Outfit, Inter, sans-serif';
        ctx.fillText(`${t.date} ${t.time}`, 80, y + 12);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Outfit, Inter, sans-serif';
        ctx.fillText(t.entry.substring(0, 32), 260, y + 12);

        ctx.fillStyle = t.isProfit ? '#52c41a' : '#ff4d4f';
        ctx.font = 'bold 14px Outfit, Inter, sans-serif';
        ctx.fillText(t.pl, 580, y + 12);

        y += rowHeight;
      });

      showReport(canvas, 'TRADING JOURNAL REPORT', `ERA_TRADING_REPORT_${getDateKey(REAL_TODAY)}.png`);
      showTradeToast('REPORT PREVIEW READY');
    });

    // 2. GYM WORKOUT REPORT
    document.getElementById('btn-download-gym-report').addEventListener('click', () => {
      const currentKey = getDateKey(gymSelectedDate);
      const filtered = showAllGymNotes 
        ? gymNotesStore 
        : gymNotesStore.filter(n => n.dateKey === currentKey);

      if (filtered.length === 0) {
        showGymToast('NO WORKOUT NOTES TO DOWNLOAD');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = 800;
      let totalLines = 0;
      filtered.forEach(n => {
        totalLines += (n.content.split('\n').length + 3);
      });
      const height = Math.max(500, 220 + (totalLines * 28) + 60);
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#0e0e0e';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#1c1b1b';
      roundRect(ctx, 30, 30, width - 60, height - 60, 24, true, false);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Outfit, Inter, sans-serif';
      ctx.fillText('ERA — WORKOUT NOTES REPORT', 60, 85);

      ctx.fillStyle = '#8e9192';
      ctx.font = '14px Outfit, Inter, sans-serif';
      const sub = showAllGymNotes ? 'ALL LOGGED WORKOUTS' : `DATE: ${gymSelectedDateSub.textContent}`;
      ctx.fillText(sub, 60, 115);

      let y = 160;
      filtered.forEach(n => {
        ctx.fillStyle = '#201f1f';
        const lines = n.content.split('\n');
        const boxHeight = 60 + (lines.length * 26);
        roundRect(ctx, 60, y, width - 120, boxHeight, 16, true, false);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Outfit, Inter, sans-serif';
        ctx.fillText(n.title, 80, y + 35);

        ctx.fillStyle = '#8e9192';
        ctx.font = 'bold 12px Outfit, Inter, sans-serif';
        ctx.fillText(n.displayDate, width - 220, y + 35);

        ctx.fillStyle = '#c4c7c8';
        ctx.font = '13px Outfit, Inter, sans-serif';
        let lineY = y + 70;
        lines.forEach(l => {
          ctx.fillText(l, 80, lineY);
          lineY += 26;
        });

        y += (boxHeight + 20);
      });

      showReport(canvas, 'WORKOUT NOTES REPORT', `ERA_WORKOUT_REPORT_${getDateKey(gymSelectedDate)}.png`);
      showGymToast('REPORT PREVIEW READY');
    });

    // 3. LIFESTYLE HABITS REPORT
    document.getElementById('btn-download-lifestyle').addEventListener('click', () => {
      const tasks = getTasksForDate(selectedDate);
      if (tasks.length === 0) {
        showTradeToast('NO HABITS TO DOWNLOAD');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = 800;
      const height = 320 + (tasks.length * 56) + 60;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#0e0e0e';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#1c1b1b';
      roundRect(ctx, 30, 30, width - 60, height - 60, 24, true, false);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Outfit, Inter, sans-serif';
      ctx.fillText('ERA — DAILY HABITS REPORT', 60, 85);

      ctx.fillStyle = '#8e9192';
      ctx.font = '14px Outfit, Inter, sans-serif';
      ctx.fillText(`DATE: ${selectedDateSub.textContent}`, 60, 115);

      // Summary Card
      ctx.fillStyle = '#201f1f';
      roundRect(ctx, 60, 138, width - 120, 78, 16, true, false);

      const completedCount = tasks.filter(t => getTaskStatus(t) === 'completed').length;
      const incompleteCount = tasks.filter(t => getTaskStatus(t) === 'incomplete').length;
      const pendingCount = tasks.filter(t => getTaskStatus(t) === 'pending').length;

      // Summary Pills
      // 1. Completed
      ctx.fillStyle = '#262626';
      roundRect(ctx, 80, 154, 180, 46, 12, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Outfit, Inter, sans-serif';
      ctx.fillText(`✔ COMPLETED: ${completedCount}`, 96, 182);

      // 2. Incomplete / Missed
      ctx.fillStyle = '#262626';
      roundRect(ctx, 280, 154, 180, 46, 12, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Outfit, Inter, sans-serif';
      ctx.fillText(`✖ INCOMPLETE: ${incompleteCount}`, 296, 182);

      // 3. Pending
      ctx.fillStyle = '#1c1b1b';
      roundRect(ctx, 480, 154, 160, 46, 12, true, false);
      ctx.fillStyle = '#8e9192';
      ctx.font = 'bold 12px Outfit, Inter, sans-serif';
      ctx.fillText(`○ PENDING: ${pendingCount}`, 496, 182);

      let y = 245;
      tasks.forEach((t, i) => {
        const st = getTaskStatus(t);

        if (st === 'completed') {
          ctx.fillStyle = '#222222';
          roundRect(ctx, 60, y, width - 120, 48, 10, true, false);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px Outfit, Inter, sans-serif';
          ctx.fillText('✔', 85, y + 31);

          ctx.fillStyle = '#8e9192';
          ctx.font = 'bold 13px Outfit, Inter, sans-serif';
          ctx.fillText(t.text, 120, y + 31);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px Outfit, Inter, sans-serif';
          ctx.fillText('COMPLETED', width - 180, y + 31);
        } else if (st === 'incomplete') {
          ctx.fillStyle = '#1f1f1f';
          roundRect(ctx, 60, y, width - 120, 48, 10, true, false);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px Outfit, Inter, sans-serif';
          ctx.fillText('✖', 85, y + 31);

          ctx.fillStyle = '#8e9192';
          ctx.font = 'bold 13px Outfit, Inter, sans-serif';
          ctx.fillText(t.text, 120, y + 31);

          ctx.fillStyle = '#c4c7c8';
          ctx.font = 'bold 11px Outfit, Inter, sans-serif';
          ctx.fillText('INCOMPLETE', width - 180, y + 31);
        } else {
          ctx.fillStyle = '#1c1b1b';
          roundRect(ctx, 60, y, width - 120, 48, 10, true, false);

          ctx.fillStyle = '#8e9192';
          ctx.font = 'bold 18px Outfit, Inter, sans-serif';
          ctx.fillText('○', 85, y + 31);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px Outfit, Inter, sans-serif';
          ctx.fillText(t.text, 120, y + 31);

          ctx.fillStyle = '#8e9192';
          ctx.font = 'bold 11px Outfit, Inter, sans-serif';
          ctx.fillText('PENDING', width - 180, y + 31);
        }

        y += 56;
      });

      showReport(canvas, 'DAILY HABITS REPORT', `ERA_HABITS_REPORT_${getDateKey(selectedDate)}.png`);
      showTradeToast('REPORT PREVIEW READY');
    });

    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    // ========================================================
    // 7. PROGRESSIVE WEB APP (PWA) & APP INSTALLATION
    // ========================================================
    let deferredInstallPrompt = null;
    const btnInstallApp = document.getElementById('btn-install-app');
    const installModal = document.getElementById('install-modal');
    const closeInstallModal = document.getElementById('close-install-modal');
    const btnTriggerInstall = document.getElementById('btn-trigger-install-prompt');
    const installContentNative = document.getElementById('install-content-native');
    const installContentIos = document.getElementById('install-content-ios');

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('Era SW registered:', reg.scope))
          .catch(err => console.log('Era SW reg error:', err));
      });
    }

    // Capture Native PWA Install Prompt (Chrome, Edge, Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (btnInstallApp && !isStandalone) {
        btnInstallApp.classList.remove('hidden');
      }
    });

    // If app is already installed/standalone, hide install button
    if (isStandalone && btnInstallApp) {
      btnInstallApp.classList.add('hidden');
    }

    if (btnInstallApp) {
      btnInstallApp.addEventListener('click', () => {
        if (!installModal) return;
        installModal.classList.remove('hidden');
        installModal.classList.add('flex');
        if (isIos) {
          installContentIos.classList.remove('hidden');
          installContentNative.classList.add('hidden');
        } else {
          installContentNative.classList.remove('hidden');
          installContentIos.classList.add('hidden');
        }
      });
    }

    if (closeInstallModal) {
      closeInstallModal.addEventListener('click', () => {
        installModal.classList.add('hidden');
        installModal.classList.remove('flex');
      });
    }

    if (installModal) {
      installModal.addEventListener('click', (e) => {
        if (e.target === installModal) {
          installModal.classList.add('hidden');
          installModal.classList.remove('flex');
        }
      });
    }

    if (btnTriggerInstall) {
      btnTriggerInstall.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          const { outcome } = await deferredInstallPrompt.userChoice;
          if (outcome === 'accepted') {
            if (btnInstallApp) btnInstallApp.classList.add('hidden');
          }
          deferredInstallPrompt = null;
          installModal.classList.add('hidden');
          installModal.classList.remove('flex');
        } else {
          showTradeToast('USE BROWSER MENU -> INSTALL APP');
        }
      });
    }

    // ========================================================
    
// ========================================================
// 8. FIREBASE REALTIME DATABASE SYNC & AUTHENTICATION (MODULAR SDK)
// ========================================================
import { app, database, auth, firebaseConfig, isFirebaseConfigured } from './firebase/config.js';
import { 
  getCurrentUserId,
  subscribeToHabits,
  saveHabitsForDate,
  subscribeToGymNotes,
  saveGymNotesToDb,
  subscribeToTrades,
  saveTradesToDb,
  validateConnection
} from './firebase/db.js';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  onAuthStateChanged 
} from 'firebase/auth';

let currentAuthUser = null;
let phoneConfirmationResult = null;
let unsubLifestyleListener = null;
let unsubTradingListener = null;
let unsubGymListener = null;

// Account Modal Elements
const accountModal = document.getElementById('account-modal');
const btnAccountModal = document.getElementById('btn-account-modal');
const closeAccountModal = document.getElementById('close-account-modal');
const authStateLoggedIn = document.getElementById('auth-state-logged-in');
const authStateLoggedOut = document.getElementById('auth-state-logged-out');
const cloudSyncIndicator = document.getElementById('cloud-sync-indicator');

const userProfileImg = document.getElementById('user-profile-img');
const userProfileInitials = document.getElementById('user-profile-initials');
const userDisplayName = document.getElementById('user-display-name');
const userDisplayEmail = document.getElementById('user-display-email');
const headerUserAvatar = document.getElementById('header-user-avatar');
const headerUserImg = document.getElementById('header-user-img');

const btnGoogleLogin = document.getElementById('btn-google-login');
const btnSendOtp = document.getElementById('btn-send-otp');
const btnVerifyOtp = document.getElementById('btn-verify-otp');
const btnChangePhone = document.getElementById('btn-change-phone');
const phoneStep1 = document.getElementById('phone-step-1');
const phoneStep2 = document.getElementById('phone-step-2');
const inputCountryCode = document.getElementById('input-country-code');
const inputPhoneNumber = document.getElementById('input-phone-number');
const inputPhoneOtp = document.getElementById('input-phone-otp');
const btnSignOut = document.getElementById('btn-sign-out');
const btnForceSync = document.getElementById('btn-force-sync');

// Firebase Settings Elements
const btnToggleFirebaseSettings = document.getElementById('btn-toggle-firebase-settings');
const firebaseSettingsPanel = document.getElementById('firebase-settings-panel');
const firebaseSettingsChevron = document.getElementById('firebase-settings-chevron');
const inputFirebaseConfigJson = document.getElementById('input-firebase-config-json');
const btnSaveFirebaseConfig = document.getElementById('btn-save-firebase-config');
const firebaseStatusBadge = document.getElementById('firebase-status-badge');

// Display active Firebase Project & Realtime DB status
if (firebaseStatusBadge) {
  if (isFirebaseConfigured()) {
    firebaseStatusBadge.textContent = `CONNECTED: ${firebaseConfig.projectId} (REALTIME DB)`;
    firebaseStatusBadge.className = 'text-[10px] font-bold text-green-400';
  } else {
    firebaseStatusBadge.textContent = 'REALTIME DB: LOCAL CACHE (ENTER API KEY)';
    firebaseStatusBadge.className = 'text-[10px] font-bold text-yellow-400';
  }
}

if (inputFirebaseConfigJson) {
  inputFirebaseConfigJson.value = JSON.stringify(firebaseConfig, null, 2);
}

// Toggle Account Modal
if (btnAccountModal) {
  btnAccountModal.addEventListener('click', () => {
    accountModal.classList.remove('hidden');
    accountModal.classList.add('flex');
  });
}

if (closeAccountModal) {
  closeAccountModal.addEventListener('click', () => {
    accountModal.classList.add('hidden');
    accountModal.classList.remove('flex');
  });
}

if (accountModal) {
  accountModal.addEventListener('click', (e) => {
    if (e.target === accountModal) {
      accountModal.classList.add('hidden');
      accountModal.classList.remove('flex');
    }
  });
}

// Toggle Firebase Settings Accordion
if (btnToggleFirebaseSettings) {
  btnToggleFirebaseSettings.addEventListener('click', () => {
    const isHidden = firebaseSettingsPanel.classList.contains('hidden');
    if (isHidden) {
      firebaseSettingsPanel.classList.remove('hidden');
      firebaseSettingsPanel.classList.add('flex');
      firebaseSettingsChevron.textContent = 'expand_less';
    } else {
      firebaseSettingsPanel.classList.add('hidden');
      firebaseSettingsPanel.classList.remove('flex');
      firebaseSettingsChevron.textContent = 'expand_more';
    }
  });
}

// Save Local Firebase Config Override
if (btnSaveFirebaseConfig) {
  btnSaveFirebaseConfig.addEventListener('click', () => {
    const text = inputFirebaseConfigJson.value.trim();
    if (!text) {
      showTradeToast('ENTER FIREBASE CONFIG JSON');
      return;
    }
    try {
      const parsed = JSON.parse(text);
      localStorage.setItem('era_firebase_config', JSON.stringify(parsed));
      showTradeToast('CONFIG SAVED! RELOADING TO CONNECT...');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      alert('Invalid JSON format. Please paste valid Firebase config JSON.');
    }
  });
}

// Setup Auth State Observer
if (auth) {
  onAuthStateChanged(auth, (user) => {
    currentAuthUser = user;
    if (user) {
      // Logged In
      if (authStateLoggedIn) {
        authStateLoggedIn.classList.remove('hidden');
        authStateLoggedIn.classList.add('flex');
      }
      if (authStateLoggedOut) authStateLoggedOut.classList.add('hidden');
      if (cloudSyncIndicator) {
        cloudSyncIndicator.classList.remove('hidden');
        cloudSyncIndicator.classList.add('flex');
      }

      const name = user.displayName || user.phoneNumber || 'Era User';
      const email = user.email || (user.phoneNumber ? 'Phone Verified' : 'Logged In');
      if (userDisplayName) userDisplayName.textContent = name;
      if (userDisplayEmail) userDisplayEmail.textContent = email;

      if (user.photoURL) {
        if (userProfileImg) { userProfileImg.src = user.photoURL; userProfileImg.classList.remove('hidden'); }
        if (userProfileInitials) userProfileInitials.classList.add('hidden');
        if (headerUserImg) { headerUserImg.src = user.photoURL; headerUserImg.classList.remove('hidden'); }
        if (headerUserAvatar) headerUserAvatar.classList.add('hidden');
      } else {
        if (userProfileImg) userProfileImg.classList.add('hidden');
        if (userProfileInitials) { userProfileInitials.classList.remove('hidden'); userProfileInitials.textContent = name.charAt(0).toUpperCase(); }
        if (headerUserImg) headerUserImg.classList.add('hidden');
        if (headerUserAvatar) headerUserAvatar.classList.remove('hidden');
      }

      // Subscribe to Realtime Database
      subscribeToRealTimeDatabaseSync(user.uid);
    } else {
      // Logged Out
      if (authStateLoggedIn) {
        authStateLoggedIn.classList.add('hidden');
        authStateLoggedIn.classList.remove('flex');
      }
      if (authStateLoggedOut) authStateLoggedOut.classList.remove('hidden');
      if (cloudSyncIndicator) {
        cloudSyncIndicator.classList.add('hidden');
        cloudSyncIndicator.classList.remove('flex');
      }
      if (headerUserImg) headerUserImg.classList.add('hidden');
      if (headerUserAvatar) headerUserAvatar.classList.remove('hidden');

      unsubscribeFromRealtimeDatabase();
    }
  });
}

// Real-Time Database Listeners (onValue)
function subscribeToRealTimeDatabaseSync(uid) {
  unsubscribeFromRealtimeDatabase();

  // 1. Subscribe to Habits
  unsubLifestyleListener = subscribeToHabits(uid, (cloudData) => {
    let changed = false;
    Object.keys(cloudData).forEach(dateKey => {
      const dayData = cloudData[dateKey];
      if (dayData && Array.isArray(dayData.tasks)) {
        habitsStore[dateKey] = dayData.tasks;
        changed = true;
      }
    });
    if (changed) {
      try { localStorage.setItem('era_habits_by_date', JSON.stringify(habitsStore)); } catch(e){}
      renderTasks();
      renderCalendar();
    }
  });

  // 2. Subscribe to Trading Journal
  unsubTradingListener = subscribeToTrades(uid, (cloudTrades) => {
    if (cloudTrades && Array.isArray(cloudTrades) && cloudTrades.length > 0) {
      tradesData = cloudTrades;
      try { localStorage.setItem('era_trades_data', JSON.stringify(tradesData)); } catch(e){}
      renderTrades();
      updateSummaryMetrics();
      renderTradingCalendar();
    }
  });

  // 3. Subscribe to Gym Notes
  unsubGymListener = subscribeToGymNotes(uid, (cloudNotes) => {
    if (cloudNotes && Array.isArray(cloudNotes) && cloudNotes.length > 0) {
      gymNotesStore = cloudNotes;
      try { localStorage.setItem('era_gym_notes_data', JSON.stringify(gymNotesStore)); } catch(e){}
      renderGymNotes();
      renderGymCalendar();
    }
  });

  // Push existing offline local cache to Realtime DB if useful
  pushAllLocalDataToRealtimeDatabase(false);
}

function unsubscribeFromRealtimeDatabase() {
  if (unsubLifestyleListener) { unsubLifestyleListener(); unsubLifestyleListener = null; }
  if (unsubTradingListener) { unsubTradingListener(); unsubTradingListener = null; }
  if (unsubGymListener) { unsubGymListener(); unsubGymListener = null; }
}

// Write/Sync Functions using Realtime Database
function syncLifestyleToCloud(dateKey) {
  const uid = getCurrentUserId();
  if (!uid) return;
  const tasks = habitsStore[dateKey] || [];
  saveHabitsForDate(uid, dateKey, tasks).catch(err => console.warn('Habits sync warning:', err.message));
}

function syncTradingToCloud() {
  const uid = getCurrentUserId();
  if (!uid) return;
  saveTradesToDb(uid, tradesData).catch(err => console.warn('Trading sync warning:', err.message));
}

function syncGymToCloud() {
  const uid = getCurrentUserId();
  if (!uid) return;
  saveGymNotesToDb(uid, gymNotesStore).catch(err => console.warn('Gym notes sync warning:', err.message));
}

function pushAllLocalDataToRealtimeDatabase(showToast = true) {
  const uid = getCurrentUserId();
  if (!uid) return;
  Object.keys(habitsStore).forEach((dateKey) => {
    syncLifestyleToCloud(dateKey);
  });
  syncTradingToCloud();
  syncGymToCloud();
  if (showToast) showTradeToast('REALTIME DATABASE SYNCED');
}

if (btnForceSync) {
  btnForceSync.addEventListener('click', () => {
    pushAllLocalDataToRealtimeDatabase(true);
  });
}

// Google Sign-In
if (btnGoogleLogin) {
  btnGoogleLogin.addEventListener('click', async () => {
    if (!auth) {
      showTradeToast('CONFIGURE FIREBASE API KEY FIRST');
      firebaseSettingsPanel.classList.remove('hidden');
      firebaseSettingsPanel.classList.add('flex');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showTradeToast('LOGGED IN WITH GOOGLE');
    } catch (err) {
      console.error('Google sign-in error:', err);
      showTradeToast(err.message || 'GOOGLE SIGN-IN FAILED');
    }
  });
}

// Phone Number Auth: Setup invisible reCAPTCHA
function setupPhoneRecaptcha() {
  if (!window.recaptchaVerifier && auth) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });
  }
}

// Phone Auth: Send OTP
if (btnSendOtp) {
  btnSendOtp.addEventListener('click', async () => {
    if (!auth) {
      showTradeToast('CONFIGURE FIREBASE API KEY FIRST');
      firebaseSettingsPanel.classList.remove('hidden');
      firebaseSettingsPanel.classList.add('flex');
      return;
    }
    const code = inputCountryCode.value.trim();
    const phone = inputPhoneNumber.value.trim();
    if (!phone) {
      showTradeToast('ENTER VALID MOBILE NUMBER');
      return;
    }
    const fullNumber = (code.startsWith('+') ? code : '+' + code) + phone.replace(/\D/g, '');
    try {
      setupPhoneRecaptcha();
      btnSendOtp.disabled = true;
      btnSendOtp.textContent = 'SENDING OTP SMS...';
      phoneConfirmationResult = await signInWithPhoneNumber(auth, fullNumber, window.recaptchaVerifier);
      showTradeToast('OTP SENT VIA SMS');
      phoneStep1.classList.add('hidden');
      phoneStep2.classList.remove('hidden');
      phoneStep2.classList.add('flex');
    } catch (err) {
      console.error('Phone sign-in error:', err);
      showTradeToast(err.message || 'FAILED TO SEND OTP');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(wId => grecaptcha.reset(wId)).catch(() => {});
      }
    } finally {
      btnSendOtp.disabled = false;
      btnSendOtp.innerHTML = '<span class="material-symbols-outlined text-[16px]">sms</span><span>SEND OTP SMS</span>';
    }
  });
}

// Phone Auth: Change Number
if (btnChangePhone) {
  btnChangePhone.addEventListener('click', () => {
    phoneStep2.classList.add('hidden');
    phoneStep2.classList.remove('flex');
    phoneStep1.classList.remove('hidden');
    inputPhoneOtp.value = '';
  });
}

// Phone Auth: Verify OTP
if (btnVerifyOtp) {
  btnVerifyOtp.addEventListener('click', async () => {
    const otp = inputPhoneOtp.value.trim();
    if (!otp || otp.length < 6) {
      showTradeToast('ENTER 6-DIGIT OTP');
      return;
    }
    try {
      btnVerifyOtp.disabled = true;
      btnVerifyOtp.textContent = 'VERIFYING...';
      await phoneConfirmationResult.confirm(otp);
      showTradeToast('LOGGED IN SUCCESSFULLY');
      phoneStep2.classList.add('hidden');
      phoneStep2.classList.remove('flex');
      phoneStep1.classList.remove('hidden');
      inputPhoneOtp.value = '';
    } catch (err) {
      console.error('Verify OTP error:', err);
      showTradeToast(err.message || 'INVALID OTP CODE');
    } finally {
      btnVerifyOtp.disabled = false;
      btnVerifyOtp.innerHTML = '<span class="material-symbols-outlined text-[16px]">verified_user</span><span>VERIFY OTP & LOGIN</span>';
    }
  });
}

// Sign Out
if (btnSignOut) {
  btnSignOut.addEventListener('click', async () => {
    if (auth) {
      await signOut(auth);
      showTradeToast('SIGNED OUT');
    }
  });
}

// Initial View Render
updateDayLabels();
renderTasks();
renderCalendar();

updateTradingDayLabels();
renderTradingCalendar();
renderTrades();
updateSummaryMetrics();
updateCalculator();

updateGymDayLabels();
renderGymCalendar();
renderGymNotes();
