import { __ } from '@wordpress/i18n';
import { useFormContext } from 'react-hook-form';

import { SettingsFormData } from '@/lib/schemas/settings.schema';
import { ColorPicker } from '@/components/ui/color-picker';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function StylesTab() {
  const { control, watch } = useFormContext<SettingsFormData>();
  const styles = watch('styles');
  console.log({ styles });
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-dashed border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <FormLabel className="text-base font-medium">{__('Colors', 'yay-bulk-order')}</FormLabel>
        </div>
        <div className="flex flex-col gap-2">
          <FormField
            control={control}
            name="styles.colors.primary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">{__('Primary', 'yay-bulk-order')}</FormLabel>
                <FormControl>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <FormField
            control={control}
            name="styles.colors.textNormal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">{__('Text normal', 'yay-bulk-order')}</FormLabel>
                <FormControl>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="styles.colors.textSecondary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">
                  {__('Text secondary', 'yay-bulk-order')}
                </FormLabel>
                <FormControl>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="styles.colors.backgroundNormal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">
                  {__('Background normal', 'yay-bulk-order')}
                </FormLabel>
                <FormControl>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="styles.colors.backgroundSecondary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">
                  {__('Background secondary', 'yay-bulk-order')}
                </FormLabel>
                <FormControl>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <FormField
            control={control}
            name="styles.colors.borderColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">{__('Border', 'yay-bulk-order')}</FormLabel>
                <FormControl>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FormLabel className="text-base font-medium">{__('Others', 'yay-bulk-order')}</FormLabel>
        </div>
        <div className="flex flex-col gap-2">
          <FormField
            control={control}
            name="styles.borderRadius"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">
                  {__('Border radius', 'yay-bulk-order')}
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={__('Select border radius', 'yay-bulk-order')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">{__('Small', 'yay-bulk-order')}</SelectItem>
                      <SelectItem value="normal">{__('Normal', 'yay-bulk-order')}</SelectItem>
                      <SelectItem value="large">{__('Large', 'yay-bulk-order')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
