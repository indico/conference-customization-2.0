function Container(containerElem) {
    this.containerElem = containerElem;
    this.settings = containerElem.data('settings') || {};
    this.content = []
}

$.extend(Container.prototype, {
    initialize: function initialize() {
        var self = this;
        var edit = $('.page-content-container').data('edit').toLowerCase() === 'true';

        self.containerElem.data('object', self);

        if (edit) {
            self.bind();
        }

        var contentElem = self.containerElem.children('.content');
        self.content = [];
        contentElem.children().each(function(){
            var jqElement = $(this);
            var jsElement = null;
            if (jqElement.hasClass('widget-cnt')) {
                jsElement = containerFactory(jqElement);
            } else if (jqElement.hasClass('widget')) {
                jsElement = widgetFactory(jqElement);
            } else if (jqElement.hasClass('widget-block')) {
                jsElement = blockFactory(jqElement);
            }
            self.content.push(jsElement);
        });
    },

    updateContent: function updateContent() {
        var self = this;

        var contentElem = self.containerElem.children('.content');
        self.content = [];
        contentElem.children().each(function(){
            var jqElement = $(this);
            var jsElement = jqElement.data('object');
            self.content.push(jsElement);
        });

        var edit = $('.page-content-container').data('edit').toLowerCase() === 'true';
        if (self.containerElem.hasClass('main-cnt') && edit) {
            var blockSection = $('.elements-bar .block-section');
            var widgetSection = $('.elements-bar .widget-section');
            if (self.content.length) {
                widgetSection.removeClass('greyed-out-section');
                widgetSection.find('.element-stub').draggable('enable');
            } else {
                widgetSection.addClass('greyed-out-section');
                widgetSection.find('.element-stub').draggable('disable');
            }
        }
    },

    bind: function bind() {
        var self = this;

        self.bindIcons();

        if (!self.containerElem.hasClass('main-cnt')) {
            self.containerElem.draggable(draggableOpts);
        }
        self.containerElem.children('.droppables-container').children('.droppable-area').droppable(droppableOpts);
    },

    bindIcons: function bindIcons() {
        var self = this;
        var iconsContainer = self.containerElem.children('.icons-container');
        var gear = iconsContainer.children('.ui-icon.ui-icon-gear');
        gear.on('click', function(){
            var container = $(this).parent('.icons-container').parent('.widget-cnt');
            var dialog = $('#container-dialog');
            $('.widget-cnt').removeClass('customizing');
            container.addClass('customizing');
            dialog.modal('show');
        });
    },

    updateSettings: function updateSettings() {
        var self = this;
    },

    serialize: function serialize() {
        var self = this;
        var serializedContainer = {
            type: 'container',
            settings: self.settings,
            content: []
        };
        self.content.forEach(function(element){
            serializedContainer.content.push(element.serialize());
        });
        return serializedContainer;
    }
});

function containerFactory(containerElem) {
    var container = new Container(containerElem);
    container.initialize();
    return container;
}

$(document).ready(function() {
    "use strict";

    var containerDialog = $('#container-dialog');

    $('#container-dialog-close').on('click', function(){
        $('.widget-cnt').removeClass('customizing');
    });

    $('#container-dialog-save').on('click', function(){
        var container = $('.widget-cnt.customizing');
        container.data('object').updateSettings();
        $('.widget-cnt').removeClass('customizing');
    });

    containerDialog.detach().appendTo('body');
    containerDialog.modal({
        show: false
    });

    $('.element-stub').draggable(draggableStubOpts);

    var main = containerFactory($('.main-cnt'));
    main.updateContent();

});
