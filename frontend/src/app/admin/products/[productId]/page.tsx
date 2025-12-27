import ProductForm from '@/components/admin/products/ProductForm';

const ProductFormPage = async ({ params }: { params: Promise<{ productId: string }> }) => {
    const { productId } = await params;
    return (
        <ProductForm productId={productId} />
    )
}

export default ProductFormPage;