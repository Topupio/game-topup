
export function toFormData<T extends Record<string, any>>(data: T): FormData {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === undefined || value === null) return;

        if (value instanceof File) {
            formData.append(key, value);
        } else if (Array.isArray(value)) {
            // For arrays, traditionally append multiple times or stringify depending on backend
            // Our backend expects JSON string for arrays of objects usually, or specific handling
            // This is a simple generic. For specific cases like 'content' in blogs, we handle it manually in the API client.
            // But if we use this generic, we might need adjustments.
            // For now, simple conversion.
            value.forEach(v => formData.append(key, v));
        } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, String(value));
        }
    });
    return formData;
}
