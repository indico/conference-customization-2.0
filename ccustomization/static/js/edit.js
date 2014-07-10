$(document).ready(function() {
    "use strict";
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

    $('.widget-test').each(function(){
        bindWidget($(this));
    });

    function rgb2hex(rgb) {
       rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
       return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    function hex(x) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    }

    var widgetCount = 0,
        cols = $('.main-list').children().length,
        dialog,
        hexDigits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];

    function bindWidget(widget) {
        widget.on('click', function(){
            var select = ! widget.hasClass('selected');
            $('.widget-test').removeClass('selected');
            widget.toggleClass('selected', select);
            if (select) {
                var color = dialog.find("form input#color"),
                    fontSize = dialog.find("form input#font-size"),
                    title = dialog.find("form input#title");
                color.val(rgb2hex(widget.css('background-color')));
                fontSize.val(widget.css('font-size'));
                title.val(widget.text().trim());
                dialog.dialog("open");
            }
        });
        widget.find('.ui-icon.ui-icon-trash').on('click', function(e){
            e.stopPropagation();
            if (widget.siblings('.widget-test').length < 1) {
                widget.parent().parent().remove();
            } else {
                widget.remove();
            }
            $('body').trigger('sortstop');
        });
    }

    $('.actions button#add-widget').on('click', function(){
        var widget = $('<li>', {
            'class': 'widget-test',
            text: 'Widget '+widgetCount
        });
        var widgetIcons = $('<div>', {
            'class': 'widget-icons'
        });
        var drag = $('<span>', {
            'class': 'ui-icon ui-icon-arrow-4'
        });
        var trash = $('<span>', {
            'class': 'ui-icon ui-icon-trash'
        });
        var container = $('<li>', {
            'class': 'container-test'
        });
        var containerList = $('<ul>', {
            'class': 'container-list'
        })
        var colNumber = $('.actions select').val();
        var column = $('#column-'+colNumber+'-container .column-list');
        drag.appendTo(widgetIcons);
        trash.appendTo(widgetIcons);
        widgetIcons.appendTo(widget);
        widget.appendTo(containerList);
        bindWidget(widget);
        containerList.appendTo(container);
        container.appendTo(column);
        widgetCount++;

        containerList.sortable({
            connectWith: '.column-list, .container-list',
            handle: '.ui-icon.ui-icon-arrow-4'
        });
    });

    $('.actions button#add-column').on('click', function(){
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
        option.appendTo($('.actions select'));
        $('.actions select').selectmenu('refresh');

        columnList.sortable({
            connectWith: '.column-list, .container-list',
            handle: '.ui-icon.ui-icon-arrow-4'
        });
 
        cols++;
    });

    function refreshContainers() {
        $('.container-test').each(function(){
            var $this = $(this);
            var list = $this.children('.container-list');
            if (list.children().length < 1) {
                $this.remove();
            } else if (list.children().length > 1 && $this.children('.container-icons').length < 1) {
                list.detach();
                var containerIcons = $('<div>', {
                    'class': 'container-icons'
                });
                var drag = $('<span>', {
                    'class': 'ui-icon ui-icon-arrow-4'
                });
                var trash = $('<span>', {
                    'class': 'ui-icon ui-icon-trash'
                }).on('click', function(e){
                    e.stopPropagation();
                    $(this).parent().parent().remove();
                });
                drag.appendTo(containerIcons);
                trash.appendTo(containerIcons);
                containerIcons.appendTo($this);
                list.appendTo($this);
            } else if (list.children().length == 1) {
                $this.children('.container-icons').remove();
            }

            if ($this.parent().hasClass('container-list')) {
                $this.children('.container-icons').remove();
                $this.children().children().unwrap().unwrap();
            }
        });
    }

    function refreshWidgets() {
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
    }

    $('body').on('sortstop', function(){
        refreshContainers();
        refreshWidgets();
    }).trigger('sortstop');

    dialog = $("#dialog-form").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Save": function() {
                var color = dialog.find("form input#color"),
                    fontSize = dialog.find("form input#font-size"),
                    title = dialog.find("form input#title"),
                    widget = $('.widget-test.selected');
                widget.css('background-color', color.val()).css('font-size', fontSize.val()).text(title.val());
                dialog.dialog("close");
            },
            Cancel: function() {
                dialog.dialog("close");
            }
        },
        close: function() {
            $('.widget-test').removeClass('selected');
        },
        show: {
            effect: "explode",
            duration: 400
        },
        hide: {
            effect: "explode",
            duration: 400
        }
    });

    $('button').button();
    $('select').selectmenu();

    $('#save').on('click', function(){
        var data = {},
            saveButton = $(this);
        $('.column-container').each(function(){
            var columnContainer = $(this),
                col = columnContainer.data('column');
            data[col] = [];
            var containerCounter = 0;
            columnContainer.find('.column-list .container-test').each(function(){
                var container = $(this);
                data[col][containerCounter] = [];
                var widgetCounter = 0;
                container.find('.container-list .widget-test').each(function(){
                    var widget = $(this);
                    data[col][containerCounter][widgetCounter] = {
                        'title': widget.text().trim(),
                        'color': rgb2hex(widget.css('background-color')),
                        'font_size': widget.css('font-size')
                    }
                    widgetCounter++;
                });
                containerCounter++;
            });
        });

        $.ajax({
            type: 'PATCH',
            url: saveButton.data('url'),
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            error: function() {
                alert('Error: couldn\'t save correctly!');
            }
        });
    });

    $('#discard').on('click', function(){
        location.reload();
    });

});