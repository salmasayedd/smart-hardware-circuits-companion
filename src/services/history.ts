import { HistoryItem } from '../types';

const STORAGE_KEY = 'smart_circuits_history_v1';

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): HistoryItem {
  const items = getHistory();
  const newItem: HistoryItem = {
    id: item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: item.timestamp || new Date().toISOString(),
    title: item.title,
    type: item.type,
    summary: item.summary,
    data: item.data
  };

  // Keep max 50 items
  const updated = [newItem, ...items.filter(i => i.id !== newItem.id)].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save item to localStorage', e);
  }
  return newItem;
}

export function deleteHistoryItem(id: string): void {
  const items = getHistory();
  const updated = items.filter(i => i.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete item from localStorage', e);
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear localStorage', e);
  }
}

export const clearHistory = clearAllHistory;
