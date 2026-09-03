# Yay Bulk Order for WooCommerce

WooCommerce plugin for quick bulk ordering.

## Getting Started

```php
// In wp-config.php
// development mode
define( 'YAYBULKORDER_IS_DEVELOPMENT', true );
// production mode
define( 'YAYBULKORDER_IS_DEVELOPMENT', false );
```

```bash
# Install JS dependencies
pnpm install
# Build Gutenberg block
pnpm build
```

## Development

```bash
# Build assets (watch mode)
pnpm dev
```

## Testing

### E2E Tests (Playwright)

```bash
# Install Playwright browsers
pnpm test:e2e:install

# Start test environment (single site)
pnpm env:start:single

# Run all e2e tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Stop test environment
pnpm env:stop:single
```

## Release

```bash
# Build & package both Pro and Lite
pnpm release

# Pro only
pnpm release:pro

# Lite only
pnpm release:lite
```

## Internationalization

```bash
pnpm makepot
```

## Chia chuc nang

Product Table : table of multiple Products, add to cart directly in one page
Variant Table : table of one Product with variations, add to cart directly in one page.
Quick Order : enter quantity in Shop, then click "Add to Cart" , "Add More". Show total in Floating Button (Brandy Block)

Config Bulk Order : plugin settings, style, meta

Store Product Table :
readonly: product query
state: total count, pagination, filter

Store Variant Table :
readonly: product id
state: quantity input

Store Quick Order :
readonly: product id
state: quantity input

Store Cart : import from Woocommerce

# run release

./release.sh # prompts you to pick Pro/Lite
./release.sh pro # builds Pro directly, no prompt
./release.sh lite # builds Lite directly, no prompt
