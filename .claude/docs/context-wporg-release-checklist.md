# WordPress.org pre-submission checklist

Run before you submit a new plugin or a review update to WordPress.org. Each item says what to check, then **How:** gives the steps. Refer to items by ID (for example "S4").

## Index

| ID | Item | Section |
|---|---|---|
| S1 | Nonce and permission on data-changing handlers | [1. Security](#1-security) |
| S2 | REST `permission_callback` | [1. Security](#1-security) |
| S3 | Input sanitized | [1. Security](#1-security) |
| S4 | Output escaped late | [1. Security](#1-security) |
| S5 | Shortcode and filter callbacks escaped | [1. Security](#1-security) |
| S6 | No JSON flags that bypass escaping | [1. Security](#1-security) |
| S7 | User values in markup allow-listed | [1. Security](#1-security) |
| S8 | SQL prepared | [1. Security](#1-security) |
| S9 | `ABSPATH` guard in every PHP file | [1. Security](#1-security) |
| S10 | No dangerous functions | [1. Security](#1-security) |
| S11 | JSON in inline scripts is hex-encoded | [1. Security](#1-security) |
| S12 | Stored HTML escaped when echoed | [1. Security](#1-security) |
| S13 | Block comment attributes serialized | [1. Security](#1-security) |
| G1 | No updater or license client in the free zip | [2. Guidelines](#2-guidelines-compliance) |
| G2 | No remote code or assets | [2. Guidelines](#2-guidelines-compliance) |
| G3 | No tracking without opt-in | [2. Guidelines](#2-guidelines-compliance) |
| G4 | No locked or trial features | [2. Guidelines](#2-guidelines-compliance) |
| G5 | Admin notices limited | [2. Guidelines](#2-guidelines-compliance) |
| G6 | No forced credit links | [2. Guidelines](#2-guidelines-compliance) |
| G7 | GPL-compatible licenses | [2. Guidelines](#2-guidelines-compliance) |
| B1 | Public source for minified files | [3. Source code and build](#3-source-code-and-build) |
| B2 | Build steps documented | [3. Source code and build](#3-source-code-and-build) |
| B3 | Third-party libraries credited | [3. Source code and build](#3-source-code-and-build) |
| B4 | No dev files in the zip | [3. Source code and build](#3-source-code-and-build) |
| Q1 | `ob_start()` closed on every path | [4. Code quality](#4-code-quality) |
| Q2 | Unique prefix (4+ characters) | [4. Code quality](#4-code-quality) |
| Q3 | Assets load only where needed | [4. Code quality](#4-code-quality) |
| Q4 | No `load_plugin_textdomain()` | [4. Code quality](#4-code-quality) |
| Q5 | Strings translatable, correct text domain | [4. Code quality](#4-code-quality) |
| Q6 | No PHP notices | [4. Code quality](#4-code-quality) |
| Q7 | Clean activate, deactivate, uninstall | [4. Code quality](#4-code-quality) |
| Q8 | WordPress bundled libraries used | [4. Code quality](#4-code-quality) |
| Q9 | Post type keys 20 characters or fewer | [4. Code quality](#4-code-quality) |
| Q10 | Requirements checked at runtime | [4. Code quality](#4-code-quality) |
| Q11 | Activation is clean | [4. Code quality](#4-code-quality) |
| Q12 | Query and render cost is bounded | [4. Code quality](#4-code-quality) |
| Q13 | Product queries respect catalog visibility | [4. Code quality](#4-code-quality) |
| R1 | Readme validator passes | [5. Readme and headers](#5-readme-and-headers) |
| R2 | Versions match | [5. Readme and headers](#5-readme-and-headers) |
| R3 | Requirements correct | [5. Readme and headers](#5-readme-and-headers) |
| R4 | Header fields complete | [5. Readme and headers](#5-readme-and-headers) |
| R5 | Tags and name clean | [5. Readme and headers](#5-readme-and-headers) |
| R6 | Disclosures present | [5. Readme and headers](#5-readme-and-headers) |
| T1 | Plugin Check passes | [6. Tools](#6-tools) |
| T2 | PHPCS passes | [6. Tools](#6-tools) |
| T3 | Works on a clean install | [6. Tools](#6-tools) |
| U1 | Test the real zip | [7. Before you upload](#7-before-you-upload) |
| U2 | Confirm the slug | [7. Before you upload](#7-before-you-upload) |
| U3 | Short reply in the same thread | [7. Before you upload](#7-before-you-upload) |
| U4 | Every case of a reported issue fixed | [7. Before you upload](#7-before-you-upload) |

### Review email headings → items

Use this table when a WordPress.org review email arrives. Find its heading, then check the items listed.

| Heading in the review email | Items |
|---|---|
| Nonces and user permissions before processing requests | S1, S2 |
| Proper escaping of outputs | S4, S6, S7 |
| Variables and options must be escaped when echo'd | S4, S6, S11, S12, S13 |
| Callback calls … return values are output must be properly escaped | S5, S7 |
| Sanitize, validate and escape / data must be sanitized | S3 |
| Calling files remotely / Including an update checker | G1, G2 |
| Tracking / phoning home | G3 |
| Trialware / locked features | G4 |
| Hijacking the admin dashboard / Guideline 11 | G5 |
| The source code of your plugin should be publicly accessible / Guidelines 1, 4 | B1, B2, B3 |
| No publicly documented resource for your generated/compressed content | B1, B2 |
| The plugin has problems when it is activated | Q3, Q10, Q11, G3 |
| Other possible issues (AI-detected) | Q12, U3, U4 |
| Unclosed `ob_start()` | Q1 |
| Generic function/class/define/namespace/option names | Q2, Q9, U3 |
| `load_plugin_textdomain()` is not needed | Q4 |
| Allowing direct file access | S9 |
| Readme / Stable tag / Tested up to | R1, R2, R3 |

## 1. Security

- [ ] **S1. Data-changing handlers check a nonce and the user's permission.**
  How: `grep -rn "wp_ajax_\|admin_post_\|\$_POST\|\$_GET\|\$_REQUEST" includes/`. Open each handler. Before it writes anything, it must call `check_ajax_referer()` or `wp_verify_nonce()`, and then `current_user_can()`.

- [ ] **S2. Every REST route has a real `permission_callback`.**
  How: `grep -rn "register_rest_route" -A8`. Find each `__return_true`. It is OK only if the route is public and read-only.

- [ ] **S3. All input is sanitized.**
  How: for each `$_POST` or `$_GET` hit, check that the value goes through `wp_unslash()` and then a sanitizer such as `sanitize_text_field`, `sanitize_key`, `absint` or `sanitize_email`. Also check values that arrive through REST `$request->get_param()`.

- [ ] **S4. All output is escaped late.**
  How: `grep -rn "echo \$\|echo (\|print \$\|printf" includes/`. Each variable must be wrapped in `esc_html`, `esc_attr`, `esc_url` or `wp_kses_post` on the same line where it is output.

- [ ] **S5. Shortcode and filter callbacks return escaped content.**
  How: `grep -rn "add_shortcode\|add_filter( 'the_content\|the_title"`. Follow each callback to its `return`. Every dynamic value in it must be escaped or allow-listed.

- [ ] **S6. JSON uses no flags that bypass escaping.**
  How: `grep -rn "JSON_UNESCAPED"`. Remove the flags, or wrap the output in `esc_attr()` or `esc_html()`, whichever fits the context. Do not remove `JSON_HEX_*` flags: S11 requires them.

- [ ] **S7. User values in markup are allow-listed.**
  How: find values from shortcode attributes, block attributes or query strings that go into class names, block comments or attributes. Check them against a fixed array with `in_array( $x, $allowed, true )` or use `sanitize_key()`.

- [ ] **S8. SQL is prepared.**
  How: `grep -rn "\$wpdb->" | grep -v prepare`. Any query that contains a variable must use `$wpdb->prepare()`.

- [ ] **S9. Direct file access is blocked.**
  How: `grep -rL "ABSPATH" --include=*.php includes/` lists the PHP files that have no guard.

- [ ] **S10. No dangerous functions.**
  How: `grep -rn "eval(\|extract(\|unserialize(\|base64_decode\|create_function\|shell_exec\|exec("`. Each hit needs a valid reason, or remove it.

- [ ] **S11. JSON in an inline script is hex-encoded.**
  How: `grep -rn "wp_add_inline_script\|wp_print_inline_script_tag"`. Follow each value that comes from `wp_json_encode()`. It must use `JSON_HEX_TAG | JSON_HEX_AMP`, so that a value that contains `</script>` cannot close the script tag. Translations are included: they are not your text.

- [ ] **S12. HTML stored in a variable is escaped when it is echoed.**
  How: `grep -rn "echo \$.*phpcs:ignore\|echo \$"`. A `phpcs:ignore` comment does not pass the review. Echo through `wp_kses()`, or escape each attribute at output and remove the variable. `wp_kses_post()` removes `<input>`, `<svg>` and `srcset`, so markup with these needs its own allow-list. After the change, parse the HTML from before and after and compare each tag, attribute and value.

- [ ] **S13. Block comment attributes are serialized.**
  How: `grep -rn "<!-- wp:.*wp_json_encode"`. Use `serialize_block_attributes()`. A value that contains `-->` can close the comment and add markup.

## 2. Guidelines compliance

- [ ] **G1. The free zip has no updater or license client.**
  How: unzip the release and run `grep -rni "updater\|license\|edd_sl\|update_plugins\|pre_set_site_transient_update"`. Each hit must not be an updater or a license client: no remote calls and no update hooks. A read-only helper that only checks a saved license status can stay, if code that runs in the free build needs it.
  - If the build deletes files from a bundled library, search the rest of the library for each deleted class: `grep -rn "DeletedClass" vendor-prefixed/`. A deleted class that other code still uses causes a fatal error.

- [ ] **G2. No remote code or assets.**
  How: `grep -rn "https\?://" --include=*.php --include=*.js` in the zip. Look for CDNs, Google Fonts and remote scripts. Bundle them locally.

- [ ] **G3. No tracking without opt-in.**
  How: `grep -rn "wp_remote_\|fetch(\|axios"`. Each external call must start only after the user opts in, and the readme must disclose it under "External services".

- [ ] **G4. No locked or trial features in the free version.**
  How: on a clean install with the free plugin only, click every menu and setting. Nothing may be disabled behind a paywall or a time limit. Upsell banners are fine.

- [ ] **G5. Notices are limited.**
  How: `grep -rn "admin_notices"`. Each notice must check the current screen (`get_current_screen()->id`) and be dismissible. Open the Dashboard, Posts and Plugins pages and confirm none of your notices show there.

- [ ] **G6. No forced frontend credit links.**
  How: view the frontend page source and search for your brand name or URL. Any credit link must be off by default.

- [ ] **G7. Licenses are GPL-compatible.**
  How: `pnpm licenses list` or `composer licenses`. Flag anything that is not MIT, BSD, Apache-2.0, GPL or LGPL.

## 3. Source code and build

- [ ] **B1. The source of every minified file is public.**
  How: list `assets/dist/**`. For each one, either its source folder is in the zip, or `readme.txt` has its own `== Source Code ==` section with a public repo URL and a direct link from each compiled folder to its source folder. Do all of these checks:
  - Open each link in a logged-out browser. A private repo returns 404, and that is a blocker.
  - The repo's default branch must hold the same code as the zip. Reviewers land on that branch.
  - Check what the public repo exposes. It holds every branch and the git history, including paid code.

- [ ] **B2. Build steps are documented.**
  How: clone the public repo into an empty folder, with no login. Follow the readme steps exactly (`pnpm install && pnpm build`). They must rebuild `dist/` with no other steps, and give the same folders as the zip. The readme must name the tool versions and the build tools.

- [ ] **B3. Third-party libraries are credited.**
  How: check that each bundled library has a header comment, or is listed in the readme with name, version and URL.

- [ ] **B4. No dev files in the zip.**
  How: `unzip -l plugin.zip | grep -E "node_modules|\.git|tests/|\.env|\.claude|\.log|\.map|\.DS_Store"`. You should get no output.

## 4. Code quality

- [ ] **Q1. Every `ob_start()` is closed on every path.**
  How: `grep -rn "ob_start"`. Follow every `return` and branch after it. Each one must reach `ob_get_clean()` or `ob_end_*()` in the same function.

- [ ] **Q2. Names have a unique prefix.**
  How: `grep -rn "^function \|add_option\|update_option\|set_transient\|update_post_meta\|add_shortcode\|register_post_type\|wp_ajax_\|apply_filters(\|do_action(\|wp_enqueue_script(" | grep -v "yourprefix"`. The prefix must be 4+ characters and unique to this plugin. A variable needs the prefix only if it is declared with `global`, or if it is in a file that runs in the global scope. Names that belong to another plugin are not your prefix: keep them and explain them in the reply (U3). Before a rename, check for a shared value: a form field name can also be the key that PHP reads, and a JS action must match its `wp_ajax_` hook.

- [ ] **Q3. Assets load only where needed.**
  How: open a frontend page with no plugin content, and an unrelated admin page. In DevTools > Network, filter by your plugin slug. You should see no plugin files. Also check the things that do not show in Network:
  - `grep -rn "admin_body_class"`: add a class only on your own screen.
  - `grep -rn "enqueue_block_assets\|wp_enqueue_scripts"`: a dependency such as a WooCommerce script must load only on pages that use it.
  - Your CSS selectors must not reach WordPress's own interface, even on your own screen. Global selectors such as `*`, `html`, `img` and `#adminmenu` reach it, and so does a CSS reset like Tailwind's preflight. Scope them to your app's root element. Rules that fix WordPress's interface show that your CSS reaches it.
  - To test, open your screen and compare the computed styles of `#adminmenumain *` and `#wpadminbar *` with your stylesheet on and off. No element may change.

- [ ] **Q4. No `load_plugin_textdomain()`.**
  How: `grep -rn "load_plugin_textdomain"`. Remove it, or move it to the `init` hook.

- [ ] **Q5. Strings are translatable and use the correct text domain.**
  How: run `wp i18n make-pot . test.pot` and check for warnings. `grep -rn "__(\|_e(\|esc_html__(" | grep -v "'your-slug'"` finds strings with the wrong text domain.

- [ ] **Q6. No PHP notices.**
  How: set `WP_DEBUG` and `WP_DEBUG_LOG` to true and use every feature. `wp-content/debug.log` must have no entries from your plugin.

- [ ] **Q7. The plugin lifecycle is clean.**
  How: activate, deactivate and delete the plugin from the Plugins screen. Then run `wp option list --search="yourprefix*"` and check for leftover tables. Your uninstall routine must remove its data.

- [ ] **Q8. You use WordPress's bundled libraries.**
  How: search `dist/` for a bundled jQuery, React or lodash. Mark them as externals (`window.wp.*`, `window.React`) in the build.

- [ ] **Q9. Post type keys have 20 characters or fewer.**
  How: `grep -rn "register_post_type"`. Count the characters of each key. A longer key makes `register_post_type()` fail. A long prefix can use up this limit, so check this after a rename.

- [ ] **Q10. Requirements are checked at runtime.**
  How: the `Requires at least` header is not enough. It does not protect a site that downgrades WordPress or PHP. Before the plugin loads code that needs them, it must check the minimum WordPress version, PHP version and required plugins, then show an admin notice and stop. To test, force an old version in memory with a `muplugins_loaded` hook that sets `$GLOBALS['wp_version']`, then confirm that no plugin class loads and that the notice shows.

- [ ] **Q11. Activation is clean.**
  How: on a clean site with `WP_DEBUG` true, activate the plugin and read the output: `wp plugin activate your-plugin`. Confirm that it prints nothing and logs no errors, warnings or notices. Any table must use `$wpdb->prefix`, `$wpdb->get_charset_collate()` and `dbDelta()`. Activation must not contact an external server.

- [ ] **Q12. Query and render cost is bounded.**
  How: `grep -rn "posts_per_page.*-1\|get_available_variations\|get_children\|wc_get_product("`. For each loop, find its upper limit, including when a setting turns pagination off. A limit in the admin UI alone does not count: the server must apply it too.
  - Load items in a batch before a loop with `_prime_post_caches()`. `wc_get_product()` on an item that is not cached runs about 4 queries. A loop can only run from cache if you prime it first.
  - `clone` on a `WC_Data` object runs one meta query, unless the meta is already read. Clone only when needed.
  - Measure with `SAVEQUERIES`, at two sizes and one process per size. Compare with a similar WooCommerce block. Test with a large temporary data set in a transaction, then roll it back.

- [ ] **Q13. Product queries respect catalog visibility (WooCommerce plugins).**
  How: set a product to "Catalog visibility: Hidden" and confirm that no plugin list shows it, including search results and pagination totals. A `WP_Query` on `product` does not do this for you. Exclude `exclude-from-catalog`, or `exclude-from-search` while searching.

## 5. Readme and headers

- [ ] **R1. The readme is valid.**
  How: paste `readme.txt` into the [readme validator](https://wordpress.org/plugins/developers/readme-validator/). Fix every error and warning.

- [ ] **R2. Versions match.**
  How: compare `Version:` in the main PHP file, `Stable tag:` in the readme, and the version constant. All three must be equal. `Tested up to` must be the current major WordPress version.

- [ ] **R3. Requirements are correct.**
  How: test with the WordPress and PHP versions in `Requires at least` and `Requires PHP`. WooCommerce plugins must have `Requires Plugins: woocommerce`.

- [ ] **R4. Header fields are complete.**
  How: the main PHP file needs Plugin Name, Description, Version, Author, License (GPLv2 or later), License URI and Text Domain. The Text Domain must be the slug.

- [ ] **R5. Tags and name are clean.**
  How: count the tags (5 or fewer). The plugin name must not start with a trademark such as "WooCommerce …".

- [ ] **R6. Disclosures are present.**
  How: the readme has sections for "Source code", "External services" (if any) and "Privacy".

## 6. Tools

- [ ] **T1. Plugin Check passes.**
  How: install the [Plugin Check](https://wordpress.org/plugins/plugin-check/) plugin and go to Tools > Plugin Check. Select your plugin, run all categories and fix every error. Read every warning.

- [ ] **T2. PHPCS passes.**
  How: `vendor/bin/phpcs --standard=WordPress includes/`. Fix the security sniffs (escaping, nonces, sanitization) first.

- [ ] **T3. The plugin works on a clean install.**
  How: start a fresh site with `wp-env` or LocalWP on the latest WordPress. Test with the minimum and the latest PHP versions, and with only the required plugins active.
  - Then activate the free build together with your other plugins that share a library with it, with their license keys saved. A clean site does not show a crash that only happens when they run together.

## 7. Before you upload

- [ ] **U1. Test the real zip.**
  How: build the release zip, upload it through Plugins > Add New > Upload on a clean site, and run a smoke test of the main features.

- [ ] **U2. Confirm the slug.**
  How: check the folder name and Text Domain. You can't change the slug after approval, so ask for a change in your reply before then.

- [ ] **U3. Write a short reply.**
  How: reply in the same email thread. Give only context or clarifications, such as a repo link or answers to their questions. Don't include a changelog. If a finding is a false positive, or a name belongs to another plugin, say so and give an example. AI-detected findings can be wrong, so read the code, then fix them or explain why you did not.

- [ ] **U4. Every case of a reported issue is fixed.**
  How: the email lists examples only. For each finding, search the whole plugin for the same pattern and fix all cases. Then test the updated zip on a clean site with `WP_DEBUG` true (Q11, T3). Reviewers reject an update that skips this.
