import { __ } from "@wordpress/i18n";
import { checkUtilsIsReady } from "@yay-bulk-order/utils";

document.addEventListener("DOMContentLoaded", () => {
  if (__ !== undefined) {
    console.log("wp-i18n is loaded");
  } else {
    console.log("wp-i18n is not loaded");
  }

  checkUtilsIsReady;
});
