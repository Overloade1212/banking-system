async function apiFetch(url, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (window.authToken) headers["Authorization"] = `Bearer ${window.authToken}`;

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed: ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
}

export const createAccount  = (username, type) =>
    apiFetch("/api/accounts", { method: "POST", body: JSON.stringify({ username, type }) });

export const fetchAccount   = (id)       => apiFetch(`/api/accounts/${id}`);
export const fetchByUsername = (username) => apiFetch(`/api/accounts/by-username/${encodeURIComponent(username)}`);
export const depositFunds   = (id, amt)  => apiFetch(`/api/accounts/${id}/deposit?amount=${amt}`,  { method: "POST" });
export const withdrawFunds  = (id, amt)  => apiFetch(`/api/accounts/${id}/withdraw?amount=${amt}`, { method: "POST" });
export const fetchTransactions = (id)    => apiFetch(`/api/accounts/${id}/transactions`);
