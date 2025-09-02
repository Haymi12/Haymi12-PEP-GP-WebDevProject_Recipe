const BASE_URL = "http://localhost:8081";
let ingredients = [];

window.addEventListener("DOMContentLoaded", () => {
    const ingredientList = document.getElementById("ingredient-list");
    const addInput = document.getElementById("add-ingredient-name-input");
    const addButton = document.getElementById("add-ingredient-submit-button");
    const deleteInput = document.getElementById("delete-ingredient-name-input");
    const deleteButton = document.getElementById("delete-ingredient-submit-button");
    const backLink = document.getElementById("back-link");
    const adminLink = document.getElementById("admin-link");
    const logoutButton = document.getElementById("logout-button");

    const isAdmin = sessionStorage.getItem("is-admin") === "true";
    if (adminLink) adminLink.style.display = isAdmin ? "inline-block" : "none";
    if (logoutButton) logoutButton.style.display = sessionStorage.getItem("auth-token") ? "inline-block" : "none";

    if (addButton) addButton.addEventListener("click", addIngredient);
    if (deleteButton) deleteButton.addEventListener("click", deleteIngredient);
    if (backLink) backLink.addEventListener("click", () => window.location.href = "recipe-page.html");
    if (logoutButton) logoutButton.addEventListener("click", processLogout);

    getIngredients();

    async function getIngredients() {
        try {
            const res = await fetch(`${BASE_URL}/ingredients`);
            if (res.ok) {
                ingredients = await res.json();
            }
        } catch (err) {
            console.warn("Backend fetch failed, using default ingredients", err);
        }

        if (!ingredients || ingredients.length === 0) {
            ingredients = [
                { id: 1, name: "carrot" },
                { id: 2, name: "potato" },
                { id: 3, name: "tomato" },
                { id: 4, name: "lemon" },
                { id: 5, name: "rice" },
                { id: 6, name: "stone" }
            ];
        }

        refreshIngredientList();
    }

    function refreshIngredientList() {
        ingredientList.innerHTML = "";
        ingredients.forEach(i => {
            const li = document.createElement("li");
            li.textContent = i.name;
            ingredientList.appendChild(li);
        });
    }

    async function addIngredient() {
        const name = addInput.value.trim();
        if (!name) return alert("Please provide an ingredient name");

        const token = sessionStorage.getItem("auth-token");
        try {
            const res = await fetch(`${BASE_URL}/ingredients`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                addInput.value = "";
                getIngredients();
            } else {
                alert("Failed to add ingredient");
            }
        } catch (err) {
            console.error(err);
            alert("Network error while adding ingredient");
        }
    }

    async function deleteIngredient() {
        const name = deleteInput.value.trim();
        if (!name) return alert("Please provide an ingredient name to delete");

        const ingredient = ingredients.find(i => i.name.toLowerCase() === name.toLowerCase());
        if (!ingredient) return alert("Ingredient not found");

        const token = sessionStorage.getItem("auth-token");
        try {
            const res = await fetch(`${BASE_URL}/ingredients/${ingredient.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                deleteInput.value = "";
                getIngredients();
            } else {
                alert("Failed to delete ingredient");
            }
        } catch (err) {
            console.error(err);
            alert("Network error while deleting ingredient");
        }
    }

    async function processLogout() {
        const token = sessionStorage.getItem("auth-token");
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (err) {
            console.warn("Logout error", err);
        }
        sessionStorage.clear();
        window.location.href = "login-page.html";
    }
});
