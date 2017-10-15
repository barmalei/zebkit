zebkit.package("ui", function(pkg, Class) {
    pkg.Spin = new Class(pkg.Panel, [
        function(min, max) {
            this.$super(this);

            this.step     = 1;
            this.min      = arguments.length === 0 ? 0             : min;
            this.max      = arguments.length <   2 ? this.min + 10 : max;
            this.editor   = null;
            this.isLooped = true;

            this.layoutComponents(new this.clazz.TextField(this, this.min, this.max),
                                  new this.clazz.IncButton(),
                                  new this.clazz.DecButton());

            this._ = new zebkit.Listeners();
        },

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
                    if (/^[-+]?^[0]*[0-9]+$/.test(v) === true) {
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
                    if (pos >= 0 && pos < prevValue.length && this.hasSelection() === false) {
                        this.select(pos, pos + 1);
                    }

                    this.$super(e);

                    if (this.isValideValue(this.getValue()) === false) {
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

                function textUpdated(src, op, off, size, startLine, lines) {
                    this.$super(src, op, off, size, startLine, lines);
                    if (typeof this.getModel().validate !== 'undefined') {
                        this.target._.fired(this.target);
                    }
                }
            ]);
        },

        function layoutComponents(text, inc, dec) {
            var buttons = new pkg.Panel(new zebkit.layout.PercentLayout("vertical"));
            this.setLayout(new zebkit.layout.BorderLayout());

            var tfPan = new pkg.Panel(new zebkit.layout.FlowLayout("left", "center"));
            tfPan.layout.stretchLast = true;
            this.add("center", tfPan);

            tfPan.add(text);
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

        function $install(child) {
            if (child.isEventFired()) {
                child.on(this);
            } else if (zebkit.instanceOf(child, pkg.TextField)) {
                this.editor = child;
            }
        },

        function $uninstall(child) {
            if (child.isEventFired()) {
                child.off(this);
            } else if (zebkit.instanceOf(child, pkg.TextField)) {
                this.editor = null;
            }
        },

        function compAdded(e) {
            this.$install(e.kid);
        },

        function compRemoved(e) {
            this.$uninstall(e.kid);
        },

        function childCompAdded(e) {
            // TODO: check it is called and kid is proper field
            this.$install(e.kid);
        },

        function childCompRemoved(e) {
            // TODO: check it is called and kid is proper field
            this.$uninstall(e.kid);
        },

        function setMinMax (min, max) {
            if (this.min !== min && this.max !== max) {
                this.min = min;
                this.max = max;
                this.setValue(this.getValue());
                this.vrp();
            }
        },

        function setLoopEnabled(b) {
            this.isLooped = b;
        },

        function fired(src) {
            this.setValue(this.getValue() + src.increment * this.step);
        },

        function getValue(){
            var value = this.editor.getValue();
            if (value === "") {
                return this.min;
            } else {
                return parseInt((value.indexOf('+') === 0) ? value.substring(1) : value);
            }
        },

        function setValue(v){
            if (v < this.min) {
                v = this.isLooped ? this.max : this.min;
            }

            if (v > this.max) {
                v = this.isLooped ? this.min : this.max;
            }

            var prev = this.getValue();
            if (prev !== v){
                this.prevValue = prev;
                this.editor.setValue("" + v);
                this.repaint();
            }
        }
    ]);
});

