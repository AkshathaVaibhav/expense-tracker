
"use client";

import styles from "./Sidebar.module.css";

const menuItems = [
  { id: "overview", label: "Overview", icon: "◫" },
  { id: "transactions", label: "Transactions", icon: "↔" },
  { id: "categories", label: "Categories", icon: "▦" },
  { id: "analytics", label: "Analytics", icon: "▥" },
];

export default function Sidebar({ activeSection, onNavigate }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>₹</div>
        <div>
          <h2>Expense Tracker</h2>
          <p>Manage your money</p>
        </div>
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
  );
}
