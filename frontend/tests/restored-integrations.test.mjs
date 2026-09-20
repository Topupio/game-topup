import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("homepage heading and all six editor heading levels stay enabled", () => {
    const home = read("src/app/(user)/page.tsx");
    const editor = read("src/components/form/RichTextEditor.tsx");
    assert.match(home, /<h1[^>]*>\s*Buy Game Top-Ups, Gift Cards &amp; Digital Subscriptions/);
    assert.match(editor, /heading:\s*\{\s*levels:\s*\[1, 2, 3, 4, 5, 6\]/);
    for (let level = 1; level <= 6; level += 1) {
        assert.match(editor, new RegExp(`Heading ${level}`));
    }
});

test("Meta browser and server purchase tracking remain wired", () => {
    const layout = read("src/app/layout.tsx");
    const game = read("src/components/user/gameDetails/GameDetailsPage.tsx");
    const order = read("src/components/user/orders/UserOrderDetailClient.tsx");
    assert.match(layout, /<TrafficAttribution \/>/);
    for (const event of ["ViewContent", "AddToCart", "InitiateCheckout"]) {
        assert.match(game, new RegExp(`"${event}"`));
    }
    assert.match(order, /usePurchaseAnalytics\(order\)/);
});
