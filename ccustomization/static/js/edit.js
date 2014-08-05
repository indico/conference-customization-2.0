$(document).ready(function() {
    "use strict";

    var cols = $('.main-list').children().length,
        boxDialog = $("#box-style-dialog").dialog({
            autoOpen: false,
            height: 500,
            width: 500,
            modal: true,
            buttons: {
                "Save": function() {
                    var widget = $('.widget-test.selected');
                    var title = $('#box-title').val();
                    var color = $('#box-color').val();
                    var border = $('#box-border').is(':checked');
                    var content = $('#box-content').val();
                    var settings = widget.data('settings');
                    settings['style'] = {}
                    settings['style']['title'] = title;
                    settings['style']['color'] = color;
                    settings['style']['border'] = border;
                    settings['content'] = content;
                    settings['empty'] = content == '';
                    widget.data('settings', settings);
                    renderWidget(widget);
                    boxDialog.dialog("close");
                },
                Cancel: function() {
                    boxDialog.dialog("close");
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
        }),
        locationDialog = $("#location-style-dialog").dialog({
            autoOpen: false,
            height: 500,
            width: 500,
            modal: true,
            buttons: {
                "Save": function() {
                    var widget = $('.widget-test.selected');
                    var isAddress = $('#location-address-opt').is(':checked');
                    var address = $('#location-address').val();
                    var latitude = $('#location-latitude').val();
                    var longitude = $('#location-longitude').val();
                    var settings = widget.data('settings');
                    settings['content'] = {}
                    settings['content']['address'] = '';
                    settings['content']['latitude'] = '';
                    settings['content']['longitude'] = '';
                    if (isAddress) {
                        settings['content']['type'] = 'address';
                        settings['content']['address'] = address;
                        settings['empty'] = address == '';
                    } else {
                        settings['content']['type'] = 'coordinates';
                        settings['content']['latitude'] = latitude;
                        settings['content']['longitude'] = longitude;
                        settings['empty'] = latitude == '' || longitude == '';
                    }
                    widget.data('settings', settings);
                    renderWidget(widget);
                    locationDialog.dialog("close");
                },
                Cancel: function() {
                    locationDialog.dialog("close");
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
        }),
        layoutDialog,
        hexDigits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];

    //$('.main-list').sortable();
    $('.column-list, .container-list').sortable({
        connectWith: '.column-list, .container-list',
        handle: '.ui-icon.ui-icon-arrow-4',
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true
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

    function openStyleDialog(widget) {
        var settings = widget.data('settings');
        if (settings.type == 'Box') {
            var title = $('#box-title');
            var color = $('#box-color');
            var border = $('#box-border');
            var content = $('#box-content');
            if (settings['style'] != undefined) {
                title.val(settings['style']['title'] || '');
                color.val(settings['style']['color'] || '');
                border.prop('checked', settings['style']['border'] || false).button('refresh');
                content.val(settings['content'] || '');
            } else {
                title.val('');
                color.val('');
                border.prop('checked', false).button('refresh');
                content.val('');
            }
            boxDialog.dialog("open");
        } else if (settings.type == 'Location') {
            var addressOpt = $('#location-address-opt');
            var coordinatesOpt = $('#location-coordinates-opt');
            var latitude = $('#location-latitude');
            var longitude = $('#location-longitude');
            var address = $('#location-address');
            var addressDiv = $('#location-address-div');
            var coordinatesDiv = $('#location-coordinates-div');
            if (settings['content'] != undefined) {
                if (settings['content']['type'] == 'address' || settings['content']['type'] == undefined) {
                    addressOpt.trigger('click');
                } else {
                    coordinatesOpt.trigger('click');
                }
            }
            if (addressOpt.is(':checked')) {
                latitude.val('');
                longitude.val('');
                if (settings['content'] != undefined) {
                    address.val(settings['content']['address'] || '');
                } else {
                    address.val('');
                }
                addressDiv.show();
                coordinatesDiv.hide();
            } else {
                address.val('');
                if (settings['content'] != undefined) {
                    latitude.val(settings['content']['latitude'] || '');
                    longitude.val(settings['content']['longitude'] || '');
                } else {
                    latitude.val('');
                    longitude.val('');
                }
                coordinatesDiv.show();
                addressDiv.hide();
            }
            locationDialog.dialog("open");
        }
    }

    function bindWidget(widget) {
        widget.on('click', function(){
            $('.widget-test').removeClass('selected');
            widget.addClass('selected');
            openStyleDialog(widget);
        }).on('mouseover', function(){
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
            if (!widget.siblings('.widget-test').length) {
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

    $('#add-widget').on('click', function(){
        var widget = $('<li>', {
            'class': 'widget-test',
            'data-settings': JSON.stringify({
                type: $('#widget-select').val(),
                empty: true
            })
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
            content = $('<div>', {
                'class': 'widget-content'
            }),
            colNumber = $('#col-select').val(),
            column = $('#column-'+colNumber+'-container .column-list');
        drag.appendTo(widgetIcons);
        trash.appendTo(widgetIcons);
        copy.appendTo(widgetIcons);
        widgetIcons.appendTo(widget);
        content.appendTo(widget);
        widget.appendTo(containerList);
        bindWidget(widget);
        containerList.appendTo(container);
        container.appendTo(column);

        containerList.sortable({
            connectWith: '.column-list, .container-list',
            handle: '.ui-icon.ui-icon-arrow-4',
            placeholder: "ui-state-highlight",
            forcePlaceholderSize: true
        });
        renderWidget(widget);
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
                    var container = $(this).parent().parent();
                    container.remove();
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
                    handle: '.ui-icon.ui-icon-arrow-4',
                    placeholder: "ui-state-highlight",
                    forcePlaceholderSize: true
                });
            }
        });
    }
    $('body').on('sortstop', function(){
        refreshContainers();
        refreshWidgets();
    }).trigger('sortstop');

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
                    data[col][containerCounter][widgetCounter] = widget.data('settings');
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

    layoutDialog = $("#layout-dialog").dialog({
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
            var columnNumber = $('#col-radio input:checked').data('col');
            for (var i=0; i<columnNumber; i++) {
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
                    handle: '.ui-icon.ui-icon-arrow-4',
                    placeholder: "ui-state-highlight",
                    forcePlaceholderSize: true
                });
         
                cols++;
            }
            saveLayout();
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
    $('#col-radio').buttonset();
    $('#menu-checkboxes').buttonset();
    $('#title-checkbox').button();
    if ($('.main-list').children().length < 1)  {
        layoutDialog.dialog('open');
    }

    $("#box-border").button();
    $('#location-radio').buttonset();
    $('#location-address-opt, #location-coordinates-opt').on('click', function(){
        if ($('#location-address-opt').is(':checked')) {
            $('#location-address-div').show();
            $('#location-coordinates-div').hide();
        } else {
            $('#location-coordinates-div').show();
            $('#location-address-div').hide();
        }
    });

    function renderWidget(widget) {
        $.ajax({
            type: 'POST',
            url: $('.main-container').data('render-url'),
            contentType: 'application/json',
            dataType: 'html',
            data: JSON.stringify({
                settings: widget.data('settings'),
                edit: true
            }),
            success: function(response) {
                var newWidget = $(response);
                widget.replaceWith(newWidget);
                bindWidget(newWidget);
            }
        });
    }

});
