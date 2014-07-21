$(document).ready(function() {
    "use strict";

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
            $('.widget-test').removeClass('selected');
            widget.addClass('selected');
            var color = dialog.find("form input#color"),
                fontSize = dialog.find("form input#font-size"),
                title = dialog.find("form input#title");
            color.val(rgb2hex(widget.css('background-color')));
            fontSize.val(widget.css('font-size'));
            title.val(widget.text().trim());
            dialog.dialog("open");
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
        widget.find('.ui-icon.ui-icon-copy').on('click', function(e){
            e.stopPropagation();
            var newWidget = widget.clone();
            widget.parent().parent().after(newWidget);
            bindWidget(newWidget);
            $('body').trigger('sortstop');
        });
    }

    $('.actions button#add-widget').on('click', function(){
        var widget = $('<li>', {
            'class': 'widget-test'
        }),
            title = $('<span>', {
            text: 'Widget '+widgetCount
        }),
            widgetIcons = $('<div>', {
            'class': 'widget-icons'
        }),
            drag = $('<span>', {
            'class': 'ui-icon ui-icon-arrow-4'
        }),
            trash = $('<span>', {
            'class': 'ui-icon ui-icon-trash'
        }),
            copy = $('<span>', {
            'class': 'ui-icon ui-icon-copy'
        }),
            container = $('<li>', {
            'class': 'container-test'
        }),
            containerList = $('<ul>', {
            'class': 'container-list'
        }),
            colNumber = $('.actions select').val(),
            column = $('#column-'+colNumber+'-container .column-list');
        drag.appendTo(widgetIcons);
        trash.appendTo(widgetIcons);
        copy.appendTo(widgetIcons);
        title.appendTo(widget);
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
            'class': 'column-container',
            'data-column': cols
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
                var copy = $('<span>', {
                    'class': 'ui-icon ui-icon-copy'
                }).on('click', function(e){
                    e.stopPropagation();
                    var newContainer = $(this).parent().parent().clone();
                    $this.after(newContainer);
                    newContainer.find('.widget-test').each(function(){
                        bindWidget($(this));
                    });
                    newContainer.children('.container-icons').remove();
                    refreshContainers();
                });
                drag.appendTo(containerIcons);
                trash.appendTo(containerIcons);
                copy.appendTo(containerIcons);
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

    dialog = $("#style-dialog").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Save": function() {
                var color = dialog.find("form input#color").val(),
                    fontSize = dialog.find("form input#font-size").val(),
                    title = dialog.find("form input#title").val(),
                    widget = $('.widget-test.selected'),
                    titleSpan = $('<span>', {
                        text: title
                    });
                widget.css('background-color', color)
                      .css('font-size', fontSize)
                      .children('span').remove();
                widget.append(titleSpan);
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

    function getSerializedLayout() {
        var data = {};
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

        return JSON.stringify(data);
    }

    function saveLayout() {
        $.ajax({
            type: 'PATCH',
            url: $('#save').data('url'),
            contentType: 'application/json',
            dataType: 'json',
            data: getSerializedLayout(),
            error: function() {
                alert('Error: couldn\'t save correctly!');
            }
        });
    }

    $('#save').on('click', function(){
        saveLayout();
    });

    $('#discard').on('click', function(){
        location.reload();
    });

    var layoutDialog = $("#layout-dialog").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Continue": function() {
                layoutDialog.dialog("close");
            }
        },
        close: function() {
            var columnNumber = $('#col_radio input:checked').data('col');

            for (var i=0; i<columnNumber; i++) {
                $('.actions button#add-column').trigger('click');
            }
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
    $('#col_radio').buttonset();
    $('#menu_checkboxes').buttonset();
    $('#title_checkbox').button();

    if ($('.main-list').children().length < 1)  {
        layoutDialog.dialog('open');
    }

});