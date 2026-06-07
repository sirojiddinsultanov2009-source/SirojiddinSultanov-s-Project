function isProductLiked(productId) {
    return getLikedProducts().includes(String(productId));
}

function toggleProductLike(productId) {
    const likedProducts = getLikedProducts();
    const id = String(productId);
    const isLiked = likedProducts.includes(id);

    const nextLikedProducts = isLiked
        ? likedProducts.filter((likedId) => likedId !== id)
        : [...likedProducts, id];

    saveLikedProducts(nextLikedProducts);
    return !isLiked;
}
