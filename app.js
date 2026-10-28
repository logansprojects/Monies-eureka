
const form = document.getElementById("paycheck-form");
const dateinput = document.getElementById("pay-date");
const sourceinput = document.getElementById("source");
const grossinput = document.getElementById("gross");
const deductionsinput = document.getElementById("deductions");
const message = document.getElementById("message");
const rows = document.getElementById("paycheck-rows");


const billform = document.getElementById("bill-form");
const billnameinput = document.getElementById("bill-name");
const billamountinput = document.getElementById("bill-amount");
const billcategoryinput = document.getElementById("bill-category");
const billrows = document.getElementById("bill-rows");

const expenseform = document.getElementById("expense-form");
const expensedateinput = document.getElementById("expense-date");
const expensenameinput = document.getElementById("expense-name");
const expenseamountinput = document.getElementById("expense-amount");
const expensecategoryinput = document.getElementById("expense-category");
const expenserows = document.getElementById("expense-rows");

const monthinput = document.getElementById("summary-month");
const summaryoutput = document.getElementById("summary");

const frequencyinput = document.getElementById("pay-frequency");
const knownpaydayinput = document.getElementById("known-payday");
const splitnote = document.getElementById("split-note");
const splitrows = document.getElementById("split-rows");


const chartcanvas = document.getElementById("income-chart");
const categorycanvas = document.getElementById("category-chart");




let paychecks = JSON.parse(localStorage.getItem("paychecks")) || [];
let bills = JSON.parse(localStorage.getItem("bills")) || [];
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let schedule = JSON.parse(localStorage.getItem("schedule")) || { frequency: "14", payday: "" };
let incomechart = null;
let categorychart = null;


let editingpaycheck = null;
let editingbill = null;
let editingexpense = null;




form.addEventListener("submit", function (event) {
    event.preventDefault();

    const paycheck = {
        date: dateinput.value,
        source: sourceinput.value,
        gross: Number(grossinput.value),
        deductions: Number(deductionsinput.value)
    };


    if (editingpaycheck === null) {
        paychecks.push(paycheck);
        message.textContent = "Income saved!";
    } else {
        paychecks[editingpaycheck] = paycheck;
        message.textContent = "Income updated!";
    }

    saveData();
    showAll();
    form.reset();
});


form.addEventListener("reset", function () {
    editingpaycheck = null;
    form.querySelector("button").textContent = "Save income";
});

billform.addEventListener("submit", function (event) {
    event.preventDefault();

    const bill = {
        name: billnameinput.value,
        amount: Number(billamountinput.value),
        category: billcategoryinput.value
    };

    if (editingbill === null) {
        bills.push(bill);
    } else {
        bills[editingbill] = bill;
    }

    saveData();
    showAll();
    billform.reset();
});


billform.addEventListener("reset", function () {
    editingbill = null;
    billform.querySelector("button").textContent = "Save bill";
});

expenseform.addEventListener("submit", function (event) {
    event.preventDefault();

    const expense = {
        date: expensedateinput.value,
        name: expensenameinput.value,
        amount: Number(expenseamountinput.value),
        category: expensecategoryinput.value
    };


    if (editingexpense === null) {
        expenses.push(expense);
    } else {
        expenses[editingexpense] = expense;
    }

    saveData();
    showAll();
    expenseform.reset();
});


expenseform.addEventListener("reset", function () {
    editingexpense = null;
    expenseform.querySelector("button").textContent = "Save expense";
});

monthinput.addEventListener("change", function () {
    showSummary();
});

function schedulechanged() {
    schedule.frequency = frequencyinput.value;
    schedule.payday = knownpaydayinput.value;
    saveData();
    showSummary();
}

frequencyinput.addEventListener("change", schedulechanged);
knownpaydayinput.addEventListener("change", schedulechanged);

function editPaycheck(index) {
    const paycheck = paychecks[index];
    dateinput.value = paycheck.date;
    sourceinput.value = paycheck.source || "Paycheck";
    grossinput.value = paycheck.gross;
    deductionsinput.value = paycheck.deductions;

    editingpaycheck = index;
    form.querySelector("button").textContent = "Update income";
    form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function editBill(index) {
    const bill = bills[index];
    billnameinput.value = bill.name;
    billamountinput.value = bill.amount;
    billcategoryinput.value = bill.category;

    editingbill = index;
    billform.querySelector("button").textContent = "Update bill";
    billform.scrollIntoView({ behavior: "smooth", block: "center" });
}

function editExpense(index) {
    const expense = expenses[index];
    expensedateinput.value = expense.date;
    expensenameinput.value = expense.name;
    expenseamountinput.value = expense.amount;
    expensecategoryinput.value = expense.category;

    editingexpense = index;
    expenseform.querySelector("button").textContent = "Update expense";
    expenseform.scrollIntoView({ behavior: "smooth", block: "center" });
}

function deletePaycheck(index) {
    if (confirm("Delete this income entry?")) {
        paychecks.splice(index, 1);
        if (editingpaycheck !== null) {
            form.reset();
        }
        saveData();
        showAll();
    }
}

function deleteBill(index) {
    if (confirm("Delete this bill?")) {
        bills.splice(index, 1);
        if (editingbill !== null) {
            billform.reset();
        }
        saveData();
        showAll();
    }
}

function deleteExpense(index) {
    if (confirm("Delete this expense?")) {
        expenses.splice(index, 1);
        if (editingexpense !== null) {
            expenseform.reset();
        }
        saveData();
        showAll();
    }
}




function saveData() {
    localStorage.setItem("paychecks", JSON.stringify(paychecks));
    localStorage.setItem("bills", JSON.stringify(bills));
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("schedule", JSON.stringify(schedule));
}




function showAll() {
    showPaychecks();
    showBills();
    showExpenses();
    showSummary();
    showChart();
}

function showPaychecks() {
    rows.innerHTML = "";

    paychecks.forEach(function (paycheck, index) {
        const row = document.createElement("tr");
        addCell(row, paycheck.date);
        addCell(row, paycheck.source || "Paycheck");
        addCell(row, "$" + paycheck.gross.toFixed(2));
        addCell(row, "$" + paycheck.deductions.toFixed(2));
        addCell(row, "$" + (paycheck.gross - paycheck.deductions).toFixed(2));
        
        addButtons(row,
            function () { editPaycheck(index); },
            function () { deletePaycheck(index); }
        );
        rows.appendChild(row);
    });
}

function showBills() {
    billrows.innerHTML = "";

    bills.forEach(function (bill, index) {
        const row = document.createElement("tr");
        addCell(row, bill.name);
        addCell(row, bill.category);
        addCell(row, "$" + bill.amount.toFixed(2));
       
        addButtons(row,
            function () { editBill(index); },
            function () { deleteBill(index); }
        );
        billrows.appendChild(row);
    });
}

function showExpenses() {
    expenserows.innerHTML = "";

    expenses.forEach(function (expense, index) {
        const row = document.createElement("tr");
        addCell(row, expense.date);
        addCell(row, expense.name);
        addCell(row, expense.category);
        addCell(row, "$" + expense.amount.toFixed(2));
        // CHANGED
        addButtons(row,
            function () { editExpense(index); },
            function () { deleteExpense(index); }
        );
        expenserows.appendChild(row);
    });
}

function showSummary() {
    const month = monthinput.value;

    let paychecktotal = 0;
    let othertotal = 0;
    paychecks.forEach(function (paycheck) {
        if (paycheck.date.startsWith(month)) {
            const takehome = paycheck.gross - paycheck.deductions;
            const source = paycheck.source || "Paycheck";
            if (source === "Paycheck") {
                paychecktotal = paychecktotal + takehome;
            } else {
                othertotal = othertotal + takehome;
            }
        }
    });

    let billtotal = 0;
    bills.forEach(function (bill) {
        billtotal = billtotal + bill.amount;
    });

    let expensetotal = 0;
    expenses.forEach(function (expense) {
        if (expense.date.startsWith(month)) {
            expensetotal = expensetotal + expense.amount;
        }
    });

    const leftover = paychecktotal + othertotal - billtotal - expensetotal;


    summaryoutput.innerHTML = "";
    addSummaryRow("Paychecks (take-home)", paychecktotal);
    addSummaryRow("Other income", othertotal);
    addSummaryRow("Monthly bills", billtotal);
    addSummaryRow("Other expenses", expensetotal);
    addSummaryRow("Left over", leftover);

   
    let tocover = billtotal + expensetotal - othertotal;
    if (tocover < 0) {
        tocover = 0;
    }
    showSplit(month, tocover);
    showCategoryChart(month, leftover);
}

function showSplit(month, tocover) {
    splitrows.innerHTML = "";

    if (knownpaydayinput.value === "") {
        splitnote.textContent = "Pick one of your real paydays above to see the split.";
        return;
    }

    const paydays = getPaydays(month);
    const perpaycheck = tocover / paydays.length;

    splitnote.textContent = paydays.length + " paydays this month. $" + tocover.toFixed(2) + " to cover, so set aside $" + perpaycheck.toFixed(2) + " from each paycheck.";

    paydays.forEach(function (payday) {
        const datetext = toDateText(payday);

        let takehome = 0;
        let found = false;
        paychecks.forEach(function (paycheck) {
            const source = paycheck.source || "Paycheck";
            if (paycheck.date === datetext && source === "Paycheck") {
                takehome = takehome + paycheck.gross - paycheck.deductions;
                found = true;
            }
        });

        const row = document.createElement("tr");
        addCell(row, datetext);
        addCell(row, "$" + perpaycheck.toFixed(2));
        if (found) {
            addCell(row, "$" + takehome.toFixed(2));
            addCell(row, "$" + (takehome - perpaycheck).toFixed(2));
        } else {
            addCell(row, "No paycheck");
            addCell(row, "");
        }
        splitrows.appendChild(row);
    });
}

function getPaydays(month) {
    const frequency = Number(frequencyinput.value);
    const payday = new Date(knownpaydayinput.value + "T00:00");
    const monthstart = new Date(month + "-01T00:00");
    const monthend = new Date(monthstart);
    monthend.setMonth(monthend.getMonth() + 1);

    while (payday >= monthstart) {
        payday.setDate(payday.getDate() - frequency);
    }


    const paydays = [];
    while (payday < monthend) {
        if (payday >= monthstart) {
            paydays.push(new Date(payday));
        }
        payday.setDate(payday.getDate() + frequency);
    }

    return paydays;
}

function toDateText(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
}

function showChart() {

    const sorted = paychecks.slice().sort(function (a, b) {
        return a.date.localeCompare(b.date);
    });

 
    const labels = [];
    const grossvalues = [];
    const takehomevalues = [];
    sorted.forEach(function (paycheck) {
        const source = paycheck.source || "Paycheck";
        if (source === "Paycheck") {
            labels.push(paycheck.date);
            grossvalues.push(paycheck.gross);
            takehomevalues.push(paycheck.gross - paycheck.deductions);
        }
    });


    if (incomechart) {
        incomechart.destroy();
    }

    incomechart = new Chart(chartcanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Gross pay",
                    data: grossvalues,
                    backgroundColor: "#9fc9b3"
                },
                {
                    label: "Take-home",
                    data: takehomevalues,
                    backgroundColor: "#2f7d5b"
                }
            ]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function showCategoryChart(month, leftover) {
 
    const totals = {};

    bills.forEach(function (bill) {
        totals[bill.category] = (totals[bill.category] || 0) + bill.amount;
    });

    expenses.forEach(function (expense) {
        if (expense.date.startsWith(month)) {
            totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        }
    });

    const palette = ["#2f7d5b", "#e07a5f", "#3d5a80", "#f2cc8f", "#81b29a", "#9c6644",
        "#6d597a", "#e5989b", "#48cae4", "#b5838d", "#ffb703", "#8d99ae"];
    const labels = Object.keys(totals);
    const values = [];
    const colors = [];
    labels.forEach(function (category, index) {
        values.push(totals[category]);
        colors.push(palette[index % palette.length]);
    });

    if (leftover > 0) {
        labels.push("Left over");
        values.push(leftover);
        colors.push("#4a5563");
    }

  
    if (categorychart) {
        categorychart.destroy();
    }

    categorychart = new Chart(categorycanvas, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: colors
                }
            ]
        }
    });
}

function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
}


function addButtons(row, whenedit, whendelete) {
    const cell = document.createElement("td");

    const editbutton = document.createElement("button");
    editbutton.textContent = "Edit";
    editbutton.className = "edit";
    editbutton.addEventListener("click", whenedit);

    const deletebutton = document.createElement("button");
    deletebutton.textContent = "Delete";
    deletebutton.className = "delete";
    deletebutton.addEventListener("click", whendelete);

    cell.appendChild(editbutton);
    cell.appendChild(deletebutton);
    row.appendChild(cell);
}

function addSummaryRow(label, amount) {
    const row = document.createElement("div");
    row.className = "summary-row";

    const name = document.createElement("span");
    name.textContent = label;

    const value = document.createElement("strong");
    value.textContent = "$" + amount.toFixed(2);
    if (amount < 0) {
        value.style.color = "#e5534b";
    }

    row.appendChild(name);
    row.appendChild(value);
    summaryoutput.appendChild(row);
}


const today = new Date();
const thismonth = String(today.getMonth() + 1).padStart(2, "0");
monthinput.value = today.getFullYear() + "-" + thismonth;


frequencyinput.value = schedule.frequency;
knownpaydayinput.value = schedule.payday;


Chart.defaults.color = "#8b98a5";
Chart.defaults.borderColor = "#2f3a45";
Chart.defaults.elements.arc.borderColor = "#1a2027";

showAll();
