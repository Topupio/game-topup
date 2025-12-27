import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface UseAdminFormOptions<T> {
    onSuccess?: (data?: any) => void;
    onError?: (error: any) => void;
    redirectPath?: string;
    refreshAfterSubmit?: boolean;
}

export function useAdminForm<T extends Record<string, any>>(
    initialState: T,
    options: UseAdminFormOptions<T> = {}
) {
    const router = useRouter();
    const [form, setForm] = useState<T>(initialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    const updateForm = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
        setForm((prev) =>
            typeof updates === "function" ? updates(prev) : { ...prev, ...updates }
        );
    }, []);

    const updateError = useCallback((field: keyof T, message: string) => {
        setErrors((prev) => ({ ...prev, [field]: message }));
    }, []);

    const clearError = useCallback((field: keyof T) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const handleSubmit = useCallback(
        async (
            onSubmit: (form: T) => Promise<void>,
            e: React.FormEvent
        ) => {
            e.preventDefault();
            setLoading(true);

            try {
                await onSubmit(form);
                options.onSuccess?.();
                options.redirectPath &&
                    router.push(options.redirectPath);
                options.refreshAfterSubmit && router.refresh();
            } catch (error: any) {
                console.error(error);
                options.onError?.(error);
            } finally {
                setLoading(false);
            }
        },
        [form, router, options]
    );

    return {
        form,
        setForm,
        updateForm,
        loading,
        setLoading,
        errors,
        setErrors,
        updateError,
        clearError,
        clearErrors,
        handleSubmit,
    };
}
