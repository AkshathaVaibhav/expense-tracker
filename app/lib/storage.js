
export const STORAGE_KEYS = {
  expenses: "expense-tracker-expenses",
  categories: "expense-tracker-categories",
  monthlySettings: "expense-tracker-monthly-settings",
};

export const DEFAULT_CATEGORIES = [
  { id: "food", name: "Food", color: "#F59E0B" },
  { id: "transport", name: "Transport", color: "#3B82F6" },
  { id: "shopping", name: "Shopping", color: "#EC4899" },
  { id: "bills", name: "Bills", color: "#8B5CF6" },
  { id: "health", name: "Health", color: "#10B981" },
  { id: "entertainment", name: "Entertainment", color: "#F97316" },
  { id: "other", name: "Other", color: "#64748B" },
];

// Generate today's date in local YYYY-MM-DD format
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Get the month key, for example: 2026-11
export function getMonthKey(dateString) {
  return dateString.slice(0, 7);
}

// Read data from localStorage
export function readStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : fallback;
  } catch (error) {
    console.error("Could not read saved data:", error);
    return fallback;
  }
}

// Save data to localStorage
export function writeStorage(key, data) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Could not save data:", error);
  }
}

// Generate a unique ID
export function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
