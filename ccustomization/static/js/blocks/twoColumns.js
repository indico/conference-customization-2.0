function TwoColumnsBlock(blockElem) {
    Block.call(this, blockElem);
}
TwoColumnsBlock.prototype = Object.create(Block.prototype);
TwoColumnsBlock.prototype.constructor = TwoColumnsBlock;

$.extend(TwoColumnsBlock.prototype, {
});
