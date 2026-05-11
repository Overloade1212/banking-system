let currentAccount = null;
let allTransactions = [];

export const getAccount = () => currentAccount;
export const getAllTransactions = () => allTransactions;

export function setAccount(data) {
    currentAccount = data;
    if (data?.id) sessionStorage.setItem("accountId", data.id);
}

export function setTransactions(txs) {
    allTransactions = txs || [];
}

export function clearAccount() {
    currentAccount = null;
    allTransactions = [];
    sessionStorage.removeItem("accountId");
}

export const getSavedAccountId = () => sessionStorage.getItem("accountId");
