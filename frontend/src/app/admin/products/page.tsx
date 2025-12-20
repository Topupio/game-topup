import AdminProductListing from "@/components/admin/products/AdminProductListing";
import { productsApiServer } from "@/services/products/productsApi.server";

const ProductsPage = async () => {
    const products = await productsApiServer.list();

    return (
        <div >
            <AdminProductListing initialData={products} />
        </div>
    )
}

export default ProductsPage;