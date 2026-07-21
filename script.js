// ==========================================
// INPUT FIELDS
// ==========================================

const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");

// ==========================================
// BUTTONS
// ==========================================

const addButton = document.getElementById("addBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// ==========================================
// SUMMARY
// ==========================================

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

// ==========================================
// TRANSACTION LIST
// ==========================================

const transactionList = document.getElementById("transactionList");
const statusMessage = document.getElementById("statusMessage");

// ==========================================
// APP DATA
// ==========================================

let transactions = [];
let editId = null;

// ==========================================
// CUSTOM CURSOR
// ==========================================

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

// ==========================================
// STATUS MESSAGE
// ==========================================

function showStatus(message) {

    statusMessage.textContent = message;

    statusMessage.classList.add("show");

    clearTimeout(showStatus.timeout);

    showStatus.timeout = setTimeout(function () {

        statusMessage.classList.remove("show");

    }, 1800);

}

// ==========================================
// CLEAR FORM
// ==========================================

function clearForm() {

    amountInput.value = "";
    typeInput.value = "Income";
    categoryInput.value = "";
    dateInput.value = "";
    noteInput.value = "";

}

// ==========================================
// SAVE TO LOCAL STORAGE
// ==========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}

// ==========================================
// LOAD FROM LOCAL STORAGE
// ==========================================

function loadTransactions() {

    const savedTransactions =
        localStorage.getItem("transactions");

    if (savedTransactions) {

        transactions =
            JSON.parse(savedTransactions);

    }

}

// ==========================================
// RENDER TRANSACTIONS
// ==========================================

function renderTransactions() {

    if (transactions.length === 0) {

        transactionList.innerHTML = `
            <div class="empty-state">
                No transactions yet.
            </div>
        `;

        return;

    }

    transactionList.innerHTML = transactions
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

    // EDIT BUTTONS

    document.querySelectorAll(".edit-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                editTransaction(
                    Number(button.dataset.id)
                );

            });

        });

    // DELETE BUTTONS

    document.querySelectorAll(".delete-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                deleteTransaction(
                    Number(button.dataset.id)
                );

            });

        });

}
// ==========================================
// UPDATE SUMMARY
// ==========================================

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

// ==========================================
// DELETE TRANSACTION
// ==========================================

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

    showStatus("Transaction Deleted Successfully");

}

// ==========================================
// EDIT TRANSACTION
// ==========================================

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

// ==========================================
// CANCEL EDIT
// ==========================================

cancelEditBtn.addEventListener("click", function () {

    editId = null;

    clearForm();

    addButton.textContent = "Add Transaction";

    cancelEditBtn.style.display = "none";

});

// ==========================================
// ADD / UPDATE TRANSACTION
// ==========================================

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

    clearForm();

    addButton.classList.remove("success-pulse");

    void addButton.offsetWidth;

    addButton.classList.add("success-pulse");

});

// ==========================================
// INITIAL LOAD
// ==========================================

loadTransactions();

renderTransactions();

updateSummary();