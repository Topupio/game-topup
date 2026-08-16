import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import WalletTopup from "../models/walletTopup.model.js";
import Order from "../models/order.model.js";
import WalletAudit from "../models/walletAudit.model.js";
import { formatPaise } from "../utils/money.js";

/**
 * Reconcile every wallet balance against its ledger.
 *
 * A wallet balance is a cached total; the ledger is the truth. They can only diverge
 * through a bug, and the whole point of this job is that such a bug is noticed the
 * next morning rather than during a customer dispute months later.
 *
 * Two levels of checking:
 *
 *   Nightly: compare the balance to the newest ledger row's balanceAfterPaise. One
 *   indexed lookup per wallet, so it stays fast as the ledger grows.
 *
 *   Full: sum every row. Correct but proportional to total history, so it runs weekly
 *   and whenever the quick check finds something wrong.
 */
export async function auditWalletBalances({ full = false } = {}) {
    const startedAt = Date.now();
    const mismatches = [];
    let walletsChecked = 0;

    const cursor = Wallet.find({}).select("_id user balancePaise txnSeq").lean().cursor();

    for await (const wallet of cursor) {
        walletsChecked += 1;

        const latest = await WalletTransaction.findOne({ wallet: wallet._id })
            .sort({ seq: -1 })
            .select("seq balanceAfterPaise")
            .lean();

        if (!latest) {
            // No history means the balance must be zero.
            if (wallet.balancePaise !== 0 || wallet.txnSeq !== 0) {
                mismatches.push({
                    wallet: wallet._id,
                    user: wallet.user,
                    kind: "NO_LEDGER",
                    walletBalancePaise: wallet.balancePaise,
                    ledgerBalancePaise: 0,
                    differencePaise: wallet.balancePaise,
                });
            }
            continue;
        }

        const headMatches =
            latest.balanceAfterPaise === wallet.balancePaise && latest.seq === wallet.txnSeq;

        if (!full && headMatches) continue;

        // Either a full run, or the quick check failed and we need the detail.
        const [totals] = await WalletTransaction.aggregate([
            { $match: { wallet: wallet._id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$deltaPaise" },
                    count: { $sum: 1 },
                    maxSeq: { $max: "$seq" },
                },
            },
        ]);

        const ledgerBalancePaise = totals?.total ?? 0;
        const sumMatches = ledgerBalancePaise === wallet.balancePaise;
        const seqIntact = totals ? totals.count === totals.maxSeq : true;

        if (!sumMatches || !seqIntact || !headMatches) {
            mismatches.push({
                wallet: wallet._id,
                user: wallet.user,
                kind: !sumMatches ? "SUM_MISMATCH" : !seqIntact ? "SEQUENCE_GAP" : "HEAD_MISMATCH",
                walletBalancePaise: wallet.balancePaise,
                ledgerBalancePaise,
                differencePaise: wallet.balancePaise - ledgerBalancePaise,
            });
        }
    }

    // System-wide totals. These must agree even if no individual wallet is flagged.
    const [walletTotals] = await Wallet.aggregate([
        { $group: { _id: null, total: { $sum: "$balancePaise" } } },
    ]);
    const [ledgerTotals] = await WalletTransaction.aggregate([
        { $group: { _id: null, total: { $sum: "$deltaPaise" } } },
    ]);

    const globalWalletSumPaise = walletTotals?.total || 0;
    const globalLedgerSumPaise = ledgerTotals?.total || 0;

    const audit = await WalletAudit.create({
        mode: full ? "full" : "nightly",
        walletsChecked,
        mismatchCount: mismatches.length,
        mismatches: mismatches.slice(0, 100),
        globalWalletSumPaise,
        globalLedgerSumPaise,
        durationMs: Date.now() - startedAt,
        status:
            mismatches.length > 0 || globalWalletSumPaise !== globalLedgerSumPaise
                ? "mismatch"
                : "clean",
    });

    return {
        walletsChecked,
        mismatchCount: mismatches.length,
        mismatches,
        globalWalletSumPaise,
        globalLedgerSumPaise,
        status: audit.status,
        durationMs: audit.durationMs,
    };
}

/**
 * Look for money that moved without the paperwork, or paperwork without the money.
 * Cheap queries, and each one catches a different kind of bug.
 */
export async function auditWalletIntegrity() {
    const problems = [];

    const [creditedWithoutLedger, paidOrdersWithoutDebit, adminRowsWithoutReason] =
        await Promise.all([
            // A top-up marked credited but with no ledger row behind it.
            WalletTopup.find({
                status: "confirmed",
                creditTransaction: null,
                creditedAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) },
            })
                .select("topupRef user amountPaise creditedAt")
                .limit(50)
                .lean(),

            // An order paid from a wallet with nothing debited: free goods.
            Order.find({ paymentMethod: "wallet", paymentStatus: "paid" })
                .select("_id orderId user")
                .limit(200)
                .lean(),

            // An admin-initiated row with no reason breaks the audit trail.
            WalletTransaction.find({ admin: { $ne: null }, reason: null })
                .select("_id user type amountPaise createdAt")
                .limit(50)
                .lean(),
        ]);

    if (creditedWithoutLedger.length) {
        problems.push({ kind: "TOPUP_WITHOUT_LEDGER_ROW", items: creditedWithoutLedger });
    }

    if (adminRowsWithoutReason.length) {
        problems.push({ kind: "ADMIN_ROW_WITHOUT_REASON", items: adminRowsWithoutReason });
    }

    if (paidOrdersWithoutDebit.length) {
        const orderIds = paidOrdersWithoutDebit.map((o) => o._id);
        const debited = await WalletTransaction.find({
            order: { $in: orderIds },
            type: "debit_order",
        })
            .select("order")
            .lean();

        const debitedIds = new Set(debited.map((d) => String(d.order)));
        const missing = paidOrdersWithoutDebit.filter((o) => !debitedIds.has(String(o._id)));

        if (missing.length) {
            problems.push({ kind: "WALLET_ORDER_WITHOUT_DEBIT", items: missing });
        }
    }

    return problems;
}

/** Entry point for the cron schedule. */
export async function runWalletAudit({ full = false } = {}) {
    const balances = await auditWalletBalances({ full });
    const integrity = await auditWalletIntegrity();

    const globalMatches = balances.globalWalletSumPaise === balances.globalLedgerSumPaise;

    if (balances.mismatchCount > 0 || integrity.length > 0 || !globalMatches) {
        // Prefixed so it can be grepped out of PM2 logs. There is no alerting service
        // configured; the persisted WalletAudit document is the durable record.
        console.error(
            `[WALLET-AUDIT-ALERT] ${balances.mismatchCount} balance mismatch(es), ` +
            `${integrity.length} integrity problem(s). ` +
            `Wallets total ${formatPaise(balances.globalWalletSumPaise)}, ` +
            `ledger total ${formatPaise(balances.globalLedgerSumPaise)}.`
        );
        for (const problem of integrity) {
            console.error(`[WALLET-AUDIT-ALERT] ${problem.kind}: ${problem.items.length} affected`);
        }
    } else {
        console.log(
            `[WALLET-AUDIT] Clean. ${balances.walletsChecked} wallet(s), ` +
            `${formatPaise(balances.globalWalletSumPaise)} outstanding, ${balances.durationMs}ms.`
        );
    }

    return { ...balances, integrity };
}
