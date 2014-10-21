function bindWidget(widget) {
    var trash = widget.find('.ui-icon.ui-icon-trash');
    var copy = widget.find('.ui-icon.ui-icon-copy');
    var gear = widget.find('.ui-icon.ui-icon-gear');
    widget.on('mouseenter', function(){
        var emptyMessage = widget.find('.empty-widget-message');
        if(emptyMessage.length && widget.parents('.main-cnt, .title-cnt').hasClass('edit-mode')) {
            emptyMessage.show(100);
        }
    }).on('mouseleave', function(){
        var emptyMessage = widget.find('.empty-widget-message');
        if(emptyMessage.length && widget.parents('.main-cnt, .title-cnt').hasClass('edit-mode')) {
            emptyMessage.hide(100);
        }
    });
    trash.on('click', function(){
        widget.remove();
        refreshElements();
    });
    copy.on('click', function(){
        var settings = widget.data('settings');
        renderWidget(settings).done(function(newWidget){
            widget.after(newWidget);
            refreshElements();
            $('body').trigger('inizialize-widgets');
        });
    });
    gear.on('click', function(){
        var widgetDialog = $('#widget-dialog-'+widget.data('counter'));
        widgetDialog.modal('show');
    });

    if (widget.data('settings').type == 'title') {
        trash.remove();
        copy.remove();
    }

    var dialog = widget.find('.widget-dialog');
    dialog.detach().appendTo('body');
    dialog.modal({
        show: false
    });

    widget.draggable(draggableOpts);
    widget.find('.droppable-area').droppable(droppableOpts);
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
        url: $('.main-cnt').data('render-url'),
        contentType: 'application/json',
        dataType: 'html',
        data: JSON.stringify({
            settings: settings,
            edit: true
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
    var edit = widgetElem.data('edit').toLowerCase() === 'true';
    var settings = widgetElem.data('settings');
    var empty = settings['empty'];
    var widget = widgetFactory(widgetElem);
    if (!empty) {
        widget.run();
    }
    if (edit) {
        bindWidget(widgetElem);
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
