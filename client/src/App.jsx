import { useEffect, useMemo, useState } from "react";
import API from "./services/api";
import Navbar from "./components/Navbar";

function App() {
  const defaultCategories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Groceries",
  "Salary",
  "Other",
 ];

 const categoryOptions = defaultCategories;
  const [expenses, setExpenses] = useState([]);
  const [_categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    categoryBreakdown: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    type: "",
    text: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    description: "",
  });

  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("expense-tracker-theme");

    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    } else {
      setIsDarkMode(false);
      document.body.classList.remove("dark-mode");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;

      if (next) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("expense-tracker-theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("expense-tracker-theme", "light");
      }

      return next;
    });
  };

  const showToast = (type, text) => {
    setToast({ show: true, type, text });

    setTimeout(() => {
      setToast({ show: false, type: "", text: "" });
    }, 2500);
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();

      if (filters.category) {
        queryParams.append("category", filters.category);
      }
      if (filters.startDate) {
        queryParams.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append("endDate", filters.endDate);
      }

      const url = queryParams.toString()
        ? `/expenses?${queryParams.toString()}`
        : "/expenses";

      const response = await API.get(url);
      setExpenses(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch expenses");
      console.error("Fetch expenses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/expenses/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await API.get("/expenses/summary");
      setSummary(response.data);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
    });
    showToast("success", "Filters cleared");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      category: "",
      date: "",
      description: "",
    });
    setEditId(null);
  };

  const refreshData = async () => {
    await fetchExpenses();
    await fetchSummary();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    if (
      !formData.title ||
      !formData.amount ||
      !formData.category ||
      !formData.date
    ) {
      showToast("error", "Please fill all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (editId) {
        await API.put(`/expenses/${editId}`, payload);
        showToast("success", "Expense updated successfully");
      } else {
        await API.post("/expenses", payload);
        showToast("success", "Expense added successfully");
      }

      resetForm();
      await refreshData();
    } catch (err) {
      console.error("Save expense error:", err);
      showToast("error", "Failed to save expense");
    }
  };

  const handleEdit = (expense) => {
    setEditId(expense._id);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date ? expense.date.split("T")[0] : "",
      description: expense.description || "",
    });
    showToast("success", "Expense loaded for editing");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/expenses/${id}`);

      if (editId === id) {
        resetForm();
      }

      await refreshData();
      showToast("success", "Expense deleted successfully");
    } catch (err) {
      console.error("Delete expense error:", err);
      showToast("error", "Failed to delete expense");
    }
  };

  const displayedExpenses = useMemo(() => {
    const filteredBySearch = expenses.filter((expense) =>
      expense.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    return filteredBySearch.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, searchTerm]);

  const formatExpenseDate = (dateValue) => {
    if (!dateValue) return "No date";

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderSkeletonCards = () => {
    return Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="expense-skeleton-card">
        <div className="skeleton skeleton-title" />
        <div className="skeleton-row">
          <div className="skeleton skeleton-pill" />
          <div className="skeleton skeleton-date" />
        </div>
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
        <div className="skeleton-button-row">
          <div className="skeleton skeleton-button" />
          <div className="skeleton skeleton-button" />
        </div>
      </div>
    ));
  };
  // ==============================================
  return (
    <div className="page-shell">
      <Navbar toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        />

      {toast.show && (
        <div className={`toast-box toast-${toast.type}`}>
          <span>{toast.text}</span>
        </div>
      )}

      <div className="app-container">
        <header className="hero-section">
          <div className="top-utility-bar">
            <div className="hero-badge">Full Stack Expense Dashboard</div>
          </div>

          <h1 className="app-title animated-title">
            <span>Smart</span>
            <span>Expense</span>
            <span>Tracker</span>
          </h1>

          <p className="app-subtitle">
            Manage, search, filter, and organize your expenses with a clean
            professional dashboard.
          </p>

          <div className="top-search-wrap">
            <div className="search-shell">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search expenses by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="top-search-input"
              />
            </div>
          </div>
        </header>

        <aside className={`sidebar-panel left ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">Quick Controls</h2>
          </div>

          <div className="sidebar-section">
            <div className="toggle-row">
              <div>
                <h3 className="sidebar-section-title">Dark Mode</h3>
                <p className="sidebar-helper-text">
                  Switch between light and dark theme.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleDarkMode}
                className={`theme-arrow-toggle ${isDarkMode ? "active" : ""}`}
                aria-label="Toggle dark mode"
              >
                <span className="theme-arrow-text">
                  {isDarkMode ? "Dark" : "Light"}
                </span>
                <span className="theme-arrow-circle">
                  {isDarkMode ? "→" : "←"}
                </span>
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Filters</h3>

            <div className="sidebar-field-stack">
              <div className="field-group">
                <label className="field-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Categories</option>

                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="form-control"
                />
              </div>

              <div className="field-group">
                <label className="field-label">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="form-control"
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Category Breakdown</h3>

            {Object.keys(summary.categoryBreakdown).length === 0 ? (
              <p className="empty-text">No category data available yet.</p>
            ) : (
              <div className="breakdown-list sidebar-breakdown-list">
                {Object.entries(summary.categoryBreakdown).map(
                  ([category, amount]) => (
                    <div key={category} className="breakdown-item">
                      <span>{category}</span>
                      <strong>₹{amount}</strong>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </aside>

        {isSidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <section className="dashboard-box-grid">
          <div className="card dashboard-box stat-box">
            <p className="summary-label">Total Expenses</p>
            <h3 className="summary-value">{summary.totalExpenses}</h3>
          </div>

          <div className="card dashboard-box stat-box">
            <p className="summary-label">Total Amount</p>
            <h3 className="summary-value">₹{summary.totalAmount}</h3>
          </div>

          <div className="card dashboard-box form-box">
            <div className="section-heading-row">
              <h2 className="section-title">
                {editId ? "Edit Expense" : "Add Expense"}
              </h2>
              {editId && <span className="edit-badge">Editing Mode</span>}
            </div>

            <form onSubmit={handleSubmit} className="form-stack">
              <div className="field-group">
                <label className="field-label">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter expense title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Amount</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Description</label>
                <textarea
                  name="description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="form-control textarea-control"
                />
              </div>

              <div className="button-row">
                <button type="submit" className="btn btn-primary">
                  {editId ? "Update Expense" : "Add Expense"}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card dashboard-box list-box">
            <div className="section-heading-row">
              <h2 className="section-title">All Expenses</h2>
              <span className="count-badge">
                {displayedExpenses.length} item
                {displayedExpenses.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading && <div className="expense-list">{renderSkeletonCards()}</div>}

            {!loading && error && (
              <div className="empty-state-box error-state-box">
                <h3 className="empty-state-title">Unable to load expenses</h3>
                <p className="empty-state-text">
                  Please check your backend or database connection and try again.
                </p>
              </div>
            )}

            {!loading && !error && displayedExpenses.length === 0 && (
              <div className="empty-state-box">
                <h3 className="empty-state-title">No expenses yet</h3>
                <p className="empty-state-text">
                  Start by adding your first expense. Your items will appear
                  here automatically.
                </p>
              </div>
            )}

            {!loading && !error && displayedExpenses.length > 0 && (
              <div className="expense-list">
                {displayedExpenses.map((expense) => (
                  <article key={expense._id} className="expense-card">
                    <div className="expense-card-top">
                      <h3 className="expense-title">{expense.title}</h3>
                      <span className="expense-amount">₹{expense.amount}</span>
                    </div>

                    <div className="expense-meta">
                      <span className="pill">{expense.category}</span>
                      <span className="meta-date">
                        {formatExpenseDate(expense.date)}
                      </span>
                    </div>

                    <p className="expense-description">
                      <strong>Description:</strong>{" "}
                      {expense.description && expense.description.trim() !== ""
                        ? expense.description
                        : "No description"}
                    </p>

                    <div className="button-row">
                      <button
                        type="button"
                        onClick={() => handleEdit(expense)}
                        className="btn btn-edit"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(expense._id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;