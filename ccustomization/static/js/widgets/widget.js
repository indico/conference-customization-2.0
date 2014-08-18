function bindWidget(widget) {
    widget.on('mouseenter', function(){
        var emptyMessage = widget.children('.empty-widget-message');
        if(emptyMessage.length > 0) {
            emptyMessage.show(100);
        }
    }).on('mouseleave', function(){
        var emptyMessage = widget.children('.empty-widget-message');
        if(emptyMessage.length > 0) {
            emptyMessage.hide(100);
        }
    });
    widget.find('.ui-icon.ui-icon-trash').on('click', function(e){
        e.stopPropagation();
        $('#style-dialog-'+widget.data('counter')).remove();
        if (!widget.siblings('.widget-cc').length) {
            widget.parent().parent().remove();
        } else {
            widget.remove();
        }
        $('body').trigger('sortstop');
    });
    widget.find('.ui-icon.ui-icon-copy').on('click', function(e){
        e.stopPropagation();
        var settings = widget.data('settings');
        renderWidget(settings).done(function(newWidget){
            widget.parent().parent().after(newWidget);
            $('body').trigger('sortstop').trigger('inizialize-widgets');
        });
    });
    var containerList = widget.parent('.container-list');
    containerList.sortable(sortableOptions);
}

function updateWidget(widget, settings) {
    renderWidget(settings).done(function(newWidget){
        $('#style-dialog-'+widget.data('counter')).remove();
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
        url: $('.main-container').data('render-url'),
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
    var type = settings['type'];
    type = type.charAt(0).toUpperCase() + type.slice(1);
    var widget = new window[type+'Widget'](widgetElem);
    return widget;
}

function initialize(widgetElem) {
    var edit = widgetElem.data('edit');
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
        var uninitializedWidgets = $('.widget-cc.uninitialized');
        uninitializedWidgets.each(function(){
            var widgetElem = $(this);
            initialize(widgetElem);
        });
    }).trigger('inizialize-widgets');

});
