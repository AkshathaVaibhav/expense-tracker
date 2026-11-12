
"use client";

import { useMemo, useState } from "react";
import styles from "./Overview.module.css";

export default function Overview({
  expenses = [],
  categories = [],
  selectedDate,
  monthlyIncome = 0,
  expenseLimit = 0,
  onSetMonthlyIncome,
  onSetExpenseLimit,
  onAddExpense,
  onAddCategory,
}) {
  const [activeForm, setActiveForm] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newColor, setNewColor] = useState("#8B7BE8");
  const [settingAmount, setSettingAmount] = useState("");

  const monthKey = selectedDate?.slice(0, 7);

  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => expense.date?.startsWith(monthKey)),
    [expenses, monthKey]
  );

  const totalSpent = monthlyExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const remainingBudget = Number(expenseLimit) - totalSpent;

  const budgetUsed =
    Number(expenseLimit) > 0
      ? (totalSpent / Number(expenseLimit)) * 100
      : 0;

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const alphabeticalCategories = useMemo(
    () =>
        [...categories].sort((a, b) => {
        const aIsOther = a.name.trim().toLowerCase() === "other";
        const bIsOther = b.name.trim().toLowerCase() === "other";

        if (aIsOther && !bIsOther) return 1;
        if (!aIsOther && bIsOther) return -1;

        return a.name.localeCompare(b.name);
        }),
    [categories]
  );

  const sortedCategorySpending = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          total: monthlyExpenses
            .filter((expense) => expense.categoryId === category.id)
            .reduce(
              (sum, expense) => sum + Number(expense.amount || 0),
              0
            ),
        }))
        .sort((a, b) => b.total - a.total),
    [categories, monthlyExpenses]
  );

  function handleExpenseSubmit(event) {
    event.preventDefault();

    if (!amount || Number(amount) <= 0 || !categoryId || !selectedDate) {
      return;
    }

    onAddExpense({
      amount: Number(amount),
      categoryId,
      date: selectedDate,
      note: note.trim(),
    });

    setAmount("");
    setCategoryId("");
    setNote("");
    setActiveForm("");
  }

  function handleCategorySubmit(event) {
    event.preventDefault();

    if (!newCategory.trim()) return;

    const alreadyExists = categories.some(
      (category) =>
        category.name.toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (alreadyExists) {
      alert("This category already exists.");
      return;
    }

    onAddCategory({
      id: `category-${Date.now()}`,
      name: newCategory.trim(),
      color: newColor,
    });

    setNewCategory("");
    setNewColor("#8B7BE8");
    setActiveForm("");
  }

  function handleSettingSubmit(event) {
    event.preventDefault();

    const value = Number(settingAmount);
    if (!Number.isFinite(value) || value < 0) return;

    if (activeForm === "income") {
      onSetMonthlyIncome(value);
    } else {
      onSetExpenseLimit(value);
    }

    setActiveForm("");
    setSettingAmount("");
  }

  function openSettingEditor(type, currentValue) {
    setSettingAmount(String(currentValue || ""));
    setActiveForm(type);
  }

  return (
    <div className={styles.overview}>
      {/* Financial summary */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <div className={styles.summaryLabel}>
              <span className={`${styles.summaryIcon} ${styles.incomeIcon}`}>
                ₹
              </span>
              <span>Monthly Income</span>
            </div>

            <button
              className={styles.editIcon}
              title="Edit monthly income"
              aria-label="Edit monthly income"
              onClick={() => openSettingEditor("income", monthlyIncome)}
            >
              ✎
            </button>
          </div>

          <strong>{formatMoney(monthlyIncome)}</strong>
          <small>Your planned monthly income</small>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <div className={styles.summaryLabel}>
              <span className={`${styles.summaryIcon} ${styles.limitIcon}`}>
                ◎
              </span>
              <span>Expense Limit</span>
            </div>

            <button
              className={styles.editIcon}
              title="Edit expense limit"
              aria-label="Edit expense limit"
              onClick={() => openSettingEditor("limit", expenseLimit)}
            >
              ✎
            </button>
          </div>

          <strong>
            {Number(expenseLimit) > 0
              ? formatMoney(expenseLimit)
              : "Not set"}
          </strong>
          <small>Your monthly spending limit</small>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <div className={styles.summaryLabel}>
              <span className={`${styles.summaryIcon} ${styles.spendingIcon}`}>
                ↗
              </span>
              <span>Total Spending</span>
            </div>
          </div>

          <strong>{formatMoney(totalSpent)}</strong>
          <small>{monthlyExpenses.length} transactions this month</small>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <div className={styles.summaryLabel}>
              <span className={`${styles.summaryIcon} ${styles.remainingIcon}`}>
                ✓
              </span>
              <span>Remaining Budget</span>
            </div>
          </div>

          <strong className={styles.positive}>
            {formatMoney(
              Number(expenseLimit) > 0
                ? remainingBudget
                : Number(monthlyIncome) - totalSpent
            )}
          </strong>
          <small>
            {Number(expenseLimit) > 0
              ? "Remaining after expenses"
              : "Income minus spending"}
          </small>
        </div>
      </div>

      {/* Main actions */}
      <div className={styles.actionGrid}>
        <button
          className={`${styles.actionCard} ${styles.primaryAction}`}
          onClick={() => setActiveForm("expense")}
        >
          <span className={styles.actionIcon}>＋</span>
          <span>
            <strong>Add Expense</strong>
            <small>Record a new expense</small>
          </span>
          <span className={styles.arrow}>↗</span>
        </button>

        <button
          className={styles.actionCard}
          onClick={() => setActiveForm("category")}
        >
          <span className={styles.actionIcon}>▦</span>
          <span>
            <strong>Add Category</strong>
            <small>Create your own category</small>
          </span>
          <span className={styles.arrow}>↗</span>
        </button>
      </div>

      {/* Monthly budget */}
      {Number(expenseLimit) > 0 && (
        <div className={styles.budgetCard}>
          <div className={styles.budgetHeading}>
            <div>
              <h3>Monthly Budget</h3>
              <p>Your monthly spending at a glance</p>
            </div>
            <strong>{Math.round(budgetUsed)}% used</strong>
          </div>

          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressFill} ${
                budgetUsed >= 100 ? styles.overBudget : ""
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>

          <div className={styles.budgetFigures}>
            <div>
              <small>Spent</small>
              <strong>{formatMoney(totalSpent)}</strong>
            </div>

            <div>
              <small>
                {remainingBudget >= 0 ? "Remaining" : "Over budget"}
              </small>
              <strong className={styles.budgetRemaining}>
                {formatMoney(Math.abs(remainingBudget))}
              </strong>
            </div>

            <div>
              <small>Total limit</small>
              <strong>{formatMoney(expenseLimit)}</strong>
            </div>
          </div>

          {budgetUsed >= 100 && (
            <div className={styles.warning}>
              <span>😟</span>
              <div>
                <strong>Your spending limit has been reached!</strong>
                <p>You've gone over your planned monthly budget.</p>
              </div>
            </div>
          )}

          {budgetUsed >= 80 && budgetUsed < 100 && (
            <div className={styles.notice}>
              👀 You're getting close to your monthly spending limit!
            </div>
          )}
        </div>
      )}

      {/* Category-wise spending */}
      <div className={styles.categoryCard}>
        <div className={styles.sectionHeading}>
          <div>
            <h3>Category-wise Spending</h3>
            <p>See where your money goes this month</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className={styles.emptyText}>No categories available yet.</p>
        ) : (
          <div className={styles.categoryList}>
            {sortedCategorySpending.map((category) => {
              const percentage =
                totalSpent > 0 ? (category.total / totalSpent) * 100 : 0;

              return (
                <div className={styles.categoryRow} key={category.id}>
                  <div className={styles.categoryInfo}>
                    <span
                      className={styles.categoryDot}
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                    <strong>{formatMoney(category.total)}</strong>
                  </div>

                  <div className={styles.categoryTrack}>
                    <div
                      className={styles.categoryFill}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Forms */}
      {activeForm && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setActiveForm("")}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeading}>
              <h3>
                {activeForm === "expense"
                  ? "Add Expense"
                  : activeForm === "category"
                    ? "Add Category"
                    : activeForm === "income"
                      ? "Edit Monthly Income"
                      : "Edit Expense Limit"}
              </h3>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setActiveForm("")}
              >
                ×
              </button>
            </div>

            {activeForm === "expense" && (
              <form onSubmit={handleExpenseSubmit}>
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount"
                  required
                />

                <label>Category</label>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {alphabeticalCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className={styles.addCategoryLink}
                  onClick={() => setActiveForm("category")}
                >
                  + Add a new category
                </button>

                <label>Date</label>
                <input type="date" value={selectedDate || ""} readOnly />

                <label>Note (optional)</label>
                <input
                  type="text"
                  maxLength={120}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="What was this expense for?"
                />

                <small className={styles.characterCount}>
                  {note.length}/120 characters
                </small>

                <button className={styles.submitButton} type="submit">
                  Save Expense
                </button>
              </form>
            )}

            {activeForm === "category" && (
              <form onSubmit={handleCategorySubmit}>
                <label>Category Name</label>
                <input
                  type="text"
                  maxLength={30}
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="e.g. Education"
                  required
                />

                <label>Choose Colour</label>
                <input
                  type="color"
                  value={newColor}
                  onChange={(event) => setNewColor(event.target.value)}
                />

                <button className={styles.submitButton} type="submit">
                  Save Category
                </button>
              </form>
            )}

            {(activeForm === "income" || activeForm === "limit") && (
              <form onSubmit={handleSettingSubmit}>
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settingAmount}
                  onChange={(event) => setSettingAmount(event.target.value)}
                  placeholder="Enter amount"
                  required
                />

                <button className={styles.submitButton} type="submit">
                  Save Changes
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
