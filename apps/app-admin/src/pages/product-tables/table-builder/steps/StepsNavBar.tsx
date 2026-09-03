import { useMemo } from 'react';
import { ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { BuilderSteps } from '@/pages/product-tables/table-builder/table-builder.helper';

type StepsNavBarProps = {
  step: BuilderSteps;
  setStep: (steps: BuilderSteps) => void;
};

const STEPS: { slug: BuilderSteps; label: string }[] = [
  { slug: 'products', label: 'Products' },
  { slug: 'columns', label: 'Columns' },
  { slug: 'features', label: 'Features' },
  { slug: 'publish', label: 'Publish' },
];

export default function StepsNavBar({ step, setStep }: StepsNavBarProps) {
  const stepIndex = useMemo(() => STEPS.findIndex((s) => s.slug === step), [step]);

  return (
    <div className="flex items-center justify-center gap-4">
      {STEPS.map((s, i) => {
        const isActive = s.slug === step;
        const isCompleted = i < stepIndex;
        return (
          <div key={s.slug} className="flex items-center gap-4">
            <button
              onClick={() => setStep(s.slug)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50',
              )}
            >
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-xs font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? '✓' : i + 1}
              </span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && <ChevronRightIcon className="text-muted-foreground size-4" />}
          </div>
        );
      })}
    </div>
  );
}
