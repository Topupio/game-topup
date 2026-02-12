export function toFormData(payload: Record<string, any>): FormData {
    const fd = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // File support
        if (value instanceof File || value instanceof Blob) {
            fd.append(key, value);
            return;
        }

        // Arrays → ALWAYS JSON stringify (because your backend wants 1 JSON string)
        if (Array.isArray(value)) {
            fd.append(key, JSON.stringify(value));
            return;
        }

        // Plain objects → JSON stringify
        if (typeof value === "object") {
            fd.append(key, JSON.stringify(value));
            return;
        }

        // Primitives
        fd.append(key, String(value));
    });

    return fd;
}