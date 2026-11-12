"use client";

import { useMemo, useState } from "react";
import styles from "./Categories.module.css";

const DEFAULT_COLOR = "#8B5CF6";

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function Categories({
  expenses = [],
  categories = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [error, setError] = useState("");

  const categoryStats = useMemo(() => {
    return categories
      .map((category) => {
        const categoryExpenses = expenses.filter(
          (expense) => expense.categoryId === category.id
        );

        const total = categoryExpenses.reduce(
          (sum, expense) => sum + Number(expense.amount || 0),
          0
        );

        return {
          ...category,
          total,
          transactionCount: categoryExpenses.length,
        };
      })
      .sort((a, b) => {
        if (a.id === "other") return 1;
        if (b.id === "other") return -1;
        return a.name.localeCompare(b.name);
      });
  }, [categories, expenses]);

  function openAddModal() {
    setEditingCategory(null);
    setName("");
    setColor(DEFAULT_COLOR);
    setError("");
    setShowModal(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCategory(null);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a category name.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === trimmedName.toLowerCase() &&
        category.id !== editingCategory?.id
    );

    if (duplicate) {
      setError("This category already exists.");
      return;
    }

    if (editingCategory) {
      onUpdateCategory?.({
        ...editingCategory,
        name: trimmedName,
        color,
      });
    } else {
      onAddCategory?.({
        id: `category-${Date.now()}`,
        name: trimmedName,
        color,
      });
    }

    closeModal();
  }

  function handleDelete(category) {
    const isUsed = expenses.some(
      (expense) => expense.categoryId === category.id
    );

    if (isUsed) {
      window.alert(
        "This category has existing transactions. It cannot be deleted."
      );
      return;
    }

    if (category.id === "other") {
      window.alert("The Other category cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (confirmed) {
      onDeleteCategory?.(category.id);
    }
  }

  return (
    <section className={styles.categoriesPage}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Your Categories</h2>
          <p>Organise and manage your spending categories.</p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={openAddModal}
        >
          <span>+</span> Add Category
        </button>
      </div>

      <div className={styles.categoryGrid}>
        {categoryStats.map((category) => {
          const isUsed = category.transactionCount > 0;

          return (
            <article className={styles.categoryCard} key={category.id}>
              <div className={styles.cardTop}>
                <div
                  className={styles.categoryIcon}
                  style={{
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                  }}
                >
                  <span />
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    title="Edit category"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => openEditModal(category)}
                  >
                    <span className="editIcon">✎</span>
                  </button>

                  <button
                    type="button"
                    title={
                      category.id === "other"
                        ? "Other cannot be deleted"
                        : isUsed
                          ? "Category is being used"
                          : "Delete category"
                    }
                    aria-label={`Delete ${category.name}`}
                    disabled={isUsed || category.id === "other"}
                    onClick={() => handleDelete(category)}
                  >
                    <span>×</span>
                  </button>
                </div>
              </div>

              <h3>{category.name}</h3>

              <div className={styles.categoryDetails}>
                <div>
                  <span>Total spent</span>
                  <strong>{formatMoney(category.total)}</strong>
                </div>

                <div>
                  <span>Transactions</span>
                  <strong>{category.transactionCount}</strong>
                </div>
              </div>

              {isUsed && (
                <div className={styles.usageNote}>
                  This category is currently in use
                </div>
              )}
            </article>
          );
        })}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
                <p>
                  {editingCategory
                    ? "Update your category details."
                    : "Create a new spending category."}
                </p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="categoryName">Category Name</label>
              <input
                id="categoryName"
                type="text"
                placeholder="e.g. Education"
                value={name}
                maxLength={30}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />

              <label htmlFor="categoryColor">Choose Colour</label>
              <div className={styles.colorPicker}>
                <input
                  id="categoryColor"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                />
                <span>{color.toUpperCase()}</span>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className={styles.saveButton}>
                  {editingCategory ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}