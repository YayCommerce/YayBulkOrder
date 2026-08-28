import { GripVerticalIcon, HelpCircleIcon, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { HelpTip } from '@/components/ui/tooltip';
import { allProductTableColumns, BuilderStepsProps } from '@/pages/product-tables/table-builder/TableBuilder.helper';

export default function ColumnsStep({ setSteps }: BuilderStepsProps) {
  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-4">
      <Card className="w-2xl max-h-[calc(100vh-150px)] max-w-2xl overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-base font-medium">Configure table columns</CardTitle>
          <CardDescription>Add, reorder, and customize each column.</CardDescription>
        </CardHeader>

        <div className="flex flex-col gap-2">
          {allProductTableColumns.map((col) => {
            const isDefault = ['cart'].includes(col.slug);
            return (
              <div key={col.slug} className="border-border rounded-md border">
                <div className="flex items-center gap-2 px-3 py-2">
                  <GripVerticalIcon className="text-muted-foreground size-4 shrink-0 cursor-grab" />
                  <Switch
                    size="sm"
                    checked={col.enabled}
                    //  onCheckedChange={(v) => toggleColumn(col.slug, v)}
                    disabled={isDefault}
                  />
                  <Badge variant="dimmed" className="shrink-0 font-mono text-xs">
                    {col.slug}
                  </Badge>
                  {isDefault && <span className="text-muted-foreground text-xs">(always shown, cannot remove)</span>}
                  <div className="flex-1" />
                  {!isDefault && (
                    <Button
                      variant="link"
                      // onClick={() => removeColumn(col.slug)}
                      className="text-muted-foreground hover:text-destructive p-0! h-fit!"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  )}
                </div>
                <div className={cn('grid grid-cols-2 gap-2 border-t px-3 py-2', !col.enabled && 'hidden')}>
                  <Field className="gap-1">
                    <FieldLabel className="font-normal">Heading</FieldLabel>
                    <Input
                      value={col.heading}
                      // onChange={(e) => changeHeading(col.slug, e.target.value)}
                      placeholder="Column heading"
                      className="h-8"
                    />
                  </Field>
                  <Field className="gap-1">
                    <FieldLabel className="font-normal">Responsive</FieldLabel>
                    <Select
                      value={isDefault ? 'always-show' : col.responsive}
                      disabled={isDefault}
                      // onValueChange={(v) => changeResponsive(col.slug, v as ResponsiveOption)}
                    >
                      <SelectTrigger size="sm" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always-show">Always show</SelectItem>
                        <SelectItem value="hide-on-mobile">Hide on mobile</SelectItem>
                        <SelectItem value="hide-on-tablet">Hide on tablet</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            );
          })}

          {/* {availableToAdd.length > 0 && (
            <Popover
              open={addPopoverOpen}
              onOpenChange={(v) => {
                setAddPopoverOpen(v);
                if (!v) setPendingAdd([]);
              }}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-fit">
                  + Add Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-3">
                <p className="mb-2 text-xs font-medium">Add columns</p>
                <div className="flex flex-col gap-1.5">
                  {availableToAdd.map((slug) => (
                    <div key={slug} className="flex items-center gap-2">
                      <Checkbox
                        id={`add-${slug}`}
                        checked={pendingAdd.includes(slug)}
                        onCheckedChange={() => togglePendingAdd(slug)}
                      />
                      <Label htmlFor={`add-${slug}`}>{COLUMN_DEFAULTS[slug].heading}</Label>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="mt-3 w-full" disabled={pendingAdd.length === 0} onClick={addColumns}>
                  Add
                </Button>
              </PopoverContent>
            </Popover>
          )} */}
        </div>

        <div className="flex items-center justify-center gap-4 border-t pt-6">
          <Button variant="outline" size="sm" onClick={() => setSteps('products')}>
            Back
          </Button>
          <Button variant="primary" size="sm" onClick={() => setSteps('features')}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
