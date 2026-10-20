import { useEffect, useState } from 'react';
import { store as blockEditorStore, InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import type { VariantTableAttributes } from '@yay-bulk-order/variant-table-store';

import { fetchProductById } from './api';
import SingleProductPicker from './SingleProductPicker';
import { useFormStyle } from './useFormStyle';

type VariantTableEditProps = BlockEditProps<VariantTableAttributes> & {
  context?: { postId?: number; postType?: string };
};

// Post types that are template *shells*, not real content.
const TEMPLATE_SHELL_POST_TYPES = new Set(['wp_template', 'wp_template_part', 'wp_block', 'wp_navigation']);

export default function Edit({ attributes, setAttributes, context, clientId }: VariantTableEditProps) {
  const { style, ...blockProps } = useBlockProps();
  const formStyle = useFormStyle();
  const contextPostId = context?.postId;
  const contextPostType = context?.postType;

  const hasInnerBlocks = useSelect(
    (select) => select(blockEditorStore).getBlocks(clientId).length > 0,
    [clientId],
  );

  // `postType: "product"` context (see `isAutoDetected` below) shows up
  // identically whether the Site Editor canvas is currently the Single
  // Product template *or* a product archive one (Shop, a category, a tag —
  // any of them list many products, none of them a single one) — Gutenberg
  // doesn't distinguish the two for a block's context, only the template
  // being edited says which. So resolve that template's own slug and use it
  // as the tie-breaker: auto-detect only for Single Product (incl. its
  // per-category `single-product-*` variants); every other known template
  // (archive-product, taxonomy-product_cat, taxonomy-product_tag, …) must
  // fall back to acting like a normal page — the manual picker, same as
  // "elsewhere".
  const editedTemplateSlug = useSelect((select) => {
    const editor = select('core/editor') as { getCurrentPostType?: () => string; getCurrentPostId?: () => unknown };
    if (editor?.getCurrentPostType?.() !== 'wp_template') {
      return undefined;
    }
    const templateId = editor.getCurrentPostId?.();
    if (!templateId) {
      return undefined;
    }
    const core = select('core') as {
      getEditedEntityRecord?: (kind: string, name: string, id: unknown) => { slug?: string };
    };
    return core?.getEditedEntityRecord?.('postType', 'wp_template', templateId)?.slug;
  }, []);
  const isSingleProductTemplate =
    editedTemplateSlug === 'single-product' || Boolean(editedTemplateSlug?.startsWith('single-product-'));
  const isKnownNonSingleTemplate = editedTemplateSlug !== undefined && !isSingleProductTemplate;

  // Fast path: `postType` context reliably says this really is a product
  // (editing a product's own content, or a real Single Product template).
  const postTypeSaysProduct = contextPostType === 'product';
  // Post types that are template *shells*, not real content — editing the
  // Single Product template (incl. clicking into its "Single product"
  // pattern) surfaces the template's own entity here (`postType: "wp_template"`,
  // `postId`: the template post's id, e.g. `wp_template` 1234 — never a real
  // product). WooCommerce resolves the actually-viewed product via its own
  // Interactivity-state store on the frontend instead (see
  // `SingleProductTemplate::render_block_template()`), never through
  // Gutenberg block context, so a shell here is the normal shape of exactly
  // the page this block is meant for, not an unknown context to verify.
  const isTemplateShell = contextPostType !== undefined && TEMPLATE_SHELL_POST_TYPES.has(contextPostType);
  // A *defined*, non-shell postType that isn't "product" (e.g. editing a
  // Page) is a reliable "no" — no need to verify further.
  const postTypeSaysNotProduct = contextPostType !== undefined && contextPostType !== 'product' && !isTemplateShell;
  const hasNoContextSignal = (!contextPostId && contextPostType === undefined) || isTemplateShell;

  // Some editing surfaces — notably the WooCommerce "Single product"
  // reusable pattern, edited standalone via Appearance > Patterns — provide
  // an example `postId` without a matching `postType` context at all. Rather
  // than falling back to the manual picker there too, verify the id against
  // the same REST endpoint the picker itself uses.
  const needsVerification =
    Boolean(contextPostId) && !postTypeSaysProduct && !postTypeSaysNotProduct && !isTemplateShell;
  const [verified, setVerified] = useState<'unknown' | 'yes' | 'no'>('unknown');

  useEffect(() => {
    if (!needsVerification || !contextPostId) {
      setVerified('unknown');
      return;
    }

    let cancelled = false;
    fetchProductById(contextPostId).then((product) => {
      if (!cancelled) {
        setVerified(product ? 'yes' : 'no');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [needsVerification, contextPostId]);

  // `postType: "product"` alone is trustworthy even without a `postId` — the
  // Single Product template's editor preview confirms the *kind* of page
  // without pinning an example product to it. `postId`-based verification
  // is the only branch that actually needs a real id to check. None of that
  // applies on a template we positively know lists many products rather
  // than showing one (`isKnownNonSingleTemplate`) — there, only an explicit
  // manual pick counts.
  const isAutoDetected =
    !isKnownNonSingleTemplate &&
    (hasNoContextSignal || postTypeSaysProduct || (Boolean(contextPostId) && verified === 'yes'));

  // Verification is pending: render nothing rather than flashing the picker
  // and then immediately replacing it with the table.
  if (needsVerification && verified === 'unknown') {
    return <div style={{ ...style, ...formStyle }} {...blockProps} />;
  }

  // Only the very first insertion (nothing picked, no inner blocks yet)
  // takes over the whole canvas — once a product has been picked, the
  // canvas always shows the real table; re-picking happens in the sidebar.
  const showPlaceholder = !isAutoDetected && !attributes.hasSelectedProduct && !hasInnerBlocks;

  if (showPlaceholder) {
    return (
      <div style={{ ...style, ...formStyle }} {...blockProps}>
        <SingleProductPicker
          productId={attributes.productId}
          onSelect={(productId) => setAttributes({ productId, hasSelectedProduct: Boolean(productId) })}
        />
      </div>
    );
  }

  return (
    <>
      {!isAutoDetected && (
        <InspectorControls>
          <PanelBody title={__('Product', 'yay-bulk-order')} initialOpen>
            <SingleProductPicker
              compact
              productId={attributes.productId}
              onSelect={(productId) => setAttributes({ productId, hasSelectedProduct: Boolean(productId) })}
            />
          </PanelBody>
        </InspectorControls>
      )}
      <div style={{ ...style, ...formStyle }} {...blockProps}>
        <InnerBlocks template={DEFAULT_TEMPLATE} />
      </div>
    </>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  [
    'yay-bulk-order/variant-table',
    {},
    [
      ['yay-bulk-order/variant-table-header', {}],
      [
        'yay-bulk-order/variant-table-columns',
        {},
        [
          ['yay-bulk-order/variant-table-column-product', {}],
          ['yay-bulk-order/variant-table-column-quantity', {}],
          ['yay-bulk-order/variant-table-column-select', {}],
        ],
      ],
    ],
  ],
  ['yay-bulk-order/variant-table-footer', {}],
];
