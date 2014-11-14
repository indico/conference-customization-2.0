function TitleBlock(blockElem) {
    Block.call(this, blockElem);
}
TitleBlock.prototype = Object.create(Block.prototype);
TitleBlock.prototype.constructor = TitleBlock;

$.extend(TitleBlock.prototype, {
    initializeDialog: function initializeDialog() {
        var self = this;
        var inputFields = self.blockElem.find('.input-fields');
        var textFields = self.blockElem.find('.text-fields');

        inputFields.children('.title').on('input', function(){
            self.settings.title = inputFields.children('.title').val();
            textFields.children('.title').text(self.settings.title);
        });
        inputFields.children('.subtitle').on('input', function(){
            self.settings.subtitle = inputFields.children('.subtitle').val();
            textFields.children('.subtitle').text(self.settings.title);
        });
    }
});
