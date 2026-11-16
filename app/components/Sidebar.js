
"use client";

import styles from "./Sidebar.module.css";

const menuItems = [
  { id: "overview", label: "Overview", icon: "◫" },
  { id: "transactions", label: "Transactions", icon: "↔" },
  { id: "categories", label: "Categories", icon: "▦" },
  { id: "analytics", label: "Analytics", icon: "▥" },
];

export default function Sidebar({
  activeSection,
  onNavigate,
  isOpen,
  onClose,
}) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          isOpen ? styles.sidebarOpen : ""
        }`}
        aria-label="Main navigation"
      >
        <div className={styles.brand}>
          <img
            src="/icon-192.png"
            alt="Kubera logo"
            className={styles.logo}
          />

          <div className={styles.brandText}>
            <h2>Kubera Expense Tracker</h2>
            <p>Manage your money</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className={styles.menuLabel}>MENU</div>

        <nav className={styles.navigation}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${
                activeSection === item.id ? styles.active : ""
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <p>Your money, your control.</p>
        </div>
      </aside>
    </>
  );
}
