// Input fields
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");

// Buttons
const addButton = document.getElementById("addBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Summary section
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

// Stats
const totalTransactions = document.getElementById("totalTransactions");
const highestIncome = document.getElementById("highestIncome");
const highestExpense = document.getElementById("highestExpense");
const averageExpense = document.getElementById("averageExpense");

// List + filters
const transactionList = document.getElementById("transactionList");
const statusMessage = document.getElementById("statusMessage");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");

// Budget section
const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const budgetAmount = document.getElementById("budgetAmount");
const spentAmount = document.getElementById("spentAmount");
const remainingAmount = document.getElementById("remainingAmount");
const progressFill = document.getElementById("progressFill");
const budgetWarning = document.getElementById("budgetWarning");

// App state
let transactions = [];
let editId = null;
let monthlyBudget = 0;

let categoryChart;
let monthlyChart;

const CHART_COLORS = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9c74f", "#90be6d", "#ff9f1c", "#a78bfa", "#fb7185"];

function drawCategoryChart() {
    if (categoryChart) categoryChart.destroy();

    const expenses = transactions.filter(t => t.type === "Expense");
    if (!expenses.length) return;

    const categoryTotals = {};
    for (const t of expenses) {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const ctx = document.getElementById("categoryChart").getContext("2d");
    categoryChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: CHART_COLORS.slice(0, labels.length),
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } }
        }
    });
}

function drawMonthlyChart() {
    if (monthlyChart) monthlyChart.destroy();

    const expenses = transactions.filter(t => t.type === "Expense");
    if (!expenses.length) return;

    const monthlyTotals = {};
    for (const t of expenses) {
        const label = new Date(t.date).toLocaleString("en-US", { month: "short", year: "numeric" });
        monthlyTotals[label] = (monthlyTotals[label] || 0) + t.amount;
    }

    const ctx = document.getElementById("monthlyChart").getContext("2d");
    monthlyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(monthlyTotals),
            datasets: [{
                label: "Monthly Expense",
                data: Object.values(monthlyTotals),
                backgroundColor: "#ff6b6b",
                borderColor: "#ff4d4d",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
        }
    });
}

function refreshCharts() {
    drawCategoryChart();
    drawMonthlyChart();
}

function updateBudget() {
    const totalExpense = transactions
        .filter(t => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const remainingBudget = monthlyBudget - totalExpense;
    const budgetUsed = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
    const percentage = Math.min(100, Math.max(0, budgetUsed));

    if (budgetAmount) budgetAmount.textContent = `Rs. ${monthlyBudget}`;
    if (spentAmount) spentAmount.textContent = `Rs. ${totalExpense}`;
    if (remainingAmount) remainingAmount.textContent = `Rs. ${remainingBudget}`;

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
        progressFill.style.backgroundColor =
            percentage <= 60 ? "#4caf50" : percentage <= 90 ? "#f4b400" : "#f44336";
    }

    if (budgetWarning) {
        if (monthlyBudget === 0) {
            budgetWarning.textContent = "No Budget Set";
        } else if (totalExpense < monthlyBudget) {
            budgetWarning.textContent = `You still have Rs. ${remainingBudget} remaining.`;
        } else if (totalExpense === monthlyBudget) {
            budgetWarning.textContent = "You have reached your budget.";
        } else {
            budgetWarning.textContent = `Budget Exceeded by Rs. ${Math.abs(remainingBudget)}`;
        }
    }
}

// --- custom cursor ---
const cursorTrail = document.createElement("div");
cursorTrail.className = "cursor-trail";
document.body.appendChild(cursorTrail);

const cursorCore = document.createElement("div");
cursorCore.className = "cursor-core";
document.body.appendChild(cursorCore);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let prevMouseX = mouseX;
let prevMouseY = mouseY;
let trailX = mouseX, trailY = mouseY;
let trailTargetX = mouseX, trailTargetY = mouseY;
let trailAngle = 0;
let moveAngle = 0;

const interactiveSelector = [
    "button", "a", "input", "select", "textarea",
    ".card", ".transaction-item", ".brand-badge", ".chart-box",
    ".empty-state", ".action-buttons", ".edit-btn", ".delete-btn",
    "[role='button']"
].join(", ");

const lerp = (start, end, amount) => start + (end - start) * amount;

function lerpAngle(start, end, amount) {
    const delta = ((end - start + Math.PI) % (Math.PI * 2)) - Math.PI;
    return start + delta * amount;
}

function animateCursor() {
    trailX = lerp(trailX, trailTargetX, 0.16);
    trailY = lerp(trailY, trailTargetY, 0.16);
    trailAngle = lerpAngle(trailAngle, moveAngle, 0.2);

    cursorTrail.style.left = `${trailX}px`;
    cursorTrail.style.top = `${trailY}px`;
    cursorTrail.style.transform = `translate(-50%, -50%) rotate(${trailAngle}rad)`;

    cursorCore.style.left = `${mouseX}px`;
    cursorCore.style.top = `${mouseY}px`;

    requestAnimationFrame(animateCursor);
}

function setCursorHover(active, isInteractive) {
    cursorTrail.classList.toggle("hovering", active);
    cursorTrail.classList.toggle("interactive", isInteractive);
    cursorCore.classList.toggle("hovering", active);
    cursorCore.classList.toggle("interactive", isInteractive);
}

function attachCursorHoverListeners(root = document) {
    root.querySelectorAll(interactiveSelector).forEach(el => {
        el.addEventListener("mouseenter", () => setCursorHover(true, true));
        el.addEventListener("mouseleave", () => setCursorHover(false, false));
    });
}

animateCursor();
attachCursorHoverListeners();

document.addEventListener("mousemove", (event) => {
    const dx = event.clientX - prevMouseX;
    const dy = event.clientY - prevMouseY;

    mouseX = event.clientX;
    mouseY = event.clientY;
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;

    trailTargetX = event.clientX - dx * 0.65;
    trailTargetY = event.clientY - dy * 0.65;
    moveAngle = Math.atan2(dy, dx) || moveAngle;

    if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) setCursorHover(false, false);
});

document.addEventListener("mousedown", () => cursorCore.classList.add("clicking"));
document.addEventListener("mouseup", () => cursorCore.classList.remove("clicking"));

// --- status message ---
function showStatus(message) {
    statusMessage.textContent = message;
    statusMessage.classList.add("show");

    clearTimeout(showStatus.timeout);
    showStatus.timeout = setTimeout(() => statusMessage.classList.remove("show"), 1800);
}

function clearForm() {
    amountInput.value = "";
    typeInput.value = "Income";
    categoryInput.value = "";
    dateInput.value = "";
    noteInput.value = "";
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
    const savedTransactions = localStorage.getItem("transactions");
    const savedBudget = localStorage.getItem("monthlyBudget");

    if (savedTransactions) transactions = JSON.parse(savedTransactions);

    if (savedBudget !== null) {
        monthlyBudget = Number(savedBudget);
        if (budgetInput) budgetInput.value = monthlyBudget;
    }

    updateStatistics();
    refreshCharts();
    updateBudget();
}

function renderTransactions(searchText = "") {
    const search = searchText.toLowerCase();
    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;

    const filtered = transactions.filter(t => {
        const matchesSearch = t.category.toLowerCase().includes(search) || t.note.toLowerCase().includes(search);
        const matchesType = selectedType === "All" || t.type === selectedType;
        const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
        return matchesSearch && matchesType && matchesCategory;
    });

    if (!filtered.length) {
        transactionList.innerHTML = `<div class="empty-state">No matching transactions found.</div>`;
        return;
    }

    transactionList.innerHTML = filtered
        .slice()
        .reverse()
        .map(t => `
            <div class="transaction-item ${t.type.toLowerCase()}">
                <div>
                    <strong>${t.category}</strong>
                    <p>${t.note}</p>
                    <small>${t.date}</small>
                </div>
                <div class="transaction-right">
                    <div class="amount">Rs. ${t.amount}</div>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${t.id}">Edit</button>
                        <button class="delete-btn" data-id="${t.id}">Delete</button>
                    </div>
                </div>
            </div>
        `)
        .join("");

    attachCursorHoverListeners(transactionList);

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => editTransaction(Number(btn.dataset.id)));
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => deleteTransaction(Number(btn.dataset.id)));
    });
}

function updateSummary() {
    const totalIncome = transactions.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0);

    balance.textContent = `Rs. ${totalIncome - totalExpense}`;
    income.textContent = `Rs. ${totalIncome}`;
    expense.textContent = `Rs. ${totalExpense}`;
}

function updateStatistics() {
    const incomeTransactions = transactions.filter(t => t.type === "Income");
    const expenseTransactions = transactions.filter(t => t.type === "Expense");

    const highestIncomeAmount = incomeTransactions.length
        ? Math.max(...incomeTransactions.map(t => t.amount))
        : 0;

    const highestExpenseAmount = expenseTransactions.length
        ? Math.max(...expenseTransactions.map(t => t.amount))
        : 0;

    const averageExpenseAmount = expenseTransactions.length
        ? expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length
        : 0;

    if (totalTransactions) totalTransactions.textContent = transactions.length;
    if (highestIncome) highestIncome.textContent = `Rs. ${highestIncomeAmount}`;
    if (highestExpense) highestExpense.textContent = `Rs. ${highestExpenseAmount}`;
    if (averageExpense) averageExpense.textContent = `Rs. ${averageExpenseAmount}`;
}

function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderTransactions();
    updateSummary();
    updateStatistics();
    refreshCharts();
    updateBudget();

    showStatus("Transaction Deleted Successfully");
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;
    noteInput.value = transaction.note;

    editId = id;
    addButton.textContent = "Update Transaction";
    cancelEditBtn.style.display = "block";
}

cancelEditBtn.addEventListener("click", () => {
    editId = null;
    clearForm();
    addButton.textContent = "Add Transaction";
    cancelEditBtn.style.display = "none";
});

addButton.addEventListener("click", () => {
    const amount = amountInput.value.trim();
    const type = typeInput.value;
    const category = categoryInput.value.trim();
    const date = dateInput.value;
    const note = noteInput.value.trim();

    if (!amount || !category || !date || !note) {
        showStatus("Please fill all fields.");
        return;
    }

    if (editId === null) {
        transactions.push({ id: Date.now(), amount: Number(amount), type, category, date, note });
        showStatus("Transaction Added Successfully");
    } else {
        const index = transactions.findIndex(t => t.id === editId);
        transactions[index] = { id: editId, amount: Number(amount), type, category, date, note };

        editId = null;
        addButton.textContent = "Add Transaction";
        cancelEditBtn.style.display = "none";
        showStatus("Transaction Updated Successfully");
    }

    saveTransactions();
    renderTransactions();
    updateSummary();
    updateStatistics();
    refreshCharts();
    updateBudget();
    clearForm();

    addButton.classList.remove("success-pulse");
    void addButton.offsetWidth;
    addButton.classList.add("success-pulse");
});

saveBudgetBtn.addEventListener("click", () => {
    monthlyBudget = Number(budgetInput.value) || 0;
    localStorage.setItem("monthlyBudget", monthlyBudget);
    updateBudget();
    showStatus("Budget Saved Successfully");
});

searchInput.addEventListener("keyup", () => renderTransactions(searchInput.value));
filterType.addEventListener("change", () => renderTransactions(searchInput.value));
filterCategory.addEventListener("change", () => renderTransactions(searchInput.value));

// initial load
loadTransactions();
renderTransactions();
updateSummary();