
"use client";

import { useMemo, useState } from "react";
import styles from "./Transactions.module.css";

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  const date = parseDate(value);
  if (!date) return value || "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function Transactions({
  expenses = [],
  categories = [],
  onDeleteExpense,
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("this-month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const filteredExpenses = useMemo(() => {
    const now = parseDate(today());
    let startDate = null;
    let endDate = null;

    if (dateFilter === "this-month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (dateFilter === "this-week") {
      const day = now.getDay();
      const mondayOffset = day === 0 ? 6 : day - 1;

      startDate = new Date(now);
      startDate.setDate(now.getDate() - mondayOffset);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (dateFilter === "last-month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (dateFilter === "custom") {
      startDate = customStart ? parseDate(customStart) : null;
      endDate = customEnd ? parseDate(customEnd) : null;
    }

    const searchTerm = search.trim().toLowerCase();

    return expenses
      .filter((expense) => {
        const category = categories.find(
          (item) => item.id === expense.categoryId
        );

        const matchesSearch =
          !searchTerm ||
          (expense.note || "").toLowerCase().includes(searchTerm) ||
          (category?.name || "").toLowerCase().includes(searchTerm);

        const matchesCategory =
          categoryFilter === "all" ||
          expense.categoryId === categoryFilter;

        const expenseDate = parseDate(expense.date);

        const matchesStart =
          !startDate || (expenseDate && expenseDate >= startDate);

        const matchesEnd =
          !endDate || (expenseDate && expenseDate <= endDate);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStart &&
          matchesEnd
        );
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [
    expenses,
    categories,
    search,
    categoryFilter,
    dateFilter,
    customStart,
    customEnd,
  ]);

  function handleDelete(expense) {
    const confirmed = window.confirm(
      `Delete this ${formatMoney(expense.amount)} transaction? This action cannot be undone.`
    );

    if (confirmed) {
      onDeleteExpense?.(expense.id);
    }
  }

  function handleExportCSV() {
    if (filteredExpenses.length === 0) return;

    const rows = [
      ["Date", "Category", "Note", "Amount"],
      ...filteredExpenses.map((expense) => {
        const category = categories.find(
          (item) => item.id === expense.categoryId
        );

        return [
          expense.date || "",
          category?.name || "Unknown category",
          expense.note || "",
          Number(expense.amount || 0).toFixed(2),
        ];
      }),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "expense-transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.transactions}>
      <section className={styles.transactionCard}>
        <div className={styles.heading}>
          <div>
            <h2>All Transactions</h2>
            <p>Search, filter and manage your expenses</p>
          </div>

          <button
            type="button"
            className={styles.exportButton}
            onClick={handleExportCSV}
            disabled={filteredExpenses.length === 0}
          >
            ↓ Export CSV
          </button>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search notes or categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All Categories</option>

            {categories
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>

          <select
            aria-label="Filter by date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          >
            <option value="this-month">This Month</option>
            <option value="this-week">This Week</option>
            <option value="last-month">Last Month</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateFilter === "custom" && (
          <div className={styles.customRange}>
            <label>
              From
              <input
                type="date"
                value={customStart}
                max={customEnd || undefined}
                onChange={(event) => setCustomStart(event.target.value)}
              />
            </label>

            <label>
              To
              <input
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(event) => setCustomEnd(event.target.value)}
              />
            </label>
          </div>
        )}

        <div className={styles.resultsLine}>
          <span>
            Showing <strong>{filteredExpenses.length}</strong> transactions
          </span>

          {(search ||
            categoryFilter !== "all" ||
            dateFilter !== "this-month") && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setDateFilter("this-month");
                setCustomStart("");
                setCustomEnd("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredExpenses.length === 0 ? (
          <div className={styles.emptyState}>
            <span>▤</span>
            <h3>No transactions found</h3>
            <p>
              {expenses.length === 0
                ? "Your expenses will appear here when you add them."
                : "Try changing your search or filters to find an expense."}
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className={styles.amountColumn}>Amount</th>
                  <th className={styles.actionColumn}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((expense) => {
                  const category = categories.find(
                    (item) => item.id === expense.categoryId
                  );

                  return (
                    <tr key={expense.id}>
                      <td>
                        <div className={styles.transactionName}>
                          <span
                            className={styles.categoryDot}
                            style={{
                              backgroundColor: category?.color || "#b8b2c9",
                            }}
                          />

                          <div>
                            <strong>
                              {expense.note?.trim() || "Expense"}
                            </strong>
                            <small>Expense</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={styles.categoryName}>
                          {category?.name || "Unknown"}
                        </span>
                      </td>

                      <td className={styles.dateCell}>
                        {formatDate(expense.date)}
                      </td>

                      <td className={styles.amountCell}>
                        − {formatMoney(expense.amount)}
                      </td>

                      <td>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          title="Delete transaction"
                          aria-label={`Delete transaction ${expense.note || expense.id}`}
                          onClick={() => handleDelete(expense)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
