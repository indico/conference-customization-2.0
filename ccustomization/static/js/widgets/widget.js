function Widget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
    this.dialog = widgetElem.find('.widget-dialog');
}

$.extend(Widget.prototype, {
    initialize: function initialize() {
        var self = this;
        var empty = self.settings.empty;
        var edit = $('.page-content-container').data('edit').toLowerCase() === 'true';

        self.widgetElem.data('object', self);

        if (!empty) {
            self.run();
        }
        if (edit) {
            self.bind();
        }
    },

    bind: function bind() {
        var self = this;

        self.bindIcons();
        self.bindDialog();

        self.widgetElem.draggable(draggableOpts);
        self.widgetElem.find('.droppable-area').droppable(droppableOpts);
    },

    bindDialog: function bindDialog() {
        var self = this;
        var save = self.dialog.find('.we-save-button');
        var title = self.dialog.find('.we-widget-title');
        var border = self.dialog.find('.we-widget-border');
        self.dialog.detach().appendTo('body');
        self.dialog.modal({
            show: false
        });
        title.val(self.settings.title || '');
        border.prop('checked', self.settings.border || false);
        self.initializeDialog();
        save.on('click', function(){
            self.settings.title = title.val();
            self.settings.border = border.is(':checked');
            self.saveSettings();
            self.update();
        });
    },

    bindIcons : function bindIcons() {
        var self = this;
        var trash = self.widgetElem.find('.ui-icon.ui-icon-trash');
        var copy = self.widgetElem.find('.ui-icon.ui-icon-copy');
        var gear = self.widgetElem.find('.ui-icon.ui-icon-gear');

        trash.on('click', function(){
            var parent = self.widgetElem.parent('.content').parent('.widget-cnt');
            self.widgetElem.remove();
            parent.data('object').updateContent();
        });
        copy.on('click', function(){
            var settings = self.settings;
            self.render().done(function(newWidget){
                self.widgetElem.after(newWidget);
                widgetFactory(newWidget);
            });
        });
        gear.on('click', function(){
            self.dialog.modal('show');
        });
    },

    serialize: function serialize(){
        var self = this;
        var serializedWidget = {
            type: 'widget',
            settings: self.settings
        };
        return serializedWidget;
    },

    update: function update() {
        var self = this;
        self.render().done(function(newWidget){
            self.widgetElem.replaceWith(newWidget);
            widgetFactory(newWidget);
        });
    },

    reload:  function reload() {
        var self = this;
        self.update();
    },

    render: function render() {
        var self = this;
        return renderWidget(self.settings);
    },

    run: function run() {},

    initializeDialog: function initializeDialog() {},

    saveSettings: function saveSettings() {}
});

function widgetFactory(widgetElem) {
    var settings = widgetElem.data('settings');
    var type = settings.type;
    type = type.charAt(0).toUpperCase() + type.slice(1);
    var widget = new window[type+'Widget'](widgetElem);
    widget.initialize();
    return widget;
}

function renderWidget(settings) {
    var newWidget = $.Deferred();
    $.ajax({
        type: 'POST',
        url: $('.page-content-container').data('render-url'),
        contentType: 'application/json',
        dataType: 'html',
        data: JSON.stringify({
            settings: settings
        }),
        success: function(response) {
            newWidget.resolve($($.parseHTML(response)));
        }
    });
    return newWidget.promise();
}
