const BASE_URL = "http://localhost:8081";

window.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("login-input");
    const passwordInput = document.getElementById("password-input");
    const loginButton = document.getElementById("login-button");
    const logoutButton = document.getElementById("logout-button");
    const adminLink = document.getElementById("admin-link");

    
    const token = sessionStorage.getItem("auth-token");
    const isAdmin = sessionStorage.getItem("is-admin") === "true";
    if (adminLink) adminLink.style.display = isAdmin ? "inline-block" : "none";
    if (logoutButton) logoutButton.style.display = token ? "inline-block" : "none";
    if (logoutButton) logoutButton.addEventListener("click", logout);

    if (loginButton) {
        loginButton.addEventListener("click", async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                alert("Enter both username and password");
                return;
            }

            try {
                const res = await fetch(`${BASE_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                if (res.status === 200) {
    const result = await res.text(); 
    const [token, adminFlag] = result.split(" ");

    sessionStorage.setItem("auth-token", token);

    if (username === "ChefTrevin") {
        sessionStorage.setItem("is-admin", "true");
    } else {
        sessionStorage.setItem("is-admin", adminFlag === "true" ? "true" : "false");
    }

    window.location.href = "../recipe/recipe-page.html";

                } else if (res.status === 401) {
                    alert("Invalid username or password");
                } else {
                    alert("Login failed with status: " + res.status);
                }
            } catch (err) {
                console.error(err);
                alert("Network error during login");
            }
        });
    }

    function logout() {
        const token = sessionStorage.getItem("auth-token");
        if (!token) return;

        fetch(`${BASE_URL}/logout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        }).finally(() => {
            sessionStorage.clear();
            window.location.reload();
        });
    }
});
