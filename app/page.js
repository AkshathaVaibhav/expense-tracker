
"use client";

import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Transactions from "./components/Transactions";
import Categories from "./components/Categories";

import styles from "./page.module.css";

import {
  STORAGE_KEYS,
  DEFAULT_CATEGORIES,
  getLocalDateString,
  getMonthKey,
  readStorage,
  writeStorage,
  generateId,
} from "./lib/storage";

const sections = {
  overview: {
    title: "Overview",
    subtitle: "Here's a look at your finances.",
  },
  transactions: {
    title: "Transactions",
    subtitle: "View and manage all your expenses.",
  },
  categories: {
    title: "Categories",
    subtitle: "Organise your spending categories.",
  },
  analytics: {
    title: "Analytics",
    subtitle: "Understand your spending patterns.",
  },
};

export default function Home() {
  const [activeSection, setActiveSection] = useState("overview");

  const [selectedDate, setSelectedDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [monthlySettings, setMonthlySettings] = useState({});

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    setSelectedDate(getLocalDateString());

    setExpenses(readStorage(STORAGE_KEYS.expenses, []));
    setCategories(
      readStorage(STORAGE_KEYS.categories, DEFAULT_CATEGORIES)
    );
    setMonthlySettings(
      readStorage(STORAGE_KEYS.monthlySettings, {})
    );

    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    writeStorage(STORAGE_KEYS.expenses, expenses);
  }, [expenses, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    writeStorage(STORAGE_KEYS.categories, categories);
  }, [categories, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    writeStorage(STORAGE_KEYS.monthlySettings, monthlySettings);
  }, [monthlySettings, dataLoaded]);

  const monthKey = selectedDate
    ? getMonthKey(selectedDate)
    : "";

  const currentSettings = monthlySettings[monthKey] || {
    income: 0,
    limit: 0,
  };

  function handleSetMonthlyIncome(value) {
    if (!monthKey) return;

    setMonthlySettings((previous) => ({
      ...previous,
      [monthKey]: {
        ...(previous[monthKey] || {}),
        income: value,
      },
    }));
  }

  function handleSetExpenseLimit(value) {
    if (!monthKey) return;

    setMonthlySettings((previous) => ({
      ...previous,
      [monthKey]: {
        ...(previous[monthKey] || {}),
        limit: value,
      },
    }));
  }

  function handleAddExpense(expense) {
    setExpenses((previous) => [
      {
        id: generateId(),
        ...expense,
      },
      ...previous,
    ]);
  }

  function handleDeleteExpense(expenseId) {
    setExpenses((previous) =>
      previous.filter((expense) => expense.id !== expenseId)
    );
  }

  function handleAddCategory(category) {
    setCategories((previous) => [
      ...previous,
      category,
    ]);
  }

  function handleUpdateCategory(updatedCategory) {
    setCategories((previous) =>
      previous.map((category) =>
        category.id === updatedCategory.id
          ? updatedCategory
          : category
      )
    );
  }

  function handleDeleteCategory(categoryId) {
    const isUsed = expenses.some(
      (expense) => expense.categoryId === categoryId
    );

    if (isUsed || categoryId === "other") return;

    setCategories((previous) =>
      previous.filter((category) => category.id !== categoryId)
    );
  }

  const currentSection = sections[activeSection];

  return (
    <div className={styles.dashboard}>
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>{currentSection.title}</h1>
            <p>{currentSection.subtitle}</p>
          </div>

          <div className={styles.dateBox}>
            <label htmlFor="dashboard-date">
              Select Date
            </label>

            <input
              id="dashboard-date"
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
            />
          </div>
        </header>

        <section className={styles.content}>
          {!dataLoaded ? (
            <div className={styles.placeholder}>
              <p>Loading your expense data...</p>
            </div>
          ) : (
            <>
              {activeSection === "overview" && (
                <Overview
                  expenses={expenses}
                  categories={categories}
                  selectedDate={selectedDate}
                  monthlyIncome={currentSettings.income || 0}
                  expenseLimit={currentSettings.limit || 0}
                  onSetMonthlyIncome={handleSetMonthlyIncome}
                  onSetExpenseLimit={handleSetExpenseLimit}
                  onAddExpense={handleAddExpense}
                  onAddCategory={handleAddCategory}
                />
              )}

              {activeSection === "transactions" && (
                <Transactions
                  expenses={expenses}
                  categories={categories}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}

              {activeSection === "categories" && (
                <Categories
                  expenses={expenses}
                  categories={categories}
                  onAddCategory={handleAddCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                />
              )}

              {activeSection === "analytics" && (
                <div className={styles.placeholder}>
                  <h2>Analytics</h2>
                  <p>
                    We're getting this section ready.
                    Its features will appear here.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
