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
  primary: '--ybo-primary-color',
  headerBackground: '--ybo-header-background-color',
  headerText: '--ybo-header-text-color',
  background: '--ybo-background-color',
  border: '--ybo-border-color',
  text: '--ybo-text-color',
  textHover: '--ybo-text-hover-color',
  description: '--ybo-description-color',
  buttonBackground: '--ybo-button-background-color',
  buttonBackgroundHover: '--ybo-button-background-hover-color',
  buttonText: '--ybo-button-text-color',
  buttonTextHover: '--ybo-button-text-hover-color',
};

export function getColorPanels(): { title: string; keys: TableColorKey[] }[] {
  return [
    {
      title: __('General Colors', 'yay-bulk-order'),
      keys: ['headerBackground', 'background', 'primary', 'border'],
    },
    {
      title: __('Typography Colors', 'yay-bulk-order'),
      keys: ['headerText', 'text', 'textHover', 'description'],
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
