const YBO_QUICK_ORDER_FILE_LIMIT = 10 * 1024 * 1024; // 10MB

const { __ } = window.wp.i18n;

jQuery(function ($: JQueryStatic) {
  $(document).ready(() => {
    const dropzone = $('.ybo_csv_order_drop_zone');
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
      const fileInput = $(this).find('.ybo_csv_order_file_input');

      if (!fileInput) return;
      if (!files.length) return;

      (fileInput[0] as HTMLInputElement).files = files;
      fileInput.trigger('change');
    });

    const fileRemove = $('.ybo_csv_order_file_remove');
    fileRemove.on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const fileInput = $(this).closest('.ybo_csv_order_zone_file').siblings('.ybo_csv_order_file_input');

      if (!fileInput) return;

      fileInput.val('');
      fileInput.trigger('change');
    });
  });

  $(document).on('change', '.ybo_csv_order_file_input', function () {
    const dropzone = $(this).closest('.ybo_csv_order_drop_zone');
    const dropzonePlaceholder = dropzone.find('.ybo_csv_order_zone_placeholder');
    const dropzoneFile = dropzone.find('.ybo_csv_order_zone_file');
    const dropzoneError = dropzone.siblings('.ybo_csv_order_file_error');

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
});
