import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { useSaveSettingsMutation } from '@/lib/queries/settings.queries';
import { Settings, settingsSchema } from '@/lib/schemas/settings.schema';
import { Card, CardContent } from '@/components/ui/card';
import SettingsPreview from './settings/SettingsPreview';
import SettingsSidebar from './settings/SettingsSidebar';
import GeneralTab from './settings/tabs/GeneralTab';
import StylesTab from './settings/tabs/StylesTab';

const tabs = [
  { path: 'general', label: 'General', component: <GeneralTab /> },
  { path: 'styles', label: 'Styles', component: <StylesTab /> },
];

export default function PageSettings() {
  const { subMenu } = useParams();

  const form = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: window.yayBulkOrderAdminData.settings,
  });

  const saveMutation = useSaveSettingsMutation();

  async function onSubmit(data: Settings) {
    if (saveMutation.isPending) return;
    await saveMutation.mutateAsync(data);
    form.reset(data);
  }

  return (
    <FormProvider {...form}>
      <form id="settings-form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-6 px-6">
          <div className="flex w-full flex-col gap-8 sm:flex-row">
            <SettingsSidebar tabs={tabs} />
            <div className="flex w-full flex-col gap-8 sm:flex-row">
              <Card className="w-full rounded-lg p-6 shadow-none sm:flex-7">
                <CardContent className="w-full px-0">
                  {tabs.map((tab) => (
                    <div key={tab.path}>{subMenu === tab.path && tab.component}</div>
                  ))}
                </CardContent>
              </Card>

              <div className="w-full sm:flex-3">
                <SettingsPreview />
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
