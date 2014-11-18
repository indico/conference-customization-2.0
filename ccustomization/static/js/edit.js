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
    var serializedMainCnt = mainCnt.data('object').serialize();
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

function addWidget(type, positionElem) {
    var settings = {
        type: type,
        empty: true
    };
    renderWidget(settings).done(function(newWidget){
        parentElem = positionElem.parent('.content').parent('.widget-cnt');
        positionElem.replaceWith(newWidget);
        widgetFactory(newWidget);
        parentElem.data('object').updateContent();
    });
}

function addBlock(type, positionElem) {
    var settings = {
        type: type
    };
    if (type == 'title') {
        settings.background = '/static/img/meeting.jpg';
    }
    renderBlock(settings, []).done(function(newBlock){
        parentElem = positionElem.parent('.content').parent('.widget-cnt');
        positionElem.replaceWith(newBlock);
        blockFactory(newBlock);
        parentElem.data('object').updateContent();
    });
}

$(document).ready(function() {
    "use strict";

    var mainCnt = $('.main-cnt'); 

    $('#add-widget').on('click', function(){
        addWidget($('#widget-select input').val());
    });

    $('#add-block').on('click', function(){
        addBlock($('#block-select input').val());
    });

    $('#show-layout').on('click', function(){
        $('.page-content-container').toggleClass('edit-mode');
    });

    $('#save').on('click', function(){
        saveLayout();
    });
    $('#discard').on('click', function(){
        location.reload();
    });

});
