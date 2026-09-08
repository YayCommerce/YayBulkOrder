import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Settings, settingsSchema } from '@yay-bulk-order/common/src/schemas';
import { createPortal } from 'react-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useIsMutatingSettings, useSaveSettingsMutation, useSettingsQuery } from '@/lib/queries/settings.queries';
import { LoadingButton } from '@/components/ui/button';
import { SideNavMenuItem, SideNavMenuList } from '@/components/ui/navmenu-side';
import { toast } from '@/components/ui/sonner';
import { GeneralTab } from './tabs/GeneralTab';
import { StylesTab } from './tabs/StylesTab';

export function SettingsPage() {
  const navigate = useNavigate();
  const { subMenu } = useParams();

  const { data: settings } = useSettingsQuery();
  const saveSettingsMutation = useSaveSettingsMutation();
  const isMutatingSettings = useIsMutatingSettings();

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  async function onSubmit(data: Settings) {
    if (isMutatingSettings > 0) return;

    try {
      // Re-baseline the form against what the server actually persisted, so
      // `formState.isDirty` (and the beforeunload guard below) clears instead
      // of staying stuck "dirty" against the pre-save defaultValues.
      const saved = await saveSettingsMutation.mutateAsync(data);
      form.reset(saved);
      toast.success(__('Settings saved!', 'yay-bulk-order'));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!form.formState.isDirty) return;
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  const headerActionPortal = document.getElementById('yay-bulk-order-header-actions');

  return (
    <>
      {headerActionPortal &&
        createPortal(
          <LoadingButton
            loading={saveSettingsMutation.isPending}
            type="submit"
            form="settings-form"
            className="relative ms-4"
          >
            <span className="max-sm:hidden">{__('Save Changes', 'yay-bulk-order')}</span>
            <span className="sm:hidden">{__('Save', 'yay-bulk-order')}</span>
          </LoadingButton>,
          headerActionPortal,
        )}
      <FormProvider {...form}>
        <form id="settings-form" onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}>
          <div className="xs:p-6 mx-auto max-w-7xl px-6 pb-4 pt-8">
            <TabsPrimitive.Root value={subMenu} onValueChange={(value) => navigate(`/settings/${value}`)}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="sm:w-37.5 w-full">
                  <TabsPrimitive.List asChild>
                    <SideNavMenuList mode="tabs" className="flex w-full items-start justify-start sm:flex-col">
                      <TabsPrimitive.Trigger value="general" asChild>
                        <SideNavMenuItem>
                          <span>{__('General', 'yay-bulk-order')}</span>
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                      <TabsPrimitive.Trigger value="styles" asChild>
                        <SideNavMenuItem>
                          <span>{__('Styles', 'yay-bulk-order')}</span>
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                    </SideNavMenuList>
                  </TabsPrimitive.List>
                </div>
                <div className="bg-muted flex flex-1 flex-col overflow-hidden">
                  <TabsPrimitive.Content value="general" className="bg-card h-full rounded-md border p-6 sm:w-full">
                    <GeneralTab />
                  </TabsPrimitive.Content>
                  <TabsPrimitive.Content value="styles" className="bg-card h-full rounded-md border p-6 sm:w-full">
                    <StylesTab />
                  </TabsPrimitive.Content>
                </div>
              </div>
            </TabsPrimitive.Root>
          </div>
        </form>
      </FormProvider>
    </>
  );
}
