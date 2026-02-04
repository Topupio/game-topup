"use client";

import { Product } from "@/lib/types/product";

export default function ProductGrid({
    selectedProduct,
    setSelectedProduct,
    products
}: any) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => {
                const discountPercent = Math.round(
                    ((product.price - product.discountedPrice) / product.price) * 100
                );

                const isSelected = selectedProduct?._id === product._id;

                return (
                    <div
                        key={product._id}
                        onClick={() => setSelectedProduct(product)}
                        className={`group relative cursor-pointer rounded-2xl p-4
                        border transition-all duration-300 ease-out
                        backdrop-blur-xl
                        ${isSelected
                                ? "border-secondary bg-secondary/10 ring-2 ring-secondary/40 shadow-xl"
                                : "border-border bg-card hover:border-secondary/60 hover:bg-muted hover:shadow-lg"
                            }`}
                    >
                        {/* SELECTED BADGE */}
                        {isSelected && (
                            <div className="absolute top-2 right-2 z-10 bg-secondary text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                Selected
                            </div>
                        )}

                        {/* DISCOUNT BADGE */}
                        {discountPercent > 0 && (
                            <div className="absolute top-2 left-2 bg-tertiary text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow z-10">
                                {discountPercent}% OFF
                            </div>
                        )}

                        {/* IMAGE */}
                        <div className="relative overflow-hidden rounded-xl bg-muted p-3">
                            <img
                                src={
                                    product.imageUrl ||
                                    "https://shop.ldrescdn.com/rms/ld-space/process/img/424511be78df48649e4324b77a00b10f1745483726.webp"
                                }
                                alt={product.name}
                                className="w-full h-28 object-contain transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* IMAGE OVERLAY */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* CONTENT */}
                        <div className="mt-4 space-y-1 text-center">
                            <h3
                                className={`text-sm font-semibold tracking-wide truncate
                                ${isSelected
                                        ? "text-secondary"
                                        : "text-foreground group-hover:text-secondary"
                                    }`}
                            >
                                {product.name}
                            </h3>

                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                                Instant Delivery
                            </p>
                        </div>

                        {/* PRICE */}
                        <div className="mt-4 text-center space-y-1">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-secondary font-bold text-lg">
                                    ₹{product.discountedPrice}
                                </span>

                                {discountPercent > 0 && (
                                    <span className="text-muted-foreground text-sm line-through">
                                        ₹{product.price}
                                    </span>
                                )}
                            </div>

                            {discountPercent > 0 && (
                                <p className="text-tertiary text-xs font-medium tracking-wide">
                                    -$ {product.price - product.discountedPrice}
                                </p>
                            )}
                        </div>

                        {/* HOVER GLOW */}
                        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition">
                            <div className="absolute inset-0 bg-secondary/10 blur-xl" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
