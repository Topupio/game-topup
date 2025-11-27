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

    async post<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (options?.headers && typeof options.headers === "object") {
            Object.assign(headers, options.headers as Record<string, string>);
        }

        const init: RequestInit = {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            ...options,
            headers,
        };

        if (body !== undefined) {
            if (typeof FormData !== "undefined" && body instanceof FormData) {
                init.body = body as unknown as BodyInit;
                // let browser set content-type for FormData
                delete (init.headers as Record<string, string>)["Content-Type"];
            } else {
                init.body = JSON.stringify(body);
            }
        }

        const res = await fetch(process.env.NEXT_PUBLIC_API_BASE + url, init);

        if (!res.ok) throw new Error(`Server POST failed: ${res.status}`);
        return res.json();
    },
};
