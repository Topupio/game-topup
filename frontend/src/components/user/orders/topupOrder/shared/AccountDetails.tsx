"use client";

import { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { Order } from "@/services/orders/types";

/** login_topup asks for the customer's own game password, so don't print it in plain text. */
export function isPassword(fieldKey?: string | null) {
    return fieldKey === "password";
}

interface Props {
    userInputs: Order["userInputs"];
}

export default function AccountDetails({ userInputs }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    if (!userInputs.length) return null;

    return (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
            <div className="mb-1 flex items-center justify-between gap-3">
                <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                    Account details
                </h2>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {userInputs.length} fields
                </span>
            </div>

            <div>
                {userInputs.map((input, index) => {
                    const secret = isPassword(input.fieldKey);
                    const hidden = secret && !showPassword;

                    return (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0 last:pb-0"
                        >
                            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">
                                {input.label}
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="break-all text-right text-xs font-bold tracking-tight text-foreground sm:text-sm">
                                    {hidden ? "••••••••" : String(input.value)}
                                </span>
                                {secret && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="shrink-0 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                                    </button>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
