// INPUT FIELDS

const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");

// BUTTONS

const addButton = document.getElementById("addBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// SUMMARY

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

// STATISTICS DASHBOARD

const totalTransactions = document.getElementById("totalTransactions");
const highestIncome = document.getElementById("highestIncome");
const highestExpense = document.getElementById("highestExpense");
const averageExpense = document.getElementById("averageExpense");

// TRANSACTION LIST
const transactionList = document.getElementById("transactionList");
const statusMessage = document.getElementById("statusMessage");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");

// BUDGET PLANNER

const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const budgetAmount = document.getElementById("budgetAmount");
const spentAmount = document.getElementById("spentAmount");
const remainingAmount = document.getElementById("remainingAmount");
const progressFill = document.getElementById("progressFill");
const budgetWarning = document.getElementById("budgetWarning");

// APP DATA

let transactions = [];
let editId = null;
let monthlyBudget = 0;

// CHARTS

let categoryChart;
let monthlyChart;

function drawCategoryChart() {

    if (categoryChart) {

        categoryChart.destroy();

    }

    const expenseTransactions = transactions.filter(function (transaction) {

        return transaction.type === "Expense";

    });

    if (expenseTransactions.length === 0) {

        return;

    }

    const categoryTotals = {};

    expenseTransactions.forEach(function (transaction) {

        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }

        categoryTotals[transaction.category] += transaction.amount;

    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = [
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
        "#f9c74f",
        "#90be6d",
        "#ff9f1c",
        "#a78bfa",
        "#fb7185"
    ];

    const ctx = document.getElementById("categoryChart").getContext("2d");

    categoryChart = new Chart(ctx, {

        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });

}

function drawMonthlyChart() {

    if (monthlyChart) {

        monthlyChart.destroy();

    }

    const expenseTransactions = transactions.filter(function (transaction) {

        return transaction.type === "Expense";

    });

    if (expenseTransactions.length === 0) {

        return;

    }

    const monthlyTotals = {};

    expenseTransactions.forEach(function (transaction) {

        const monthLabel = new Date(transaction.date).toLocaleString("en-US", {
            month: "short",
            year: "numeric"
        });

        if (!monthlyTotals[monthLabel]) {

            monthlyTotals[monthLabel] = 0;

        }

        monthlyTotals[monthLabel] += transaction.amount;

    });

    const labels = Object.keys(monthlyTotals);
    const data = Object.values(monthlyTotals);

    const ctx = document.getElementById("monthlyChart").getContext("2d");

    monthlyChart = new Chart(ctx, {

        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Monthly Expense",
                data: data,
                backgroundColor: "#ff6b6b",
                borderColor: "#ff4d4d",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

}

function refreshCharts() {

    drawCategoryChart();
    drawMonthlyChart();

}

function updateBudget() {

    const totalExpense = transactions
        .filter(function (transaction) {
            return transaction.type === "Expense";
        })
        .reduce(function (sum, transaction) {
            return sum + transaction.amount;
        }, 0);

    const remainingBudget = monthlyBudget - totalExpense;
    const budgetUsed = monthlyBudget > 0
        ? (totalExpense / monthlyBudget) * 100
        : 0;
    const percentage = Math.min(100, Math.max(0, budgetUsed));

    if (budgetAmount) {

        budgetAmount.textContent = `Rs. ${monthlyBudget}`;

    }

    if (spentAmount) {

        spentAmount.textContent = `Rs. ${totalExpense}`;

    }

    if (remainingAmount) {

        remainingAmount.textContent = `Rs. ${remainingBudget}`;

    }

    if (progressFill) {

        progressFill.style.width = `${percentage}%`;

        if (percentage <= 60) {

            progressFill.style.backgroundColor = "#4caf50";

        }

        else if (percentage <= 90) {

            progressFill.style.backgroundColor = "#f4b400";

        }

        else {

            progressFill.style.backgroundColor = "#f44336";

        }

    }

    if (budgetWarning) {

        if (monthlyBudget === 0) {

            budgetWarning.textContent = "No Budget Set";

        }

        else if (totalExpense < monthlyBudget) {

            budgetWarning.textContent = `You still have Rs. ${remainingBudget} remaining.`;

        }

        else if (totalExpense === monthlyBudget) {

            budgetWarning.textContent = "You have reached your budget.";

        }

        else {

            budgetWarning.textContent = `Budget Exceeded by Rs. ${Math.abs(remainingBudget)}`;

        }

    }

}

// CUSTOM CURSOR

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

let trailX = mouseX;
let trailY = mouseY;
let trailTargetX = mouseX;
let trailTargetY = mouseY;
let trailAngle = 0;
let moveAngle = 0;

const interactiveSelector = [
    "button",
    "a",
    "input",
    "select",
    "textarea",
    ".card",
    ".transaction-item",
    ".brand-badge",
    ".chart-box",
    ".empty-state",
    ".action-buttons",
    ".edit-btn",
    ".delete-btn",
    "[role='button']"
].join(", ");

function lerp(start, end, amount) {

    return start + (end - start) * amount;

}

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

    root.querySelectorAll(interactiveSelector).forEach(function (element) {

        element.addEventListener("mouseenter", function () {

            setCursorHover(true, true);

        });

        element.addEventListener("mouseleave", function () {

            setCursorHover(false, false);

        });

    });

}

animateCursor();
attachCursorHoverListeners();

document.addEventListener("mousemove", function (event) {

    const dx = event.clientX - prevMouseX;
    const dy = event.clientY - prevMouseY;

    mouseX = event.clientX;
    mouseY = event.clientY;

    prevMouseX = event.clientX;
    prevMouseY = event.clientY;

    trailTargetX = event.clientX - dx * 0.65;
    trailTargetY = event.clientY - dy * 0.65;
    moveAngle = Math.atan2(dy, dx) || moveAngle;

    if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) {
        setCursorHover(false, false);
    }

});

document.addEventListener("mousedown", function () {

    cursorCore.classList.add("clicking");

});

document.addEventListener("mouseup", function () {

    cursorCore.classList.remove("clicking");

});

// STATUS MESSAGE

function showStatus(message) {

    statusMessage.textContent = message;

    statusMessage.classList.add("show");

    clearTimeout(showStatus.timeout);

    showStatus.timeout = setTimeout(function () {

        statusMessage.classList.remove("show");

    }, 1800);

}

// CLEAR FORM

function clearForm() {

    amountInput.value = "";
    typeInput.value = "Income";
    categoryInput.value = "";
    dateInput.value = "";
    noteInput.value = "";

}
// SAVE TO LOCAL STORAGE

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}

// LOAD FROM LOCAL STORAGE

function loadTransactions() {

    const savedTransactions =
        localStorage.getItem("transactions");

    const savedBudget = localStorage.getItem("monthlyBudget");

    if (savedTransactions) {

        transactions =
            JSON.parse(savedTransactions);

    }

    if (savedBudget !== null) {

        monthlyBudget = Number(savedBudget);

        if (budgetInput) {

            budgetInput.value = monthlyBudget;

        }

    }

    updateStatistics();
    refreshCharts();
    updateBudget();

}


// RENDER TRANSACTIONS

function renderTransactions(searchText = "") {

    const search = searchText.toLowerCase();
    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;

    let filteredTransactions = transactions.filter(function (transaction) {

        const matchesSearch =
            transaction.category.toLowerCase().includes(search) ||
            transaction.note.toLowerCase().includes(search);

        const matchesType =
            selectedType === "All" ||
            transaction.type === selectedType;

        const matchesCategory =
            selectedCategory === "All" ||
            transaction.category === selectedCategory;

        return matchesSearch &&
            matchesType &&
            matchesCategory;

    });

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <div class="empty-state">
                No matching transactions found.
            </div>
        `;

        return;

    }

    transactionList.innerHTML = filteredTransactions
        .slice()
        .reverse()
        .map(function (transaction) {

            return `

            <div class="transaction-item ${transaction.type.toLowerCase()}">

                <div>

                    <strong>${transaction.category}</strong>

                    <p>${transaction.note}</p>

                    <small>${transaction.date}</small>

                </div>

                <div class="transaction-right">

                    <div class="amount">

                        Rs. ${transaction.amount}

                    </div>

                    <div class="action-buttons">

                        <button
                            class="edit-btn"
                            data-id="${transaction.id}">
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            data-id="${transaction.id}">
                            Delete
                        </button>

                    </div>

                </div>

            </div>

            `;

        })
        .join("");

    attachCursorHoverListeners(transactionList);

    document.querySelectorAll(".edit-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                editTransaction(Number(button.dataset.id));

            });

        });

    document.querySelectorAll(".delete-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                deleteTransaction(Number(button.dataset.id));

            });

        });

}
// UPDATE SUMMARY

function updateSummary() {

    const totalIncome = transactions
        .filter(transaction => transaction.type === "Income")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpense = transactions
        .filter(transaction => transaction.type === "Expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    balance.textContent = `Rs. ${totalIncome - totalExpense}`;
    income.textContent = `Rs. ${totalIncome}`;
    expense.textContent = `Rs. ${totalExpense}`;

}

// UPDATE STATISTICS

function updateStatistics() {

    const incomeTransactions = transactions.filter(function (transaction) {

        return transaction.type === "Income";

    });

    const expenseTransactions = transactions.filter(function (transaction) {

        return transaction.type === "Expense";

    });

    const highestIncomeAmount = incomeTransactions.length > 0
        ? Math.max(...incomeTransactions.map(function (transaction) {
            return transaction.amount;
        }))
        : 0;

    const highestExpenseAmount = expenseTransactions.length > 0
        ? Math.max(...expenseTransactions.map(function (transaction) {
            return transaction.amount;
        }))
        : 0;

    const averageExpenseAmount = expenseTransactions.length > 0
        ? expenseTransactions.reduce(function (sum, transaction) {
            return sum + transaction.amount;
        }, 0) / expenseTransactions.length
        : 0;

    if (totalTransactions) {

        totalTransactions.textContent = transactions.length;

    }

    if (highestIncome) {

        highestIncome.textContent = `Rs. ${highestIncomeAmount}`;

    }

    if (highestExpense) {

        highestExpense.textContent = `Rs. ${highestExpenseAmount}`;

    }

    if (averageExpense) {

        averageExpense.textContent = `Rs. ${averageExpenseAmount}`;

    }

}

// DELETE TRANSACTION

function deleteTransaction(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {

        return;

    }

    transactions = transactions.filter(function (transaction) {

        return transaction.id !== id;

    });

    saveTransactions();

    renderTransactions();

    updateSummary();
    updateStatistics();
    refreshCharts();
    updateBudget();

    showStatus("Transaction Deleted Successfully");

}

// EDIT TRANSACTION

function editTransaction(id) {

    const transaction = transactions.find(function (transaction) {

        return transaction.id === id;

    });

    amountInput.value = transaction.amount;

    typeInput.value = transaction.type;

    categoryInput.value = transaction.category;

    dateInput.value = transaction.date;

    noteInput.value = transaction.note;

    editId = id;

    addButton.textContent = "Update Transaction";

    cancelEditBtn.style.display = "block";

}

// CANCEL EDIT
cancelEditBtn.addEventListener("click", function () {

    editId = null;

    clearForm();

    addButton.textContent = "Add Transaction";

    cancelEditBtn.style.display = "none";

});

//ADD / UPDATE TRANSACTION


addButton.addEventListener("click", function () {

    const amount = amountInput.value.trim();
    const type = typeInput.value;
    const category = categoryInput.value.trim();
    const date = dateInput.value;
    const note = noteInput.value.trim();

    if (
        amount === "" ||
        category === "" ||
        date === "" ||
        note === ""
    ) {

        showStatus("Please fill all fields.");

        return;

    }

    if (editId === null) {

        const transaction = {

            id: Date.now(),

            amount: Number(amount),

            type: type,

            category: category,

            date: date,

            note: note

        };

        transactions.push(transaction);

        showStatus("Transaction Added Successfully");

    }

    else {

        const index = transactions.findIndex(function (transaction) {

            return transaction.id === editId;

        });

        transactions[index] = {

            id: editId,

            amount: Number(amount),

            type: type,

            category: category,

            date: date,

            note: note

        };

        showStatus("Transaction Updated Successfully");

        editId = null;

        addButton.textContent = "Add Transaction";

        cancelEditBtn.style.display = "none";

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

// ==========================================
// SAVE BUDGET
// ==========================================

saveBudgetBtn.addEventListener("click", function () {

    monthlyBudget = Number(budgetInput.value) || 0;

    localStorage.setItem("monthlyBudget", monthlyBudget);

    updateBudget();

    showStatus("Budget Saved Successfully");

});

// ==========================================
// SEARCH TRANSACTIONS
// ==========================================

searchInput.addEventListener("keyup", function () {

    renderTransactions(searchInput.value);

});

filterType.addEventListener("change", function () {

    renderTransactions(searchInput.value);

});

filterCategory.addEventListener("change", function () {

    renderTransactions(searchInput.value);

});

// ==========================================
// INITIAL LOAD
// ==========================================

loadTransactions();

renderTransactions();

updateSummary();