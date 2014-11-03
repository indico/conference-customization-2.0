function TitleWidget(widgetElem) {
    Widget.call(this, widgetElem);
}
TitleWidget.prototype = Object.create(Widget.prototype);
TitleWidget.prototype.constructor = TitleWidget;

$.extend(TitleWidget.prototype, {

    saveSettings: function saveSettings() {
        var self = this;
        var dialog = self.dialog;
        var title = dialog.find('.we-widget-title');
        var subtitle = dialog.find('.we-widget-subtitle');
        self.settings.content = {
            title: title.val(),
            subtitle: subtitle.val().replace(/\n/g, '</h3>\n<h3>')
        };
        self.settings.empty = self.settings.content.title == '';
    },

    initializeDialog: function initializeDialog() {
        var self = this;
        var dialog = self.dialog;
        var title = dialog.find('.we-widget-title');
        var subtitle = dialog.find('.we-widget-subtitle');

        if (self.settings.content != undefined) {
            title.val(self.settings.content.title || '');
            subtitle.val(self.settings.content.subtitle.replace(/<\/h3>\n<h3>/g, '\n') || '');
        }
    }
});