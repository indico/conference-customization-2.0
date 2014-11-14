function BoxWidget(widgetElem) {
    Widget.call(this, widgetElem);
}
BoxWidget.prototype = Object.create(Widget.prototype);
BoxWidget.prototype.constructor = BoxWidget;

$.extend(BoxWidget.prototype, {
    saveSettings: function saveSettings() {
        var self = this;
        var dialog = self.dialog;
        var content = dialog.find('.we-widget-content');
        self.settings.content = content.val();
        self.settings.empty = self.settings.content == '';
    },

    initializeDialog: function initializeDialog() {
        var self = this;
        var dialog = self.dialog;
        var content = dialog.find('.we-widget-content');
        content.val(self.settings.content || '');
    }
});
