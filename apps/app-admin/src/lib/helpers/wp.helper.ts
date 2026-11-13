const { isBlockTheme, adminUrl, archiveProductTemplateSlug } = window.yayBulkOrderMeta.wpMeta;

/** Pattern category slug registered by the plugin (see PatternRegistry). */
const PATTERN_CATEGORY = 'yay-bulk-order';

/** Build an absolute `wp-admin` URL with query args. */
function wpAdminUrl(page: string, params: Record<string, string> = {}): string {
  const url = new URL(page, adminUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/**
 * URL to the pattern library filtered to Yay Bulk Order patterns.
 *
 * Block themes open the Site Editor pattern browser; classic themes fall back to
 * the standalone pattern management screen, which the Site Editor route can't serve.
 *
 * @param search Optional term to pre-fill the pattern search box.
 */
export function patternLibraryUrl(search?: string): string {
  if (!isBlockTheme) {
    return wpAdminUrl('edit.php', { post_type: 'wp_block', ...(search ? { s: search } : {}) });
  }

  return wpAdminUrl('site-editor.php', {
    p: '/pattern',
    postType: 'wp_block',
    categoryId: PATTERN_CATEGORY,
    ...(search ? { search } : {}),
  });
}

/**
 * URL to the Site Editor template browser, or `null` on classic themes where the
 * Site Editor is unavailable.
 */
export function templateLibraryUrl(): string | null {
  if (!isBlockTheme) {
    return null;
  }

  return wpAdminUrl('site-editor.php', { p: '/template' });
}

/** URL to the "new page" editor. */
export function newPageUrl(): string {
  return wpAdminUrl('post-new.php', { post_type: 'page' });
}

/**
 * URL to edit a single user pattern (`wp_block` post) by id.
 *
 * Block themes open it in the Site Editor canvas; classic themes fall back to the
 * standard post editor screen.
 */
export function patternEditUrl(id: number): string {
  if (!isBlockTheme) {
    return wpAdminUrl('post.php', { post: String(id), action: 'edit' });
  }

  return wpAdminUrl('site-editor.php', {
    postType: 'wp_block',
    postId: String(id),
    canvas: 'edit',
  });
}

/**
 * URL to edit WooCommerce's Shop / Category page layout — the `archive-product`
 * template — directly in the Site Editor canvas.
 *
 * The template id is `<theme>//archive-product`; the Site Editor resolves it
 * through the template hierarchy even when the active theme doesn't override it
 * (WooCommerce provides the fallback). Returns `null` on classic themes.
 */
export function archiveProductTemplateUrl(): string | null {
  if (!isBlockTheme) {
    return null;
  }

  return wpAdminUrl('site-editor.php', {
    postType: 'wp_template',
    postId: archiveProductTemplateSlug,
    canvas: 'edit',
    'ybod-catalog-notice': '1',
  });
}
