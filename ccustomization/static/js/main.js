var carouselDefaultOptions = {
    dots: true,
    autoplay: false,
    slidesToShow: 1,
    slidesToScroll: 1
};

var draggableOpts = {
    handle: '.ui-icon.ui-icon-arrow-4',
    revert: true,
    start: function(event, ui) {
        var element = ui.helper;
        element.children('.icons-container').children('.ui-icon.ui-icon-arrow-4').addClass('dragging');
        element.addClass('on-foreground');
        $('.droppable-area').show();  // shows every droppable-area
        element.find('.droppables-container').children('.droppable-area').hide();   // hides droppable-areas of dragged element and it's children
        if (element.hasClass('widget-block') || element.hasClass('block-stub')) {
            $('.widget, .widget-cnt:not(.main-cnt)').children('.droppables-container').children('.droppable-area').hide();
        } else if (element.hasClass('widget') || element.hasClass('widget-stub')) {
            $('.widget-block').children('.droppables-container').children('.droppable-area').hide();
        }
        $('.widget-cnt').each(function(){
            var container = $(this);
            if (container.children('.content').children().length) {
                container.children('.droppables-container').children('.droppable-area').hide();
            }
        });
        $('.widget, .widget-block').each(function(){ 
            var element = $(this);
            var parentContainer = element.parent('.content').parent('.widget-cnt');
            if (parentContainer.hasClass('vertical')) { // for every element, hides the droppable-areas opposite to the container's direction
                element.children('.droppables-container').children('.droppable-east, .droppable-west').hide()
            } else if (parentContainer.hasClass('horizontal')) {
                element.children('.droppables-container').children('.droppable-north, .droppable-south').hide()
            }
            if (element.next('.widget, .widget-block').length) {  // for every non-last element, hides its next droppable-area
                hideNextDroppable(element);
            }
        });
        if ((element.hasClass('widget') && element.prev('.widget').length) || (element.hasClass('widget-block') && element.prev('.widget-block').length)) {  // if this element is not the first, shows the next droppable-area of the previous element
            showNextDroppable(element.prev());
        }
    },
    stop: function(event, ui) {
        var element = ui.helper;
        $('.ui-icon.ui-icon-arrow-4').removeClass('dragging');
        $('.ui-draggable').removeClass('on-foreground');
        $('.droppable-area').addClass('alert-danger').hide();    // hides every droppable-area
    }
}

var draggableStubOptsTemp = {
    helper: 'clone',
    appendTo: 'body',
    handle: false
}
var draggableStubOpts = $.extend({}, draggableOpts, draggableStubOptsTemp);

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
        var droppableArea = $(this);
        var targetElem = droppableArea.parent('.droppables-container').parent('.widget-cnt, .widget, .widget-block');

        if (ui.draggable.hasClass('element-stub')) {
            var draggedElem = ui.helper;
            var type = draggedElem.data('type');
        } else {
            var draggedElem = ui.draggable;
            var draggableParent = draggedElem.parent('.content').parent('.widget-cnt');
        }

        if (droppableArea.hasClass('droppable-container')) {
            targetElem.children('.content').append(draggedElem);
            targetElem.data('object').updateContent();
        } else {
            var parentContainer = targetElem.parent('.content').parent('.widget-cnt');
            if (droppableArea.hasClass('droppable-north') || droppableArea.hasClass('droppable-west')) {
                targetElem.before(draggedElem);
            } else if (droppableArea.hasClass('droppable-south') || droppableArea.hasClass('droppable-east')) {
                targetElem.after(draggedElem);
            }
            targetElem.parent('.content').parent('.widget-cnt').data('object').updateContent();
        }

        if (ui.draggable.hasClass('element-stub')) {
            if (ui.draggable.hasClass('block-stub')) {
                addBlock(type, draggedElem);
            } else if (ui.draggable.hasClass('widget-stub')) {
                addWidget(type, draggedElem);
            }
        } else {
            draggableParent.data('object').updateContent();
        }
    }
}

function clickOnEnter(input, button, clear) {
    input.on('keypress', function(e){
        var keyCode = e.keyCode || e.which;
        if (keyCode == 13) {
            button.trigger('click');
            if (clear) {
                input.blur().val('').trigger('input').focus();
            }
        }
    });
}
