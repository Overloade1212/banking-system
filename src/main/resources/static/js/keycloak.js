const keycloak = new Keycloak({
    url: "http://localhost:8081",
    realm: "banking",
    clientId: "bank-app"
});

async function initKeycloak() {
    const authenticated = await keycloak.init({
        onLoad: "login-required",
        checkLoginIframe: false
    });

    if (authenticated) {
        window.authToken = keycloak.token;
    }
}