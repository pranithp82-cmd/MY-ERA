/**
 * Firebase Realtime Database Data Access & Synchronization Module for MY ERA
 * 
 * Schema structure:
 * users/
 *   USER_ID/
 *     habits/
 *       {dateKey}/
 *         {habitId}: { id, text, completed, updatedAt }
 *     tasks/
 *       {taskId}: { id, text, date, completed }
 *     notes/
 *       {noteId}: { id, title, content, dateKey, displayDate, updatedAt }
 *     trading/
 *       {tradeId}: { id, date, time, entry, pl, isProfit, amount }
 *     settings/
 *       preferences: { theme, lotSizeRisk }
 */
import { 
  ref, 
  set, 
  get, 
  onValue, 
  off, 
  remove, 
  update,
  serverTimestamp 
} from 'firebase/database';
import { database, auth } from './config.js';

/**
 * Get current authenticated user UID
 */
export function getCurrentUserId() {
  return auth && auth.currentUser ? auth.currentUser.uid : null;
}

/**
 * HABITS / LIFESTYLE REALTIME SYNC
 */
export function subscribeToHabits(userId, onDataCallback, onErrorCallback) {
  if (!userId) return () => {};
  const habitsRef = ref(database, `users/${userId}/habits`);
  const unsubscribe = onValue(
    habitsRef,
    (snapshot) => {
      const val = snapshot.val() || {};
      onDataCallback(val);
    },
    (error) => {
      console.error('Realtime Database habits error:', error);
      if (onErrorCallback) onErrorCallback(error);
    }
  );
  return () => off(habitsRef, 'value', unsubscribe);
}

export async function saveHabitsForDate(userId, dateKey, tasks) {
  if (!userId) {
    throw new Error('User not authenticated: Cannot write to Realtime Database without Firebase UID');
  }
  const dateRef = ref(database, `users/${userId}/habits/${dateKey}`);
  return set(dateRef, {
    tasks: tasks,
    updatedAt: Date.now()
  });
}

export async function addHabitToDb(userId, dateKey, habit) {
  if (!userId) throw new Error('User not authenticated');
  const habitRef = ref(database, `users/${userId}/habits/${dateKey}/tasks/${habit.id}`);
  return set(habitRef, {
    ...habit,
    updatedAt: Date.now()
  });
}

export async function toggleHabitInDb(userId, dateKey, tasks) {
  return saveHabitsForDate(userId, dateKey, tasks);
}

export async function deleteHabitFromDb(userId, dateKey, tasks) {
  return saveHabitsForDate(userId, dateKey, tasks);
}

/**
 * GYM / WORKOUT NOTES REALTIME SYNC
 */
export function subscribeToGymNotes(userId, onDataCallback, onErrorCallback) {
  if (!userId) return () => {};
  const notesRef = ref(database, `users/${userId}/notes`);
  const unsubscribe = onValue(
    notesRef,
    (snapshot) => {
      const val = snapshot.val();
      // Can be stored as array or object dictionary
      let notesList = [];
      if (val) {
        if (Array.isArray(val)) {
          notesList = val.filter(Boolean);
        } else if (typeof val === 'object') {
          notesList = Object.values(val);
        }
      }
      onDataCallback(notesList);
    },
    (error) => {
      console.error('Realtime Database notes error:', error);
      if (onErrorCallback) onErrorCallback(error);
    }
  );
  return () => off(notesRef, 'value', unsubscribe);
}

export async function saveGymNotesToDb(userId, notesList) {
  if (!userId) throw new Error('User not authenticated');
  const notesRef = ref(database, `users/${userId}/notes`);
  return set(notesRef, notesList);
}

/**
 * TRADING JOURNAL REALTIME SYNC
 */
export function subscribeToTrades(userId, onDataCallback, onErrorCallback) {
  if (!userId) return () => {};
  const tradesRef = ref(database, `users/${userId}/trading`);
  const unsubscribe = onValue(
    tradesRef,
    (snapshot) => {
      const val = snapshot.val();
      let tradesList = [];
      if (val) {
        if (Array.isArray(val)) {
          tradesList = val.filter(Boolean);
        } else if (typeof val === 'object') {
          tradesList = Object.values(val);
        }
      }
      onDataCallback(tradesList);
    },
    (error) => {
      console.error('Realtime Database trades error:', error);
      if (onErrorCallback) onErrorCallback(error);
    }
  );
  return () => off(tradesRef, 'value', unsubscribe);
}

export async function saveTradesToDb(userId, tradesList) {
  if (!userId) throw new Error('User not authenticated');
  const tradesRef = ref(database, `users/${userId}/trading`);
  return set(tradesRef, tradesList);
}

/**
 * VALIDATION: Test Connection Read/Write
 */
export async function validateConnection(testUserId = 'test_connection_check') {
  const testRef = ref(database, `.info/connected`);
  return new Promise((resolve, reject) => {
    onValue(testRef, (snap) => {
      const isConnected = snap.val() === true;
      resolve({ connected: isConnected, databaseURL: database.app.options.databaseURL });
    }, (err) => {
      reject(err);
    }, { onlyOnce: true });
  });
}
