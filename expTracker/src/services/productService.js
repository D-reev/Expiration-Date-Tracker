export const fetchExpiredProducts = async () => {
    try {
        // Use the correct backend endpoint for expired products
        const response = await fetch('http://localhost:1337/fetchexpiredproducts');
        if (!response.ok) {
            throw new Error('Failed to fetch expired products');
        }
        const data = await response.json();
        return data; // Should be an array of expired products
    } catch (error) {
        console.error('Error fetching expired products:', error);
        return [];
    }
};