(function(pkg, Class, Interface) {

pkg.TextModel = Interface();
var MB = zebra.util, Listeners = MB.Listeners, MListeners = MB.MListeners;

function Line(s) {
    this.s = s;
    this.l = 0;
}

//  toString for array.join method
Line.prototype.toString = function() { return this.s; };

pkg.Text = Class(pkg.TextModel, [
    function $prototype() {
        this.textLength = 0;

        this.getLnInfo = function(lines, start, startOffset, o){
            for(; start < lines.length; start++){
                var line = lines[start].s;
                if(o >= startOffset && o <= startOffset + line.length) return [start, startOffset];
                startOffset += (line.length + 1);
            }
            return [];
        };

        this.setExtraChar = function(i,ch){ this.lines[i].l = ch; };
        this.getExtraChar = function (i) { return this.lines[i].l; };
        this.getLine = function(line) { return this.lines[line].s; };
        this.getText = function(){ return this.lines.join("\n"); };
        this.getLines = function () { return this.lines.length; };
        this.getTextLength = function(){ return this.textLength; };

        this.write = function (s, offset){
            var slen = s.length, info = this.getLnInfo(this.lines, 0, 0, offset), line = this.lines[info[0]].s, j = 0,
                lineOff = offset - info[1], tmp = [line.substring(0, lineOff), s, line.substring(lineOff)].join('');

            for(; j < slen && s[j] != '\n'; j++);

            if(j >= slen) {
                this.lines[info[0]].s = tmp;
                j = 1;
            }
            else {
                this.lines.splice(info[0], 1);
                j = this.parse(info[0], tmp, this.lines);
            }
            this.textLength += slen;
            this._.fire(this, true, offset, slen, info[0], j);
        };

        this.remove = function (offset,size){
            var i1   = this.getLnInfo(this.lines, 0, 0, offset), 
                i2   = this.getLnInfo(this.lines, i1[0], i1[1], offset + size),
                l2   = this.lines[i2[0]].s, 
                l1   = this.lines[i1[0]].s, 
                off1 = offset - i1[1], off2 = offset + size - i2[1],
                buf  = [l1.substring(0, off1), l2.substring(off2)].join('');

            if (i2[0] == i1[0]) this.lines.splice(i1[0], 1, new Line(buf));
            else {
                this.lines.splice(i1[0], i2[0] - i1[0] + 1);
                this.lines.splice(i1[0], 0, new Line(buf));
            }
            this.textLength -= size;
            this._.fire(this, false, offset, size, i1[0], i2[0] - i1[0] + 1);
        };

        this.parse  =function (startLine, text, lines){
            var size = text.length, prevIndex = 0, prevStartLine = startLine;
            for(var index = 0; index <= size; prevIndex = index, startLine++){
                var fi = text.indexOf("\n", index);
                index = (fi < 0 ? size : fi);
                this.lines.splice(startLine, 0, new Line(text.substring(prevIndex, index)));
                index++;
            }
            return startLine - prevStartLine;
        };

        this.setText = function(text){
            if (text == null) throw new Error();
            var old = this.getText();
            if (old !== text) {
                if (old.length > 0) {
                    var numLines = this.getLines(), txtLen = this.getTextLength();
                    this.lines.length = 0;
                    this.lines = [ new Line("") ];
                    this._.fire(this, false, 0, txtLen, 0, numLines);
                }

                this.lines = [];
                this.parse(0, text, this.lines);
                this.textLength = text.length;
                this._.fire(this, true, 0, this.textLength, 0, this.getLines());
            }
        };

        this[''] = function(s){
            this.lines = [ new Line("") ];
            this._ = new Listeners("textUpdated");
            this.setText(s == null ? "" : s);
        };
    }
]);

pkg.SingleLineTxt = Class(pkg.TextModel, [
    function $prototype() {
        this.setExtraChar = function(i,ch) { this.extra = ch; };
        this.getExtraChar = function(i){ return this.extra; };

        this.getText = function(){ return this.buf; };
        this.getLines = function(){ return 1; };
        this.getTextLength = function(){ return this.buf.length; };
        this.getLine = function(line){ return this.buf; };

        this.write = function(s,offset){
            var buf = this.buf, j = s.indexOf("\n");
            if (j >= 0) s = s.substring(0, j);
            var l = (this.maxLen > 0 && (buf.length + s.length) >= this.maxLen) ? this.maxLen - buf.length : s.length;
            if (l!==0) {
                this.buf = [buf.substring(0, offset), s.substring(0, l), buf.substring(offset)].join('');
                if (l > 0) this._.fire(this, true, offset, l, 0, 1);
            }
        };

        this.remove = function(offset,size){
            this.buf = [ this.buf.substring(0, offset), this.buf.substring(offset + size)].join('');
            this._.fire(this, false, offset, size, 0, 1);
        };

        this.setText = function(text){
            if (text == null) throw new Error();
            var i = text.indexOf('\n');
            if (i >= 0) text = text.substring(0, i);
            if(this.buf == null || this.buf !== text) {
                if (this.buf != null && this.buf.length > 0) this._.fire(this, false, 0, this.buf.length, 0, 1);
                if (this.maxLen > 0 && text.length > this.maxLen) text = text.substring(0, this.maxLen);
                this.buf = text;
                this._.fire(this, true, 0, text.length, 0, 1);
            }
        };

        this[''] = function (s, max) {   
            this.maxLen = max == null ? -1 : max;
            this.buf = null;
            this.extra = 0;
            this._ = new Listeners("textUpdated");
            this.setText(s == null ? "" : s);
        };
    },

    function setMaxLength(max){
        if(max != this.maxLen){
            this.maxLen = max;
            this.setText("");
        }
    }
]);

pkg.ListModel = Class([
    function() { this.$this([]); },

    function(a) {
        this._ = new MListeners("elementInserted", "elementRemoved", "elementSet");
        this.d = a;
    },

    function $prototype() {
        this.get = function(i) {
            if (i < 0 || i >= this.d.length) throw new Error("" + i);
            return this.d[i];
        };

        this.add = function(o) {
            this.d.push(o);
            this._.elementInserted(this, o, this.d.length - 1);
        };

        this.removeAll = function() {
            var size = this.d.length;
            for(var i = size - 1; i >= 0; i--) this.removeAt(i);
        };

        this.removeAt = function(i) {
            var re = this.d[i];
            this.d.splice(i, 1);
            this._.elementRemoved(this, re, i);
        };

        this.remove = function(o) {
            for(var i = 0;i < this.d.length; i++ ) if (this.d[i] === o) this.removeAt(i);
        };

        this.insert = function(o,i){
            if(i < 0 || i >= this.d.length) throw new Error();
            this.d.splice(i, 0, o);
            this._.elementInserted(this, o, i);
        };

        this.count = function () { return this.d.length; };

        this.set = function (o,i){
            if(i < 0 || i >= this.d.length) throw new Error("" + i);
            var pe = this.d[i];
            this.d[i] = o;
            this._.elementSet(this, o, pe, i);
        };

        this.contains = function (o){ return this.indexOf(o) >= 0; };
        this.indexOf = function(o){ return this.d.indexOf(o); };
    }
]);

var Item = pkg.Item = Class([
    function $prototype() { 
        this[''] = function(v) {
            this.kids = [];
            this.value = v;
        };
    }
]);

pkg.TreeModel = Class([
    function $clazz() {
        this.create = function(r, p) {
            var item = new Item(r.value);
            item.parent = p;
            if (r.kids) {
                for(var i = 0; i < r.kids.length; i++) {
                    item.kids[i] = pkg.TreeModel.create(r.kids[i], item);
                }
            }
            return item;
        };
    },

    function $prototype() {
        this.setValue = function(item, v){
            item.value = v;
            this._.itemModified(this, item);
        };

        this.add = function(to,item){
            this.insert(to, item, to.kids.length);
        };

        this.insert = function(to,item,i){
            if (i < 0 || to.kids.length < i) throw new Error();
            to.kids.splice(i, 0, item);
            item.parent = to;
            this._.itemInserted(this, item);

            // !!!
            // it is necessary to analyze if the inserted item has kids and
            // generate inserted event for all kids recursively
        };

        this.remove = function(item){
            if (item == this.root) this.root = null;
            else {
                for(var i=0; i < item.kids.length; i++) this.remove(item.kids[i]);
                item.parent.kids.splice(item.parent.kids.indexOf(item), 1);
                item.parent = null;
            }
            this._.itemRemoved(this, item);
        };

        this.removeKids = function(item){
            for(var i = 0; i < items.kids.length; i++) this.remove(items[i]);
        };
    },

    function() { this.$this(new Item()); },

    function(r) {
        this.root = zebra.instanceOf(r, Item) ? r : pkg.TreeModel.create(r);
        this._ = new MListeners("itemModified", "itemRemoved", "itemInserted");
    }
]);

pkg.Matrix = Class([
    function $prototype() {
        this.get = function (row,col){
            return this.objs[row][col];
        };

        this.put = function(row,col,obj){
            if (arguments.length != 3) throw new Error();
            var nr = this.rows, nc = this.cols;
            if(row >= nr) nr += (row - nr + 1);
            if(col >= nc) nc += (col - nc + 1);
            this.setRowsCols(nr, nc);
            var old = this.objs[row] ? this.objs[row][col] : undefined;
            if (obj != old) {
                this.objs[row][col] = obj;
                this._.cellModified(this, row, col, old);
            }
        };

        this.puti = function(i, data){
            var p = zebra.util.index2point(i, this.rows);
            this.put(p[0], p[1], data);
        };

        this.setRowsCols = function(rows, cols){
            if(rows != this.rows || cols != this.cols){
                var pc = this.cols, pr = this.rows;
                this.rellocate(rows, cols);
                this.cols = cols;
                this.rows = rows;
                this._.matrixResized(this, pr, pc);
            }
        };

        this.rellocate = function(r, c) {
            if (r >= this.rows) {
                for(var i=this.rows; i < r; i++)  this.objs[i] = [];
            }
        };
    },

    function (data) {
        this.$this(0, 0);
        for (var i = 0; i < data.length; i++) {
            var rd = data[i];
            if (this.cols < rd.length) this.cols = rd.length;
            this.objs[i] = [];
            for (var j = 0; j < rd.length; j++) {
                this.objs[i][j] = rd[j];
            }
        }
    },

    function (rows,cols) {
        this.rows = this.cols = 0;
        this.objs = [];
        this._ = new MListeners("matrixResized", "cellModified");
        this.setRowsCols(rows, cols);
    },

    function setRows(rows) { this.setRowsCols(rows, this.cols);},
    function setCols(cols) { this.setRowsCols(this.rows, cols); },

    function removeRows(begrow,count){
        if(begrow < 0 || begrow + count > this.rows) throw new Error();
        for(var i = (begrow + count);i < this.rows; i++, begrow++){
            for(var j = 0;j < this.cols; j ++ ){
                this.objs[begrow][j] = this.objs[i][j];
                this.objs[i][j] = null;
            }
        }
        this.rows -= count;
        this._.matrixResized(this, this.rows + count, this.cols);
    },

    function removeCols(begcol,count){
        if(begcol < 0 || begcol + count > this.cols) throw new Error();
        for(var i = (begcol + count);i < this.cols; i++, begcol++){
            for(var j = 0;j < this.rows; j++){
                this.objs[j][begcol] = this.objs[j][i];
                this.objs[j][i] = null;
            }
        }
        this.cols -= count;
        this._.matrixResized(this, this.rows, this.cols + count);
    }
]);

})(zebra("data"), zebra.Class, zebra.Interface);