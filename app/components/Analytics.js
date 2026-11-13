
"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import styles from "./Analytics.module.css";

const COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#F59E0B",
  "#EC4899",
  "#10B981",
  "#F97316",
  "#64748B",
  "#06B6D4",
];

function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompact(amount) {
  return `₹${new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)}`;
}

function getMonthLabel(date) {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

export default function Analytics({
  expenses = [],
  categories = [],
  monthlySettings = {},
  selectedDate,
}) {
  const anchorDate = selectedDate
    ? parseDate(selectedDate)
    : new Date();

  const currentMonthKey = getMonthKey(anchorDate);

  const currentSettings = monthlySettings[currentMonthKey] || {
    income: 0,
    limit: 0,
  };

  const monthlyIncome = Number(currentSettings.income) || 0;
  const expenseLimit = Number(currentSettings.limit) || 0;

  const analytics = useMemo(() => {
    const currentYear = anchorDate.getFullYear();
    const currentMonth = anchorDate.getMonth();

    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    const monthExpenses = expenses.filter((expense) => {
      return expense.date?.slice(0, 7) === currentMonthKey;
    });

    const totalSpent = monthExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    const transactionCount = monthExpenses.length;

    const averageExpense = transactionCount
      ? totalSpent / transactionCount
      : 0;

    const highestExpense = monthExpenses.reduce(
      (highest, expense) =>
        Number(expense.amount || 0) >
        Number(highest?.amount || 0)
          ? expense
          : highest,
      null
    );

    const savings = monthlyIncome - totalSpent;

    const savingsRate = monthlyIncome > 0
      ? (savings / monthlyIncome) * 100
      : null;

    const budgetUsed = expenseLimit > 0
      ? (totalSpent / expenseLimit) * 100
      : null;

    const remainingBudget = expenseLimit - totalSpent;

    const categoryData = categories
      .map((category) => {
        const amount = monthExpenses
          .filter((expense) => expense.categoryId === category.id)
          .reduce(
            (sum, expense) => sum + Number(expense.amount || 0),
            0
          );

        return {
          name: category.name,
          amount,
          color: category.color,
        };
      })
      .filter((category) => category.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const sixMonthData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const key = getMonthKey(date);

      const monthTotal = expenses
        .filter((expense) => expense.date?.slice(0, 7) === key)
        .reduce(
          (sum, expense) => sum + Number(expense.amount || 0),
          0
        );

      const settings = monthlySettings[key] || {};

      sixMonthData.push({
        month: getMonthLabel(date),
        expenses: monthTotal,
        income: Number(settings.income) || 0,
      });
    }

    const previousMonthDate = new Date(
      currentYear,
      currentMonth - 1,
      1
    );

    const previousMonthKey = getMonthKey(previousMonthDate);

    const previousMonthSpent = expenses
      .filter(
        (expense) =>
          expense.date?.slice(0, 7) === previousMonthKey
      )
      .reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      );

    let monthlyChange = null;

    if (previousMonthSpent > 0) {
      monthlyChange =
        ((totalSpent - previousMonthSpent) / previousMonthSpent) *
        100;
    } else if (totalSpent > 0) {
      monthlyChange = null;
    }

    const weekdayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const weekdayTotals = weekdayNames.map((day) => ({
      day: day.slice(0, 3),
      total: 0,
      days: 0,
    }));

    const firstTrendMonth = new Date(
      currentYear,
      currentMonth - 5,
      1
    );

    const lastTrendDay = new Date(
      currentYear,
      currentMonth + 1,
      0
    );

    for (
      let date = new Date(firstTrendMonth);
      date <= lastTrendDay;
      date.setDate(date.getDate() + 1)
    ) {
      weekdayTotals[date.getDay()].days += 1;
    }

    expenses.forEach((expense) => {
      if (!expense.date) return;

      const expenseDate = parseDate(expense.date);

      if (
        expenseDate < firstTrendMonth ||
        expenseDate > lastTrendDay
      ) {
        return;
      }

      weekdayTotals[expenseDate.getDay()].total +=
        Number(expense.amount || 0);
    });

    const weekdayData = weekdayTotals.map((item) => ({
      day: item.day,
      average: item.days
        ? item.total / item.days
        : 0,
    }));

    const highestWeekday = weekdayData.reduce(
      (highest, day) =>
        day.average > highest.average ? day : highest,
      weekdayData[0]
    );

    const highestCategory = categoryData[0] || null;

    const daysElapsed = Math.max(
      1,
      Math.min(anchorDate.getDate(), monthEnd.getDate())
    );

    const projectedMonthlySpend =
      (totalSpent / daysElapsed) * monthEnd.getDate();

    return {
      monthExpenses,
      totalSpent,
      transactionCount,
      averageExpense,
      highestExpense,
      savings,
      savingsRate,
      budgetUsed,
      remainingBudget,
      categoryData,
      sixMonthData,
      previousMonthSpent,
      monthlyChange,
      weekdayData,
      highestWeekday,
      highestCategory,
      projectedMonthlySpend,
      daysElapsed,
      monthDays: monthEnd.getDate(),
      monthStart,
    };
  }, [
    expenses,
    categories,
    monthlySettings,
    currentMonthKey,
    anchorDate,
  ]);

  const {
    totalSpent,
    transactionCount,
    averageExpense,
    highestExpense,
    savings,
    savingsRate,
    budgetUsed,
    remainingBudget,
    categoryData,
    sixMonthData,
    monthlyChange,
    weekdayData,
    highestWeekday,
    highestCategory,
    projectedMonthlySpend,
    daysElapsed,
    monthDays,
  } = analytics;

  const insights = [];

  if (transactionCount > 0) {
    if (highestCategory) {
      insights.push({
        icon: "category",
        title: "Top spending category",
        description: `${highestCategory.name} accounts for ${Math.round(
          (highestCategory.amount / totalSpent) * 100
        )}% of your spending this month.`,
      });
    }

    if (monthlyChange !== null) {
      insights.push({
        icon: monthlyChange > 0 ? "up" : "down",
        title:
          monthlyChange > 0
            ? "Spending increased"
            : monthlyChange < 0
              ? "Spending decreased"
              : "Spending unchanged",
        description:
          monthlyChange === 0
            ? "Your spending is the same as last month."
            : `Your spending ${
                monthlyChange > 0 ? "increased" : "decreased"
              } by ${Math.abs(monthlyChange).toFixed(
                1
              )}% compared with last month.`,
      });
    }

    if (expenseLimit > 0) {
      insights.push({
        icon: remainingBudget < 0 ? "warning" : "budget",
        title:
          remainingBudget < 0
            ? "Budget exceeded"
            : "Budget status",
        description:
          remainingBudget < 0
            ? `You are ${formatMoney(
                Math.abs(remainingBudget)
              )} over your expense limit.`
            : `${formatMoney(
                remainingBudget
              )} remains in your monthly budget.`,
      });
    }

    if (highestWeekday && highestWeekday.average > 0) {
      insights.push({
        icon: "calendar",
        title: "Highest average spending day",
        description: `${highestWeekday.day} has your highest average daily spending over the six-month period.`,
      });
    }
  }

  return (
    <section className={styles.analyticsPage}>
      <div className={styles.intro}>
        <div>
          <h2>Financial Insights</h2>
          <p>
            Explore your spending habits and understand your finances.
          </p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Expenses</span>
          <strong>{formatMoney(totalSpent)}</strong>
          <span className={styles.summaryHint}>Selected month</span>
        </article>

        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Average Expense</span>
          <strong>{formatMoney(averageExpense)}</strong>
          <span className={styles.summaryHint}>Per transaction</span>
        </article>

        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Highest Expense</span>
          <strong>
            {formatMoney(Number(highestExpense?.amount || 0))}
          </strong>
          <span className={styles.summaryHint}>
            {highestExpense
              ? highestExpense.note || "Largest transaction"
              : "No transactions yet"}
          </span>
        </article>

        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Savings Rate</span>
          <strong>
            {savingsRate === null
              ? "—"
              : `${savingsRate.toFixed(1)}%`}
          </strong>
          <span className={styles.summaryHint}>
            {monthlyIncome > 0
              ? `${formatMoney(savings)} savings`
              : "Add monthly income"}
          </span>
        </article>
      </div>

      <div className={styles.chartGrid}>
        <article className={styles.chartCard}>
          <div className={styles.cardHeading}>
            <div>
              <h3>Monthly Spending Trend</h3>
              <p>Expenses over the last six months</p>
            </div>
          </div>

          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sixMonthData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eeedf4"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#9290a2", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatCompact}
                  tick={{ fill: "#9290a2", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />
                <Tooltip
                  formatter={(value) => formatMoney(value)}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #eeedf4",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#8065D8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8065D8" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={styles.chartCard}>
          <div className={styles.cardHeading}>
            <div>
              <h3>Category Distribution</h3>
              <p>Where your money goes this month</p>
            </div>
          </div>

          {categoryData.length > 0 ? (
            <>
              <div className={styles.donutArea}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="name"
                      innerRadius="57%"
                      outerRadius="82%"
                      paddingAngle={3}
                    >
                      {categoryData.map((category, index) => (
                        <Cell
                          key={category.name}
                          fill={category.color || COLORS[index % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatMoney(value)}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #eeedf4",
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.categoryBreakdown}>
                {categoryData.slice(0, 5).map((category, index) => (
                  <div
                    className={styles.categoryLine}
                    key={category.name}
                  >
                    <span
                      className={styles.categoryDot}
                      style={{
                        backgroundColor:
                          category.color || COLORS[index % COLORS.length],
                      }}
                    />
                    <span>{category.name}</span>
                    <strong>{formatMoney(category.amount)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.emptyChart}>
              No category spending to display for this month.
            </div>
          )}
        </article>
      </div>

      <div className={styles.chartGrid}>
        <article className={styles.chartCard}>
          <div className={styles.cardHeading}>
            <div>
              <h3>Income vs Expenses</h3>
              <p>Monthly comparison over six months</p>
            </div>
          </div>

          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sixMonthData} barGap={5}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eeedf4"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#9290a2", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatCompact}
                  tick={{ fill: "#9290a2", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />
                <Tooltip
                  formatter={(value) => formatMoney(value)}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #eeedf4",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#45B9A2"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#8065D8"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={styles.chartCard}>
          <div className={styles.cardHeading}>
            <div>
              <h3>Weekly Spending Pattern</h3>
              <p>Average daily spending by weekday</p>
            </div>
          </div>

          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eeedf4"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#9290a2", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatCompact}
                  tick={{ fill: "#9290a2", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />
                <Tooltip
                  formatter={(value) => formatMoney(value)}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #eeedf4",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="average"
                  name="Average spending"
                  fill="#F2A65A"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className={styles.bottomGrid}>
        <article className={styles.budgetCard}>
          <div className={styles.cardHeading}>
            <div>
              <h3>Budget Utilization</h3>
              <p>Your selected month's budget progress</p>
            </div>
          </div>

          {expenseLimit > 0 ? (
            <>
              <div className={styles.budgetNumbers}>
                <div>
                  <span>Spent</span>
                  <strong>{formatMoney(totalSpent)}</strong>
                </div>
                <div>
                  <span>Budget limit</span>
                  <strong>{formatMoney(expenseLimit)}</strong>
                </div>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${
                    budgetUsed > 100 ? styles.overBudget : ""
                  }`}
                  style={{
                    width: `${Math.min(budgetUsed, 100)}%`,
                  }}
                />
              </div>

              <div className={styles.budgetFooter}>
                <strong>
                  {budgetUsed.toFixed(1)}% used
                </strong>
                <span>
                  {remainingBudget >= 0
                    ? `${formatMoney(remainingBudget)} remaining`
                    : `${formatMoney(Math.abs(remainingBudget))} over budget`}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.emptyChart}>
              Set an expense limit in Overview to see your budget analysis.
            </div>
          )}
        </article>

        <article className={styles.insightsCard}>
          <div className={styles.cardHeading}>
            <div>
              <h3>Spending Insights</h3>
              <p>Automatically generated from your data</p>
            </div>
          </div>

          {insights.length > 0 ? (
            <div className={styles.insightList}>
              {insights.map((insight, index) => (
                <div className={styles.insightItem} key={index}>
                  <span className={styles.insightIcon}>
                    {insight.icon === "up" || insight.icon === "warning"
                      ? "↗"
                      : insight.icon === "down"
                        ? "↘"
                        : insight.icon === "calendar"
                          ? "▦"
                          : insight.icon === "budget"
                            ? "✓"
                            : "◉"}
                  </span>
                  <div>
                    <strong>{insight.title}</strong>
                    <p>{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyChart}>
              Add some expenses to discover your spending patterns.
            </div>
          )}
        </article>
      </div>

      <article className={styles.projectionCard}>
        <div>
          <h3>Estimated Monthly Spending</h3>
          <p>
            Based on your average daily spending so far this month.
          </p>
        </div>
        <strong>
          {transactionCount > 0
            ? formatMoney(projectedMonthlySpend)
            : "—"}
        </strong>
        <span>
          {transactionCount > 0
            ? `Based on ${daysElapsed} of ${monthDays} days`
            : "Add expenses to see an estimate"}
        </span>
      </article>
    </section>
  );
}
