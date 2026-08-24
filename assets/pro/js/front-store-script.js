const YBO_QUICK_ORDER_FILE_LIMIT = 10 * 1024 * 1024; // 10MB

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
  $(document).ready(() => {
    const dropzone = jQuery('.ybo_csv_order_drop_zone');
    dropzone.on('dragenter dragover dragleave drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    dropzone.on('dragenter dragover', function () {
      dropzone.addClass('ybo_csv_order_dropenter');
    });

    dropzone.on('dragleave drop', function () {
      dropzone.removeClass('ybo_csv_order_dropenter');
    });

    dropzone.on('drop', function (e) {
      const files = e.originalEvent.dataTransfer.files;
      const fileInput = jQuery(this).find('.ybo_csv_order_file_input');

      if (!fileInput) return;
      if (!files.length) return;

      fileInput[0].files = files;
      fileInput.trigger('change');
    });

    const fileRemove = jQuery('.ybo_csv_order_file_remove');
    fileRemove.on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const fileInput = jQuery(this).closest('.ybo_csv_order_zone_file').siblings('.ybo_csv_order_file_input');

      if (!fileInput) return;

      fileInput.val('');
      fileInput.trigger('change');
    });
  });

  jQuery(document).on('change', '.ybo_csv_order_file_input', function () {
    const dropzone = jQuery(this).closest('.ybo_csv_order_drop_zone');
    const dropzonePlaceholder = dropzone.find('.ybo_csv_order_zone_placeholder');
    const dropzoneFile = dropzone.find('.ybo_csv_order_zone_file');
    const dropzoneError = dropzone.siblings('.ybo_csv_order_file_error');
    const { __ } = window.wp.i18n;

    const resetZone = () => {
      dropzoneFile.find('.ybo_csv_order_file_name').text('');
      dropzonePlaceholder.show();
      dropzoneFile.hide();
    };

    const file = this.files?.[0];

    if (!file) {
      dropzoneError.hide();
      resetZone();
      return;
    }

    let errorMsg = '';
    const isCsv = file.type === 'text/csv' || /\.csv$/i.test(file.name);

    if (!isCsv) {
      errorMsg = __('Error: Please upload a csv file.', 'yay-bulk-order');
    } else if (file.size > YBO_QUICK_ORDER_FILE_LIMIT) {
      errorMsg = __('Error: This csv file is too large', 'yay-bulk-order');
    }

    if (errorMsg.length) {
      dropzoneError.text(errorMsg);
      dropzoneError.show();
      this.value = '';
      resetZone();
      return;
    }

    dropzoneError.hide();

    const fileName = file.name;

    dropzonePlaceholder.hide();
    dropzoneFile.show();
    dropzoneFile.find('.ybo_csv_order_file_name').text(fileName);
  });
  // #endregion
});
