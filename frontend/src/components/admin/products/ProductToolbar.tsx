import AdminToolbar from '../shared/AdminToolbar';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';

const ProductToolbar = () => {
    return (
        <AdminToolbar
            title='Products'
            actions={
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition"
                >
                    <FiPlus size={18} /> Add Product
                </Link>
            }
        />
    )
}

export default ProductToolbar;