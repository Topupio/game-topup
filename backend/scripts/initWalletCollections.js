/**
 * Create the wallet collections and build their indexes, then verify the result.
 *
 * Run this once before enabling wallet features:
 *   node scripts/initWalletCollections.js
 *
 * Why it matters: Mongoose builds indexes in the background after the app starts. A
 * unique index that has not finished building does not enforce uniqueness, so a
 * webhook arriving during that window could credit the same payment twice. This
 * script waits for the builds and fails loudly if any are missing.
 *
 * It also applies a $jsonSchema validator to `wallets`, which is the closest thing
 * MongoDB has to the SQL CHECK (balance_paise >= 0) the specification asked for.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import WalletTopup from "../models/walletTopup.model.js";
import WalletSettings, { getWalletSettings } from "../models/walletSettings.model.js";

dotenv.config();

const REQUIRED_UNIQUE_INDEXES = {
    wallets: ["user_1"],
    wallettransactions: ["wallet_1_seq_1", "idempotencyKey_1"],
    wallettopups: ["topupRef_1", "method_1_providerRef_1", "upi.utrNumber_1"],
};

async function applyBalanceValidator() {
    // MongoDB cannot express CHECK constraints in a Mongoose schema, so this is set
    // directly on the collection. It stops a negative balance even if something
    // bypasses the service layer entirely.
    await mongoose.connection.db.command({
        collMod: "wallets",
        validator: {
            $jsonSchema: {
                bsonType: "object",
                properties: {
                    balancePaise: {
                        bsonType: ["int", "long", "double"],
                        minimum: 0,
                        description: "balancePaise must be zero or greater",
                    },
                },
            },
        },
        validationLevel: "strict",
        validationAction: "error",
    });
}

async function run() {
    await connectDB();

    console.log("Creating wallet collections...");
    for (const model of [Wallet, WalletTransaction, WalletTopup, WalletSettings]) {
        await model.createCollection();
    }

    console.log("Building indexes (waiting for completion)...");
    for (const model of [Wallet, WalletTransaction, WalletTopup, WalletSettings]) {
        await model.syncIndexes();
    }

    console.log("Applying non-negative balance validator...");
    await applyBalanceValidator();

    console.log("Seeding wallet settings (disabled by default)...");
    await getWalletSettings();

    console.log("\nVerifying indexes:");
    let missing = 0;

    for (const [collection, required] of Object.entries(REQUIRED_UNIQUE_INDEXES)) {
        const indexes = await mongoose.connection.db.collection(collection).indexes();
        const names = indexes.map((i) => i.name);

        for (const name of required) {
            const index = indexes.find((i) => i.name === name);
            if (!index) {
                console.error(`  MISSING  ${collection}.${name}`);
                missing += 1;
            } else if (!index.unique) {
                console.error(`  NOT UNIQUE  ${collection}.${name}`);
                missing += 1;
            } else {
                console.log(`  ok  ${collection}.${name}`);
            }
        }

        console.log(`      (${collection}: ${names.length} indexes total)`);
    }

    if (missing > 0) {
        console.error(`\n${missing} required index(es) missing or not unique. Do NOT enable wallet features.`);
        process.exit(1);
    }

    console.log("\nWallet collections ready.");
    process.exit(0);
}

run().catch((err) => {
    console.error("initWalletCollections failed:", err);
    process.exit(1);
});
