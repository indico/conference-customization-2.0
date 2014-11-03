var draggableOpts = {
    handle: '.ui-icon.ui-icon-arrow-4',
    revert: true,
    start: function(event, ui) {
        var element = ui.helper;
        element.children('.icons-container').children('.ui-icon.ui-icon-arrow-4').addClass('dragging');
        element.addClass('on-foreground');
        $('.droppable-area').show();  // shows every droppable-area
        element.find('.droppables-container').children('.droppable-area').hide();   // hides droppable-areas of dragged element and it's children
        $('.widget-cnt:not(.main-cnt), .widget').each(function(){ 
            var element = $(this);
            var parentContainer = element.parent('.content').parent('.widget-cnt');
            if (parentContainer.hasClass('vertical')) { // for every element, hides the droppable-areas opposite to the container's direction
                element.children('.droppables-container').children('.droppable-east, .droppable-west').hide()
            } else if (parentContainer.hasClass('horizontal')) {
                element.children('.droppables-container').children('.droppable-north, .droppable-south').hide()
            }
            if (element.next('.widget-cnt, .widget').length) {  // for every non-last element, hides its next droppable-area
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
        if (droppableElem.hasClass('droppable-north') || droppableElem.hasClass('droppable-west')) {
            targetElem.before(draggableElem);
        } else if (droppableElem.hasClass('droppable-south') || droppableElem.hasClass('droppable-east')) {
            targetElem.after(draggableElem);
        }
        draggableElem.parent('.content').parent('.widget-cnt').data('object').updateContent();
        targetElem.parent('.content').parent('.widget-cnt').data('object').updateContent();
    }
}

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

function getSerializedLayout() {
    var mainCnt = $('.main-cnt');
    var serializedMainCnt = [mainCnt.data('object').serialize()];
    console.log(JSON.stringify(serializedMainCnt));
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
        widgetFactory(newWidget);
        $('.main-cnt').data('object').updateContent();
    });
}

$(document).ready(function() {
    "use strict";

    var mainCnt = $('.main-cnt'); 

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

});
