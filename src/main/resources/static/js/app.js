import { setAccount, getAccount, clearAccount, getSavedAccountId, setTransactions, getAllTransactions } from "./state.js?v=5";
import {
    hideLoading, showAuthScreen, showDashboard,
    updateBalance, renderTransactions, showToast,
    openModal, closeModal, showError, clearError,
    setButtonLoading, initAuthTabs, initTypeHint
} from "./ui.js?v=5";
import {
    createAccount, fetchAccount, fetchByUsername,
    depositFunds, withdrawFunds, fetchTransactions
} from "./api.js?v=5";

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════

async function init() {
    initAuthTabs();
    initTypeHint();

    try {
        if (typeof initKeycloak === "function") {
            await Promise.race([initKeycloak(), new Promise(r => setTimeout(r, 3000))]);
        }

        const savedId = getSavedAccountId();
        if (savedId) {
            try {
                const account = await fetchAccount(savedId);
                setAccount(account);
                await loadTransactions();
                showDashboard();
            } catch {
                clearAccount();
                showAuthScreen();
            }
        } else {
            showAuthScreen();
        }
    } catch (e) {
        console.error("Init error:", e);
        showAuthScreen();
    } finally {
        hideLoading();
    }
}

// ═══════════════════════════════════════════════════════════
// AUTH — LOGIN
// ═══════════════════════════════════════════════════════════

document.getElementById("login-btn").addEventListener("click", async () => {
    const username = document.getElementById("login-name").value.trim();
    clearError("login-error");

    if (!username) { showError("login-error", "Enter your username."); return; }

    setButtonLoading("login-btn", true);
    try {
        const account = await fetchByUsername(username);
        setAccount(account);
        await loadTransactions();
        showDashboard();
        showToast(`Welcome back, ${account.username}!`, "success");
    } catch (err) {
        showError("login-error", err.message.includes("not found") ? "Account not found. Check the name or create a new one." : err.message);
    } finally {
        setButtonLoading("login-btn", false);
    }
});

// Enter key on login
document.getElementById("login-name").addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("login-btn").click();
});

// ═══════════════════════════════════════════════════════════
// AUTH — REGISTER
// ═══════════════════════════════════════════════════════════

document.getElementById("register-btn").addEventListener("click", async () => {
    const username = document.getElementById("register-name").value.trim();
    const type     = document.getElementById("account-type").value;
    clearError("register-error");

    if (!username) { showError("register-error", "Enter your full name."); return; }
    if (!type)     { showError("register-error", "Select an account type."); return; }

    setButtonLoading("register-btn", true);
    try {
        const account = await createAccount(username, type);
        setAccount(account);
        setTransactions([]);
        showDashboard();
        renderTransactions([], "all");
        showToast("Account created! Welcome 🎉", "success");
    } catch (err) {
        showError("register-error", err.message || "Failed to create account.");
    } finally {
        setButtonLoading("register-btn", false);
    }
});

// ═══════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════

document.getElementById("logout-btn").addEventListener("click", () => {
    clearAccount();
    if (typeof keycloakLogout === "function") keycloakLogout();
    else showAuthScreen();
});

window.addEventListener("app:logout", () => { clearAccount(); showAuthScreen(); });

// ═══════════════════════════════════════════════════════════
// DEPOSIT
// ═══════════════════════════════════════════════════════════

document.getElementById("open-deposit-btn").addEventListener("click", () => {
    clearError("deposit-error");
    document.getElementById("deposit-amount").value = "";
    openModal("deposit-modal");
});

document.getElementById("confirm-deposit-btn").addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("deposit-amount").value);
    clearError("deposit-error");
    if (!amount || amount <= 0) { showError("deposit-error", "Enter a valid amount."); return; }

    const account = getAccount();
    setButtonLoading("confirm-deposit-btn", true);
    try {
        const updated = await depositFunds(account.id, amount);
        setAccount(updated);
        updateBalance(updated);
        closeModal("deposit-modal");
        await loadTransactions();
        showToast(`+$${amount.toFixed(2)} deposited`, "success");
    } catch (err) {
        showError("deposit-error", err.message || "Deposit failed.");
    } finally {
        setButtonLoading("confirm-deposit-btn", false);
    }
});

// ═══════════════════════════════════════════════════════════
// WITHDRAW
// ═══════════════════════════════════════════════════════════

document.getElementById("open-withdraw-btn").addEventListener("click", () => {
    clearError("withdraw-error");
    document.getElementById("withdraw-amount").value = "";
    openModal("withdraw-modal");
});

document.getElementById("confirm-withdraw-btn").addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("withdraw-amount").value);
    clearError("withdraw-error");
    if (!amount || amount <= 0) { showError("withdraw-error", "Enter a valid amount."); return; }

    const account = getAccount();
    setButtonLoading("confirm-withdraw-btn", true);
    try {
        const updated = await withdrawFunds(account.id, amount);
        setAccount(updated);
        updateBalance(updated);
        closeModal("withdraw-modal");
        await loadTransactions();
        showToast(`−$${amount.toFixed(2)} withdrawn`, "error");
    } catch (err) {
        showError("withdraw-error", err.message || "Withdrawal failed.");
    } finally {
        setButtonLoading("confirm-withdraw-btn", false);
    }
});

// ═══════════════════════════════════════════════════════════
// TRANSFER (withdraw from sender, deposit to recipient)
// ═══════════════════════════════════════════════════════════

document.getElementById("open-transfer-btn").addEventListener("click", () => {
    clearError("transfer-error");
    document.getElementById("transfer-amount").value = "";
    document.getElementById("transfer-recipient").value = "";
    openModal("transfer-modal");
});

document.getElementById("confirm-transfer-btn").addEventListener("click", async () => {
    const recipient = document.getElementById("transfer-recipient").value.trim();
    const amount    = parseFloat(document.getElementById("transfer-amount").value);
    clearError("transfer-error");

    if (!recipient) { showError("transfer-error", "Enter recipient username."); return; }
    if (!amount || amount <= 0) { showError("transfer-error", "Enter a valid amount."); return; }

    const account = getAccount();
    if (recipient.toLowerCase() === account.username.toLowerCase()) {
        showError("transfer-error", "Cannot transfer to yourself.");
        return;
    }

    setButtonLoading("confirm-transfer-btn", true);
    try {
        // 1. Find recipient account
        const recipientAccount = await fetchByUsername(recipient);

        // 2. Withdraw from sender
        const updatedSender = await withdrawFunds(account.id, amount);

        // 3. Deposit to recipient
        await depositFunds(recipientAccount.id, amount);

        setAccount(updatedSender);
        updateBalance(updatedSender);
        closeModal("transfer-modal");
        await loadTransactions();
        showToast(`$${amount.toFixed(2)} sent to ${recipientAccount.username}`, "success");
    } catch (err) {
        const msg = err.message.includes("not found")
            ? `User "${recipient}" not found.`
            : err.message || "Transfer failed.";
        showError("transfer-error", msg);
    } finally {
        setButtonLoading("confirm-transfer-btn", false);
    }
});

// ═══════════════════════════════════════════════════════════
// REFRESH
// ═══════════════════════════════════════════════════════════

document.getElementById("refresh-btn").addEventListener("click", async () => {
    const account = getAccount();
    if (!account) return;
    try {
        const updated = await fetchAccount(account.id);
        setAccount(updated);
        updateBalance(updated);
        await loadTransactions();
        showToast("Data refreshed", "success");
    } catch {
        showToast("Failed to refresh", "error");
    }
});

// ═══════════════════════════════════════════════════════════
// TRANSACTION FILTERS
// ═══════════════════════════════════════════════════════════

let currentFilter = "all";

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderTransactions(getAllTransactions(), currentFilter);
    });
});

// ═══════════════════════════════════════════════════════════
// QUICK AMOUNTS
// ═══════════════════════════════════════════════════════════

document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const modal = btn.closest(".modal");
        if (!modal) return;
        const input = modal.querySelector(".amount-input");
        if (input) input.value = btn.dataset.amount;
    });
});

// ═══════════════════════════════════════════════════════════
// MODAL CLOSE
// ═══════════════════════════════════════════════════════════

document.querySelectorAll("[data-modal]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.modal));
});

document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(overlay.id); });
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape")
        document.querySelectorAll(".modal-overlay:not(.hidden)").forEach(m => closeModal(m.id));
});

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

async function loadTransactions() {
    const account = getAccount();
    if (!account) return;
    try {
        const txs = await fetchTransactions(account.id);
        setTransactions(txs);
        renderTransactions(txs, currentFilter);
    } catch {
        setTransactions([]);
        renderTransactions([], currentFilter);
    }
}

// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════

init();
