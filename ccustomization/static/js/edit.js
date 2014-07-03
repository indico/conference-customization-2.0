$(document).ready(function() {
    function enableDrag(elem, grid) {
        elem.draggable({
            grid: grid,
            containment: '.modification-grid',
            scroll: false
        }).resizable({
            grid: grid,
            containment: '.modification-grid'
        }).addClass('active').on('click', function(){
            var select = true;
            if (elem.hasClass('selected')) {
                select = false;
            }
            $('.widget-test').removeClass('selected');
            elem.toggleClass('selected', select);
        });
    }

    var widget = $('.widget-test');
    var width = $('.modification-grid .grid-row .grid-cell').width();
    var height = $('.modification-grid .grid-row .grid-cell').height();
    widget.width(width-8);
    widget.height(height-8);
    var grid = [width+1, height+1];
    enableDrag($('#widget-0-0'), grid);
    enableDrag($('#widget-1-2'), grid);
});