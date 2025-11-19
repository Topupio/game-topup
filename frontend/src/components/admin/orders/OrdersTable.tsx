"use client";

export type OrderRow = {
    id: string;
    user: string;
    game: string;
    amount: string;
    status: string;
};

type Props = {
    rows: OrderRow[];
    onView: (row: OrderRow) => void;
    onUpdate: (row: OrderRow) => void;
};

export default function OrdersTable({ rows, onView, onUpdate }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
                <thead className="bg-gray-100 text-left text-sm text-gray-600">
                    <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Game</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {rows.map((r) => (
                        <tr key={r.id} className="border-t border-gray-300 hover:bg-gray-50 transition">
                            <td className="p-4 font-medium">#{r.id}</td>
                            <td className="p-4">{r.user}</td>
                            <td className="p-4">{r.game}</td>
                            <td className="p-4">{r.amount}</td>
                            <td className="p-4">
                                <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                    {r.status}
                                </span>
                            </td>
                            <td className="p-4 text-right flex justify-end gap-2">
                                <button
                                    onClick={() => onView(r)}
                                    className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => onUpdate(r)}
                                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200 hover:bg-red-100 transition"
                                >
                                    Update
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
