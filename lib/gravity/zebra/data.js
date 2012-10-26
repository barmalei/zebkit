(function(pkg, Class, Interface) {

pkg.TextModel = Interface();
var MB = zebra.util, Listeners = MB.Listeners, MListeners = MB.MListeners;

function Line(s) {
    this.s = s;
    this.l = 0;
}
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
            var i1 = this.getLnInfo(this.lines, 0, 0, offset), i2 = this.getLnInfo(this.lines, i1[0], i1[1], offset + size),
                l2 = this.lines[i2[0]].s, l1= this.lines[i1[0]].s, off1 = offset - i1[1], off2 = offset + size - i2[1],
                buf = [l1.substring(0, off1), l2.substring(off2)].join('');

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
    },

    function() { this.$this(""); },

    function(s){
        this.lines = [ new Line("") ];
        this._ = new Listeners("textUpdated");
        this.setText(s);
    },

    function setText(text){
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
    }
]);

pkg.SingleLineTxt = Class(pkg.TextModel, [
    function $prototype() {
        this.setExtraChar = function(i,ch) { this.extra = ch; };
        this.getExtraChar = function(i){ return this.extra; };

        this.getText = function(){ return this.buf; };
        this.getLines = function(){ return 1; };
        this.getTextLength = function(){ return this.buf.length; };
        this.getMaxLength = function(){ return this.maxLen; };
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
    },

    function()  { this.$this("",  -1); },
    function(s) { this.$this(s,  -1);  },

    function (s,max){
        this.maxLen = max;
        this.buf = null;
        this.extra = 0;
        this._ = new Listeners("textUpdated");
        this.setText(s);
    },

    function setMaxLength(max){
        if(max != this.maxLen){
            this.maxLen = max;
            this.setText("");
        }
    },

    function setText(text){
        if(text == null) throw new Error();
        var i = text.indexOf('\n');
        if (i >= 0) text = text.substring(0, i);
        if(this.buf == null || this.buf !== text) {
            if (this.buf != null && this.buf.length > 0) this._.fire(this, false, 0, this.buf.length, 0, 1);
            if (this.maxLen > 0 && text.length > this.maxLen) text = text.substring(0, this.maxLen);
            this.buf = text;
            this._.fire(this, true, 0, text.length, 0, 1);
        }
    }
]);

pkg.ListModel = Class([
    function () {
        this._ = new MListeners("elementInserted", "elementRemoved", "elementSet");
        this.d = [];
    },

    function $prototype() {
        this.elementAt = function(i){
            if (i < 0 || i >= this.d.length) throw new Error("" + i);
            return this.d[i];
        };

        this.addElement = function(o){
            this.d.push(o);
            this._.elementInserted(this, o, this.d.length - 1);
        };

        this.removeAllElements = function(){
            var size = this.d.length;
            for(var i = size - 1; i >= 0; i--) this.removeElementAt(i);
        };

        this.removeElementAt = function(i){
            var re = this.d[i];
            this.d.splice(i, 1);
            this._.elementRemoved(this, re, i);
        };

        this.removeElement = function(o){ 
            for(var i = 0;i < this.d.length; i++ ) if (this.d[i] === o) this.removeElementAt(i); 
        };

        this.insertElementAt = function(o,i){
            if(i < 0 || i >= this.d.length) throw new Error();
            this.d.splice(i, 0, o);
            this._.elementInserted(this, o, i);
        };

        this.elementsCount = function () { return this.d.length; };

        this.setElementAt = function (o,i){
            if(i < 0 || i >= this.d.length) throw new Error("" + i);
            var pe = this.d[i];
            this.d[i] = o;
            this._.elementSet(this, o, pe, i);
        };

        this.contains = function (o){ return this.indexOf(o) >= 0; };
        this.indexOf = function(o){ return this.d.indexOf(o); };
    }
]);

pkg.Item = Class([
    function (){ this.$this(null); },
    function (item) { this.setValue((item && item.value)? item.value : item); },

    function setValue(v){
        this.value = v;
        this.repr = v != null ? v.toString() : "null";
    }
]);

var ItemDesc = function(p) {
    this.kids = [];
    this.parent = p;
};

pkg.TreeModel = Class([
    function $clazz() {  
        this.Item = pkg.Item; 

        this.pclone = function(res,root,d){
            for(var i = 0;i < d.kids.length; i++){
                var originalItem = d.kids[i], item = new Item(originalItem);
                res.add(root, item);
                pkg.TreeModel.pclone(res, item, this.itemDesc(originalItem));
            }
        };
    },

    function $prototype() {
        this.getParent = function (item){ return this.itemDesc(item).parent; };
        this.getChildrenCount = function (item){ return this.itemDesc(item).kids.length; };
        this.hasChildren = function (item){ return this.itemDesc(item).kids.length > 0; };
        this.contains = function(item){ return typeof this.elements[item] !== "undefined"; };

        this.regItem = function (item,parent){
            this.elements[item] = new ItemDesc(parent);
            this._.itemInserted(this, item);
        };

        this.unregItem = function (item){
            var d = this.itemDesc(item);
            if(d.parent != null) rm(this.itemDesc(d.parent).kids, item);
            delete this.elements[item];
            if(item == this.root) this.root = null;
            this._.itemRemoved(this, item);
        };

        this.getChildAt = function(item,index){
            return this.itemDesc(item).kids[index];
        };

        this.getChildIndex = function (item){
            if(this.contains(item)){
                var p = this.getParent(item);
                return p != null ? this.itemDesc(p).kids.indexOf(item) : 0;
            }
            return  -1;
        };

        this.clone = function (item){
            var res = new pkg.TreeModel(root);
            pkg.TreeModel.pclone(res, new Item(item), this.itemDesc(item));
            return res;
        };

        this.set = function(item,o){
            item.setValue(o);
            this._.itemModified(this, item );
        };

        this.add = function(to,item){ this.insert(to, item, this.getChildrenCount(to)); };

        this.insert = function(to,item,index){
            if(index < 0) throw new Error();
            this.itemDesc(to).kids.splice(index, 0, item);
            this.regItem(item, to);
        };

        this.remove = function(item){
            var d = this.itemDesc(item);
            if(d.children != null) while(d.kids.length !== 0) this.remove(d.kids[0]);
            this.unregItem(item);
        };

        this.removeChild = function (p,i){ this.remove(this.itemDesc(p).kids[i]); };

        this.removeChildren = function (item){
            var items = this.getChildren(item);
            for(var i = 0;i < items.length; i++) this.remove(items[i]);
        };

        this.getRootChildren = function(){ return this.getChildren(this.root); };

        this.getChildren = function(item){
            var d = this.itemDesc(item), kids = d.kids, r = Array(kids.length);
            for(var i = 0;i < kids.length; i++) r[i] = kids[i];
            return r;
        };
    },

    function() { this.$this(new Item()); },

    function(r) {
        this.itemDesc = function(item){
            var v = this.elements[item];
            return typeof v === "undefined" ? null : v;
        };
        this.elements = {};
        this.root = null;
        this._ = new MListeners("itemMoved", "itemModified", "itemRemoved", "itemInserted");
        this.setRoot(r);
    },

    function setRoot(r){
        if(this.root != null && r == null) throw new Error();
        this.root = r;
        if(r != null) this.regItem(r, null);
    },

    function move(to,item){
        var p = this.getParent(item);
        this.itemDesc(p).removeKid(item);
        this.itemDesc(to).kids.push(item);
        this.itemDesc(item).parent = to;
        this._.itemMoved(this, item, p);
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

    function (rows,cols) {
        this.rows = this.cols = 0;
        this.objs    = [];
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