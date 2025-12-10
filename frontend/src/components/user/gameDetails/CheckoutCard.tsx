"use client";

import { RiAddLine, RiSubtractLine } from "react-icons/ri";

export default function CheckoutCard({ product, qty, updateQty }: any) {
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
            <RiSubtractLine className="cursor-pointer text-tertiary" onClick={() => updateQty(-1)} />

            <span className="text-white font-semibold">{qty}</span>

            <RiAddLine className="cursor-pointer text-tertiary" onClick={() => updateQty(1)} />
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
