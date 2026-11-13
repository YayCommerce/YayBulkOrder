import { __ } from '@wordpress/i18n';

export type TableColorKey =
  | 'primary'
  | 'headerBackground'
  | 'headerText'
  | 'background'
  | 'border'
  | 'text'
  | 'textHover'
  | 'description'
  | 'buttonBackground'
  | 'buttonBackgroundHover'
  | 'buttonText'
  | 'buttonTextHover';

export type TableColors = Partial<Record<TableColorKey, string>>;

const CSS_VAR_BY_KEY: Record<TableColorKey, string> = {
  primary: '--ybod-primary-color',
  headerBackground: '--ybod-header-background-color',
  headerText: '--ybod-header-text-color',
  background: '--ybod-background-color',
  border: '--ybod-border-color',
  text: '--ybod-text-color',
  textHover: '--ybod-text-hover-color',
  description: '--ybod-description-color',
  buttonBackground: '--ybod-button-background-color',
  buttonBackgroundHover: '--ybod-button-background-hover-color',
  buttonText: '--ybod-button-text-color',
  buttonTextHover: '--ybod-button-text-hover-color',
};

export function getColorPanels(): { title: string; keys: TableColorKey[] }[] {
  return [
    {
      title: __('General Colors', 'yay-bulk-order'),
      keys: ['primary', 'background', 'border'],
    },
    {
      title: __('Typography Colors', 'yay-bulk-order'),
      keys: ['text', 'textHover', 'description'],
    },
    {
      title: __('Button Colors', 'yay-bulk-order'),
      keys: ['buttonBackground', 'buttonBackgroundHover', 'buttonText', 'buttonTextHover'],
    },
  ];
}

export function getColorLabel(key: TableColorKey): string {
  const labels: Record<TableColorKey, string> = {
    primary: __('Primary Color', 'yay-bulk-order'),
    headerBackground: __('Header Background Color', 'yay-bulk-order'),
    headerText: __('Header Text Color', 'yay-bulk-order'),
    background: __('Body Background Color', 'yay-bulk-order'),
    border: __('Border Color', 'yay-bulk-order'),
    text: __('Text Color', 'yay-bulk-order'),
    textHover: __('Text Hover Color', 'yay-bulk-order'),
    description: __('Description Color', 'yay-bulk-order'),
    buttonBackground: __('Button Background Color', 'yay-bulk-order'),
    buttonBackgroundHover: __('Button Background Hover Color', 'yay-bulk-order'),
    buttonText: __('Button Text Color', 'yay-bulk-order'),
    buttonTextHover: __('Button Text Hover Color', 'yay-bulk-order'),
  };
  return labels[key];
}

// Only overridden keys get a CSS var here, so unset colors keep inheriting
// the value the ancestor Variant Table block already set from global settings.
export function buildColorStyle(colors: TableColors): Record<string, string> {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    if (value) {
      style[CSS_VAR_BY_KEY[key as TableColorKey]] = value;
    }
  }
  return style;
}
