$(document).ready(function() {
    "use strict";

    var mainCnt = $('.main-cnt');
    var mainCntList = mainCnt.children('ul');

    function getContainerIcons() {
        var iconsContainer = $('<div>', {
            'class': 'container-icons'
        });
        var drag = $('<span>', {
            'class': 'ui-icon ui-icon-arrow-4'
        });
        var trash = $('<span>', {
            'class': 'ui-icon ui-icon-trash'
        });
        var copy = $('<span>', {
            'class': 'ui-icon ui-icon-copy'
        });
        drag.appendTo(iconsContainer);
        trash.appendTo(iconsContainer);
        copy.appendTo(iconsContainer);
        bindContainerIcons(iconsContainer);
        return iconsContainer;
    }
    function bindContainerIcons(iconsContainer) {
        var trash = iconsContainer.find('.ui-icon.ui-icon-trash');
        var copy = iconsContainer.find('.ui-icon.ui-icon-copy');
        trash.on('click', function(){
            var iconsContainer = $(this).parent('.container-icons');
            var container = iconsContainer.parent('li');
            container.remove();
            refreshElements();
        });
        copy.on('click', function(){
            var iconsContainer = $(this).parent('.container-icons');
            var container = iconsContainer.parent('li');
            var newContainer = container.clone(true);
            container.after(newContainer);
            newContainer.find('.widget').each(function(){
                reloadWidget($(this));
            });
            refreshElements();
        });
    }

    // The refresh functions are used to refresh the widgets/containers aspect (icons, not content) after each sortstop
    function refreshElements() {
        refreshContainers();
        refreshWidgets();
        $('.lvl-1-cnt, .lvl-2-cnt').toggleClass('hidden-cnt', mainCnt.hasClass('hidden-cnt'));
        $('body').trigger('refreshFinished');
    }
    function refreshContainers() {
        $('.lvl-1-cnt, .lvl-2-cnt').each(function(){
            var container = $(this);
            if (!container.find('.widget').length) {
                container.remove();
            } else if ((container.hasClass('.lvl-1-cnt') && container.parents('.lvl-1-cnt').length) || (container.hasClass('.lvl-2-cnt') && container.parents('.lvl-2-cnt').length)) {
                container.children('.container-icons').remove();
                container.children('ul').children('li').unwrap().unwrap();
            }
        });
    }
    function refreshWidgets() {
        wrapWidgets();
        moveWidgets();
    }
    function wrapWidgets() {
        $('.widget').each(function(){
            var widget = $(this);
            wrapWidget(widget);
        });
    }
    function wrapWidget(widget) {
        if (!widget.parents('.lvl-2-cnt').length) {
            var secondLvlCnt = $('<li>', {
                'class': 'lvl-2-cnt'
            });
            var secondLvlCntList = $('<ul>');
            var containerIcons = getContainerIcons();
            widget.wrap(secondLvlCntList);
            secondLvlCntList = widget.parent();
            secondLvlCntList.wrap(secondLvlCnt);
            secondLvlCntList.before(containerIcons);
            secondLvlCntList.sortable(secondLvlSortableOpts);
        }
        if (!widget.parents('.lvl-1-cnt').length) {
            var firstLvlCnt = $('<li>', {
                'class': 'lvl-1-cnt'
            });
            var firstLvlCntList = $('<ul>');
            var secondLvlCnt = widget.parents('.lvl-2-cnt');
            var containerIcons = getContainerIcons();
            secondLvlCnt.wrap(firstLvlCntList);
            firstLvlCntList = secondLvlCnt.parent();
            firstLvlCntList.wrap(firstLvlCnt);
            firstLvlCntList.before(containerIcons);
            firstLvlCntList.sortable(firstLvlSortableOpts);
        }
    }
    function moveWidgets() {
        $('.lvl-2-cnt:only-child').each(function(){
            var secondLvlCnt = $(this);
            var widgets = secondLvlCnt.find('.widget:not(:last-child)');
            widgets.each(function(){
                var widget = $(this);
                var firstLvlCnt = widget.parents('.lvl-1-cnt');
                widget.detach();
                firstLvlCnt.before(widget);
                wrapWidget(widget);
            });
        });
    }

    function getSerializedLayout() {
        var content = [];
        var firstLvlCntCount = 0;
        mainCnt.find('li.lvl-1-cnt').each(function(){
            var firstLvlCnt = $(this);
            content[firstLvlCntCount] = [];
            var secondLvlCntCount = 0;
            firstLvlCnt.find('li.lvl-2-cnt').each(function(){
                var secondLvlCnt = $(this);
                content[firstLvlCntCount][secondLvlCntCount] = [];
                var widgetCount = 0;
                secondLvlCnt.find('li.widget').each(function(){
                    var widget = $(this);
                    content[firstLvlCntCount][secondLvlCntCount][widgetCount] = widget.data('settings');
                    widgetCount++;
                });
                secondLvlCntCount++;
            });
            firstLvlCntCount++;
        });
        return JSON.stringify(content);
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
        var secondLvlCnt = $('<li>', {
            'class': 'lvl-2-cnt'
        });
        var secondLvlCntList = $('<ul>');
        var containerIcons = getContainerIcons();
        containerIcons.appendTo(secondLvlCnt);
        secondLvlCntList.appendTo(secondLvlCnt);
        var firstLvlCnt = $('<li>', {
            'class': 'lvl-1-cnt'
        });
        var firstLvlCntList = $('<ul>');
        containerIcons = getContainerIcons();
        containerIcons.appendTo(firstLvlCnt);
        firstLvlCntList.appendTo(firstLvlCnt);
        secondLvlCnt.appendTo(firstLvlCntList);
        renderWidget(settings).done(function(newWidget){
            newWidget.appendTo(secondLvlCntList);
            firstLvlCnt.appendTo(mainCntList);
            $('body').trigger('inizialize-widgets');
        });
    });

    $('#show-layout').on('click', function(){
        $('.main-cnt, .lvl-1-cnt, .lvl-2-cnt').toggleClass('hidden-cnt');
    });

    $('body').on('sortstop', function(){
        refreshElements();
    }).trigger('sortstop');

    $('#save').on('click', function(){
        saveLayout();
    });
    $('#discard').on('click', function(){
        location.reload();
    });

    $('.main-cnt>ul').sortable(mainSortableOpts);
    $('.lvl-1-cnt>ul').sortable(firstLvlSortableOpts);
    $('.lvl-2-cnt>ul').sortable(secondLvlSortableOpts);

    $('#widget-select li a').each(function(){
        bindSelectMenus($(this));
    });

    $('.container-icons').each(function(){
        bindContainerIcons($(this));
    });

});
