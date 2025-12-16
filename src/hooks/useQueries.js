import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch books with optional filters
async function fetchBooks({ category, search, page = 1, limit = 20 }) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);

    const res = await fetch(`/api/books?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch books');
    return res.json();
}

// Hook: Get books with caching
export function useBooks(filters = {}) {
    return useQuery({
        queryKey: ['books', filters],
        queryFn: () => fetchBooks(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

// Hook: Get single book
export function useBook(bookId) {
    return useQuery({
        queryKey: ['book', bookId],
        queryFn: async () => {
            const res = await fetch(`/api/books/${bookId}`);
            if (!res.ok) throw new Error('Book not found');
            return res.json();
        },
        enabled: !!bookId,
    });
}

// Hook: Get categories
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - categories rarely change
    });
}

// Hook: Get reviews with pagination
export function useReviews(bookId, sort = 'newest') {
    return useQuery({
        queryKey: ['reviews', bookId, sort],
        queryFn: async () => {
            const res = await fetch(`/api/reviews?bookId=${bookId}&sort=${sort}`);
            if (!res.ok) throw new Error('Failed to fetch reviews');
            return res.json();
        },
        enabled: !!bookId,
    });
}

// Hook: Add review mutation
export function useAddReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to add review');
            }
            return res.json();
        },
        onSuccess: (_, variables) => {
            // Invalidate reviews cache for this book
            queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] });
        },
    });
}

// Hook: Vote on review mutation
export function useVoteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reviewId, type }) => {
            const res = await fetch('/api/reviews/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, type }),
            });
            if (!res.ok) throw new Error('Vote failed');
            return res.json();
        },
        onSuccess: (_, variables) => {
            // Invalidate all reviews queries to refresh vote counts
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });
}

// Hook: Get user library
export function useLibrary() {
    return useQuery({
        queryKey: ['library'],
        queryFn: async () => {
            const res = await fetch('/api/library');
            if (!res.ok) throw new Error('Failed to fetch library');
            return res.json();
        },
    });
}

// Hook: Add to library mutation
export function useAddToLibrary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bookId) => {
            const res = await fetch('/api/library', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId }),
            });
            if (!res.ok) throw new Error('Failed to add to library');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
        },
    });
}
