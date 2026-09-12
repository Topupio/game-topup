import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

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

    /*
     * "Dirty" tracking, so a Save button can stay disabled until something
     * actually changes.
     *
     * `baseline` is a snapshot of the form as it was last known to match what's
     * saved on the server: the initial state for a create form, and whatever the
     * API returned for an edit form (the page calls resetBaseline after loading).
     * `isDirty` is then just "does the form differ from that snapshot".
     *
     * Comparing by value rather than tracking a was-touched flag means editing a
     * field and then undoing the edit correctly returns to a clean state.
     */
    const [baseline, setBaseline] = useState<string>(() => JSON.stringify(initialState));

    /** Marks the current form values as the new "unchanged" state. */
    const resetBaseline = useCallback((snapshot: T) => {
        setBaseline(JSON.stringify(snapshot));
    }, []);

    const isDirty = useMemo(() => JSON.stringify(form) !== baseline, [form, baseline]);

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
        isDirty,
        resetBaseline,
    };
}
