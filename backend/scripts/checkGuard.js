/**
 * Guard for the wallet verification scripts.
 *
 * These scripts write to whichever database MONGO_URI points at, which by default is
 * production. They create a throwaway user and delete it afterwards, but running load
 * against a live cluster should always be a deliberate act, never a default.
 *
 * Run them with:
 *   WALLET_CHECK_ALLOW=1 npm run wallet:check
 */
export function assertChecksAllowed() {
    if (process.env.WALLET_CHECK_ALLOW === "1") return;

    const target = process.env.MONGO_URI || "(MONGO_URI not set)";
    const host = target.replace(/\/\/[^@]*@/, "//<credentials>@");

    console.error(
        "\nRefusing to run: this writes to a real database.\n" +
        `  Target: ${host}\n\n` +
        "It creates a temporary user and removes it afterwards, but point it at a test\n" +
        "database if you can. To proceed:\n\n" +
        "  WALLET_CHECK_ALLOW=1 npm run wallet:check\n"
    );

    process.exit(1);
}
