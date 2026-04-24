export async function createAccount(username, type) {
    const url = "/api/accounts";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, type })
        });

        if (!response.ok) {
            throw new Error("Failed to create account");
        }

        const result = await response.json();
        return result;

    } catch (error) {
        throw error;
    }
}