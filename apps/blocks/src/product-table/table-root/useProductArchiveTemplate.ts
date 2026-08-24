import { Meta } from '@yay-bulk-order/common/src/schemas';
import { useSelect } from '@wordpress/data';

function getShopPageId(): number {
  const meta = (window as Window & { yayBulkOrderMeta?: Meta }).yayBulkOrderMeta;
  return meta?.wpMeta?.shopPageId ?? 0;
}

/**
 * WooCommerce product catalog / archive template slugs used by the Site Editor.
 * Mirrors the detection in WooCommerce's Product Collection block.
 */
const PRODUCT_CATALOG_AND_ARCHIVE_SLUGS = [
  'archive-product',
  'taxonomy-product_attribute',
  'product-search-results',
  'taxonomy-product_cat',
  'taxonomy-product_tag',
  'taxonomy-product_brand',
] as const;

/** Taxonomy-specific archives (not Shop / product search). */
const PRODUCT_TAXONOMY_ARCHIVE_SLUGS = [
  'taxonomy-product_cat',
  'taxonomy-product_tag',
  'taxonomy-product_brand',
  'taxonomy-product_attribute',
] as const;

type EditorStore = {
  getEditedPostSlug?: () => string | number | undefined;
  getCurrentPostId?: () => number | string | undefined;
  getCurrentPostType?: () => string | undefined;
};

function slugMatches(slug: string, candidates: readonly string[]): boolean {
  return candidates.some((candidate) => slug.includes(candidate));
}

function resolveTemplateSlug(select: (store: string) => unknown, contextSlug?: string): string {
  if (typeof contextSlug === 'string' && contextSlug !== '') {
    return contextSlug;
  }

  // Woo Product Collection uses `core/editor` (not `core/edit-site`) —
  // Site Editor templates expose their slug via getEditedPostSlug().
  const editor = select('core/editor') as EditorStore | undefined;
  const edited = editor?.getEditedPostSlug?.();
  return edited !== undefined && edited !== null ? String(edited) : '';
}

function isEditingShopPage(select: (store: string) => unknown): boolean {
  const shopPageId = getShopPageId();
  if (shopPageId <= 0) {
    return false;
  }

  const editor = select('core/editor') as EditorStore | undefined;
  const postType = editor?.getCurrentPostType?.();
  const postId = editor?.getCurrentPostId?.();

  return postType === 'page' && Number(postId) === Number(shopPageId);
}

export type ProductArchiveEditorContext = {
  /** Shop page, Product Catalog template, or any product archive template. */
  isCatalogOrArchive: boolean;
  /** Category / tag / attribute / brand archive template (not Shop). */
  isTaxonomyArchive: boolean;
};

/**
 * Detect Shop / product-archive editor context so Product Table can auto-inherit.
 *
 * @param templateSlugFromContext Block `context.templateSlug` when `usesContext` includes it.
 */
export function useProductArchiveEditorContext(templateSlugFromContext?: string): ProductArchiveEditorContext {
  return useSelect(
    (select) => {
      const slug = resolveTemplateSlug(select, templateSlugFromContext);
      const isShopPage = isEditingShopPage(select);
      const matchesCatalogOrArchive = slug !== '' && slugMatches(slug, PRODUCT_CATALOG_AND_ARCHIVE_SLUGS);
      const matchesTaxonomyArchive = slug !== '' && slugMatches(slug, PRODUCT_TAXONOMY_ARCHIVE_SLUGS);

      return {
        isCatalogOrArchive: matchesCatalogOrArchive || isShopPage,
        isTaxonomyArchive: matchesTaxonomyArchive,
      };
    },
    [templateSlugFromContext],
  );
}

/** @deprecated Prefer useProductArchiveEditorContext — kept for filter edit components. */
export function useIsProductCatalogOrArchiveTemplate(templateSlugFromContext?: string): boolean {
  return useProductArchiveEditorContext(templateSlugFromContext).isCatalogOrArchive;
}

/** @deprecated Prefer useProductArchiveEditorContext */
export function useIsProductTaxonomyArchiveTemplate(templateSlugFromContext?: string): boolean {
  return useProductArchiveEditorContext(templateSlugFromContext).isTaxonomyArchive;
}
