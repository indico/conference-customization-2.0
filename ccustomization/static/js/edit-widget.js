var defaultDialogOptions = {
    autoOpen: false,
    height: 500,
    width: 500,
    modal: true,
    close: function() {
        $('.widget-test').removeClass('selected');
    },
    show: {
        duration: 400
    },
    hide: {
        duration: 400
    }
};

function getDialogOptions(options) {
    return $.extend(defaultDialogOptions, options);
}

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
        if (!widget.siblings('.widget-test').length) {
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
            $('body').trigger('sortstop');
        });
    });
    var containerList = widget.parent('.container-list');
    containerList.sortable({
        connectWith: '.column-list, .container-list',
        handle: '.ui-icon.ui-icon-arrow-4'
    });
}

function updateWidget(widget, settings) {
    renderWidget(settings).done(function(newWidget){
        $('#style-dialog-'+widget.data('counter')).remove();
        widget.replaceWith(newWidget);
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
            newWidget.resolve($(response)); // to change to $($.parseHTML(....)); when get rid of inline JS
        }
    });
    return newWidget.promise();
}
