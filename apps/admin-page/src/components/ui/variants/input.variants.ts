import { cva, VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  'aria-invalid:border-destructive border-input aria-invalid:hover:border-destructive',
  {
    variants: {
      variant: {
        input: 'focus-visible:border-foreground hover:border-foreground',
        picker: 'focus-visible:border-ring focus-visible:hover:border-ring-accent',
      },
    },
    defaultVariants: {
      variant: 'input',
    },
  },
);

export type InputVariantProps = VariantProps<typeof inputVariants>;

export const inputGroupVariants = cva(
  [
    'group/input-group border border-input dark:bg-input/30 hover:border-accent-foreground-300 shadow-sm relative flex w-full items-center outline-none transition-colors duration-300 min-w-0 has-[>textarea]:h-auto data-[disabled=true]:opacity-70 data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed',

    'has-[>[data-align=inline-start]]:[&>input]:pl-2 has-[>[data-align=inline-end]]:[&>input]:pr-2',

    'has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:ring-ring/9 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-offset-[0.5px] has-[[data-slot=input-group-control]:focus-visible]:ring-offset-primary',

    'has-[[data-slot][aria-invalid=true]]:ring-0 has-[[data-slot][aria-invalid=true]]:ring-offset-0 has-[[data-slot][aria-invalid=true]]:border-destructive',
  ],
  {
    variants: {
      size: {
        small: 'h-7 rounded-sm',
        medium: 'h-8 rounded-sm',
        large: 'h-9 rounded-sm',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

export type InputGroupVariantProps = VariantProps<typeof inputGroupVariants>;

export const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)]",
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-3 has-[>button]:-ml-2 has-[>kbd]:ml-[-0.35rem]',
        'inline-end': 'order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]',
        'block-start':
          'order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5',
        'block-end':
          'order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

export const inputGroupButtonVariants = cva('text-sm shadow-none flex gap-2 items-center', {
  variants: {
    size: {
      medium:
        "h-6 gap-1 px-2 rounded-[calc(var(--radius-md)-4px)] [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
      large: 'h-7 px-2.5 gap-1.5 rounded-[calc(var(--radius-md)-4px)] has-[>svg]:px-2.5',
      'icon-md': 'size-6 rounded-[calc(var(--radius-md)-4px)] p-0 has-[>svg]:p-0',
      'icon-lg': 'size-7 rounded-[calc(var(--radius-md)-4px)] p-0 has-[>svg]:p-0',
    },
  },
  defaultVariants: {
    size: 'large',
  },
});
