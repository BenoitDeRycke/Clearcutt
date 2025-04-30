import TableCell from '@/components/TableCell';
import TableHeading from '@/components/TableHeading';
import SyncButton from '@/components/SyncButton';
import { useSync } from '@/hooks/useSync';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/types/product';
import StatusBadge from '@/components/StatusBadge';
import React from 'react';

function Products() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const {
    lastSynced,
    handleSync,
    loading: syncing,
  } = useSync(async () => {
    const toastId = toast.loading('Syncing products...');
    const res = await fetch('http://localhost:3001/api/sync/sync-products');
    if (!res.ok) throw new Error('Sync failed');
    const data = await res.json();
    toast.success(`Sync complete! ${data.count} products updated.`, { id: toastId });
    await fetchProduct();
  }, 'products');

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/supabase/getproducts`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.products)) throw new Error('Invalid data received');
      setProducts(data.products);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const grouped = products.reduce(
    (acc, product) => {
      if (!acc[product.product_id]) acc[product.product_id] = [];
      acc[product.product_id].push(product);
      return acc;
    },
    {} as Record<string, Product[]>
  );

  return (
    <>
      <SyncButton title="Products" onClick={handleSync} lastSynced={lastSynced} />
      <table className="bg-white w-full border text-sm text-center relative rounded-xl">
        {(loading || syncing) && (
          <tbody>
            <tr>
              <td colSpan={12}>
                <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              </td>
            </tr>
          </tbody>
        )}
        <thead className="font-bold text-black bg-clearcut-light">
          <tr>
            <TableHeading className="text-left">Product Name</TableHeading>
            <TableHeading>Status</TableHeading>
            <TableHeading>Units Sold</TableHeading>
            <TableHeading>Total Cost</TableHeading>
            <TableHeading>Profit</TableHeading>
            <TableHeading>
              <div className="flex justify-end items-center gap-1">
                <span className="text-right">Margin</span>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-500 hover:text-clearcut-dark cursor-pointer" />
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs rounded-md bg-white border px-3 py-2 text-xs text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 pointer-events-none">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-600 rounded-sm" />
                      <span>&lt; 30%</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-sm" />
                      <span>&lt; 50%</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-emerald-600 rounded-sm" />
                      <span>&lt; 70%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-clearcut rounded-sm" />
                      <span>&gt; 70%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TableHeading>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([productId, variants]) => {
            const isOpen = expanded[productId];
            const first = variants[0];
            return (
              <>
                <tr className="border-t bg-white" key={productId}>
                  <TableCell className="text-left">
                    {first.product_name}
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [productId]: !prev[productId],
                        }))
                      }
                      className="ml-2 font-bold text-gray-600 hover:text-black"
                    >
                      {isOpen ? '▾' : '▸'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={first.status || 'unknown'} />
                  </TableCell>
                  <TableCell></TableCell>
                </tr>
                {isOpen &&
                  variants.map((v) => (
                    <tr key={v.variant_id} className="border-t bg-gray-50">
                      <TableCell className="pl-10 text-left text-gray-700">
                        {v.variant_title}
                      </TableCell>
                      <TableCell></TableCell>
                    </tr>
                  ))}
              </>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
export default Products;
