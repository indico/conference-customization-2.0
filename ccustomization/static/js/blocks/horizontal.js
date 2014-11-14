function HorizontalBlock(blockElem) {
    Block.call(this, blockElem);
}
HorizontalBlock.prototype = Object.create(Block.prototype);
HorizontalBlock.prototype.constructor = HorizontalBlock;

$.extend(HorizontalBlock.prototype, {
});
