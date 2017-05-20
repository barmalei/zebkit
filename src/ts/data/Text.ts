import TextModel from './TextModel';

/**
 * Multi-lines text model implementation
 * @class zebkit.data.Text
 * @param  {String}  [s] the specified text the model has to be filled
 * @constructor
 * @extends zebkit.data.TextModel
 */
class Text extends TextModel {
    $clazz = () {
        this.Line = function(s) {
            this.s = s;
        };

        //  toString for array.join method
        this.Line.prototype.toString = function() {
            return this.s;
        };
    }


    constructor(s) {
        super();
        this.textLength = 0;
        this.lines = [ new this.clazz.Line("") ];
        this._ = new this.clazz.Listeners();
        this.setValue(s == null ? "" : s);
    }

    /**
     * Detect line by offset starting from the given line and offset.
     * @param  {Integer} [start]       start line
     * @param  {Integer} [startOffset] start offset of the start line
     * @param  {Integer} o             offset to detect line
     * @private
     * @method calcLineByOffset
     * @return {Array}  an array that consists of two elements: detected line index and its offset
     */
    calcLineByOffset(start, startOffset, o) {
        if (arguments.length === 1) {
            startOffset = start = 0;
        }

        for(; start < this.lines.length; start++){
            var line = this.lines[start].s;
            if (o >= startOffset && o <= startOffset + line.length){
                return [start, startOffset];
            }
            startOffset += (line.length + 1);
        }
        return [];
    }

    calcLineOffset(line) {
        var off = 0;
        for(var i = 0; i < line; i++){
            off += (this.lines[i].s.length + 1);
        }
        return off;
    }

    $lineTags(i) {
        return this.lines[i];
    }

    getLine(line) {
        if (line < 0 || line >= this.lines.length) throw RangeError(line);
        return this.lines[line].s;
    }

    getValue() {
        return this.lines.join("\n");
    }

    getLines() {
        return this.lines.length;
    }

    getTextLength() {
        return this.textLength;
    }

    removeLines(start, size) {
        if (start < 0 || start >= this.lines.length) {
            throw new RangeError(start);
        }

        if (arguments.length === 1) {
            size = 1;
        } else {
            if (size <= 0) {
                throw new Error("Invalid number of lines : " + size);
            }
        }

        // normalize number required lines to be removed
        if ((start + size) > this.lines.length) {
            size = this.lines.length - start;
        }

        var end  = start + size - 1,            // last line to be removed
            off  = this.calcLineOffset(start),  // offset of the first line to be removed
            olen = start !== end ? this.calcLineOffset(end) + this.lines[end].s.length + 1 - off
                                  : this.lines[start].s.length + 1;


        // if this is the last line we have to correct offset to point to "\n" character in text
        if (start === this.lines.length - 1) {
            off--;
        }

        this.lines.splice(start, size);
        this._.textUpdated(this, false, off, olen, start, size);
    }

    insertLines(startLine) {
        if (startLine < 0 || startLine > this.lines.length) {
            throw new RangeError(startLine);
        }

        var off = this.calcLineOffset(startLine), offlen = 0;
        if (startLine === this.lines.length) {
            off--;
        }

        for(var i = 1; i < arguments.length; i++) {
            offlen += arguments[i].length + 1;
            this.lines.splice(startLine + i - 1, 0, new this.clazz.Line(arguments[i]));
        }
        this._.textUpdated(this, true, off, offlen, startLine, arguments.length - 1);
    }

    write(s, offset) {
        if (s.length > 0) {
            var slen    = s.length,
                info    = this.calcLineByOffset(0,0,offset),
                line    = this.lines[info[0]].s,
                j       = 0,
                lineOff = offset - info[1],
                tmp     = line.substring(0, lineOff) + s + line.substring(lineOff);

            for(; j < slen && s[j] !== '\n'; j++);

            if (j >= slen) {
                this.lines[info[0]].s = tmp;
                j = 1;
            } else {
                this.lines.splice(info[0], 1);
                j = this.parse(info[0], tmp, this.lines);
            }

            if (slen > 0) {
                this.textLength += slen;
                this._.textUpdated(this, true, offset, slen, info[0], j);
                return true;
            }
        }
        return false;
    }

    remove(offset, size) {
        if (size > 0) {
            var i1   = this.calcLineByOffset(0, 0, offset),
                i2   = this.calcLineByOffset(i1[0], i1[1], offset + size),
                l1   = this.lines[i1[0]].s,
                l2   = this.lines[i2[0]].s,
                off1 = offset - i1[1], off2 = offset + size - i2[1],
                buf  = l1.substring(0, off1) + l2.substring(off2);

            if (i2[0] === i1[0]) {
                this.lines.splice(i1[0], 1, new this.clazz.Line(buf));
            }
            else {
                this.lines.splice(i1[0], i2[0] - i1[0] + 1);
                this.lines.splice(i1[0], 0, new this.clazz.Line(buf));
            }

            if (size > 0) {
                this.textLength -= size;
                this._.textUpdated(this, false, offset, size, i1[0], i2[0] - i1[0] + 1);
                return true;
            }
        }
        return false;
    }

    parse(startLine, text, lines){
        var size = text.length, prevIndex = 0, prevStartLine = startLine;
        for(var index = 0; index <= size; prevIndex = index, startLine++){
            var fi = text.indexOf("\n", index);
            index = (fi < 0 ? size : fi);
            this.lines.splice(startLine, 0, new this.clazz.Line(text.substring(prevIndex, index)));
            index++;
        }
        return startLine - prevStartLine;
    }

    setValue(text){
        if (text == null) {
            throw new Error("Invalid null string");
        }

        var old = this.getValue();
        if (old !== text) {
            if (old.length > 0) {
                var numLines = this.getLines(), txtLen = this.getTextLength();
                this.lines.length = 0;
                this.lines = [ new this.clazz.Line("") ];
                this._.textUpdated(this, false, 0, txtLen, 0, numLines);
            }

            this.lines = [];
            this.parse(0, text, this.lines);
            this.textLength = text.length;
            this._.textUpdated(this, true, 0, this.textLength, 0, this.getLines());
            return true;
        }
        return false;
    }
)