let csrfToken: string | null = null;

export async function fetchCsrfToken(): Promise<string> {
    if (typeof window === "undefined") return ""; // server-safe
    if (csrfToken) return csrfToken;

    const res = await fetch("/api/auth/csrf", {
        credentials: "include",
    });

    const data = await res.json();
    csrfToken = data.csrfToken as string;
    return csrfToken;
}

export function clearCachedCsrf() {
    csrfToken = null;
}
