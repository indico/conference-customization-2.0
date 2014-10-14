function ImageWidget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
}

$.extend(ImageWidget.prototype, {
    run: function run() {},

    runEdit: function runEdit() {
        var self = this;
        var dialog = $('#widget-dialog-'+self.widgetElem.data('counter'));
        var save = dialog.find('.we-save-button');
        var title = dialog.find('.we-widget-title');
        var border = dialog.find('.we-widget-border');
        var upload = dialog.find('.we-picture-file');
        var url = dialog.find('.we-picture-url');
        var loadPictureButton = dialog.find('.we-load-picture-button');
        var path = dialog.find('.we-picture-path');
        var picURL = null;
        var fileForm = upload.parent('form');
        var previewSection = dialog.find('.we-preview-section');
        var previewImg = previewSection.find('img');

        function updatePath(newPath) {
            path.val(newPath);
            path.trigger('change');
        }

        path.on('change', function(){
            if (path.val() == '') {
                previewSection.addClass('hidden');
            } else {
                previewImg.prop('src', path.val());
                previewSection.removeClass('hidden');
            }
        });

        fileForm.submit(function() {
            fileForm.ajaxSubmit({
                async: false,
                success: function(response) {
                    picURL = response;
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('File loading failed: ' + errorThrown);
                    upload.val('');
                    picURL = null;
                }
            });
            return false;
        });

        title.val(self.settings.title || '');
        border.prop('checked', self.settings.border || false);
        if (self.settings.content != undefined) {
            url.val(self.settings.content.path);
            updatePath(self.settings.content.path);
        }

        loadPictureButton.on('click', function(){
            $('<img>', {
                src: url.val(),
                error: function() {
                    alert('The specified URL is invalid!');
                    url.val('');
                },
                load: function() {
                    updatePath(url.val());
                    upload.val('');
                }
            });
        });

        upload.on('change', function(){
            var ok = upload[0].files[0].type.match('^image/.*');
            if (ok) {
                fileForm.submit();
                if (picURL != null) {
                    updatePath(picURL);
                    url.val('');
                }
            } else {
                alert('The specified file is invalid!');
                upload.val('');
            }
        });

        save.on('click', function(){
            self.settings.title = title.val();
            self.settings.border = border.is(':checked');
            self.settings.content = {
                path: path.val()
            }
            self.settings.empty = path.val() == '';
            updateWidget(self.widgetElem, self.settings);
        });
    }
});
