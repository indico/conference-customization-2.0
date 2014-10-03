function BoxWidget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
}

$.extend(BoxWidget.prototype, {
    run: function run() {},

    runEdit: function runEdit() {
        var self = this;
        var dialog = $('#widget-dialog-'+self.widgetElem.data('counter'));
        var save = dialog.find('.we-save-button');
        var title = dialog.find('.we-widget-title');
        var color = dialog.find('.we-widget-color');
        var border = dialog.find('.we-widget-border');
        var content = dialog.find('.we-widget-content');

        if (self.settings.style != undefined) {
            title.val(self.settings.style.title || '');
            color.val(self.settings.style.color || '');
            border.prop('checked', self.settings.style.border || false);
        } else {
            title.val('');
            color.val('');
            border.prop('checked', false);
        }
        content.val(self.settings.content || '');
        content.trigger('input');

        save.on('click', function(){
            self.settings['style'] = {
                title: title.val(),
                color: color.val(),
                border: border.is(':checked')
            };
            self.settings.content = content.val();
            self.settings.empty = self.settings.content == '';
            updateWidget(self.widgetElem, self.settings);
        });
    }
});
