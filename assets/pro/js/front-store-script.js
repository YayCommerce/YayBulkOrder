// #region Purchase List
const { __ } = window.wp.i18n;

jQuery(function ($) {
  $(document).ready(() => {
    function saveList($button, action, payload) {
      var listName = window.prompt(__('Name this purchase list:', 'yay-bulk-order'));

      if (!listName) {
        return;
      }

      $button.prop('disabled', true);

      $.ajax({
        url: yayBulkOrder.ajaxUrl + '?action=' + action,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(
          $.extend(
            {
              nonce: yayBulkOrder.nonce,
              list_name: listName,
            },
            payload,
          ),
        ),
      })
        .done(function (response) {
          if (response && response.success) {
            window.alert(__('Purchase list saved.', 'yay-bulk-order'));
          } else {
            window.alert(
              (response && response.data && response.data.message) ||
                __('Something went wrong. Please try again.', 'yay-bulk-order'),
            );
          }
        })
        .fail(function (jqXHR) {
          var response = jqXHR.responseJSON;
          window.alert(
            (response && response.data && response.data.message) ||
              __('Something went wrong. Please try again.', 'yay-bulk-order'),
          );
        })
        .always(function () {
          $button.prop('disabled', false);
        });
    }

    $(document).on('click', '.ybod_save_pl_cart_button', function (event) {
      event.preventDefault();
      saveList($(this), 'ybod_save_purchase_list_from_cart', {});
    });

    $(document).on('click', '.ybod_save_pl_order_button', function (event) {
      event.preventDefault();
      saveList($(this), 'ybod_save_purchase_list_from_order', { orderId: $(this).data('order-id') });
    });
  });
  // #endregion

  // #region Quick CSV Order
  // #endregion
});
