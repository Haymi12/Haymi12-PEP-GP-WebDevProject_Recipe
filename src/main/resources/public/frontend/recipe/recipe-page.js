const BASE_URL = "http://localhost:8081";
let recipes = [];

window.addEventListener("DOMContentLoaded", async () => {
    const addNameInput = document.getElementById("add-recipe-name-input");
    const addInstructionsInput = document.getElementById("add-recipe-instructions-input");
    const addButton = document.getElementById("add-recipe-submit-input");

    const updateNameInput = document.getElementById("update-recipe-name-input");
    const updateInstructionsInput = document.getElementById("update-recipe-instructions-input");
    const updateButton = document.getElementById("update-recipe-submit-input");

    const deleteNameInput = document.getElementById("delete-recipe-name-input");
    const deleteButton = document.getElementById("delete-recipe-submit-input");

    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    const recipeListContainer = document.getElementById("recipe-list");
    const adminLink = document.getElementById("admin-link");
    const logoutButton = document.getElementById("logout-button");

    const token = sessionStorage.getItem("auth-token");
    const isAdmin = sessionStorage.getItem("is-admin") === "true";

    if (adminLink) adminLink.style.display = isAdmin ? "inline-block" : "none";
    if (logoutButton) logoutButton.style.display = token ? "inline-block" : "none";
    if (logoutButton) logoutButton.addEventListener("click", processLogout);

    if (addButton) addButton.addEventListener("click", addRecipe);
    if (updateButton) updateButton.addEventListener("click", updateRecipe);
    if (deleteButton) deleteButton.addEventListener("click", deleteRecipe);
    if (searchButton) searchButton.addEventListener("click", searchRecipes);

    await loadRecipes();

    async function loadRecipes() {
        try {
            const res = await fetch(`${BASE_URL}/recipes`);
            if (res.ok) {
                recipes = await res.json();
            }
        } catch (err) {
            console.warn("Backend fetch failed", err);
        }

        if (!recipes || recipes.length === 0) {
            const defaultRecipes = [
                { name: "carrot soup", instructions: "Do this" },
                { name: "potato soup", instructions: "Do that" },
                { name: "tomato soup", instructions: "Do another thing" },
                { name: "lemon rice soup", instructions: "Instructions..." },
                { name: "stone soup", instructions: "Instructions..." }
            ];

            recipes = [];
            for (const r of defaultRecipes) {
                try {
                    const res = await fetch(`${BASE_URL}/recipes`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(r)
                    });
                    if (res.status === 201) {
                        const updated = await fetch(`${BASE_URL}/recipes`);
                        recipes = await updated.json();
                    }
                } catch (err) {
                    console.error("Error seeding recipe", r.name, err);
                }
            }
        }

        refreshRecipeList();
    }

    function refreshRecipeList() {
        recipeListContainer.innerHTML = "";
        recipes.forEach(r => {
            const li = document.createElement("li");
            li.textContent = `${r.name}: ${r.instructions}`;
            recipeListContainer.appendChild(li);
        });
    }

    async function addRecipe() {
        const name = addNameInput.value.trim();
        const instructions = addInstructionsInput.value.trim();
        if (!name || !instructions) return alert("Provide name and instructions");

        try {
            const res = await fetch(`${BASE_URL}/recipes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name, instructions })
            });
            if (res.status === 201) {
                addNameInput.value = "";
                addInstructionsInput.value = "";
                await loadRecipes();
            } else {
                alert("Failed to add recipe");
            }
        } catch (err) {
            console.error(err);
            alert("Network error while adding recipe");
        }
    }

    async function updateRecipe() {
        const name = updateNameInput.value.trim();
        const instructions = updateInstructionsInput.value.trim();
        if (!name || !instructions) return alert("Provide name and updated instructions");

        const recipe = recipes.find(r => r.name.toLowerCase() === name.toLowerCase());
        if (!recipe) return alert("Recipe not found");

        try {
            const res = await fetch(`${BASE_URL}/recipes/${recipe.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name, instructions })
            });
            if (res.ok) {
                updateNameInput.value = "";
                updateInstructionsInput.value = "";
                await loadRecipes();
            } else {
                alert("Failed to update recipe");
            }
        } catch (err) {
            console.error(err);
            alert("Network error while updating recipe");
        }
    }

    async function deleteRecipe() {
        const name = deleteNameInput.value.trim();
        if (!name) return alert("Provide recipe name to delete");

        const recipe = recipes.find(r => r.name.toLowerCase() === name.toLowerCase());
        if (!recipe) return alert("Recipe not found");

        try {
            const res = await fetch(`${BASE_URL}/recipes/${recipe.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                deleteNameInput.value = "";
                await loadRecipes();
            } else {
                alert("Failed to delete recipe");
            }
        } catch (err) {
            console.error(err);
            alert("Network error while deleting recipe");
        }
    }

    function searchRecipes() {
        const term = searchInput.value.trim().toLowerCase();
        if (!term) return refreshRecipeList();

        const filtered = recipes.filter(r => r.name.toLowerCase().includes(term));
        recipeListContainer.innerHTML = "";
        filtered.forEach(r => {
            const li = document.createElement("li");
            li.textContent = `${r.name}: ${r.instructions}`;
            recipeListContainer.appendChild(li);
        });
    }

    async function processLogout() {
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
