// Load reusable HTML components into the page.
document.addEventListener("DOMContentLoaded", async () => {
    const components = document.querySelectorAll("[data-component]");

    for (const placeholder of components) {
        const componentPath = placeholder.dataset.component;

        try {
            const response = await fetch(componentPath);

            if (!response.ok) {
                throw new Error(
                    `Could not load ${componentPath}: ${response.status}`
                );
            }

            placeholder.innerHTML = await response.text();

        } catch (error) {
            console.error("Component loading error:", error);
        }
    }
});