// Input Fields
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");

// Buttons
const addButton = document.getElementById("addBtn");

// Summary Cards
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

// Transaction List
const transactionList = document.getElementById("transactionList");
const statusMessage = document.getElementById("statusMessage");

// this array Stores Transactions
let transactions = [];

const cursorRing = document.createElement("div");
cursorRing.className = "cursor-ring";
document.body.appendChild(cursorRing);

const cursorDot = document.createElement("div");
cursorDot.className = "cursor-dot";
document.body.appendChild(cursorDot);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

function animateCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    requestAnimationFrame(animateCursor);
}

animateCursor();

document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    const spark = document.createElement("span");
    spark.className = "cursor-effect";
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 650);
});

document.addEventListener("mousedown", () => {
    cursorDot.classList.add("clicking");
});

document.addEventListener("mouseup", () => {
    cursorDot.classList.remove("clicking");
});

const interactiveElements = document.querySelectorAll("button, input, select, textarea, .card, .transaction-item");
interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", () => cursorRing.classList.add("hovering"));
    element.addEventListener("mouseleave", () => cursorRing.classList.remove("hovering"));
});

function renderTransactions() {
    if (transactions.length === 0) {
        transactionList.innerHTML = '<p class="empty-state">No transactions yet. Add your first move.</p>';
        return;
    }

    transactionList.innerHTML = transactions
        .slice()
        .reverse()
        .map((transaction) => `
            <div class="transaction-item ${transaction.type.toLowerCase()}">
                <div>
                    <strong>${transaction.category}</strong>
                    <p>${transaction.note || "No note added"}</p>
                    <small>${transaction.date}</small>
                </div>
                <div class="amount">Rs. ${transaction.amount}</div>
            </div>
        `)
        .join("");
}

function updateSummary() {
    const totalIncome = transactions
        .filter((transaction) => transaction.type === "Income")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpense = transactions
        .filter((transaction) => transaction.type === "Expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    balance.textContent = `Rs. ${totalIncome - totalExpense}`;
    income.textContent = `Rs. ${totalIncome}`;
    expense.textContent = `Rs. ${totalExpense}`;
}

function showStatus(message) {
    statusMessage.textContent = message;
    statusMessage.classList.add("show");
    clearTimeout(showStatus.timeout);
    showStatus.timeout = setTimeout(() => {
        statusMessage.classList.remove("show");
    }, 1800);
}

// Add Transaction
addButton.addEventListener("click", function () {
    // Read input values
    const amount = amountInput.value.trim();
    const type = typeInput.value;
    const category = categoryInput.value.trim();
    const date = dateInput.value;
    const note = noteInput.value.trim();

    // Basic validation
    if (amount === "" || category === "" || date === "" || note === "") {
        showStatus("Please fill in all fields.");
        return;
    }

    // Create transaction object
    const transaction = {
        id: Date.now(),
        amount: Number(amount),
        type: type,
        category: category,
        date: date,
        note: note
    };

    // Store transaction
    transactions.push(transaction);

    renderTransactions();
    updateSummary();
    showStatus(`Added ${type} of Rs. ${amount}`);

    addButton.classList.remove("success-pulse");
    void addButton.offsetWidth;
    addButton.classList.add("success-pulse");

    amountInput.value = "";
    typeInput.value = "Income";
    categoryInput.value = "";
    dateInput.value = "";
    noteInput.value = "";
});

renderTransactions();
updateSummary();