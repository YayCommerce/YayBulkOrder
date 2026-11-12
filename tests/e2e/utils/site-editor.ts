import { expect, FrameLocator, Page } from '@playwright/test';

import { rest } from './rest';

/** The Catalog (Shop / product archive) template of the active block theme. */
export function catalogTemplateId(theme: string): string {
  return `${theme}//archive-product`;
}

export function editorCanvas(page: Page): FrameLocator {
  return page.frameLocator('iframe[name="editor-canvas"]');
}

/** Open the Catalog template in the Site Editor, past the welcome guide. */
export async function openCatalogTemplate(page: Page, theme: string): Promise<void> {
  const postId = encodeURIComponent(catalogTemplateId(theme));
  await page.goto(`/wp-admin/site-editor.php?postType=wp_template&postId=${postId}&canvas=edit`);
  await editorCanvas(page).locator('body').waitFor();
  await page.waitForFunction(() => (window as any).wp?.data?.select('core/block-editor')?.getBlocks().length > 0);
  const welcome = page.getByRole('button', { name: 'Get started' });
  if (await welcome.isVisible().catch(() => false)) {
    await welcome.click();
  }
}

/**
 * Add an empty paragraph to the template, right after the header, and put the
 * caret in it, so a keyboard paste goes there like a user's would. It goes at
 * the top level: a theme's catalog content can sit inside a pattern
 * (Brandy's "Archive Product 1"), which takes no new blocks.
 */
export async function focusNewParagraphInMain(page: Page): Promise<void> {
  const clientId = await page.evaluate(() => {
    const { select, dispatch } = (window as any).wp.data;
    const blocks = select('core/block-editor').getBlocks();
    const header = blocks.findIndex((b: any) => b.name === 'core/template-part');
    const paragraph = (window as any).wp.blocks.createBlock('core/paragraph');
    dispatch('core/block-editor').insertBlocks(paragraph, header + 1, '', true);
    return paragraph.clientId as string;
  });
  await editorCanvas(page).locator(`[data-block="${clientId}"]`).click();
}

/** Names of every block in the editor, nested ones included. */
export async function editorBlockNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const flat = (blocks: any[]): string[] => blocks.flatMap((b) => [b.name, ...flat(b.innerBlocks)]);
    return flat((window as any).wp.data.select('core/block-editor').getBlocks());
  });
}

/** Save the template and wait until nothing is left unsaved. */
export async function saveSiteEditor(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  // With other unsaved entities WordPress asks which to save first.
  const confirm = page.getByRole('button', { name: 'Save', exact: true }).last();
  await expect
    .poll(
      async () => {
        const dirty = await page.evaluate(() => {
          const core = (window as any).wp.data.select('core');
          return core.__experimentalGetDirtyEntityRecords().length + (core.isSavingEntityRecord?.() ? 1 : 0);
        });
        if (dirty && (await confirm.isVisible().catch(() => false))) await confirm.click().catch(() => {});
        return dirty;
      },
      { timeout: 20_000 },
    )
    .toBe(0);
}

/** Put the Catalog template back to the theme's own version (deletes the customized copy). */
export async function resetCatalogTemplate(page: Page, theme: string): Promise<void> {
  await rest(page, `wp/v2/templates/${catalogTemplateId(theme)}`, 'DELETE');
}
