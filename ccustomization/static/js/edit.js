var draggableOpts = {
    handle: '.ui-icon.ui-icon-arrow-4',
    revert: true,
    start: function(event, ui) {
        var element = ui.helper;
        element.children('.icons-container').children('.ui-icon.ui-icon-arrow-4').addClass('dragging');
        element.addClass('on-foreground');
        $('.droppable-area').show();  // shows every droppable-area
        element.find('.droppables-container').children('.droppable-area').hide();   // hides droppable-areas of dragged element and it's children
        $('.widget-cnt, .widget').each(function(){  // for every non-last element, hides its next droppable-area
            var element = $(this);
            if (element.next('.widget-cnt, .widget').length) {
                hideNextDroppable(element);
            }
        });
        if (element.prev('.widget-cnt, .widget').length) {  // if this element is not the first, shows the next droppable-area of the previous element
            showNextDroppable(element.prev());
        }
    },
    stop: function(event, ui) {
        var element = ui.helper;
        $('.ui-icon.ui-icon-arrow-4').removeClass('dragging');
        $('.widget-cnt, .widget').removeClass('on-foreground');
        $('.droppable-area').hide();    // hides every droppable-area
    }
}

var droppableOpts = {
    tolerance: 'pointer',
    hoverClass: 'alert-success',
    over: function(event, ui) {
        $(this).removeClass('alert-danger');
    },
    out: function(event, ui) {
        $(this).addClass('alert-danger');
    },
    drop: function(event, ui) {
        var draggableElem = ui.draggable;
        var droppableElem = $(this);
        var targetElem = droppableElem.parent('.droppables-container').parent('.widget-cnt, .widget');
        var parentContainer = targetElem.parent('.content').parent('.widget-cnt');
        draggableElem.detach();
        if (parentContainer.hasClass('vertical') && (droppableElem.hasClass('droppable-west') || droppableElem.hasClass('droppable-east'))) {
            containerWrap(targetElem, 'horizontal');
        } else if (parentContainer.hasClass('horizontal') && (droppableElem.hasClass('droppable-north') || droppableElem.hasClass('droppable-south'))) {
            containerWrap(targetElem, 'vertical');
        }
        if (droppableElem.hasClass('droppable-north') || droppableElem.hasClass('droppable-west')) {
            targetElem.before(draggableElem);
        } else if (droppableElem.hasClass('droppable-south') || droppableElem.hasClass('droppable-east')) {
            targetElem.after(draggableElem);
        }
    }
}

var picURL = null;

function hideNextDroppable(element) {
    var container = element.parent('.content').parent('.widget-cnt');
    if (container.hasClass('vertical')) {
        element.children('.droppables-container').children('.droppable-south').hide();
    } else if (container.hasClass('horizontal')) {
        element.children('.droppables-container').children('.droppable-east').hide();
    }
}
function showNextDroppable(element) {
    var container = element.parent('.content').parent('.widget-cnt');
    if (container.hasClass('vertical')) {
        element.children('.droppables-container').children('.droppable-south').show();
    } else if (container.hasClass('horizontal')) {
        element.children('.droppables-container').children('.droppable-east').show();
    }
}

function getContainerIcons() {
    var iconsContainer = $('<div>', {
        'class': 'icons-container'
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
    var gear = $('<span>', {
        'class': 'ui-icon ui-icon-gear'
    });
    drag.appendTo(iconsContainer);
    trash.appendTo(iconsContainer);
    copy.appendTo(iconsContainer);
    gear.appendTo(iconsContainer);
    bindContainerIcons(iconsContainer);
    return iconsContainer;
}
function bindContainerIcons(iconsContainer) {
    var trash = iconsContainer.find('.ui-icon.ui-icon-trash');
    var copy = iconsContainer.find('.ui-icon.ui-icon-copy');
    var gear = iconsContainer.find('.ui-icon.ui-icon-gear');
    trash.on('click', function(){
        var container = $(this).parent('.icons-container').parent('.widget-cnt');
        container.remove();
    });
    copy.on('click', function(){
        var container = $(this).parent('.icons-container').parent('.widget-cnt');
        var newContainer = container.clone();
        var iconsContainer = newContainer.children('.icons-container');
        bindContainerIcons(iconsContainer); // not binding inner containers? ---> investigate <---
        container.after(newContainer);
        newContainer.find('.widget').each(function(){
            reloadWidget($(this));
        });
        newContainer.data('title', container.data('title'));
        newContainer.data('border', container.data('border'));
        newContainer.data('background', container.data('background'));
        newContainer.draggable(draggableOpts);
        newContainer.children('.droppables-container').children('.droppable-area').droppable(droppableOpts);
    });
    gear.on('click', function(){
        var container = $(this).parent('.icons-container').parent('.widget-cnt');
        var dialog = $('#container-dialog');
        var containerTitle = $('#container-title');
        var containerBorder = $('#container-border');
        var backgroundPreview = $('.we-background-preview');
        var backgroundPath = $('.we-background-path');
        var backgroundURL = $('.we-background-url');
        $('.widget-cnt').removeClass('customizing');
        container.addClass('customizing');
        updateBackgroundPreview(container.data('background'));
        backgroundURL.val(container.data('background') || '');
        containerTitle.val(container.data('title') || '');
        containerBorder.prop('checked', container.data('border') || false);
        dialog.modal('show');
    });
}
function getDroppables() {
    var droppablesContainer = $('<div>', {
        'class': 'droppables-container'
    });
    var north = $('<div>', {
        'class': 'droppable-area droppable-north alert alert-danger'
    });
    var east = $('<div>', {
        'class': 'droppable-area droppable-east alert alert-danger'
    });
    var south = $('<div>', {
        'class': 'droppable-area droppable-south alert alert-danger'
    });
    var west = $('<div>', {
        'class': 'droppable-area droppable-west alert alert-danger'
    });
    north.appendTo(droppablesContainer).droppable(droppableOpts);
    east.appendTo(droppablesContainer).droppable(droppableOpts);
    south.appendTo(droppablesContainer).droppable(droppableOpts);
    west.appendTo(droppablesContainer).droppable(droppableOpts);
    return droppablesContainer;
}
function containerWrap(element, orientation) {
    var container = $('<div>', {
        'class': 'widget-cnt ' + orientation
    });
    var containerContent = $('<div>', {
        'class': 'content'
    });
    element.wrap(containerContent);
    containerContent = element.parent('.content');
    containerContent.wrap(container);
    container = containerContent.parent('.widget-cnt');
    var containerIcons = getContainerIcons();
    containerContent.before(containerIcons);
    var droppablesContainer = getDroppables();
    containerContent.before(droppablesContainer);
    var title = $('<h3>', {
        'class': 'title hidden'
    });
    containerContent.before(title);
    container.draggable(draggableOpts);
}

function updateBackgroundPreview(path) {
    var backgroundPath = $('.we-background-path');
    var backgroundPreview = $('.we-background-preview');
    var background = $('.we-background');
    var backgroundUpload = $('.we-background-file');
    var backgroundURL = $('.we-background-url');
    backgroundPath.val(path || '');
    if (path) {
        backgroundPreview.show();
        background.css('background-image', 'url(' + path + ')');
    } else {
        backgroundPreview.hide();
        backgroundURL.val('');
        backgroundUpload.val('');
    }
}

function getSerializedContainer(container) {
    var serializedContainer = {
        type: 'container',
        orientation: container.hasClass('vertical') ? 'vertical' : 'horizontal',
        title: container.data('title'),
        border: container.data('border'),
        background: container.data('background'),
        content: []
    };
    serializeContent(container, serializedContainer);
    return serializedContainer;
}

function getSerializedWidget(widget) {
    var serializedWidget = {
        type: 'widget',
        settings: widget.data('settings')
    };
    return serializedWidget;
}

function serializeContent(container, serializedContainer) {
    var count = 0;
    container.children('.content').children('.widget-cnt, .widget').each(function(){
        var element = $(this);
        if (element.hasClass('widget-cnt')) {
            serializedContainer.content[count] = getSerializedContainer(element);
        } else if (element.hasClass('widget')) {
            serializedContainer.content[count] = getSerializedWidget(element);
        }
        count++;
    });
}

function getSerializedLayout() {
    var mainCnt = $('.main-cnt');
    var serializedMainCnt = [getSerializedContainer(mainCnt)];
    return JSON.stringify(serializedMainCnt);
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

function addWidget(type) {
    var settings = {
        type: type,
        empty: true
    };
    renderWidget(settings).done(function(newWidget){
        newWidget.appendTo($('.main-cnt > .content'));
        $('body').trigger('inizialize-widgets');
    });
}

$(document).ready(function() {
    "use strict";

    var mainCnt = $('.main-cnt'); 
    var fileForm = $('#background-form');
    var backgroundUpload = $('.we-background-file');
    var backgroundURL = $('.we-background-url');

    fileForm.submit(function() {
        fileForm.ajaxSubmit({
            async: false,
            success: function(response) {
                picURL = response;
            },
            error: function (xhr, textStatus, errorThrown) {
                alert('File loading failed: ' + errorThrown);
                backgroundUpload.val('');
                picURL = null;
            }
        });
        return false;
    });

    $('.we-load-background-button').on('click', function(){
        $('<img>', {
            src: backgroundURL.val(),
            error: function() {
                alert('The specified URL is invalid!');
                backgroundURL.val('');
            },
            load: function() {
                updateBackgroundPreview(backgroundURL.val());
                backgroundUpload.val('');
            }
        });
    });

    backgroundUpload.on('change', function(){
        var ok = backgroundUpload[0].files[0].type.match('^image/.*');
        if (ok) {
            fileForm.submit();
            if (picURL != null) {
                updateBackgroundPreview(picURL);
                backgroundURL.val('');
            }
        } else {
            alert('The specified file is invalid!');
            backgroundUpload.val('');
        }
    });

    $('.we-remove-background-button').on('click', function(){
        updateBackgroundPreview('');
    });

    $('#add-widget').on('click', function(){
        addWidget($('#widget-select input').val());
    });

    $('#show-layout').on('click', function(){
        $('.page-content-container').toggleClass('edit-mode');
        $('.container-label').toggleClass('hidden');
    });

    $('#save').on('click', function(){
        saveLayout();
    });
    $('#discard').on('click', function(){
        location.reload();
    });

    $('.widget-cnt:not(.main-cnt), .widget').draggable(draggableOpts);
    $('.droppable-area').droppable(droppableOpts);

    $('#widget-select li a').each(function(){
        bindSelectMenus($(this));
    });

    $('.widget-cnt > .icons-container').each(function(){
        bindContainerIcons($(this));
    });

    $('#container-dialog-close').on('click', function(){
        $('.widget-cnt').removeClass('customizing');
    });
    $('#container-dialog-save').on('click', function(){
        var container = $('.widget-cnt.customizing');
        var containerTitle = $('#container-title').val();
        var containerBorder = $('#container-border').prop('checked');
        var backgroundPath = $('.we-background-path').val();
        container.data('title', containerTitle);
        container.data('border', containerBorder);
        container.data('background', backgroundPath);
        if (containerTitle == '') {
            container.children('.title').addClass('hidden');
        } else {
            container.children('.title').removeClass('hidden').text(containerTitle);
        }
        container.toggleClass('bordered', containerBorder);
        if (backgroundPath == '') {
            container.css('background-image', 'none');
        } else {
            container.css('background-image', 'url(' + backgroundPath + ')');
        }
        $('.widget-cnt').removeClass('customizing');
    });

    var containerDialog = $('#container-dialog');
    containerDialog.detach().appendTo('body');
    containerDialog.modal({
        show: false
    });

    if (!$('.title-widget').length) {
        //addWidget('title');
    }

});
