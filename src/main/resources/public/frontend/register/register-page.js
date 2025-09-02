const BASE_URL = "http://localhost:8081";

const usernameInput = document.getElementById("username-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const repeatPasswordInput = document.getElementById("repeat-password-input");
const registerButton = document.getElementById("register-button");

registerButton.addEventListener("click", processRegistration);

async function processRegistration() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const repeatPassword = repeatPasswordInput.value;

    if (!username || !email || !password || !repeatPassword) {
        alert("Please fill in all fields.");
        return;
    }
    if (password !== repeatPassword) {
        alert("Passwords do not match.");
        return;
    }

    const requestBody = { username, email, password };

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (response.status === 201) {
            window.location.href = "../login/login-page.html";
        } else if (response.status === 409) {
            alert("Username or email already exists.");
        } else {
            alert("Registration failed. Try again.");
        }
    } catch (err) {
        console.error(err);
        alert("Network error. Try again later.");
    }
}
