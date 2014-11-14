function Block(blockElem) {
    this.blockElem = blockElem;
    this.settings = blockElem.data('settings') || {};
    this.dialog = blockElem.find('.block-dialog');
    this.containers = []
    this.picURL = null
}

$.extend(Block.prototype, {
    initialize: function initialize() {
        var self = this;
        var edit = $('.page-content-container').data('edit').toLowerCase() === 'true';

        self.blockElem.data('object', self);

        if (edit) {
            self.bind();
        }

        var contentElem = self.blockElem.children('.content');
        self.containers = [];
        contentElem.children('.widget-cnt').each(function(){
            var jqElement = $(this);
            var jsElement = containerFactory(jqElement);
            self.containers.push(jsElement);
        });
    },

    bind: function bind() {
        var self = this;

        self.bindIcons();
        self.bindDialog();

        self.blockElem.draggable(draggableOpts);
        self.blockElem.children('.droppables-container').children('.droppable-area').droppable(droppableOpts);
    },

    bindDialog: function bindDialog() {
        var self = this;
        var save = self.dialog.find('.we-save-button');
        var form = self.dialog.find('form');
        var backgroundUpload = self.dialog.find('.we-background-file');
        var backgroundURL = self.dialog.find('.we-background-url');

        self.dialog.detach().appendTo('body');
        self.dialog.modal({
            show: false
        });

        form.submit(function() {
            form.ajaxSubmit({
                async: false,
                success: function(response) {
                    self.picURL = response;
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('File loading failed: ' + errorThrown);
                    backgroundUpload.val('');
                    self.picURL = null;
                }
            });
            return false;
        });
        self.dialog.find('.we-load-background-button').on('click', function(){
            $('<img>', {
                src: backgroundURL.val(),
                error: function() {
                    alert('The specified URL is invalid!');
                    backgroundURL.val('');
                },
                load: function() {
                    self.updateBackgroundPreview(backgroundURL.val());
                    backgroundUpload.val('');
                }
            });
        });
        backgroundUpload.on('change', function(){
            var ok = backgroundUpload[0].files[0].type.match('^image/.*');
            if (ok) {
                form.submit();
                if (self.picURL != null) {
                    self.updateBackgroundPreview(self.picURL);
                    backgroundURL.val('');
                }
            } else {
                alert('The specified file is invalid!');
                backgroundUpload.val('');
            }
        });
        self.dialog.find('.we-remove-background-button').on('click', function(){
            self.updateBackgroundPreview('');
        });
        self.updateBackgroundPreview(self.settings.background);
        backgroundURL.val(self.settings.background || '');

        self.initializeDialog();
        save.on('click', function(){
            var backgroundPath = self.dialog.find('.we-background-path').val();
            self.settings.background = backgroundPath;
            self.saveSettings();
            self.update();
        });
    },

    bindIcons: function bindIcons() {
        var self = this;
        var iconsContainer = self.blockElem.children('.icons-container');
        var trash = iconsContainer.children('.ui-icon.ui-icon-trash');
        var copy = iconsContainer.children('.ui-icon.ui-icon-copy');
        var gear = iconsContainer.children('.ui-icon.ui-icon-gear');

        trash.on('click', function(){
            var parent = self.blockElem.parent('.content').parent('.widget-cnt');
            self.blockElem.remove();
            parent.data('object').updateContent();
        });
        copy.on('click', function(){
            var parent = self.blockElem.parent('.content').parent('.widget-cnt');
            var settings = self.settings;
            self.render().done(function(newBlock){
                self.blockElem.after(newBlock);
                blockFactory(newBlock);
                parent.data('object').updateContent();
            });
        });
        gear.on('click', function(){
            self.dialog.modal('show');
        });
    },

    serialize: function serialize() {
        var self = this;
        var serializedBlock = {
            type: 'block',
            settings: self.settings,
            containers: self.serializeContainers()
        };
        return serializedBlock;
    },

    serializeContainers: function serializeContainers() {
        var self = this;
        var containers = [];
        self.containers.forEach(function(element){
            containers.push(element.serialize());
        });
        return containers
    },

    update: function update() {
        var self = this;
        self.render().done(function(newBlock){
            self.blockElem.replaceWith(newBlock);
            blockFactory(newBlock);
        });
    },

    reload: function reload() {
        var self = this;
        self.update();
    },

    render: function render() {
        var self = this;
        return renderBlock(self.settings, self.serializeContainers());
    },

    run: function run() {},

    initializeDialog: function initializeDialog() {},

    saveSettings: function saveSettings() {},

    updateBackgroundPreview: function updateBackgroundPreview(path) {
        var self = this;
        var backgroundPath = self.dialog.find('.we-background-path');
        var backgroundPreview = self.dialog.find('.we-background-preview');
        var background = self.dialog.find('.we-background');
        var backgroundUpload = self.dialog.find('.we-background-file');
        var backgroundURL = self.dialog.find('.we-background-url');
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
});

function blockFactory(blockElem) {
    var settings = blockElem.data('settings');
    var type = settings.type;
    type = type.charAt(0).toUpperCase() + type.slice(1);
    var block = new window[type+'Block'](blockElem);
    block.initialize();
    return block;
}

function renderBlock(settings, containers) {
    var newBlock = $.Deferred();
    $.ajax({
        type: 'POST',
        url: $('.page-content-container').data('render-url'),
        contentType: 'application/json',
        dataType: 'html',
        data: JSON.stringify({
            type: 'block',
            settings: settings,
            containers: containers
        }),
        success: function(response) {
            newBlock.resolve($($.parseHTML(response)));
        }
    });
    return newBlock.promise();
}
