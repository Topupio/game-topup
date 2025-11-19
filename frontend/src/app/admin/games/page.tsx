"use client";

import { useState } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import { TbPencil, TbTrash, TbToggleLeft, TbToggleRight } from "react-icons/tb";

export default function GamesPricingPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="p-6 w-full">
            {/* Page Title */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Games & Pricing</h1>

                <button className="
                    flex items-center gap-2 bg-black text-white px-4 py-2 
                    rounded-lg text-sm hover:bg-gray-900 transition
                ">
                    <FiPlus size={18} /> Add Game
                </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64 mb-6">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search games..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100 text-left text-sm text-gray-600">
                        <tr>
                            <th className="p-4">Game</th>
                            <th className="p-4">Denomination</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="text-sm">
                        {[
                            {
                                game: "Efootball 24",
                                denom: "600 Coins",
                                price: "₹449",
                                active: true,
                            },
                            {
                                game: "PUBG Mobile",
                                denom: "300 UC",
                                price: "₹259",
                                active: false,
                            },
                        ].map((item, idx) => (
                            <tr
                                key={idx}
                                className="border-t border-gray-300 hover:bg-gray-50 transition"
                            >
                                <td className="p-4 font-medium">{item.game}</td>
                                <td className="p-4">{item.denom}</td>
                                <td className="p-4">{item.price}</td>
                                <td className="p-4">
                                    {item.active ? (
                                        <span className="flex items-center gap-1 text-green-600">
                                            <TbToggleRight size={22} /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-500">
                                            <TbToggleLeft size={22} /> Inactive
                                        </span>
                                    )}
                                </td>

                                {/* ACTIONS */}
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-3">

                                        {/* EDIT */}
                                        <button
                                            className="
                                                flex items-center gap-1 px-3 py-1.5
                                                text-sm rounded-md border border-gray-300
                                                text-gray-700 hover:bg-gray-100 transition
                                            "
                                        >
                                            <TbPencil size={16} />
                                            Edit
                                        </button>

                                        {/* DELETE */}
                                        <button
                                            className="
                                                flex items-center gap-1 px-3 py-1.5
                                                text-sm rounded-md border border-red-300
                                                text-red-600 hover:bg-red-50 transition
                                            "
                                        >
                                            <TbTrash size={16} />
                                            Delete
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
