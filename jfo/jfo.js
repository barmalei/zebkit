var lefticon, righticon;

zebra()['zebra.json'] = ('/zebra.json');

// load with callback will call zebra.busy();
// our run function will get called after json config loaded
new zebra.ui.Bag(zebra('jfo')).load('jfo.json', function(){});

zebra.ready(run2);

function run() {
    eval(zebra.Import("ui", "layout"));

    var arr = [];
    for (var i = 0; i < 50; ++i) {
        var label = new Label(new zebra.data.Text('test' + i)).properties({
            color: "red",
            border: new Border("cyan"),
            font: new Font("Verdana", 14)
        });
        var fl = new Panel(new FlowLayout(LEFT, CENTER, HORIZONTAL, 4));
        fl.layout.stretchLast = true;
        fl.add(label);
        arr.push(fl);
    }

    var MyListLayout = zebra.Class(zebra.layout.ListLayout, [
        function calcPreferredSize(lw) {
            var ps = this.$super(lw);
            return {
                width: root.width - root.left - root.right - this.gap,
                height: ps.height
            };
        },
        function getPreferredSize() {
            return this.$super();
        },
        function doLayout(t) {
            this.$super(t);
        }
    ]);

    var innerPan = new Panel({
        layout: new MyListLayout(4),
        border: new Border("green"),
//        psWidth: 220,
        kids: arr
    });


    var sp = new ScrollPan(innerPan, VERTICAL);
    sp.setAutoHide(true);

    var z = new zCanvas('mycanvas');
    z.fullScreen();
    var root = z.root.properties({
        layout: new BorderLayout(10),
        padding: 8,
        border: new Border("red"),
        kids: {
            CENTER: sp
        }
    });
}

function run2() {
    eval(zebra.Import("ui", "layout"));

    var z = new zCanvas('mycanvas');
    z.fullScreen();

//    function F(){}
//    F.prototype = zebra.ui.Font.prototype;
//    function MyFont(name, style, size){
//        zebra.ui.Font.apply(this, arguments);
//    }
//    MyFont.prototype = new F();
//    MyFont.prototype.constructor = MyFont;
//    MyFont.prototype.stringWidth = function (s) {
//        return zebra.ui.Font.prototype.stringWidth.call(this, s);
//    }

    var WrapText = zebra.Class(zebra.data.Text, [
        function (text, font, maxWidth) {
            this.origText = text;
            this.font = font ? font : null;
            this.maxWidth = maxWidth ? maxWidth : 0;
            return this.$super(text);
        },
        function setValue(text) {
            if (this.maxWidth > 0 && this.font != null) {
                var lines = [];
                var s = '';
                for (var i in text) {
                    var c = text[i];
                    var old = s;
                    s += c;

                    if (c == '\n') {
                        lines.push(old);
                        s = '';
                    } else {
                        var width = this.font.stringWidth(s);
                        if (width > this.maxWidth) {
                            if (old.length == 0) {
                                old = s;
                            }
                            lines.push(old);
                            s = c;
                        }
                    }
                }
                lines.push(s);
                text = lines.join('\n');
            }
            return this.$super(text);
        },
        function setFont(font) {
            if (this.font != font) {
                this.font = font;
                this.setValue(this.origText);
            }
        },
        function setMaxWidth(maxWidth) {
            if (this.maxWidth != maxWidth) {
                this.maxWidth = maxWidth;
                this.setValue(this.origText);
            }
        }
    ]);

    var WrapLabel = zebra.Class(Label, [
        function setModel(m) {
            var render = m;
            if (zebra.isString(m)) {
                var text = new WrapText(m);
                var render = new TextRender(text);
                text.setFont(render.font);
            } else if (zebra.instanceOf(m, zebra.data.TextModel)) {
                render = new TextRender(m);
            }
            this.setView(render);
        },
        function setFont(f) {
            var model = this.getModel();
            if (model != null) {
                model.setFont(f);
            }
            return this.$super(f);
        },
        function resized(prevWidth, prevHeight) {
            var model = this.getModel();
            if (model != null) {
                // this will invalidate all
                model.setMaxWidth(this.width);
            }
            this.$super(prevWidth, prevHeight);
        }
    ]);

    var MyPanel = zebra.Class(Panel, [
        function calcPreferredSize(target) {
            return this.$super(target);
        },
        function getPreferredSize() {
            return this.$super();
        },

        function childPointerEntered(e) {
            if (e.identifier === 'mouse') {
                this.origBackground = e.source.bg;
                e.source.setBackground("orange");
            }
        },
        function childPointerExited(e) {
            if (e.identifier === 'mouse') {
                e.source.setBackground(this.origBackground);
            }
        }
    ]);
    var IMAGE_SIZE = 40;
    var titleBar = new Panel({
        layout: new BorderLayout(),
        background: 'white',
        psHeight: 60,
        kids: {
            LEFT: new Panel({
                layout: new RasterLayout(USE_PS_SIZE),
                kids: {
                    CENTER: new ImagePan("img/back.png", IMAGE_SIZE, IMAGE_SIZE).properties({
                        id: 'left'
                    })
                }
            }),
            RIGHT: new Panel({
                layout: new RasterLayout(USE_PS_SIZE),
                kids: {
                    CENTER: new ImagePan("img/order_person.png", IMAGE_SIZE, IMAGE_SIZE).properties({
                        id: 'right'
                    })
                }
            }),
            CENTER: new Panel({
                layout: new RasterLayout(USE_PS_SIZE),
                kids: {
                    CENTER: new Label(new Label("到站加油")).properties({
                        font: new Font("Verdana", 22)
                    })
                }
            })
        }
    });
//    titleBar.setPreferredSize(z.width, 100);

    var gasStation = new Panel({
        id: 'station',
        layout: new BorderLayout(6),
        padding: 6,
        background: 'white',
        kids: {
            CENTER: new Panel({
                layout: new ListLayout(6),
                kids: [
                    new AutoWrapLabel("壳牌园西路加油站（农大加油站）东路口西路").properties({
                        color: "black",
                        font: new Font("Verdana", 16)
                    }),
                    new Label("北京市海淀区圆明园西路28").properties({
                        font: new Font("Verdana", 12)
                    }),
                    new Label("每天22:00至次日06:00，92#汽油，优惠0.4元").properties({
                        color: "red",
                        font: new Font("Verdana", 12)
                    })
                ]
            }),
            RIGHT: new Panel({
                layout: new RasterLayout(USE_PS_SIZE),
                kids: {
                    CENTER: new Button('切换油站').properties({
                        id: 'change',
                        canHaveFocus: false
                    })
                }
            })
        }
    });

    var test = new Panel({
        id: 'test',
        layout: new PercentLayout(HORIZONTAL, 0, false),
        background: 'white',
        psHeight: 60,
        kids: [
            new Panel({
                layout: new RasterLayout(USE_PS_SIZE),
                constraints: 20,
                kids: {
                    LEFT: new ImagePan("img/back.png", IMAGE_SIZE, IMAGE_SIZE).properties({
                        id: 'left'
                    })
                }
            }),
            new Panel({
                layout: new RasterLayout(USE_PS_SIZE),
                constraints: 60,
                kids: {
                    CENTER: new Label(new Label("到站加油")).properties({
                        constraints: CENTER
                    })
                }
            }),
            new Panel({
                id: 'ttt',
                layout: new RasterLayout(USE_PS_SIZE),
                padding: 0,
                constraints: 20,
                kids: {
                    RIGHT: new ImagePan("img/order_person.png", IMAGE_SIZE, IMAGE_SIZE).properties({
                        id: 'left'
                    })
                }
            })
        ]
    });

    var test2 = new Panel({
        layout: new FlowLayout(RIGHT, STRETCH, HORIZONTAL, 2),
        background: 'white',
        psHeight: 130,
        kids: [
            new Checkbox("Checkbox").properties({
            }),
            new Label(new zebra.data.Text("Ri2\n2")).properties({
            }),
            new Label(new zebra.data.Text("Ri33\n2\n33")).properties({
            })
        ],
        focusMarkerView: new View([function () {
            function paint(g, x, y, w, h, c) {
                var step = 10;
                g.setColor("red");
                for (var i = 0; i < w / step; i++) {
                    g.drawLine(x + i * step, y,
                            x + i * step, y + h);
                }

                g.setColor("orange");
                for (var i = 0; i < h / step; i++) {
                    g.drawLine(x, y + i * step,
                            x + w, y + i * step);
                }
            }
        }])
    });

    var test3 = new Panel({
        layout: new RasterLayout(),
        padding: 0,
        background: 'white',
        kids: [
            new Button("Right-Center-Hor").properties({
                bounds: [0, 10, 180, 50],
                constraints: HORIZONTAL
            }),
            new Button("Right-Center-Hor22").properties({
                bounds: [40, 50, 180, 50]
            }),
            new Button("Right-Center-Hor333").properties({
                bounds: [90, 90, 180, 50]
            }),
            new Button("Right-Center-Hor333").properties({
                bounds: [250, 40, 90, 40]
            })
        ]
    });
    for (var i in test3.kids) {
        test3.kids[i].toPreferredSize();
    }

    var arr = [];
    arr.push(titleBar);
    arr.push(gasStation);
    arr.push(test);
    arr.push(test2);
    arr.push(test3);

    var container = new MyPanel({
        layout: new ListLayout(10),
        kids: arr
    });

    var root = z.root.properties({
        layout: new BorderLayout(),
        kids: {
            CENTER: container
        }
//        kids: [container.properties({
//            bounds: [0, 0, z.width, z.height]
//        })]
    });

    root.find('#change').extend([
        function pointerClicked(e) {
            console.log('================> change clicked');
        }
    ]);
    root.find('#left').extend([
        function pointerClicked(e) {
            console.log('================> left clicked');
        }
    ]);
    root.find('#right').extend([
        function pointerClicked(e) {
            console.log('================> right clicked');
        }
    ]);
    root.find('#station').extend([
        function pointerClicked(e) {
            console.log('================> station clicked');
        }
    ]);

}