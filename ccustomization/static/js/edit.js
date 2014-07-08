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
        hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

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
            if (select) {
                var color = dialog.find("form input#color");
                color.val(rgb2hex(widget.css('background-color')));
                dialog.dialog("open");
            }
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
            } else if (list.children().length == 1) {
                $this.children('.ui-icon.ui-icon-arrow-4').remove();
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

    dialog = $( "#dialog-form" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Save": function() {
                var color = dialog.find("form input#color"),
                    widget = $('.widget-test.selected');
                widget.css('background-color', color.val());
                dialog.dialog("close");
            },
            Cancel: function() {
                dialog.dialog("close");
            }
        },
        close: function() {
            $('.widget-test').removeClass('selected');
        }
    });

});