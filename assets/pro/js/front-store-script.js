// #region Purchase List
jQuery(function ($) {
  $(document).ready(() => {
    function saveList($button, action, payload) {
      var listName = window.prompt(yayBulkOrder.i18n.promptListName);

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
            window.alert(yayBulkOrder.i18n.saved);
          } else {
            window.alert((response && response.data && response.data.message) || yayBulkOrder.i18n.error);
          }
        })
        .fail(function (jqXHR) {
          var response = jqXHR.responseJSON;
          window.alert((response && response.data && response.data.message) || yayBulkOrder.i18n.error);
        })
        .always(function () {
          $button.prop('disabled', false);
        });
    }

    $(document).on('click', '.ybo_save_pl_cart_button', function (event) {
      event.preventDefault();
      saveList($(this), 'ybo_save_purchase_list_from_cart', {});
    });

    $(document).on('click', '.ybo_save_pl_order_button', function (event) {
      event.preventDefault();
      saveList($(this), 'ybo_save_purchase_list_from_order', { orderId: $(this).data('order-id') });
    });
  });
  // #endregion

  // #region Quick CSV Order
  // #endregion
});
