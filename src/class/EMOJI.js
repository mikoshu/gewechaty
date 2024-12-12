export class Emoji {
    constructor(obj) {
        // 对 emojiMd5 进行空值判断
        if (!obj.emojiMd5) {
            throw new Error('emojiMd5 字段不能为空');
        }
        // 对 emojiSize 进行空值判断
        if (!obj.emojiSize) {
            throw new Error('emojiSize 字段不能为空');
        }
        this.emojiMd5 = obj.emojiMd5;
        this.emojiSize = obj.emojiSize;
    }

}