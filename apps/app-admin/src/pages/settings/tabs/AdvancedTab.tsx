import { Settings } from '@yay-bulk-order/common/src/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Field, FieldSet } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export function AdvancedTab() {
  const { control } = useFormContext<Settings>();

  return (
    <div className="flex flex-col gap-5">
      <FieldSet className="gap-4">
        <div className="mb-1">
          <h2 className="font-semibold">{__('My Account Page', 'yay-bulk-order')}</h2>
          <p className="text-muted-foreground">{__('Add new menu options to the My Account Page')}</p>
        </div>
        <Controller
          control={control}
          name="purchaseList.isAddToAccountPage"
          render={({ field }) => (
            <Field orientation="horizontal" className="flex items-center justify-between rounded-md border p-4">
              <div>
                <Label
                  htmlFor="purchase-list-is-add-to-account-page"
                  className="flex items-center gap-2 font-medium leading-3"
                >
                  {__('Purchase List', 'yay-bulk-order')}
                </Label>
                <p className="text-muted-foreground mt-2 text-xs font-normal">
                  {__('Add the "Purchase List" menu to My Account.', 'yay-bulk-order')}
                </p>
              </div>
              <Switch
                size="sm"
                id="purchase-list-is-add-to-account-page"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="csvOrder.isAddToAccountPage"
          render={({ field }) => (
            <Field orientation="horizontal" className="flex items-center justify-between rounded-md border p-4">
              <div>
                <Label
                  htmlFor="purchase-list-is-add-to-account-page"
                  className="flex items-center gap-2 font-medium leading-3"
                >
                  {__('Quick Order via CSV', 'yay-bulk-order')}
                </Label>
                <p className="text-muted-foreground mt-2 text-xs font-normal">
                  {__('Add the "Quick Order" menu to My Account.', 'yay-bulk-order')}
                </p>
              </div>
              <Switch
                size="sm"
                id="csv-order-is-add-to-account-page"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldSet>

      <Separator />

      <FieldSet className="gap-4">
        <div className="mb-1">
          <h2 className="font-semibold">{__('"Save as Purchase List" Button', 'yay-bulk-order')}</h2>
          <p className="text-muted-foreground">
            {__('Enable customers to save purchase lists from their cart and orders history')}
          </p>
        </div>

        <Controller
          control={control}
          name="purchaseList.savePurchaseListButton.isAddToCartPage"
          render={({ field }) => (
            <Field orientation="horizontal" className="flex items-center justify-between rounded-md border p-4">
              <div>
                <Label
                  htmlFor="save-purchase-list-button-is-add-to-cart-page"
                  className="flex items-center gap-2 font-medium leading-3"
                >
                  {__('Add to Cart Page', 'yay-bulk-order')}
                </Label>
                <p className="text-muted-foreground mt-2 text-xs font-normal">
                  {__('Allow customers save their new purchase list from the Cart page.', 'yay-bulk-order')}
                </p>
              </div>
              <Switch
                size="sm"
                id="save-purchase-list-button-is-add-to-cart-page"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="purchaseList.savePurchaseListButton.isAddToCheckoutPage"
          render={({ field }) => (
            <Field orientation="horizontal" className="flex items-center justify-between rounded-md border p-4">
              <div>
                <Label
                  htmlFor="save-purchase-list-button-is-add-to-checkout-page"
                  className="flex items-center gap-2 font-medium leading-3"
                >
                  {__('Add to Checkout Page', 'yay-bulk-order')}
                </Label>
                <p className="text-muted-foreground mt-2 text-xs font-normal">
                  {__('Allow customers save their new purchase list from the Checkout page.', 'yay-bulk-order')}
                </p>
              </div>
              <Switch
                size="sm"
                id="save-purchase-list-button-is-add-to-checkout-page"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="purchaseList.savePurchaseListButton.isAddToMiniCart"
          render={({ field }) => (
            <Field orientation="horizontal" className="flex items-center justify-between rounded-md border p-4">
              <div>
                <Label
                  htmlFor="save-purchase-list-button-is-add-to-mini-cart"
                  className="flex items-center gap-2 font-medium leading-3"
                >
                  {__('Add to Mini Cart', 'yay-bulk-order')}
                </Label>
                <p className="text-muted-foreground mt-2 text-xs font-normal">
                  {__('Allow customers save their new purchase list from the Mini Cart page.', 'yay-bulk-order')}
                </p>
              </div>
              <Switch
                size="sm"
                id="save-purchase-list-button-is-add-to-mini-cart"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="purchaseList.savePurchaseListButton.isAddToOrder"
          render={({ field }) => (
            <Field orientation="horizontal" className="flex items-center justify-between rounded-md border p-4">
              <div>
                <Label
                  htmlFor="save-purchase-list-button-is-add-to-my-order-page"
                  className="flex items-center gap-2 font-medium leading-3"
                >
                  {__('Add to Order Table', 'yay-bulk-order')}
                </Label>
                <p className="text-muted-foreground mt-2 text-xs font-normal">
                  {__(
                    'Allow customers save their new purchase list from [My Account > Orders page] or after placing an order.',
                    '',
                  )}
                </p>
              </div>
              <Switch
                size="sm"
                id="save-purchase-list-button-is-add-to-my-order-page"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldSet>
    </div>
  );
}
