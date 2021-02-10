// Toogle the MODAL
const modal = document.querySelector(".modal-overlay");

const Modal = {
  open() {
    modal.classList.add("active");
  },

  close() {
    modal.classList.remove("active");
  }
  // TO DO: Create a unique method called toogle
};

// Setup a LOCAL STORAGE
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("devFinanceTransactions")) || [];
  },

  set(transactions) {
    localStorage.setItem("devFinanceTransactions", JSON.stringify(transactions));
  }
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    this.all.push(transaction);
    App.reload();
  },

  remove(index) {
    this.all.splice(index, 1);
    App.reload();
  },

  getIncomes() {
    let incomes = 0;
    this.all.forEach(transaction => {
      if (transaction.amount > 0) {
        incomes += transaction.amount;
      }
    });
    return incomes;
  },

  getExpenses() {
    let expenses = 0;
    this.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expenses += transaction.amount;
      }
    });
    return expenses;
  },

  getTotal() {
    return this.getIncomes() + this.getExpenses();
  }
};

const Display = {
  transactionsContainer: document.querySelector("#transactions-history tbody"),

  addTransactionRow(transaction, index) {
    const tableRow = document.createElement("tr");
    tableRow.innerHTML = this.buildTransactionRow(transaction, index);
    tableRow.dataset.index = index;
    
    this.transactionsContainer.appendChild(tableRow);
  },

  buildTransactionRow(transaction, index) {
    const smartClass = transaction.amount > 0 ? "income" : "expense";
    const amount = Utils.formatCurrency(transaction.amount);

    const block = `
      <td class="description">${transaction.description}</td>
      <td class=${smartClass}>${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
      </td>`;

    return block;
  },

  updateBalance() {
    document
      .getElementById("incomeDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.getIncomes());
    document
      .getElementById("expenseDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.getExpenses());
    document
      .getElementById("totalDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.getTotal());
  },

  clearTransactions() {
    this.transactionsContainer.innerHTML = "";
  }
};

const Utils = {
  formatCurrency(value) {
    //const signal = Number(value) > 0 ? "" : "-";
    
    value = value.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL"
    });

    return value;
  },

  formatDate(value) {
    const splittedDate = value.split("-");
    
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  }
};

const Form = {
  description: document.querySelector("#description"),
  amount: document.querySelector("#amount"),
  date: document.querySelector("#date"),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value
    }
  },

  validateData() {
    const { description, amount, date } = this.getValues();

    if ((description.trim() === "") || (amount.trim() === "") || (date.trim() === "")) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  getFormattedValues() {
    let { description, amount, date } = this.getValues();

    date = Utils.formatDate(date);
    amount = Number(amount);
    
    return {
      description,
      amount,
      date
    };
  },

  clearFields() {
    this.description.value = "";
    this.amount.value = "";
    this.date.value = "";
  },

  submit(event) {
    event.preventDefault()

    try {
      this.validateData()

      // Add a new transaction
      const transaction = this.getFormattedValues();
      Transaction.add(transaction);

      this.clearFields();
      Modal.close();
    }
    catch (error) {
      alert(error.message);
    }
  }
};

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      Display.addTransactionRow(transaction, index);
    });

    Display.updateBalance();

    Storage.set(Transaction.all);
  },

  reload() {
    Display.clearTransactions();
    App.init();
  }
};

App.init();
