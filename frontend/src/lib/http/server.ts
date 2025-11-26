// src/lib/http/server.ts

export const serverApi = {
    async get<T>(url: string, options?: RequestInit): Promise<T> {
        const res = await fetch(process.env.NEXT_PUBLIC_API_BASE + url, {
            ...options,
            credentials: "include",
            cache: "no-store",
        });

        if (!res.ok) throw new Error(`Server GET failed: ${res.status}`);
        return res.json();
    },

    async post<T>(url: string, body: any, options?: RequestInit): Promise<T> {
        const res = await fetch(process.env.NEXT_PUBLIC_API_BASE + url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            cache: "no-store",
            ...options,
        });

        if (!res.ok) throw new Error(`Server POST failed: ${res.status}`);
        return res.json();
    },
};
