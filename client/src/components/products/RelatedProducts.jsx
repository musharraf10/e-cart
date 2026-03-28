import { SectionHeader } from "../ui/SectionHeader.jsx";
import { ProductGridSkeleton } from "../ui/LoadingSkeleton.jsx";
import { HorizontalProductRow } from "../ui/HorizontalProductRow.jsx";
import { expandProductsByVariant } from "../../utils/productVariants.js";

export function RelatedProducts({ items = [], loading = false }) {
  const expandedRelated = expandProductsByVariant(items).slice(0, 8);

  if (expandedRelated.length === 0 && !loading) return null;

  return (
    <section>
      <SectionHeader title="Related products" />
      {loading ? <ProductGridSkeleton count={4} /> : <HorizontalProductRow products={expandedRelated} />}
    </section>
  );
}
