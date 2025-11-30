/**
 * Generate a random URL-safe slug
 * @param length - Length of the slug (default: 8)
 * @returns A random alphanumeric string
 */
export function generateSlug(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';

    for (let i = 0; i < length; i++) {
        slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return slug;
}

/**
 * Generate a unique slug that doesn't exist in the database
 * @param checkExists - Async function to check if slug exists
 * @param maxAttempts - Maximum number of attempts (default: 10)
 * @returns A unique slug
 */
export async function generateUniqueSlug(
    checkExists: (slug: string) => Promise<boolean>,
    maxAttempts: number = 10
): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
        const slug = generateSlug();
        const exists = await checkExists(slug);

        if (!exists) {
            return slug;
        }
    }

    // If we couldn't generate a unique slug after max attempts, use a longer one
    return generateSlug(12);
}
