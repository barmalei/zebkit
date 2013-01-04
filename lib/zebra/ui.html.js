(function(pkg, Class, Interface) {

pkg.HTMLTextField = Class(pkg.Panel, pkg.MouseListener, pkg.FocusListener, [
    function() {
        this.$super();
        this.element = document.createElement("input");
        this.element.setAttribute("type",  "text");
        this.element.setAttribute("id", this);
        //this.element.setAttribute("style", "visibility:hidden;");


        this.element.style.border  = "none";
        this.element.style.backgroundColor  = "transparent";


        document.body.appendChild(this.element);


        zebra.print("Element : " + this.element.offsetWidth);
        console.log(this.element);


        this.setPreferredSize(1, 22);

        zebra.print("Element : " + this.element.offsetWidth);

        this.element.style.zIndex = 10;



        var $this = this;

        // this.element.onfocus = function() {
        //     zebra.print("onfocus");
        //     pkg.focusManager.requestFocus($this);
        // };


        function keyHandler(e) {
            if(e.keyCode == 9) {
                if(e.preventDefault) e.preventDefault();

                EM.performInput(new KE($this, 5, e.keyCode, '', 0));
                return false;

            }
        }


        if(this.element.addEventListener) {
            this.element.addEventListener('keydown', keyHandler,false);
        }
        else
        if (this.element.attachEvent) {
            this.element.attachEvent('onkeydown',this.keyHandler);
        }

        this.setBorder(new pkg.Border());
        this.setBackground(new pkg.Gradient("#CCCCCC", "#FFFFFF"));


        this.delegate = function(name, e) {
            var d = pkg.findCanvas(this);
            if (d) {
                if (typeof e.clientX !== "undefined") {
                    zebra.print(e.clientX + "," + this.x);
                 //   e.clientX = e.clientX + this.x;
                   // e.clientY = e.clientY + this.y;
                }
                d[name].call(d, e);
            }
        };

        var $this = this;
        this.element.onmousemove   = function(e) { $this.delegate("mouseMoved", e);   };
        this.element.onmousedown   = function(e) { $this.delegate("mousePressed",e); };
        this.element.onmouseup     = function(e) { $this.delegate("mouseReleased",e);};
        this.element.onmouseover   = function(e) { $this.delegate("mouseEntered",e); };
        this.element.onmouseout    = function(e) { $this.delegate("mouseExited",e);  };
        this.element.onkeydown     = function(e) { $this.delegate("keyPressed",e);   };
        this.element.onkeyup       = function(e) { $this.delegate("keyReleased",e);  };
        this.element.onkeypress    = function(e) { $this.delegate("keyTyped",e);     };
    },

    function focusLost(e) {
        zebra.print("FocusLost ....  ");
        this.element.blur();

    },

    function focusGained(e) {
        zebra.print("FocusGained ....  ");
        this.element.focus();
    },

    function mouseEntered(e) {
        zebra.print("!!!!!!!! " + e.y);
    },

    function canHaveFocus() { return true; },

    function setBorder(br) {
        this.$super(br);

        zebra.print(this.getLeft());
        this.element.style.paddingTop  = this.getTop() + "px";
        this.element.style.paddingLeft = this.getLeft() + 4+ "px";
        this.element.style.paddingRight = this.getRight() + "px";
        this.element.style.paddingBottom = this.getBottom() + "px";
    },

    function setPaddins(t,l,b,r) {
        this.$super(t,l,b,r);
        // this.element.style["padding-top"]  = t;
        // this.element.style["padding-left"] = l;
        // this.element.style["padding-right"] = r;
        // this.element.style["padding-bottom"] = b;
    },

    function setVisible(b) {
        if (this.isVisible != b) {
            this.element.style.zIndex = b ? 10 : -1;
            this.$super(b);
        }
    },

    function setSize(w, h) {
        this.$super(w, h);
        //if (this.parent != null) {
            this.element.style.width = "" + w + "px";
            this.element.style.height = "" + h + "px";
        //}
    },

    function setLocation(x, y) {
        this.$super(x, y);
        //if (this.parent != null) {
            var a = zebra.layout.getAbsLocation(0,0,this);
            zebra.print(a[0] + "," + a[1]);
            this.element.style.position = "absolute";
            this.element.style.top = "" + a[1] + "px";
            this.element.style.left = "" + a[0] + "px";
        //}
    },

    function setParent(p) {
        this.$super(p);
        this.element.style.display = "visible";
    }
]);

})(zebra("ui"), zebra.Class, zebra.Interface);