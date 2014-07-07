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
        cols = $('.main-list').children().length;

    $('.widget-button button').on('click', function(){
        var widget = $('<li>', {
            'class': 'widget-test',
            text: 'Widget '+widgetCount
        });
        var drag = $('<span>', {
            'class': 'ui-icon ui-icon-arrow-4'
        });
        var container = $('<li>', {
            'class': 'container-test'
        });
        var containerList = $('<ul>', {
            'class': 'container-list'
        })
        var colNumber = $('.widget-button select').val();
        var column = $('#column-'+colNumber+'-container .column-list');
        drag.appendTo(widget);
        widget.on('click', function(){
            var select = ! widget.hasClass('selected');
            $('.widget-test').removeClass('selected');
            widget.toggleClass('selected', select);
        }).appendTo(containerList);
        containerList.appendTo(container);
        container.appendTo(column);
        widgetCount++;

        containerList.sortable({
            connectWith: '.column-list, .container-list',
            handle: '.ui-icon.ui-icon-arrow-4'
        });
    });

    $('.add-column-button button').on('click', function(){
        var columnContainer = $('<li>', {
            id: 'column-'+cols+'-container',
            'class': 'column-container'
        });
        var columnList = $('<ul>', {
            'class': 'column-list'
        });
        var option = $('<option>', {
            text: cols
        });

        columnList.appendTo(columnContainer);
        columnContainer.appendTo($('.main-list'));
        option.appendTo($('.widget-button select'));

        columnList.sortable({
            connectWith: '.column-list, .container-list',
            handle: '.ui-icon.ui-icon-arrow-4'
        });

        cols++;
    });

    $('body').on('sortstop', function(){
        $('.container-test').each(function(){
            $this = $(this);
            var list = $this.children('.container-list');
            if (list.children().length < 1) {
                $this.remove();
            } else if (list.children().length > 1 && $this.children('.ui-icon.ui-icon-arrow-4').length < 1) {
                list.detach();
                var drag = $('<span>', {
                    'class': 'ui-icon ui-icon-arrow-4'
                });
                drag.appendTo($this);
                list.appendTo($this);
                $this.addClass('filled');
            } else if (list.children().length == 1) {
                $this.children('.ui-icon.ui-icon-arrow-4').remove();
                $this.removeClass('filled');
            }
        });
        $('.widget-test').each(function(){
            var $this = $(this);
            if (!$this.parent().hasClass('container-list')) {
                var container = $('<li>', {
                    'class': 'container-test'
                });
                var containerList = $('<ul>', {
                    'class': 'container-list'
                });
                $this.wrap(containerList);
                $this.parent().wrap(container);
                $this.parent().sortable({
                    connectWith: '.column-list, .container-list',
                    handle: '.ui-icon.ui-icon-arrow-4'
                });
            }
        });
    });

});