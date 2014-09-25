$(document).ready(function() {
    "use strict";

    var cols = $('.main-list').children().length;
    var layoutDialog = $("#layout-dialog");

    // The refresh functions are used to refresh the widgets/containers aspect (icons, not content) after each sortstop
    function refreshContainers() {
        $('.container-cc').each(function(){
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
                    newContainer.children('.container-icons').remove();
                    newContainer.find('.widget-cc').each(function(){
                        reloadWidget($(this));
                    });
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
        $('.widget-cc').each(function(){
            var $this = $(this);
            if (!$this.parent().hasClass('container-list')) {
                var container = $('<li>', {
                    'class': 'container-cc'
                });
                var containerList = $('<ul>', {
                    'class': 'container-list'
                });
                $this.wrap(containerList);
                $this.parent().wrap(container);
                $this.parent().sortable(sortableOptions);
            }
        });
    }

    function getSerializedLayout() {
        var data = {};
        $('.column-container').each(function(){
            var columnContainer = $(this),
                col = columnContainer.data('column');
            data[col] = [];
            var containerCounter = 0;
            columnContainer.find('.column-list .container-cc').each(function(){
                var container = $(this);
                data[col][containerCounter] = [];
                var widgetCounter = 0;
                container.find('.container-list .widget-cc').each(function(){
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

    function bindSelectMenus(element) {
        element.on('click', function(e){
            e.preventDefault();
            var elemText = element.text();
            var dropup = element.parents('.dropup');
            dropup.find('.dropdown-toggle').html(elemText+' <span class="caret"></span>');
            dropup.find('input').val(elemText.toLowerCase());
        });
    }

    $('#add-widget').on('click', function(){
        var settings = {
            type: $('#widget-select input').val(),
            empty: true
        };
        var container = $('<li>', {
            'class': 'container-cc'
        });
        var containerList = $('<ul>', {
            'class': 'container-list'
        });
        var colNumber = $('#col-select input').val();
        var column = $('#column-'+colNumber+'-container .column-list');
        renderWidget(settings).done(function(newWidget){
            newWidget.appendTo(containerList);
            containerList.appendTo(container);
            container.appendTo(column);
            $('body').trigger('inizialize-widgets');
        });
    });

    $('body').on('sortstop', function(){
        refreshContainers();
        refreshWidgets();
    }).trigger('sortstop');

    $('#save').on('click', function(){
        saveLayout();
    });
    $('#discard').on('click', function(){
        location.reload();
    });

    $('.column-list, .container-list').sortable(sortableOptions);

    $('#widget-select li a, #col-select li a').each(function(){
        bindSelectMenus($(this));
    });

    layoutDialog.detach().appendTo('body');

    layoutDialog.on('hidden.bs.modal', function() {
        var columnNumber = $('#col-radio label.active input').val();
        var titleSelected = $('.title-checkbox').prop('checked');
        for (var i=0; i<columnNumber; i++) {
            var columnContainer = $('<li>', {
                id: 'column-'+cols+'-container',
                'class': 'column-container',
                'data-column': cols
            });
            var columnList = $('<ul>', {
                'class': 'column-list'
            });
            var columnLink = $('<a>', {
                href: '#',
                text: cols
            });
            var columnOption = $('<li>');

            columnList.appendTo(columnContainer);
            columnContainer.appendTo($('.main-list'));
            columnLink.appendTo(columnOption);
            columnOption.appendTo($('#col-select ul'));
            bindSelectMenus(columnLink);

            columnList.sortable(sortableOptions);
     
            cols++;
        }
        saveLayout();

        layoutDialog.modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    });

    layoutDialog.modal({
        show: false
    });

    if ($('.main-list').children().length < 1)  {
        layoutDialog.modal('show');
    }

});
