
"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const categoryOptions = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Entertainment",
  "Other",
];

const categoryColors = {
  Food: "food",
  Transport: "transport",
  Bills: "bills",
  Shopping: "shopping",
  Entertainment: "entertainment",
  Other: "other",
};

function getLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Home() {
  const [today, setToday] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [formDate, setFormDate] = useState("");

  // Set today's date and load saved expenses.
  useEffect(() => {
    const currentDate = getLocalDate(new Date());

    setToday(currentDate);
    setSelectedDate(currentDate);
    setCalendarMonth(new Date());

    const savedExpenses = localStorage.getItem("expenses");

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch {
        setExpenses([]);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save expenses whenever they change.
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses, isLoaded]);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const monthName = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const currentMonthExpenses = expenses.filter((expense) => {
    return expense.date.startsWith(
      `${year}-${String(month + 1).padStart(2, "0")}`
    );
  });

  const totalExpenses = currentMonthExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const selectedDateExpenses = expenses
    .filter((expense) => expense.date === selectedDate)
    .sort((a, b) => b.id - a.id);

  const openExpenseForm = () => {
    setAmount("");
    setCategory("Food");
    setNote("");
    setFormDate(selectedDate || today);
    setShowForm(true);
  };

  const handleAddExpense = (event) => {
    event.preventDefault();

    if (!amount || Number(amount) <= 0 || !formDate || !category) {
      return;
    }

    const newExpense = {
      id: Date.now(),
      amount: Number(amount),
      category,
      date: formDate,
      note: note.trim(),
    };

    setExpenses((previous) => [...previous, newExpense]);
    setSelectedDate(formDate);
    setCalendarMonth(
      new Date(
        Number(formDate.slice(0, 4)),
        Number(formDate.slice(5, 7)) - 1,
        1
      )
    );
    setShowForm(false);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses((previous) =>
        previous.filter((expense) => expense.id !== id)
      );
    }
  };

  const changeMonth = (difference) => {
    setCalendarMonth(new Date(year, month + difference, 1));
  };

  const selectCalendarDate = (day) => {
    const dateString = getLocalDate(new Date(year, month, day));
    setSelectedDate(dateString);
  };

  const formatAmount = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <a href="#" className={styles.brand}>
          <span className={styles.brandIcon}>₹</span>
          <span>Expense Tracker</span>
        </a>

        <div className={styles.navSection}>
          <p className={styles.navLabel}>WORKSPACE</p>
          <a href="#overview" className={`${styles.navItem} ${styles.active}`}>
            <span>▦</span> Overview
          </a>
          <a href="#calendar" className={styles.navItem}>
            <span>▣</span> Calendar
          </a>
          <a href="#transactions" className={styles.navItem}>
            <span>↔</span> Transactions
          </a>
          <a href="#categories" className={styles.navItem}>
            <span>◷</span> Categories
          </a>
          <a href="#analytics" className={styles.navItem}>
            <span>▥</span> Analytics
          </a>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.profile}>
            <div className={styles.avatar}>A</div>
            <div>
              <strong>My Account</strong>
              <span>Personal workspace</span>
            </div>
          </div>
        </div>
      </aside>

      <section className={styles.mainContent} id="overview">
        <header className={styles.header}>
          <div>
            <p className={styles.breadcrumb}>WORKSPACE / OVERVIEW</p>
            <h1>Expense overview</h1>
            <p className={styles.subtitle}>
              Keep track of where your money goes.
            </p>
          </div>

          <button className={styles.addButton} onClick={openExpenseForm}>
            + Add Expense
          </button>
        </header>

        <div className={styles.summaryGrid}>
          <article className={`${styles.summaryCard} ${styles.totalCard}`}>
            <div className={styles.cardTop}>
              <span>Total expenses</span>
              <span className={styles.cardSymbol}>↗</span>
            </div>
            <h2>{formatAmount(totalExpenses)}</h2>
            <p>Recorded expenses for {monthName}</p>
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.cardTop}>
              <span>Number of expenses</span>
              <span className={styles.incomeIcon}>#</span>
            </div>
            <h2>{currentMonthExpenses.length}</h2>
            <p>Transactions this month</p>
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.cardTop}>
              <span>Selected date</span>
              <span className={styles.balanceIcon}>▣</span>
            </div>
            <h2 className={styles.selectedDateValue}>
              {selectedDate ? formatDate(selectedDate) : "Loading..."}
            </h2>
            <p>Date chosen in the calendar</p>
          </article>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.panel} id="calendar">
            <div className={styles.panelHeader}>
              <div>
                <h3>Expense calendar</h3>
                <p>Select a date to view or add expenses</p>
              </div>
              <button
                className={styles.todayButton}
                onClick={() => {
                  setSelectedDate(today);
                  setCalendarMonth(new Date());
                }}
              >
                Today
              </button>
            </div>

            <div className={styles.calendarHeader}>
              <button
                className={styles.monthArrow}
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
              >
                ‹
              </button>
              <strong>{monthName}</strong>
              <button
                className={styles.monthArrow}
                onClick={() => changeMonth(1)}
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className={styles.calendarGrid}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div className={styles.weekday} key={day}>
                    {day}
                  </div>
                )
              )}

              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`blank-${index}`} />;
                }

                const dateString = getLocalDate(
                  new Date(year, month, day)
                );

                const hasExpense = expenses.some(
                  (expense) => expense.date === dateString
                );

                return (
                  <button
                    key={dateString}
                    className={`${styles.calendarDay} ${
                      selectedDate === dateString ? styles.selectedDay : ""
                    } ${today === dateString ? styles.todayDay : ""}`}
                    onClick={() => selectCalendarDate(day)}
                  >
                    {day}
                    {hasExpense && <span className={styles.calendarDot} />}
                  </button>
                );
              })}
            </div>

            <div className={styles.selectedDateHeading}>
              <div>
                <h3>{selectedDate ? formatDate(selectedDate) : "Loading..."}</h3>
                <p>
                  {selectedDateExpenses.length} expense
                  {selectedDateExpenses.length === 1 ? "" : "s"} on this date
                </p>
              </div>
              <button className={styles.smallAddButton} onClick={openExpenseForm}>
                + Add
              </button>
            </div>

            <div className={styles.transactionList}>
              {selectedDateExpenses.length === 0 ? (
                <div className={styles.emptyState}>
                  <span>▣</span>
                  <strong>No expenses for this date</strong>
                  <p>Add an expense to start tracking this day.</p>
                </div>
              ) : (
                selectedDateExpenses.map((expense) => (
                  <div className={styles.transaction} key={expense.id}>
                    <div
                      className={`${styles.transactionIcon} ${
                        styles[categoryColors[expense.category]]
                      }`}
                    >
                      {expense.category.charAt(0)}
                    </div>

                    <div className={styles.transactionDetails}>
                      <strong>{expense.note || expense.category}</strong>
                      <span>{expense.category}</span>
                    </div>

                    <strong className={styles.amount}>
                      −{formatAmount(expense.amount)}
                    </strong>

                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteExpense(expense.id)}
                      aria-label="Delete expense"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.panel} id="categories">
            <div className={styles.panelHeader}>
              <div>
                <h3>Spending by category</h3>
                <p>Breakdown for {monthName}</p>
              </div>
            </div>

            {categoryOptions.map((item) => {
              const categoryTotal = currentMonthExpenses
                .filter((expense) => expense.category === item)
                .reduce((sum, expense) => sum + Number(expense.amount), 0);

              const percentage =
                totalExpenses > 0
                  ? (categoryTotal / totalExpenses) * 100
                  : 0;

              return (
                <div className={styles.category} key={item}>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>
                      <span
                        className={`${styles.dot} ${
                          styles[categoryColors[item]]
                        }`}
                      />
                      {item}
                    </span>
                    <strong>{formatAmount(categoryTotal)}</strong>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={`${styles.progressBar} ${
                        styles[categoryColors[item]]
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        <footer className={styles.footer}>
          Expense Tracker · Personal finance
          <span>Track your spending, one day at a time.</span>
        </footer>
      </section>

      {showForm && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <section
            className={styles.expenseModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-form-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 id="expense-form-title">Add an expense</h2>
                <p>Enter the details of your spending.</p>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddExpense}>
              <label className={styles.formLabel}>
                Amount (₹)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </label>

              <label className={styles.formLabel}>
                Category
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.formLabel}>
                Date
                <input
                  type="date"
                  value={formDate}
                  onChange={(event) => setFormDate(event.target.value)}
                  required
                />
              </label>

              <label className={styles.formLabel}>
                Note
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="What did you spend on?"
                  maxLength={120}
                  rows={3}
                />
                <span className={styles.characterCount}>
                  {note.length}/120 characters
                </span>
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  Save expense
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
