"use client";

import { Product } from "@/lib/types/product";

export default function ProductGrid({ selectedProduct, setSelectedProduct, products }: any) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
                <div
                    key={product._id}
                    onClick={() => setSelectedProduct(product)}
                    className={`group rounded-xl p-4 border cursor-pointer transition-all duration-300 ${selectedProduct?._id === product._id
                            ? "border-secondary bg-secondary/10"
                            : "border-white/10 bg-white/5 hover:border-secondary"
                        }`}
                >
                    <img
                        src={product.imageUrl || "https://via.placeholder.com/150"}
                        className="rounded-lg w-full h-28 object-cover mb-3 group-hover:scale-105 transition-transform"
                    />

                    <div className={`text-white font-semibold text-sm ${selectedProduct?._id === product._id ? "text-secondary" : ""}`}>
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
