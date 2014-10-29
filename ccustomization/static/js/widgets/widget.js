function Widget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
    this.dialog = widgetElem.find('.widget-dialog');
}

$.extend(Widget.prototype, {
    initialize: function initialize() {
        var self = this;
        var edit = $('.page-content-container').data('edit').toLowerCase() === 'true';
        var empty = self.settings['empty'];

        self.bind();

        if (!empty) {
            self.run();
        }
        if (edit) {
            self.runEdit();
        }
    },

    bind: function bind() {
        var self = this;
        self.widgetElem.on('mouseenter', function(){
            var emptyMessage = self.widgetElem.find('.empty-widget-message');
            if(emptyMessage.length && self.widgetElem.parents('.page-content-container').hasClass('edit-mode')) {
                emptyMessage.show(100);
            }
        }).on('mouseleave', function(){
            var emptyMessage = self.widgetElem.find('.empty-widget-message');
            if(emptyMessage.length && self.widgetElem.parents('.page-content-container').hasClass('edit-mode')) {
                emptyMessage.hide(100);
            }
        });

        self.bindIcons();

        self.dialog.detach().appendTo('body');
        self.dialog.modal({
            show: false
        });

        self.widgetElem.draggable(draggableOpts);
        self.widgetElem.find('.droppable-area').droppable(droppableOpts);
    },

    bindIcons : function bindIcons() {
        var self = this;
        var trash = self.widgetElem.find('.ui-icon.ui-icon-trash');
        var copy = self.widgetElem.find('.ui-icon.ui-icon-copy');
        var gear = self.widgetElem.find('.ui-icon.ui-icon-gear');

        trash.on('click', function(){
            self.widgetElem.remove();
        });
        copy.on('click', function(){
            var settings = self.widgetElem.data('settings');
            self.render().done(function(newWidget){
                self.widgetElem.after(newWidget);
                widgetFactory(newWidget);
            });
        });
        gear.on('click', function(){
            self.dialog.modal('show');
        });
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

    runEdit: function runEdit() {}
});

function widgetFactory(widgetElem) {
    var settings = widgetElem.data('settings');
    var type = settings.type;
    type = type.charAt(0).toUpperCase() + type.slice(1);
    var widget = new window[type+'Widget'](widgetElem);
    widgetElem.data('object', widget);
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

$(document).ready(function() {
    "use strict";

    $('.widget').each(function(){
        var widgetElem = $(this);
        widgetFactory(widgetElem);
    });

});
