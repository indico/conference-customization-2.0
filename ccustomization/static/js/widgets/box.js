function BoxWidget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
}

$.extend(BoxWidget.prototype, {
    run: function run() {},

    runEdit: function runEdit() {
        var self = this;
        var dialog = self.widgetElem.find('.widget-dialog');
        var save = dialog.find('.we-save-button');
        var title = dialog.find('.we-widget-title');
        var color = dialog.find('.we-widget-color');
        var border = dialog.find('.we-widget-border');
        var content = dialog.find('.we-widget-content');

        dialog.detach().appendTo('body');

        save.on('click', function(){
            self.settings['style'] = {
                title: title.val(),
                color: color.val(),
                border: border.is(':checked')
            };
            self.settings.content = content.val();
            self.settings.empty = false;
            updateWidget(self.widgetElem, self.settings);
        });

        dialog.on('hidden.bs.modal', function() {
            dialog.modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        });

        dialog.modal({
            show: false
        });

        self.widgetElem.on('click', function(){
            if (self.settings.style != undefined) {
                title.val(self.settings.style.title || '');
                color.val(self.settings.style.color || '');
                border.prop('checked', self.settings.style.border || false);
                content.val(self.settings.content || '');
            } else {
                title.val('');
                color.val('');
                border.prop('checked', false);
                content.val('');
            }
            content.trigger('input');
            dialog.modal('show');
        });

        content.on('input', function(){
            if (content.val() == '') {
                save.prop('disabled', true);
            } else {
                save.prop('disabled', false);
            }
        });
    }
});
