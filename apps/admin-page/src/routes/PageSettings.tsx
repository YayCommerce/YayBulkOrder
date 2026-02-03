import { zodResolver } from '@hookform/resolvers/zod';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { createPortal } from 'react-dom';
import { FieldErrors, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

import { Settings, settingsSchema } from '@yay-bulk-order/common/types/settings.schema';
import { useSaveSettingsMutation } from '@/lib/queries/settings.queries';
import { styled } from '@/lib/styled';
import { Button } from '@/components/ui/button';
import { SideNavMenuItem, SideNavMenuList } from '@/components/ui/navmenu-side';
import { toast } from '@/components/ui/sonner';
import GeneralTab from './settings/GeneralTab';
import StylesTab from './settings/StylesTab';

export default function PageSettings() {
  const { subMenu = 'general' } = useParams();
  const navigate = useNavigate();

  const form = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: window.yayBulkOrderAdminData.settings,
    mode: 'onSubmit',
  });

  const saveMutation = useSaveSettingsMutation();

  async function onSubmit(data: Settings) {
    if (saveMutation.isPending) return;
    await saveMutation.mutateAsync(data);
    toast.success('Settings saved');
    form.reset(data);
  }

  const onError = (errors: FieldErrors<Settings>) => {
    const hasGeneralErrors = !!errors.general;
    const hasStylesErrors = !!errors.styles;

    const hasActiveTabErrors = (subMenu === 'general' && hasGeneralErrors) || (subMenu === 'styles' && hasStylesErrors);
    if (hasActiveTabErrors) return;

    // If has errors in another tab, navigate to that tab
    if (hasGeneralErrors) {
      navigate('/settings/general');
    } else if (hasStylesErrors) {
      navigate('/settings/styles');
    }
  };

  const portalTarget = document.getElementById('yay-header-actions');

  return (
    <>
      {portalTarget &&
        createPortal(
          <Button
            type="submit"
            form="settings-form"
            disabled={!form.formState.isDirty}
            variant={form.formState.isDirty ? 'primary' : 'muted'}
            className="disabled:opacity-100"
          >
            Save Settings
          </Button>,
          portalTarget,
        )}
      <FormProvider {...form}>
        <form id="settings-form" onSubmit={form.handleSubmit(onSubmit, onError)}>
          <div className="xs:p-6 px-6 pt-8 pb-4">
            <TabsPrimitive.Root value={subMenu} onValueChange={(subMenu) => navigate(`/settings/${subMenu}`)}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-full sm:w-[150px]">
                  <TabsPrimitive.List asChild>
                    <SideNavMenuList
                      mode="tabs"
                      activeTab={subMenu}
                      className="flex w-full items-start justify-start sm:flex-col"
                    >
                      <TabsPrimitive.Trigger value="general" asChild>
                        <SideNavMenuItem>
                          <span>General</span>
                          <GeneralErrorIndicator />
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                      <TabsPrimitive.Trigger value="styles" asChild>
                        <SideNavMenuItem>
                          <span>Styles</span>
                          <StylesErrorIndicator />
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                    </SideNavMenuList>
                  </TabsPrimitive.List>
                </div>
                <Main>
                  <TabsPrimitive.Content value="general" style={{ height: '100%' }}>
                    <GeneralTab />
                  </TabsPrimitive.Content>

                  <TabsPrimitive.Content value="styles" style={{ height: '100%' }}>
                    <StylesTab />
                  </TabsPrimitive.Content>
                </Main>
              </div>
            </TabsPrimitive.Root>
          </div>
        </form>
      </FormProvider>
    </>
  );
}

const Main = styled.div('flex flex-col bg-muted flex-1');
const ErrorIndicator = styled.span('bg-destructive size-1 rounded-full');

function GeneralErrorIndicator() {
  const { formState } = useFormContext<Settings>();
  const hasErrors = !!formState.errors.general;

  if (!hasErrors) return null;

  return <ErrorIndicator />;
}

function StylesErrorIndicator() {
  const { formState } = useFormContext<Settings>();
  const hasErrors = !!formState.errors.styles;

  if (!hasErrors) return null;

  return <ErrorIndicator />;
}
