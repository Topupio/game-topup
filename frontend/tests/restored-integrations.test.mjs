import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("homepage heading and all six editor heading levels stay enabled", () => {
    const home = read("src/app/(user)/page.tsx");
    const categoryQuickNav = read("src/components/user/homePage/CategoryQuickNav.tsx");
    const editor = read("src/components/form/RichTextEditor.tsx");
    assert.doesNotMatch(home, /<h1[^>]*>\s*Buy Game Top-Ups, Gift Cards &amp; Digital Subscriptions/);
    assert.match(
        categoryQuickNav,
        /<h1 className="text-gray-500 text-xs sm:text-sm font-normal">\s*Buy Game Top-Ups, Gift Cards &amp; Digital Subscriptions/
    );
    assert.doesNotMatch(categoryQuickNav, /Quick access to all categories/);
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

test("deployment rejects broken Next.js links and checks a live product page", () => {
    const deploy = read("../.github/workflows/deploy.yml");
    assert.match(deploy, /find \.next\/node_modules -xtype l/);
    assert.match(deploy, /uid-instant-top-up\/mlbb-diamond-recharge-india/);
    assert.match(deploy, /Googlebot\/2\.1/);
});
