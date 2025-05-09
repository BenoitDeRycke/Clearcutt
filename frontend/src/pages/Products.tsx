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
      const [rawRes, metricsRes] = await Promise.all([
        fetch('http://localhost:3001/api/supabase/getproducts'),
        fetch('http://localhost:3001/api/supabase/getproductmetrics'),
      ]);

      if (!rawRes.ok || !metricsRes.ok) throw new Error('One of the requests failed');

      const rawData = await rawRes.json();
      const metricsData = await metricsRes.json();

      const rawProducts: Product[] = rawData.products;
      const metrics: Partial<Product>[] = metricsData.products;

      const merged = rawProducts.map((p: Product) => {
        const metric = metrics.find((m: Partial<Product>) => m.variant_id === p.variant_id);
        return {
          ...p,
          ...metric,
        };
      });

      setProducts(merged);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('❌ Failed to fetch product data.');
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
            <TableHeading>Revenue</TableHeading>
            <TableHeading>Product</TableHeading>
            <TableHeading>Shipping</TableHeading>
            <TableHeading>Ad</TableHeading>
            <TableHeading>Other</TableHeading>
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

            const totalUnits = variants.reduce((sum, v) => sum + (v.units_sold || 0), 0);
            const totalRevenue = variants.reduce((sum, v) => sum + (v.revenue || 0), 0);
            const totalProduct = variants.reduce((sum, v) => sum + (v.product_cost || 0), 0);
            const totalShipping = variants.reduce((sum, v) => sum + (v.shipping || 0), 0);
            const totalAd = variants.reduce((sum, v) => sum + (v.ad || 0), 0);
            const totalOther = variants.reduce((sum, v) => sum + (v.other || 0), 0);
            const totalCost = totalProduct + totalShipping + totalAd + totalOther;
            const totalProfit = totalRevenue - totalCost;

            return (
              <>
                <tr className="border-t bg-white" key={productId}>
                  <TableCell className="text-left">
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [productId]: !prev[productId],
                        }))
                      }
                      className="mr-2 font-bold text-gray-600 hover:text-black"
                    >
                      {isOpen ? '▾' : '▸'}
                    </button>
                    {first.product_name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        first.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {first.status}
                    </span>
                  </TableCell>
                  <TableCell format="number">{totalUnits}</TableCell>
                  <TableCell>{totalRevenue}</TableCell>
                  <TableCell>{totalProduct}</TableCell>
                  <TableCell>{totalShipping}</TableCell>
                  <TableCell>{totalAd}</TableCell>
                  <TableCell>{totalOther}</TableCell>
                  <TableCell>{totalCost}</TableCell>
                  <TableCell>{totalProfit}</TableCell>
                </tr>

                {isOpen &&
                  variants.map((v) => (
                    <tr key={v.variant_id} className="border-t bg-gray-50">
                      <TableCell className="text-left pl-8">{v.variant_title}</TableCell>
                      <TableCell></TableCell>
                      <TableCell format="number">{v.units_sold}</TableCell>
                      <TableCell>{v.revenue}</TableCell>
                      <TableCell>{v.product_cost}</TableCell>
                      <TableCell>{v.shipping}</TableCell>
                      <TableCell>{v.ad}</TableCell>
                      <TableCell>{v.other}</TableCell>
                      <TableCell>
                        {(v.product_cost || 0) + (v.shipping || 0) + (v.ad || 0) + (v.other || 0)}
                      </TableCell>
                      <TableCell>
                        {(v.revenue || 0) -
                          ((v.product_cost || 0) +
                            (v.shipping || 0) +
                            (v.ad || 0) +
                            (v.other || 0))}
                      </TableCell>
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
