
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

// TRANSACTION LIST

const transactionList = document.getElementById("transactionList");
const statusMessage = document.getElementById("statusMessage");

// APP DATA

let transactions = [];

// stores id of transaction currently.
let editId = null;

// CUSTOM CURSOR

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

document.addEventListener("mousemove", function (event) {

    mouseX = event.clientX;
    mouseY = event.clientY;

    const spark = document.createElement("span");

    spark.className = "cursor-effect";

    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;

    document.body.appendChild(spark);

    setTimeout(function () {

        spark.remove();

    }, 650);

});

document.addEventListener("mousedown", function () {

    cursorDot.classList.add("clicking");

});

document.addEventListener("mouseup", function () {

    cursorDot.classList.remove("clicking");

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

// RENDER TRANSACTIONS

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

    // EDIT BUTTON

    const editButtons =
        document.querySelectorAll(".edit-btn");

    editButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const id = Number(button.dataset.id);

            editTransaction(id);

        });

    });

    // DELETE BUTTON

    const deleteButtons =
        document.querySelectorAll(".delete-btn");

    deleteButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const id = Number(button.dataset.id);

            deleteTransaction(id);

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

// DELETE TRANSACTION

function deleteTransaction(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
        return;
    }

    transactions = transactions.filter(
        transaction => transaction.id !== id
    );

    renderTransactions();
    updateSummary();

    showStatus("Transaction Deleted Successfully");

}

// EDIT TRANSACTION

function editTransaction(id) {

    const transaction = transactions.find(
        transaction => transaction.id === id
    );

    if (!transaction) return;

    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;
    noteInput.value = transaction.note;

    editId = id;

    addButton.textContent = "Update Transaction";

    cancelEditBtn.style.display = "block";

    showStatus("Editing Transaction");

}


// CANCEL EDIT

cancelEditBtn.addEventListener("click", function () {

    editId = null;

    clearForm();

    addButton.textContent = "Add Transaction";

    cancelEditBtn.style.display = "none";

    showStatus("Edit Cancelled");

});

// ADD / UPDATE TRANSACTION

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

        const index = transactions.findIndex(
            transaction => transaction.id === editId
        );

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

    clearForm();

    renderTransactions();

    updateSummary();

});

// INITIAL LOAD

renderTransactions();

updateSummary();