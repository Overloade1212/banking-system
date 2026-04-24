import { getAccount } from "./state.js";

const mainScreen = document.getElementById("main-screen")
const authScreen = document.getElementById("auth-screen")
const nameAccount = document.getElementById("accaunt-name");
const typeAccount = document.getElementById("accaunt-type");
const balanceAccount = document.getElementById("accaunt-balance");
const idAccount = document.getElementById("accaunt-id");
const createdAccount = document.getElementById("accaunt-created");


export function renderApp() {
    const current = getAccount();
    if (!current) {
        toggleCreateScreen(true)
        toggleDashboard(false)
    }
    else {
        toggleCreateScreen(false)
        toggleDashboard(true)
        renderAccount(current)
    }
}

function toggleCreateScreen(show) {
    if (show) {
        authScreen.classList.remove('hidden')
    }
    else {
        authScreen.classList.add('hidden')

    }
}
function toggleDashboard(show) {
    if (show) {

        mainScreen.classList.remove('hidden')
    }
    else {
        mainScreen.classList.add('hidden')

    }
}
console.log(nameAccount);
console.log(typeAccount);
console.log(balanceAccount);
console.log(idAccount);
console.log(createdAccount);
function renderAccount(accountData) {
    nameAccount.textContent = accountData.username;
    typeAccount.textContent = accountData.type;
    balanceAccount.textContent = Number(accountData.balance).toFixed(2);
    idAccount.textContent = accountData.id;
    if (accountData.createdAt) {
    createdAccount.textContent = new Date(accountData.createdAt).toLocaleString();
} else {
    createdAccount.textContent = "Just created";
}
}