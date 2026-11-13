
"use client";

import { useState } from "react";
import styles from "./Categories.module.css";

const DEFAULT_COLOR = "#8B5CF6";

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
        "This category has existing transactions and cannot be deleted."
      );
      return;
    }

    if (category.id === "other") {
      window.alert("The Other category cannot be deleted.");
      return;
    }

    if (window.confirm(`Delete "${category.name}"?`)) {
      onDeleteCategory?.(category.id);
    }
  }

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.id === "other") return 1;
    if (b.id === "other") return -1;
    return a.name.localeCompare(b.name);
  });

  return (
    <section className={styles.categoriesPage}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Your Categories</h2>
          <p>Manage your spending categories.</p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={openAddModal}
        >
          <span>+</span> Add Category
        </button>
      </div>

      <div className={styles.categoryList}>
        {sortedCategories.map((category) => {
          const isUsed = expenses.some(
            (expense) => expense.categoryId === category.id
          );

          const cannotDelete = isUsed || category.id === "other";

          return (
            <div className={styles.categoryRow} key={category.id}>
              <h3>{category.name}</h3>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  title="Edit category"
                  aria-label={`Edit ${category.name}`}
                  onClick={() => openEditModal(category)}
                >
                  ✎
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
                  disabled={cannotDelete}
                  onClick={() => handleDelete(category)}
                >
                  ×
                </button>
              </div>
            </div>
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
                    ? "Update your category name and colour."
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
