const PRODUCTS_API_URL = "https://jsonbek.uz/api/products";

async function fetchProducts() {
    const response = await fetch(PRODUCTS_API_URL);

    if (!response.ok) {
        throw new Error("API error");
    }

    const data = await response.json();

    if (Array.isArray(data)) {
        return data;
    }

    if (data.products) {
        return data.products;
    }

    if (data.data) {
        return data.data;
    }

    return [];
}
