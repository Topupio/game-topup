"use client";

import { useState } from "react";
import { RiArrowDownSLine, RiAddLine, RiSubtractLine } from "react-icons/ri";

/* ----------------------------------------------------- */
/*  MOCK PRODUCTS — replace with API data                */
/* ----------------------------------------------------- */
const products = [
    { id: 1, name: "100 Coins", price: 80, img: "/placeholder.png" },
    { id: 2, name: "300 Coins", price: 200, img: "/placeholder.png" },
    { id: 3, name: "500 Coins", price: 320, img: "/placeholder.png" },
    { id: 4, name: "1000 Coins", price: 600, img: "/placeholder.png" },
];

export default function GameDetailsPage() {
    const [activeTab, setActiveTab] = useState("products");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [qty, setQty] = useState(1);

    const updateQty = (change: number) => {
        setQty((prev) => Math.max(1, prev + change));
    };

    return (
        <div className="text-white max-w-7xl mx-auto py-16">

            {/* ---------------- Hero Section ---------------- */}
            <HeroHeader />

            {/* ---------------- Tabs ---------------- */}
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* ---------------- Main Layout ---------------- */}
            <div className="max-w-7xl mx-auto mt-8 flex flex-col lg:flex-row gap-10 px-4 lg:px-0">

                {/* ---------------- LEFT CONTENT ---------------- */}
                <div className="lg:w-2/3 w-full">
                    {activeTab === "overview" && <OverviewTab />}

                    {activeTab === "products" && (
                        <ProductGrid
                            selectedProduct={selectedProduct}
                            setSelectedProduct={(p: any) => {
                                setSelectedProduct(p);
                                setQty(1);
                            }}
                        />
                    )}

                    {activeTab === "how" && <HowToTab />}
                </div>

                {/* ---------------- CHECKOUT + USER DETAILS ---------------- */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-6">

                    <UserDetailsForm
                        fields={[
                            { id: "uid", label: "Player UID", required: true, type: "text" },
                            {
                                id: "server",
                                label: "Server",
                                required: true,
                                type: "select",
                                options: ["Asia", "Europe", "South America"],
                            },
                            {
                                id: "platform",
                                label: "Platform",
                                required: true,
                                type: "select",
                                options: ["Android", "iOS"],
                            },
                        ]}
                    />

                    {/* Checkout Box */}
                    {selectedProduct && (
                        <CheckoutCard
                            product={selectedProduct}
                            qty={qty}
                            updateQty={updateQty}
                        />
                    )}
                </aside>
            </div>
        </div>
    );
}

/* -------------------------------------------------- */
/* HERO                                               */
/* -------------------------------------------------- */
function HeroHeader() {
    return (
        <div className="relative h-64 sm:h-80 w-full rounded-b-3xl overflow-hidden">
            <img
                src="https://cdn2.unrealengine.com/genshin-natlan-2560x1440-7c1488a69af0.jpg"
                className="w-full h-full object-cover opacity-80 rounded-b-3xl"
            />

            <div className="absolute inset-0 bg-linear-to-t from-primary/90 to-black/40" />

            <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <img
                    src="/game-icon.png"
                    className="w-20 h-20 object-cover rounded-xl shadow-xl border border-white/20"
                />

                <div>
                    <h1 className="text-3xl font-bold tracking-wide">Efootball 2024</h1>
                    <p className="text-gray-300 text-sm">Top-up Game Utilities</p>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------- */
/* TABS                                               */
/* -------------------------------------------------- */
function Tabs({ activeTab, setActiveTab }: any) {
    return (
        <div className="mt-10 px-4 lg:px-0">
            <div className="flex gap-6 border-b border-white/10 pb-2">
                {[
                    { id: "overview", label: "Overview" },
                    { id: "products", label: "Products" },
                    { id: "how", label: "How to Top-up" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-2 text-sm font-medium transition-all relative
                                ${activeTab === tab.id ? "text-secondary" : "text-gray-300"}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-secondary rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------------------------- */
/* PRODUCTS GRID                                       */
/* -------------------------------------------------- */
function ProductGrid({ selectedProduct, setSelectedProduct }: any) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`group rounded-xl p-4 border cursor-pointer
                        transition-all duration-300
                        ${selectedProduct?.id === product.id
                            ? "border-secondary bg-secondary/10"
                            : "border-white/10 bg-white/5 hover:border-secondary"
                        }
                    `}
                >
                    <img
                        src={product.img}
                        className="rounded-lg w-full h-28 object-cover mb-3 group-hover:scale-105 transition-transform"
                    />

                    <div
                        className={`text-white font-semibold text-sm 
                            ${selectedProduct?.id === product.id ? "text-secondary" : ""}`}
                    >
                        {product.name}
                    </div>

                    <div className="text-gray-300 text-xs mt-1">Instant Delivery</div>

                    <div className="mt-3">
                        <span className="text-secondary font-bold">₹{product.price}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* -------------------------------------------------- */
/* CHECKOUT PANEL                                     */
/* -------------------------------------------------- */
function CheckoutCard({ product, qty, updateQty }: any) {
    return (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-secondary mb-4">Selected Product</h2>

            <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-300">
                    <span>{product.name}</span>
                    <span className="text-white font-semibold">₹{product.price}</span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between mt-4">
                    <span className="text-gray-300">Quantity</span>

                    <div className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-xl">
                        <RiSubtractLine
                            className="cursor-pointer text-tertiary"
                            onClick={() => updateQty(-1)}
                        />

                        <span className="text-white font-semibold">{qty}</span>

                        <RiAddLine
                            className="cursor-pointer text-tertiary"
                            onClick={() => updateQty(1)}
                        />
                    </div>
                </div>

                <div className="flex justify-between text-white font-bold mt-4">
                    <span>Total</span>
                    <span>₹{product.price * qty}</span>
                </div>

                <button className="w-full mt-6 py-3 rounded-xl bg-secondary hover:text-gray-950 font-semibold hover:bg-tertiary transition">
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------- */
/* OTHER SECTIONS                                      */
/* -------------------------------------------------- */
function OverviewTab() {
    return (
        <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
                Efootball Coins let you unlock premium players, kits, upgrades,
                and exclusive advantages inside the game.
            </p>
            <p>
                We provide instant and safe top-up for all Efootball users.
                Your account data is always secure.
            </p>
        </div>
    );
}

function HowToTab() {
    return (
        <div className="space-y-4 text-gray-300">
            <h3 className="text-xl font-semibold text-secondary">How to Top-up</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Enter your Game ID correctly</li>
                <li>Select coin package</li>
                <li>Complete secure checkout</li>
                <li>Coins delivered instantly</li>
            </ul>
        </div>
    );
}

/* -------------------------------------------------- */
/* USER DETAILS FORM                                   */
/* -------------------------------------------------- */
function UserDetailsForm({ fields }: { fields: any[] }) {
    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-secondary mb-4">Enter Player Details</h3>

            <div className="grid grid-cols-1 gap-5">
                {fields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-200">
                            {field.label}
                            {field.required && <span className="text-red-400"> *</span>}
                        </label>

                        {field.type === "text" && (
                            <input
                                type="text"
                                placeholder={`Enter ${field.label}`}
                                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl 
                                placeholder-gray-400 backdrop-blur-lg focus:outline-none
                                focus:border-secondary focus:shadow-[0_0_10px_rgba(255,120,0,0.4)] transition-all"
                            />
                        )}

                        {field.type === "select" && (
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl
                                    backdrop-blur-lg appearance-none focus:border-secondary focus:shadow-[0_0_10px_rgba(255,120,0,0.4)]"
                                >
                                    <option className="text-black">Select {field.label}</option>
                                    {field.options.map((opt: string) => (
                                        <option key={opt} className="text-black">
                                            {opt}
                                        </option>
                                    ))}
                                </select>

                                <RiArrowDownSLine className="absolute right-3 top-3 text-white/70 pointer-events-none" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-400 mt-3">
                Make sure details are correct. Wrong UID / Server may cause delivery delays.
            </p>
        </div>
    );
}