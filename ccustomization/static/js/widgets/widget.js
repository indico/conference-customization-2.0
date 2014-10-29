function bindWidget(widget) {
    var widgetElem = widget.widgetElem;
    var trash = widgetElem.find('.ui-icon.ui-icon-trash');
    var copy = widgetElem.find('.ui-icon.ui-icon-copy');
    var gear = widgetElem.find('.ui-icon.ui-icon-gear');
    widgetElem.on('mouseenter', function(){
        var emptyMessage = widgetElem.find('.empty-widget-message');
        if(emptyMessage.length && widgetElem.parents('.page-content-container').hasClass('edit-mode')) {
            emptyMessage.show(100);
        }
    }).on('mouseleave', function(){
        var emptyMessage = widgetElem.find('.empty-widget-message');
        if(emptyMessage.length && widgetElem.parents('.page-content-container').hasClass('edit-mode')) {
            emptyMessage.hide(100);
        }
    });
    trash.on('click', function(){
        widgetElem.remove();
    });
    copy.on('click', function(){
        var settings = widgetElem.data('settings');
        renderWidget(settings).done(function(newWidget){
            widgetElem.after(newWidget);
            $('body').trigger('inizialize-widgets');
        });
    });
    gear.on('click', function(){
        var widgetDialog = widget.dialog;
        widgetDialog.modal('show');
    });

    var dialog = widget.dialog;
    dialog.detach().appendTo('body');
    dialog.modal({
        show: false
    });

    widgetElem.draggable(draggableOpts);
    widgetElem.find('.droppable-area').droppable(droppableOpts);
}

function updateWidget(widget, settings) {
    renderWidget(settings).done(function(newWidget){
        widget.replaceWith(newWidget);
        $('body').trigger('inizialize-widgets');
    });
}

function reloadWidget(widget) {
    var settings = widget.data('settings');
    updateWidget(widget, settings);
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

function widgetFactory(widgetElem) {
    var settings = widgetElem.data('settings');
    var type = settings.type;
    type = type.charAt(0).toUpperCase() + type.slice(1);
    var widget = new window[type+'Widget'](widgetElem);
    return widget;
}

function initialize(widgetElem) {
    var edit = $('.page-content-container').data('edit').toLowerCase() === 'true';
    var settings = widgetElem.data('settings');
    var empty = settings['empty'];
    var widget = widgetFactory(widgetElem);
    bindWidget(widget);
    if (!empty) {
        widget.run();
    }
    if (edit) {
        widget.runEdit();
    }
    widgetElem.removeClass('uninitialized');
}

$(document).ready(function() {
    "use strict";

    $('body').on('inizialize-widgets', function(){
        var uninitializedWidgets = $('.widget.uninitialized');
        uninitializedWidgets.each(function(){
            var widgetElem = $(this);
            initialize(widgetElem);
        });
    }).trigger('inizialize-widgets');

});
