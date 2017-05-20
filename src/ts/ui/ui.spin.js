zebkit.package("ui", function(pkg, Class) {

    pkg.Spin = new Class(pkg.Panel, [
        function $clazz() {
            this.SpinButton = Class(pkg.ArrowButton, [
                function $prototype() {
                    this.increment = 1;
                }
            ]);

            this.IncButton = Class(this.SpinButton, []);
            this.DecButton = Class(this.SpinButton, []);
            this.DecButton.prototype.increment = -1;

            this.TextField = Class(pkg.TextField, [
                function isValideValue(v) {
                    if (/^[-+]?^[0]*[0-9]+$/.test(v)) {
                        var iv = parseInt(v);
                        return iv >= this.min && iv <= this.max;
                    }
                    return false;
                },

                function keyTyped(e) {
                    var model     = this.getModel(),
                        validate  = model.validate,
                        prevValue = this.getValue();

                    model.validate = null;

                    var pos = this.position.offset;
                    if (pos >= 0 && pos < prevValue.length && this.hasSelection() == false) {
                        this.select(pos, pos + 1);
                    }

                    this.$super(e);

                    if (this.isValideValue(this.getValue()) == false) {
                        this.setValue(prevValue);
                    }
                    model.validate = validate;
                },

                function calcPreferredSize(target) {
                    var font = this.getFont();
                    return { width  : Math.max(font.stringWidth("" + this.max), font.stringWidth("" + this.min)),
                             height : font.height };
                },

                function (target, min, max) {
                    this.target = target;
                    this.min = min;
                    this.max = max;

                    var $this = this;
                    this.$super(new zebkit.data.SingleLineTxt([
                        function () {
                            this.$super("" + min);
                        },

                        function validate(value) {
                            return $this.isValideValue(value);
                        }
                    ]));
                },

                function textUpdated(src, b, off, size, startLine, lines) {
                    console.log("textUpdated("+b+"," + off + ") " + this.getValue());
                    this.$super(src, b, off, size, startLine, lines);
                    if (this.getModel().validate != null) {
                        this.target._.fired(this.target);
                    }
                }
            ]);
        },

        function(min, max) {
            this.$super(this);

            this.step     = 1;
            this.min      = min == null ? 0  : min;
            this.max      = max == null ? this.min + 10 : max;
            this.editor   = null;
            this.isLooped = true;

            this.layoutComponents(new this.clazz.TextField(this, this.min, this.max),
                                  new this.clazz.IncButton(),
                                  new this.clazz.DecButton());

            this._ = new zebkit.util.Listeners();
        },

        function layoutComponents(text, inc, dec) {
            var buttons = new pkg.Panel(new zebkit.layout.PercentLayout("vertical"));
            this.setLayout(new zebkit.layout.BorderLayout());

            var tfPan = new pkg.Panel(new zebkit.layout.FlowLayout("left", "center"));
            tfPan.layout.stretchLast = true;

            tfPan.add(text);

            this.add("center", tfPan);
            this.add("right", buttons);
            buttons.add(50, inc);
            buttons.add(50, dec);


            // this.setLayout(new zebkit.layout.BorderLayout());
            // this.add("center", text);

            // var buttons = new pkg.Panel(new zebkit.layout.BorderLayout());
            // buttons.add("top", inc);
            // buttons.add("bottom", dec);
            // this.add("right", buttons);


            // this.setLayout(new zebkit.layout.BorderLayout());
            // this.add("center", text );
            // this.add("left", dec);
            // this.add("right", inc);
        },

        function  $install(child) {

            console.log("$intsall : " + child.clazz.$name);

            if (zebkit.instanceOf(child, pkg.Button)) {
                child.bind(this);
            }
            else {
                if (zebkit.instanceOf(child, pkg.TextField)) {
                    this.editor = child;
                }
            }
        },

        function $uninstall(child) {
            if (zebkit.instanceOf(child, pkg.Button)) {
                child.unbind(this);
            }
            else {
                if (zebkit.instanceOf(child, pkg.TextField)) {
                    this.editor = null;
                }
            }
        },

        function compAdded(i, ctr, c) {
            this.$install(c);
        },

        function compRemoved(i,l) {
            this.$uninstall(l);
        },

        function childCompAdded(e) {
            // TODO: check it is called and kid is proper field
            this.$install(e.kid);
        },

        function childCompRemoved(id, src, constr, p2) {
            // TODO: check it is called and kid is proper field
            this.$uninstall(e.kid);
        },

        function setMinMax (min, max) {
            if (this.min != min && this.max != max) {
                this.min = min;
                this.max = max;
                this.setValue(this.getValue());
                this.vrp();
            }
        },

        function setLoopEnabled(b) {
            this.isLooped = b;
        },

        function fired(src){
            this.setValue(this.getValue() + src.increment * this.step);
        },

        function getValue(){
            var value = this.editor.getValue();
            if (value === "") return this.min;
            return parseInt((value.indexOf('+') == 0) ? value.substring(1) : value);
        },

        function setValue(v){
            if (v < this.min) {
                v = this.isLooped ? this.max : this.min;
            }

            if (v > this.max) {
                v = this.isLooped ? this.min : this.max;
            }

            var prev = this.getValue();
            if (prev != v){
                this.prevValue = prev;
                this.editor.setValue("" + v);
                this.repaint();
            }
        }
    ]);

    console.log("pkg.$url  = " + pkg.$url ) ;

    pkg.load(pkg.$url + "src/spin.json", function(e) {
        if (e != null) {

            console.log("" + (e.stack ? e.stack : e));
        }
    });
});

