import { TRUST_STATS } from "@/lib/constants/trustStats";

/** Social proof under the payment card. Figures are placeholders — see TRUST_STATS. */
export default function TrustStrip() {
    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {TRUST_STATS.map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-card p-3 text-center shadow-soft"
                >
                    <p className="text-sm font-extrabold tracking-tight text-foreground sm:text-base">
                        {stat.value}
                    </p>
                    <p className="mt-0.5 text-[10px] font-semibold leading-tight text-muted-foreground">
                        {stat.label}
                    </p>
                </div>
            ))}
        </div>
    );
}
