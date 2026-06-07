function isProductLiked(productId) {
    const likes = getLikedProducts();
    return likes.includes(String(productId));
}

function toggleProductLike(productId) {
    const likes = getLikedProducts();
    const id = String(productId);
    const index = likes.indexOf(id);

    if (index === -1) {
        likes.push(id);
        saveLikedProducts(likes);
        return true;
    }

    likes.splice(index, 1);
    saveLikedProducts(likes);
    return false;
}

