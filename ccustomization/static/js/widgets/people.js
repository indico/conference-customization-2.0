function PeopleWidget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
}

$.extend(PeopleWidget.prototype, {
    run: function run() {},

    runEdit: function runEdit() {
        var self = this;
        var dialog = self.widgetElem.find('.widget-dialog');
        var save = dialog.find('.we-save-button');
        var radio = dialog.find('.we-radio');
        var select = dialog.find('.we-select');
        var listOpt = radio.find('.we-list-opt');
        var carouselOpt = radio.find('.we-carousel-opt');
        var peopleType = select.find('.we-people-type');

        dialog.detach().appendTo('body');

        save.on('click', function(){
            self.settings.style = {
                type: radio.find('.active input').val()
            };
            self.settings.content = {
                type: peopleType.val()
            };
            self.settings.empty = false;
            updateWidget(self.widgetElem, self.settings);
        });

        dialog.on('hidden.bs.modal', function() {
            dialog.modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        });

        dialog.modal({
            show: false
        });

        self.widgetElem.on('click', function(){
            if (self.settings.style != undefined) {
                if (self.settings.style.type == 'list' || self.settings.style.type == undefined) {
                    listOpt.trigger('click');
                } else {
                    carouselOpt.trigger('click');
                }
            }
            if (self.settings.content != undefined) {
                var type = self.settings.content.type || 'speakers';
                select.find('li a').each(function(){
                    var $this = $(this);
                    if (type == $this.text()) {
                        $this.trigger('click');
                    }
                });
            }
            dialog.modal('show');
        });

        select.find('li a').on('click', function(e){
            e.preventDefault();
            var $this = $(this);
            var selText = $this.text();
            select.find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
            peopleType.val(selText.toLowerCase());
        });
    }
});
