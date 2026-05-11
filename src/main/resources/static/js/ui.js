import { getAccount, getAllTransactions } from "./state.js?v=5";

// ── Elements ──────────────────────────────────────────────
const authScreen     = document.getElementById("auth-screen");
const mainScreen     = document.getElementById("main-screen");
const loadingOverlay = document.getElementById("loading-overlay");

const balanceAmount    = document.getElementById("balance-amount");
const accountTypeBadge = document.getElementById("account-type-badge");
const accountIdShort   = document.getElementById("account-id-short");
const accountCreated   = document.getElementById("account-created");
const accountOwner     = document.getElementById("account-owner");
const statTotalIn      = document.getElementById("stat-total-in");
const statTotalOut     = document.getElementById("stat-total-out");
const navAvatar        = document.getElementById("nav-avatar");
const navUsername      = document.getElementById("nav-username");
const transactionsList = document.getElementById("transactions-list");
const accountInfoCard  = document.getElementById("account-info-card");

const toast        = document.getElementById("toast");
const toastIcon    = document.getElementById("toast-icon");
const toastMessage = document.getElementById("toast-message");
let toastTimer;

// ── Account type metadata ─────────────────────────────────
const TYPE_META = {
    SAVINGS:    { emoji: "💰", label: "Savings",    color: "#22c55e", desc: "Standard savings account. Cannot go below $0.", limit: "No overdraft" },
    CHECKING:   { emoji: "🏦", label: "Checking",   color: "#3b82f6", desc: "Everyday checking account. Cannot go below $0.", limit: "No overdraft" },
    CREDIT:     { emoji: "💳", label: "Credit",     color: "#a855f7", desc: "Credit account with up to $1,000 overdraft.", limit: "−$1,000 limit" },
    BUSINESS:   { emoji: "🏢", label: "Business",   color: "#f59e0b", desc: "Business account for company operations.", limit: "No overdraft" },
    INVESTMENT: { emoji: "📈", label: "Investment", color: "#06b6d4", desc: "Investment account for growing your wealth.", limit: "No overdraft" },
};

// ═══════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════

export function hideLoading() {
    loadingOverlay.classList.add("fade-out");
    setTimeout(() => loadingOverlay.classList.add("hidden"), 400);
}

export function showAuthScreen() {
    authScreen.classList.remove("hidden");
    mainScreen.classList.add("hidden");
}

export function showDashboard() {
    authScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");
    renderAccount(getAccount());
    renderAccountInfo(getAccount());
}

// ═══════════════════════════════════════════════════════════
// ACCOUNT
// ═══════════════════════════════════════════════════════════

export function updateBalance(account) {
    balanceAmount.textContent = fmt(account.balance);
    balanceAmount.classList.remove("pulse");
    void balanceAmount.offsetWidth;
    balanceAmount.classList.add("pulse");
}

function renderAccount(account) {
    if (!account) return;
    const meta = TYPE_META[account.type] || {};
    const initial = (account.username || "?").charAt(0).toUpperCase();

    navAvatar.textContent   = initial;
    navUsername.textContent = account.username;

    balanceAmount.textContent    = fmt(account.balance);
    accountTypeBadge.textContent = (meta.emoji || "") + " " + (meta.label || account.type);
    accountTypeBadge.style.setProperty("--badge-color", meta.color || "#d4af37");
    accountOwner.textContent     = account.username;

    const id = account.id ? String(account.id) : "—";
    accountIdShort.textContent = "…" + id.slice(-8);

    accountCreated.textContent = account.createdAt
        ? new Date(account.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "Just now";
}

function renderAccountInfo(account) {
    if (!account) return;
    const meta = TYPE_META[account.type] || {};
    accountInfoCard.innerHTML = `
        <div class="info-row">
            <div class="info-cell">
                <span class="info-label">Type</span>
                <span class="info-value">${meta.emoji || ""} ${meta.label || account.type}</span>
            </div>
            <div class="info-cell">
                <span class="info-label">Overdraft Policy</span>
                <span class="info-value">${meta.limit || "—"}</span>
            </div>
            <div class="info-cell">
                <span class="info-label">Full Account ID</span>
                <span class="info-value mono small">${account.id}</span>
            </div>
        </div>
        <p class="info-desc">${meta.desc || ""}</p>
    `;
}

// ═══════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════

export function renderTransactions(transactions, filter = "all") {
    const txs = getAllTransactions();

    // Compute stats from ALL transactions (not filtered)
    let totalIn = 0, totalOut = 0;
    txs.forEach(tx => {
        const amt = parseFloat(tx.amount) || 0;
        if (tx.type === "DEPOSIT") totalIn += amt;
        else totalOut += amt;
    });
    statTotalIn.textContent  = fmt(totalIn);
    statTotalOut.textContent = fmt(totalOut);

    // Apply filter
    const filtered = filter === "all" ? txs : txs.filter(tx => tx.type === filter);
    const count = filtered.length;

    if (count === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${filter === "DEPOSIT" ? "📥" : filter === "WITHDRAW" ? "📤" : "📋"}</div>
                <p>${filter === "all" ? "No transactions yet" : "No " + filter.toLowerCase() + "s yet"}</p>
                <span>${filter === "all" ? "Make a deposit to get started" : ""}</span>
            </div>`;
        return;
    }

    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    transactionsList.innerHTML = sorted.map((tx, i) => {
        const isDeposit = tx.type === "DEPOSIT";
        const cls  = isDeposit ? "deposit" : "withdraw";
        const sign = isDeposit ? "+" : "−";
        const icon = isDeposit ? "↓" : "↑";
        const date = tx.createdAt
            ? new Date(tx.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
            : "—";

        return `
        <div class="tx-item" style="animation-delay:${i * 30}ms">
            <div class="tx-icon ${cls}">${icon}</div>
            <div class="tx-info">
                <div class="tx-type">${tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}</div>
                <div class="tx-date">${date}</div>
            </div>
            <div class="tx-amount ${cls}">${sign}${fmt(tx.amount)}</div>
        </div>`;
    }).join("");
}

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════

export function showToast(message, type = "default") {
    clearTimeout(toastTimer);
    const icons = { success: "✓", error: "✕", default: "ℹ" };
    toastIcon.textContent    = icons[type] || "ℹ";
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    void toast.offsetWidth;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

// ═══════════════════════════════════════════════════════════
// MODALS / FORMS
// ═══════════════════════════════════════════════════════════

export const openModal  = id => document.getElementById(id).classList.remove("hidden");
export const closeModal = id => document.getElementById(id).classList.add("hidden");

export function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.remove("hidden");
}

export function clearError(id) {
    const el = document.getElementById(id);
    el.textContent = "";
    el.classList.add("hidden");
}

export function setButtonLoading(btnId, loading) {
    const btn    = document.getElementById(btnId);
    const text   = btn.querySelector(".btn-text");
    const loader = btn.querySelector(".btn-loader");
    btn.disabled = loading;
    text.classList.toggle("hidden", loading);
    loader.classList.toggle("hidden", !loading);
}

// ═══════════════════════════════════════════════════════════
// AUTH TABS
// ═══════════════════════════════════════════════════════════

export function initAuthTabs() {
    document.querySelectorAll(".auth-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const target = tab.dataset.tab;
            document.getElementById("tab-login").classList.toggle("hidden", target !== "login");
            document.getElementById("tab-register").classList.toggle("hidden", target !== "register");
        });
    });
}

// Account type info hint on register
export function initTypeHint() {
    const select = document.getElementById("account-type");
    const info   = document.getElementById("type-info");
    select.addEventListener("change", () => {
        const meta = TYPE_META[select.value];
        if (meta) {
            info.innerHTML = `<span>${meta.emoji} <strong>${meta.label}</strong> — ${meta.desc}</span>`;
            info.classList.remove("hidden");
        }
    });
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function fmt(value) {
    const n = parseFloat(value) || 0;
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
