var sortableOptions = {
    connectWith: '.column-list, .container-list',
    handle: '.ui-icon.ui-icon-arrow-4',
    placeholder: 'sortable-placeholder',
    forcePlaceholderSize: true
};

var carouselDefaultOptions = {
    dots: true,
    autoplay: false,
    slidesToShow: 1,
    slidesToScroll: 1
};

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
