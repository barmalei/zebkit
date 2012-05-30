(function(pkg, Class, Interface) {

pkg.TextModelListener = Interface();
pkg.TextModel = Interface();

var TML = pkg.TextModelListener, MB = zebra.util, Listeners = MB.Listeners;
TML.REMOVED  = 1;
TML.INSERTED = 2;

pkg.Text = Class(pkg.TextModel, function($) {
    function Line(s) {
        this.s = s;
        this.l = 0;
    }
    Line.prototype.toString = function() { return this.s; }
        
    $(function() { this.$this(""); });
    $(function(s){ 
        this.textLength = 0;
        this.lines = [ new Line("") ];
        this._ = new Listeners("textUpdated");
        this.setText(s); 
        
        // !!! speed up
        this.setExtraChar = function(i,ch){ this.lines[i].l = ch; }
        this.getExtraChar = function (i) { return this.lines[i].l; }
    });
    
    $(function getLine(line) { return this.lines[line].s; });
    $(function getText(){ return this.lines.join("\n"); });
    $(function getLines() { return this.lines.length; });

    $(function setText(text){
        if (text == null) throw new Error();
        var old = this.getText();
        if (old !== text) {
            if (old.length > 0) {
                var numLines = this.getLines(), txtLen = this.getTextLength();
                this.lines.length = 0;
                this.lines = [ new Line("") ];
                this._.fire(this, TML.REMOVED, 0, txtLen, 0, numLines);
            }
            
            this.lines = [];
            this.parse(0, text, this.lines);
            this.textLength = text.length;
            this._.fire(this, TML.INSERTED, 0, this.textLength, 0, this.getLines());
        }
    });

    $(function write(s, offset){
        var slen = s.length, info = getLnInfo(this.lines, 0, 0, offset), line = this.lines[info[0]].s, j = 0;
        var lineOff = offset - info[1], tmp = [line.substring(0, lineOff), s, line.substring(lineOff)].join('');

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
        this._.fire(this, TML.INSERTED, offset, slen, info[0], j);
    });

    $(function remove(offset,size){
        var i1 = getLnInfo(this.lines, 0, 0, offset), i2 = getLnInfo(this.lines, i1[0], i1[1], offset + size);
        var l2 = this.lines[i2[0]].s, l1= this.lines[i1[0]].s, off1 = offset - i1[1], off2 = offset + size - i2[1];
        var buf = [l1.substring(0, off1), l2.substring(off2)].join('');
        if (i2[0] == i1[0]) this.lines.splice(i1[0], 1, new Line(buf));
        else {
            this.lines.splice(i1[0], i2[0] - i1[0] + 1)
            this.lines.splice(i1[0], 0, new Line(buf));
        }
        this.textLength -= size;
        this._.fire(this, TML.REMOVED, offset, size, i1[0], i2[0] - i1[0] + 1);
    });

    $(function parse(startLine, text, lines){
        var size = text.length, prevIndex = 0, prevStartLine = startLine;
        for(var index = 0; index <= size; prevIndex = index, startLine++){
            var fi = text.indexOf("\n", index);
            index = (fi < 0 ? size : fi);
            this.lines.splice(startLine, 0, new Line(text.substring(prevIndex, index)));
            index++;
        }
        return startLine - prevStartLine;
    });

    $(function getTextLength(){ return this.textLength; });

    function getLnInfo(lines, start, startOffset, o){
        for(; start < lines.length; start++){
            var line = lines[start].s;
            if(o >= startOffset && o <= startOffset + line.length) return [start, startOffset];
            startOffset += (line.length + 1);
        }
        return [];
    }
});

pkg.SingleLineTxt = Class(pkg.TextModel, [
    function()  { this.$this("",  -1); },
    function(s) { this.$this(s,  -1);  },

    function (s,max){
        this.maxLen = max;
        this.buf = null;
        this.extra = 0;
        this._ = new Listeners("textUpdated");
        this.setText(s);
        
        //!!!! speed up
        this.setExtraChar = function(i,ch) { this.extra = ch; }
        this.getExtraChar = function(i){ return this.extra; }
    },

    function getMaxLength(){ return this.maxLen; },

    function setMaxLength(max){
        if(max != this.maxLen){
            this.maxLen = max;
            this.setText("");
        }
    },

    function getLine(line){ return this.buf; },

    function setText(text){
        if(text == null) throw new Error(); 
        var i = text.indexOf('\n');
        if (i >= 0) text = text.substring(0, i);
        if(this.buf == null || this.buf !== text) {
            if (this.buf != null && this.buf.length > 0) this._.fire(this, TML.REMOVED, 0, this.buf.length, 0, 1);
            if (this.maxLen > 0 && text.length > this.maxLen) text = text.substring(0, this.maxLen); 
            this.buf = text;
            this._.fire(this, TML.INSERTED, 0, text.length, 0, 1);
        }
    },

    function getText(){ return this.buf; },
    function getLines(){ return 1; },

    function write(s,offset){
        var buf = this.buf, j = s.indexOf("\n");
        if (j >= 0) s = s.substring(0, j);
        var l = (this.maxLen > 0 && (buf.length + s.length) >= this.maxLen) ? this.maxLen - buf.length : s.length;
        if (l!=0) {
            this.buf = [buf.substring(0, offset), s.substring(0, l), buf.substring(offset)].join('');
            if (l > 0) this._.fire(this, TML.INSERTED, offset, l, 0, 1); 
        }
    },

    function remove(offset,size){
        this.buf = [ this.buf.substring(0, offset), this.buf.substring(offset + size)].join(''); 
        this._.fire(this, TML.REMOVED, offset, size, 0, 1);
    },

    function getTextLength(){ return this.buf.length; }
]);

var ELEMENT_INSERTED = 1, ELEMENT_REMOVED = 2, ELEMENT_SET = 3;
pkg.ListModel = Class([
    function () {
        this.support = [];
        this.d = [];
    },
    
    function addListModelListener(l){ this.support.push(l); },
    function removeListModelListener(l){ zebra.util.array_rm(this.support, l); },

    function elementAt(i){
        if (i < 0 || i >= this.d.length) throw new Error("" + i);
        return this.d[i];
    },

    function addElement(o){
        this.d.push(o);
        this.perform(ELEMENT_INSERTED, o, null, this.d.length - 1);
    },

    function removeAllElements(){
        var size = this.d.length;
        for(var i = size - 1; i >= 0; i--) this.removeElementAt(i);
    },

    function removeElementAt(i){
        var re = this.d[i];
        this.d.splice(i, 1);
        this.perform(ELEMENT_REMOVED, re, null, i);
    },

    function removeElement(o){ for(var i = 0;i < this.d.length; i++ ) if (this.d[i] === o) this.removeElementAt(i); },

    function insertElementAt(o,i){
        if(i < 0 || i >= this.d.length) throw new Error();
        this.d.splice(i, 0, o); 
        this.perform(ELEMENT_INSERTED, o, null, i);
    },

    function elementsCount(){ return this.d.length; },

    function setElementAt(o,i){
        if(i < 0 || i >= this.d.length) throw new Error("" + i);
        var pe = this.d[i];
        this.d[i] = o; 
        this.perform(ELEMENT_SET, o, pe, i);
    },

    function contains(o){ return this.indexOf(o) >= 0; },
    function indexOf(o){ return this.d.indexOf(o); },

    function perform(id,e,pe,index){
        for(var i = 0;i < this.support.length; i++){
            var l = this.support[i];
            if(id == ELEMENT_INSERTED) l.elementInserted(e, index);
            else
                if(id == ELEMENT_REMOVED) l.elementRemoved(e, index);
                else l.elementSet(e, pe, index);
        }
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

pkg.TreeModel = Class(function($) {
    var ItemDesc = function(p) {
        this.kids = [];
        this.parent = p;
    }, INSERTED = 1, REMOVED = 2, MODIFIED = 3, MOVED = 4, Item = pkg.Item;

    $(function() { this.$this(new Item()); });

    $(function(r) { 
        this.itemDesc = function(item){ 
            var v = this.elements[item]; 
            return typeof v === "undefined" ? null : v; 
        }
        this.elements =  {}; 
        this.root = null;
        this.setRoot(r); 
    });

    $(function addListener(l){
        if(!this.v) this.v = [];
        this.v.push(l);
    });

    $(function removeListener(l){ if (this.v) zebra.util.array_rm(this.v, l); });

    $(function setRoot(r){
        if(this.root != null && r == null) throw new Error();
        this.root = r;
        if(r != null) this.regItem(r, null);
    });

    $(function getChildren(){ return this.getChildren(this.root); });

    $(function getChildren(item){
        var d = this.itemDesc(item), kids = d.kids, r = Array(kids.length);
        for(var i = 0;i < kids.length; i++) r[i] = kids[i];
        return r;
    });

    $(function getChildAt(item,index){ return this.itemDesc(item).kids[index]; });

    $(function getChildIndex(item){
        if(this.contains(item)){
            var p = this.getParent(item);
            return p != null ? this.itemDesc(p).kids.indexOf(item) : 0;
        }
        return  -1;
    });

    $(function getParent(item){ return this.itemDesc(item).parent; });
    $(function getChildrenCount(item){ return this.itemDesc(item).kids.length; });
    $(function hasChildren(item){ return this.itemDesc(item).kids.length > 0; });
    $(function contains(item){ return typeof this.elements[item] !== "undefined"; });
    $(function add(to,item){ this.insert(to, item, this.getChildrenCount(to)); });

    $(function insert(to,item,index){
        if(index < 0) throw new Error();
        this.itemDesc(to).kids.splice(index, 0, item); 
        this.regItem(item, to);
    });

    $(function remove(item){
        var d = this.itemDesc(item);
        if(d.children != null) while(d.kids.length != 0) this.remove(d.kids[0]);
        this.unregItem(item);
    });

    $(function removeChild(p,i){ this.remove(this.itemDesc(p).kids[i]); });

    $(function removeKids(item){
        var items = this.getChildren(item);
        for(var i = 0;i < items.length; i++) this.remove(items[i]);
    });

    $(function clone(item){
        var root = new Item(item), res = new pkg.TreeModel(root);
        pclone(res, root, this.itemDesc(item));
        return res;
    });

    $(function set(item,o){
        item.setValue(o);
        this.fire(MODIFIED, item, null);
    });

    $(function move(to,item){
        var p = this.getParent(item);
        this.itemDesc(p).removeKid(item);
        var d = this.itemDesc(to);
        d.kids.push(item);
        this.itemDesc(item).parent = to;
        this.fire(MOVED, item, p);
    });

    $(function regItem(item,parent){
        this.elements[item] = new ItemDesc(parent);
        this.fire(INSERTED, item, null);
    });

    $(function unregItem(item){
        var d = this.itemDesc(item);
        if(d.parent != null) rm(this.itemDesc(d.parent).kids, item);
        delete this.elements[item];
        if(item == this.root) this.root = null;
        this.fire(REMOVED, item, null);
    });

    $(function fire(id, i, mi){
        if (this.v && this.v.length > 0) {
            for(var k=0; k<this.v.length; k++) {
                var l = this.v[k];
                switch(id)
                {
                    case INSERTED:l.itemInserted(this, i);break;
                    case REMOVED:l.itemRemoved(this, i);break;
                    case MODIFIED: l.itemModified(this, i);break;
                    case MOVED: l.itemMoved(this, i, mi);break;
                    default: throw new Error();
                }
            }
        }
    });

    function pclone(res,root,d){
        for(var i = 0;i < d.kids.length; i++){
            var originalItem = d.kids[i], item = new Item(originalItem);
            res.add(root, item);
            pclone(res, item, this.itemDesc(originalItem));
        }
    }
});

pkg.Matrix = Class(function($) {
    $(function (rows,cols) { 
        this.get = function (row,col){ return this.objs[row][col]; }
        this.rows = this.cols = 0;
        this.objs    = [];
        this.support = null;
        this.setRowsCols(rows, cols); 
    });

    $(function setRows(rows) { this.setRowsCols(rows, this.cols);});
    $(function setCols(cols) { this.setRowsCols(this.rows, cols); });

    $(function setRowsCols(rows, cols){
        if(rows != this.rows || cols != this.cols){ 
            var pc = this.cols, pr = this.rows;
            this.objs = rellocate(this.objs, rows, cols);
            this.cols = cols;
            this.rows = rows;
            perform(this.support, this, pr, pc, null, true);
        }
    });

    $(function put(row,col,obj){
        var nr = this.rows, nc = this.cols;
        if(row >= nr) nr += (row - nr + 1);
        if(col >= nc) nc += (col - nc + 1);
        this.setRowsCols(nr, nc);
        var old = this.objs[row][col];
        if (obj != old) {
            this.objs[row][col] = obj;
            perform(this.support, this, row, col, old, false);
        }
    });

    $(function put(index,obj){
        var p = MB.index2point(index, this.cols);
        this.put(p.x, p.y, obj);
        return p;
    });

    $(function put(data){
        for(var r = 0; r < data.length; r++) {
            var d = data[r];
            for(var c = 0; c < d.length; c++)  put(r, c, d[c]);
        }
    });

    $(function get(index){
        var p = MB.index2point(index, this.cols);
        return this.objs[p.x][p.y];
    });

    $(function removeRows(begrow,count){
        if(begrow < 0 || begrow + count > this.rows) throw new Error();
        for(var i = (begrow + count);i < this.rows; i++, begrow++){
            for(var j = 0;j < this.cols; j ++ ){
                this.objs[begrow][j] = this.objs[i][j];
                this.objs[i][j] = null;
            }
        }
        this.rows -= count;
        perform(this.support, this, this.rows + count, this.cols, null, true);
    });

    $(function removeCols(begcol,count){
        if(begcol < 0 || begcol + count > this.cols) throw new Error();
        for(var i = (begcol + count);i < this.cols; i++, begcol++){
            for(var j = 0;j < this.rows; j++){
                this.objs[j][begcol] = this.objs[j][i];
                this.objs[j][i] = null;
            }
        }
        this.cols -= count;
        perform(this.support, this, this.rows, this.cols + count, null, true);
    });

    $(function addMatrixModelListener(m){
        if(this.support == null) this.support = [];
        this.support.push(m);
    });

    $(function removeMatrixModelListener(m){ if (this.support != null) rm(this.support, m); });

    function perform(support,model,row,col,prevValue,isResized){
        if(support != null)
            for(var i = 0;i < support.length; i++){
                if(isResized) support[i].matrixResized(model, row, col);
                else support[i].cellModified(model, row, col, prevValue);
            }
    }
    
    function rellocate(a, r, c) {
        var rr = a.length, m = r;
        if (r > rr) { 
            for(var i = rr; i < r; i++) {
                var aa = Array(c);
                for(var j = 0; j < c; j++) aa[j] = null;
                a[i] = aa;
            }   
            m = rr;
        }
        else {
            if (r < rr) {
                for(var i = r; i < rr; i++) {
                    var aa = a[i];
                    for(var j = 0; j < aa.length; j++) aa[j] = null;
                }
            }
        }
      
        for(var i = 0; i < m; i++) {
            var aa = a[i], rc = aa.length;
            if (rc > c) for(var j = c; j < rc; j++) aa[j] = null;
            else for(var j = rc; j < c; j++) aa[j] = null;
        }   
        return a;
    }
});

})(zebra("data"), zebra.Class, zebra.Interface);