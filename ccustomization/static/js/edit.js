$(document).ready(function() {
    // var widgets = $('.widget-test');
    // var width = $('.main-container').width();
    // widgets.on('click', function(){
    //     var widget = $(this);
    //     var select = true;
    //     if (widget.hasClass('selected')) {
    //         select = false;
    //     }
    //     widgets.removeClass('selected');
    //     widget.toggleClass('selected', select);
    // });

    // $('.main-list').width(width).sortable();

    // ---------------------------------------

    //$('.main-list').sortable();
    $('.column-list, .container-list').sortable({
        connectWith: '.column-list, .container-list',
        handle: '.ui-icon.ui-icon-arrow-4'
    });

    var widgetCount = 0,
        containerCount = 0;

    $('.widget-button button').on('click', function(){
        var widget = $('<li>', {
            class: 'widget-test',
            text: 'Widget '+widgetCount
        });
        var drag = $('<span>', {
            class: 'widget-drag ui-icon ui-icon-arrow-4'
        });
        drag.appendTo(widget);
        widget.on('click', function(){
            var select = true;
            if (widget.hasClass('selected')) {
                select = false;
            }
            $('.widget-test').removeClass('selected');
            widget.toggleClass('selected', select);
        }).appendTo($('#column-0-container .column-list'));
        widgetCount++;
    });

    $('.container-button button').on('click', function(){
        var container = $('<li>', {
            class: 'container-test',
            id: 'container-'+containerCount
        });
        var drag = $('<span>', {
            class: 'container-drag ui-icon ui-icon-arrow-4'
        });
        var containerList = $('<ul>', {
            class: 'container-list'
        });
        drag.appendTo(container);
        containerList.appendTo(container);
        container.appendTo($('#column-0-container .column-list'));
        containerCount++;

        containerList.sortable({
            connectWith: '.column-list, .container-list',
            handle: '.ui-icon.ui-icon-arrow-4'
        });
    });

});