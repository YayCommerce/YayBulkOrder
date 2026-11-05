import { useMemo } from 'react';
import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { ChevronRightIcon } from 'lucide-react';
import { FieldPath, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BuilderSteps } from '@/pages/product-tables/table-builder/table-builder.helper';

type StepsNavBarProps = {
  step: BuilderSteps;
  setStep: (steps: BuilderSteps) => void;
};

type StepValidation = FieldPath<ProductTableForm>[] | ((table: ProductTableForm) => FieldPath<ProductTableForm>[]);

const STEPS: { slug: BuilderSteps; label: string; validation?: StepValidation }[] = [
  { slug: 'products', label: __('Products', 'yay-bulk-order'), validation: ['query.categories', 'query.products'] },
  {
    slug: 'columns',
    label: __('Columns', 'yay-bulk-order'),
    validation: (table) => table.columns.map((_, index) => `columns.${index}.heading` as FieldPath<ProductTableForm>),
  },
  { slug: 'features', label: __('Features', 'yay-bulk-order') },
  { slug: 'publish', label: __('Publish', 'yay-bulk-order') },
];

export default function StepsNavBar({ step, setStep }: StepsNavBarProps) {
  const stepIndex = useMemo(() => STEPS.findIndex((s) => s.slug === step), [step]);
  const { trigger, getValues } = useFormContext<ProductTableForm>();

  const handleSteps = async (slug: BuilderSteps) => {
    const current = STEPS.find((s) => s.slug === step);
    const table = getValues();
    const paths = typeof current?.validation === 'function' ? current.validation(table) : current?.validation;
    if (paths?.length && !(await trigger(paths))) {
      return;
    }
    setStep(slug);
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {STEPS.map((s, i) => {
        const isActive = s.slug === step;
        const isCompleted = i < stepIndex;

        return (
          <div key={s.slug} className="flex items-center gap-4">
            <Button
              variant={!isActive ? 'ghost' : 'primary-soft'}
              onClick={() => handleSteps(s.slug)}
              className={cn('gap-1.5 transition-colors')}
            >
              <Badge
                variant={isActive ? 'primary' : isCompleted ? 'success' : 'secondary'}
                className="size-5 rounded-full px-1 text-xs font-medium tabular-nums"
              >
                {isCompleted ? '✓' : i + 1}
              </Badge>
              {s.label}
            </Button>
            {i < STEPS.length - 1 && <ChevronRightIcon className="text-muted-foreground size-4" />}
          </div>
        );
      })}
    </div>
  );
}
