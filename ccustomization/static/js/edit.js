$(document).ready(function() {
    var widget = $('#widget-test');
    widget.width(widget.width()+2);
    widget.height(widget.height()+1);
    widget.draggable({
        grid: [widget.width(), widget.height()],
        containment: '.modification-grid',
        scroll: false
    }).resizable({
        grid: [widget.width(), widget.height()]
    });
});