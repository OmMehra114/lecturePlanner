import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCHEDULES_FILE = path.join(DATA_DIR, 'schedules.json');

// Ensure data directory exists
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SCHEDULES_FILE)) {
    fs.writeFileSync(SCHEDULES_FILE, JSON.stringify([]), 'utf-8');
  }
}

/**
 * Get all saved schedules
 */
export function getAllSchedules() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(SCHEDULES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading schedules:', err);
    return [];
  }
}

/**
 * Get a specific schedule by ID
 */
export function getScheduleById(id) {
  const all = getAllSchedules();
  return all.find((s) => s.id === id) || null;
}

/**
 * Save or update a schedule
 */
export function saveSchedule(scheduleData) {
  ensureStorage();
  const all = getAllSchedules();
  const id = scheduleData.id || `plan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  const existingIndex = all.findIndex((s) => s.id === id);
  const now = new Date().toISOString();

  const record = {
    ...scheduleData,
    id,
    updatedAt: now,
    createdAt: existingIndex >= 0 ? all[existingIndex].createdAt : now,
  };

  if (existingIndex >= 0) {
    all[existingIndex] = record;
  } else {
    all.unshift(record);
  }

  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(all, null, 2), 'utf-8');
  return record;
}

/**
 * Delete a schedule by ID
 */
export function deleteSchedule(id) {
  ensureStorage();
  const all = getAllSchedules();
  const filtered = all.filter((s) => s.id !== id);
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}
