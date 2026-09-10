import { useIsMutating, useMutation } from '@tanstack/react-query';
import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { __ } from '@wordpress/i18n';

import { createPattern } from '@/lib/api/blocks.api';
import { makeBlockText } from '@/pages/product-tables/product-tables.helper';

/** ─── Mutation Keys ─────────────────────────────────── */

const BLOCK_PATTERN_MUTATION_KEYS = {
  create: ['patterns', 'create'] as const,
  // For isMutating
  all: ['patterns'] as const,
};

/** ─── Mutations ─────────────────────────────────────── */

export function useCreateProductTablePatternMutation(tableId: number) {
  return useMutation({
    mutationKey: BLOCK_PATTERN_MUTATION_KEYS.create,
    mutationFn: (pattern: { title: string; content: string }) => createPattern(pattern.title, pattern.content, tableId),
  });
}

/** ─── Utils ─────────────────────────────────────────── */

export function useIsMutatingPatterns() {
  return useIsMutating({ mutationKey: BLOCK_PATTERN_MUTATION_KEYS.all }) > 0;
}
