// Keycloak integration — currently disabled until backend security is configured.
// To enable: uncomment the init block and add spring-security-oauth2 to pom.xml.

window.authToken = null;
window.keycloakReady = false;
window._kc = null;

async function initKeycloak() {
  


    if (typeof Keycloak === "undefined") return;
    try {
        const kc = new Keycloak({
            url: "http://localhost:8081",
            realm: "banking",
            clientId: "bank-app"
        });
        window._kc = kc;
        const authenticated = await kc.init({
            onLoad: "check-sso",
            checkLoginIframe: false,
            pkceMethod: "S256"
        });
        if (authenticated) {
            window.authToken = kc.token;
            window.keycloakReady = true;
            setInterval(async () => {
                try {
                    const refreshed = await kc.updateToken(30);
                    if (refreshed) window.authToken = kc.token;
                } catch { kc.logout(); }
            }, 20000);
        }
    } catch (e) {
        console.warn("Keycloak unavailable:", e);
    }

}

function keycloakLogout() {
    if (window._kc && window.keycloakReady) {
        window._kc.logout({ redirectUri: window.location.origin });
    } else {
        // Without Keycloak just clear state and go back to create screen
        window.dispatchEvent(new CustomEvent("app:logout"));
    }
}
