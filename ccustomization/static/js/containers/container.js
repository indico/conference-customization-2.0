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
            var containerTitle = $('#container-title');
            var containerBorder = $('#container-border');
            var backgroundPreview = dialog.find('.we-background-preview');
            var backgroundPath = dialog.find('.we-background-path');
            var backgroundURL = dialog.find('.we-background-url');
            $('.widget-cnt').removeClass('customizing');
            container.addClass('customizing');
            updateBackgroundPreview(self.settings.background);
            backgroundURL.val(self.settings.background || '');
            containerTitle.val(self.settings.title || '');
            containerBorder.prop('checked', self.settings.border || false);
            dialog.modal('show');
        });
    },

    updateSettings: function updateSettings(title, border, background) {
        var self = this;
        self.settings.title = title;
        self.settings.border = border;
        self.settings.background = background;
        if (title == '') {
            self.containerElem.children('.title').addClass('hidden');
        } else {
            self.containerElem.children('.title').removeClass('hidden').text(title);
        }
        self.containerElem.toggleClass('bordered', border);
        if (background == '') {
            self.containerElem.css('background-image', 'none');
        } else {
            self.containerElem.css('background-image', 'url(' + background + ')');
        }
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

function updateBackgroundPreview(path) {
    var containerDialog = $('#container-dialog');
    var backgroundPath = containerDialog.find('.we-background-path');
    var backgroundPreview = containerDialog.find('.we-background-preview');
    var background = containerDialog.find('.we-background');
    var backgroundUpload = containerDialog.find('.we-background-file');
    var backgroundURL = containerDialog.find('.we-background-url');
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

$(document).ready(function() {
    "use strict";

    var containerDialog = $('#container-dialog');
    var fileForm = $('#background-form');
    var backgroundUpload = containerDialog.find('.we-background-file');
    var backgroundURL = containerDialog.find('.we-background-url');
    var picURL = null;

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

    $('#container-dialog-close').on('click', function(){
        $('.widget-cnt').removeClass('customizing');
    });

    $('#container-dialog-save').on('click', function(){
        var container = $('.widget-cnt.customizing');
        var containerTitle = $('#container-title').val();
        var containerBorder = $('#container-border').prop('checked');
        var backgroundPath = $('.we-background-path').val();
        container.data('object').updateSettings(containerTitle, containerBorder, backgroundPath);
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
