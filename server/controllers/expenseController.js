const Expense = require("../models/Expense");

const getExpenses = async (req, res) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.date = {};

      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate);
      }
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Server error while fetching expenses" });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    console.error("Get expense by id error:", error);
    res.status(500).json({ message: "Server error while fetching expense" });
  }
};

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      description: description || "",
      user: req.user._id,
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ message: "Server error while creating expense" });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.title = title ?? expense.title;
    expense.amount = amount ?? expense.amount;
    expense.category = category ?? expense.category;
    expense.date = date ?? expense.date;
    expense.description = description ?? expense.description;

    const updatedExpense = await expense.save();

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ message: "Server error while updating expense" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Server error while deleting expense" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Expense.distinct("category", {
      user: req.user._id,
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
};

const getSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const key = expense.category || "Other";
      acc[key] = (acc[key] || 0) + Number(expense.amount);
      return acc;
    }, {});

    res.status(200).json({
      totalExpenses,
      totalAmount,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ message: "Server error while fetching summary" });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getCategories,
  getSummary,
};