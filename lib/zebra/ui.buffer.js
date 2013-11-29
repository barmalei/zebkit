(function(pkg, Class, Interface) {


pkg.CanvasPan = Class(pkg.Panel, [
    function $prototype() {
        this.setStyles = function(styles) {
            for(var k in styles) {
                this.canvas.style[k] = styles[k];
            }
        };

        this.setAttribute = function(name, value) {
            this.canvas.setAttribute(name, value);
        };

        this.paintOnTop = function(g) {
            zebra.print("!!!!");

            var c = this.getCanvas();
            c.$context.drawImage( this.canvas, this.x, this.y);
        };
    },

    function() {
        /**
         * Reference to HTML Canvas element  where the zebra canvas UI 
         * components are hosted 
         * @protected
         * @readOnly
         * @attribute canvas
         * @type {Canvas}
         */        
        this.canvas = document.createElement("canvas");

        /**
         * Keeps rectangular "dirty" area of the canvas component
         * @private
         * @attribute da
         * @type {Object} 
                { x:Integer, y:Integer, width:Integer, height:Integer }
         */
        this.$da = { x:0, y:0, width:-1, height:0 };

        this.$super();
    },

    function setSize(w, h) {
        if (this.width != w || h != this.height) {
            var pw = this.width, ph = this.height;

            // this.canvas.style.width  = "" + w  + "px";
            // this.canvas.style.height = "" + h + "px";
  
            this.$context = this.canvas.getContext("2d");

            // take in account that canvas can be visualized on 
            // Retina screen where the size of canvas (backstage)
            // can be less than it is real screen size. Let's 
            // make it match each other
            // this.canvas.width  = w * this.$context.$ratio;
            // this.canvas.height = h * this.$context.$ratio;


            this.canvas.width  = w ;
            this.canvas.height = h ;

            // again something for Retina screen
            // if (this.$context.$ratio != 1) {
            //     // call original method
            //     this.$context.$scale(this.$context.$ratio,
            //                          this.$context.$ratio);
            // }

            this.width = w;
            this.height = h;

            this.invalidate();
            this.validate();
            this.repaint();

            if (w != pw || h != ph) {
                this.resized(pw, ph);
            }

        }
    }
]);

pkg.bindEvents =- function(element, ui) {

        function $prototype() {

            function km(e) {
                var c = 0;
                if (e.altKey)   c += KE.M_ALT;
                if (e.shiftKey) c += KE.M_SHIFT;
                if (e.ctrlKey)  c += KE.M_CTRL;
                if (e.metaKey)  c += KE.M_CMD;
                return c;
            }

            this.keyTyped = function(e){
                if (e.charCode == 0) {
                    if ($keyPressedCode != e.keyCode) this.keyPressed(e);
                    $keyPressedCode = -1;
                    return;
                }

                if (e.charCode > 0) {
                    var fo = pkg.focusManager.focusOwner;
                    if (fo != null) {
                        //debug("keyTyped: " + e.keyCode + "," + e.charCode + " " + (e.charCode == 0));
                        KE_STUB.reset(fo, KE.TYPED, e.keyCode, String.fromCharCode(e.charCode), km(e));
                        if (EM.performInput(KE_STUB)) e.preventDefault();
                    }
                }

                if (e.keyCode < 47) e.preventDefault();
            };

            this.keyPressed = function(e){
                $keyPressedCode  = e.keyCode;
                var code = e.keyCode, m = km(e), b = false;
                for(var i = this.kids.length - 1;i >= 0; i--){
                    var l = this.kids[i];
                    l.layerKeyPressed(code, m);
                    if (l.isLayerActive && l.isLayerActive()) break;
                }

                var focusOwner = pkg.focusManager.focusOwner;
                if (pkg.clipboardTriggerKey > 0 && 
                    e.keyCode == pkg.clipboardTriggerKey && 
                    focusOwner != null && 
                    instanceOf(focusOwner, CopyCutPaste)) 
                {
                    $clipboardCanvas = this;  
                    $clipboard.style.display = "block";
                    this.canvas.onfocus = this.canvas.onblur = null;
                    
                    // value has to be set, otherwise some browsers (Safari) do not generate 
                    // "copy" event
                    $clipboard.value="1";

                    $clipboard.select();
                    $clipboard.focus();                
                    return;        
                }

                $keyPressedOwner     = focusOwner;
                $keyPressedModifiers = m;

                if (focusOwner != null) {
                    //debug("keyPressed : " + e.keyCode, 1);
                    KE_STUB.reset(focusOwner, KPRESSED, code, code < 47 ? KE.CHAR_UNDEFINED : '?', m);
                    b = EM.performInput(KE_STUB);

                    if (code == KE.ENTER) {
                        //debug("keyTyped keyCode = " + code);
                        KE_STUB.reset(focusOwner, KE.TYPED, code, "\n", m);
                        b = EM.performInput(KE_STUB) || b;
                    }
                }

                //!!!! 
                if ((code < 47 && code != 32) || b) { 
                    e.preventDefault();
                }
            };

            this.keyReleased = function(e){
                $keyPressedCode = -1;

                var fo = pkg.focusManager.focusOwner;
                if(fo != null) {
                    //debug("keyReleased : " + e.keyCode, -1);
                    KE_STUB.reset(fo, KE.RELEASED, e.keyCode, KE.CHAR_UNDEFINED, km(e));
                    if (EM.performInput(KE_STUB)) e.preventDefault();
                }
            };

            this.mouseEntered = function(id, e) {
                var mp = $mousePressedEvents[id];

                // !!!
                // quick and dirty fix
                // try to track a situation when the canvas has been moved 
                this.recalcOffset();

                // if a button has not been pressed handle mouse entered to detect
                // zebra component the mouse pointer entered and send appropriate
                // mouse entered event to it
                if (mp == null || mp.canvas == null) {
                    var x = $meX(e, this), y = $meY(e, this), d = this.getComponentAt(x, y);

                    // also correct current component on that mouse pointer is located
                    if (pkg.$mouseMoveOwner != null && d != pkg.$mouseMoveOwner) {
                        var prev = pkg.$mouseMoveOwner;
                        pkg.$mouseMoveOwner = null;

                        //debug("mouseExited << ", -1);
                        ME_STUB.reset(prev, MEXITED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }

                    if (d != null && d.isEnabled){
                        //debug("mouseEntered >> ", 1);
                        pkg.$mouseMoveOwner = d;
                        ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            };

            this.mouseExited = function (id, e) {
                var mp = $mousePressedEvents[id];

                // if a mouse button has not been pressed and current mouse owner 
                // component is not null, flush current mouse owner and send 
                // mouse exited event to him 
                if ((mp == null || mp.canvas == null) && pkg.$mouseMoveOwner != null){
                    var p = pkg.$mouseMoveOwner;
                    pkg.$mouseMoveOwner = null;

                    ME_STUB.reset(p, MEXITED, $meX(e, this), $meY(e, this), -1, 0);
                    EM.performInput(ME_STUB);
                }
            };

            this.mouseMoved = function(id, e){
                // get appropriate mousePressed event by event id
                var mp = $mousePressedEvents[id];
            
                // mouse button has been pressed and pressed target zebra component exists  
                // emulate mouse dragging events if we mouse moved on the canvas where mouse 
                // pressed event occurred
                if (mp != null && mp.canvas != null) {
                    // target component exits and mouse cursor moved on the same canvas where mouse pressed occurred
                    if (mp.component != null && mp.canvas.canvas == e.target) {

                        // !!!!
                        // for the sake of performance $meX(e, this) and $meY(e, this)
                        // methods calls are replaced with direct code
                        var x = this.$context.tX(e.pageX - this.offx, e.pageY - this.offy),
                            y = this.$context.tY(e.pageX - this.offx, e.pageY - this.offy),
                            m = mp.button;

                        // if dragg events has not been initiated yet generate mouse 
                        // start dragging event
                        if (mp.draggedComponent == null) {

                            // check if zebra mouse moved event has already occurred 
                            // if it is true set mouse dragged target component to the mouse moved target component
                            // otherwise compute the target component basing on mouse moved event location  

                            // !!!!
                            // for the sake of performance $meX(e, this) and $meY(e, this)
                            // methods calls are replaced with direct code

                            var xx = this.$context.tX(mp.pageX - this.offx, mp.pageY - this.offy), 
                                yy = this.$context.tY(mp.pageX - this.offx, mp.pageY - this.offy),
                                d  = (pkg.$mouseMoveOwner == null) ? this.getComponentAt(xx, yy)
                                                                   : pkg.$mouseMoveOwner;
                           
                            // if target component can be detected fire mouse start sragging and 
                            // mouse dragged events to the component  
                            if (d != null && d.isEnabled === true) {
                                mp.draggedComponent = d;

                                ME_STUB.reset(d, ME.DRAGSTARTED, xx, yy, m, 0);
                                EM.performInput(ME_STUB);

                                // if mouse cursor has been moved mouse dragged event has to be generated
                                if (xx != x || yy != y) {
                                    ME_STUB.reset(d, MDRAGGED, x, y, m, 0);
                                    EM.performInput(ME_STUB);
                                }
                            }
                        }
                        else {
                            // the drag event has already occurred before, just send 
                            // next dragged event to target zebra component 
                            ME_STUB.reset(mp.draggedComponent, MDRAGGED, x, y, m, 0);
                            EM.performInput(ME_STUB);
                        }
                    }
                }
                else {
                    // if a mouse button has not been pressed handle the normal mouse moved event

                    // !!!!
                    // for the sake of performance $meX(e, this) and $meY(e, this)
                    // methods calls are replaced with direct code

                    var x = this.$context.tX(e.pageX - this.offx, e.pageY - this.offy),
                        y = this.$context.tY(e.pageX - this.offx, e.pageY - this.offy),
                        d = this.getComponentAt(x, y);

                    if (pkg.$mouseMoveOwner != null) {
                        if (d != pkg.$mouseMoveOwner) {
                            var old = pkg.$mouseMoveOwner;

                            //debug("mouseExited << ", -1);
                            pkg.$mouseMoveOwner = null;
                            ME_STUB.reset(old, MEXITED, x, y, -1, 0);
                            EM.performInput(ME_STUB);

                            if (d != null && d.isEnabled === true) {
                                //debug("mouseEntered >> " , 1);
                                pkg.$mouseMoveOwner = d;
                                ME_STUB.reset(pkg.$mouseMoveOwner, MENTERED, x, y, -1, 0);
                                EM.performInput(ME_STUB);
                            }
                        }
                        else {
                            if (d != null && d.isEnabled) {
                                ME_STUB.reset(d, MMOVED, x, y, -1, 0);
                                EM.performInput(ME_STUB);
                            }
                        }
                    }
                    else {
                        if (d != null && d.isEnabled === true) {
                            //debug("mouseEntered >> ", 1);
                            pkg.$mouseMoveOwner = d;
                            ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                            EM.performInput(ME_STUB);
                        }
                    }
                }
            };

            this.mouseReleased = function(id, e){
                var mp = $mousePressedEvents[id];

                // handle it only if appropriate mouse pressed has occurred 
                if (mp != null && mp.canvas != null) {   
                    var x = $meX(e, this), y = $meY(e, this), po = mp.component;
                   
                    // if a component has been dragged send end dragged event to him to 
                    // complete dragging
                    if (mp.draggedComponent != null){
                        ME_STUB.reset(mp.draggedComponent, ME.DRAGENDED, x, y, mp.button, 0);
                        EM.performInput(ME_STUB);
                    }

                    // mouse pressed has not null target zebra component 
                    // send mouse released and mouse clicked (if necessary)
                    // to him
                    if (po != null) {
                        //debug("mouseReleased ", -1);

                      
                        // generate mouse click if no mouse drag event has been generated
                        if (mp.draggedComponent == null && (e.touch == null || e.touch.group == null)) {
                            ME_STUB.reset(po, ME.CLICKED, x, y, mp.button, mp.clicks);
                            EM.performInput(ME_STUB);
                        }
                        
                        // send mouse released to zebra target component
                        ME_STUB.reset(po, ME.RELEASED, x, y, mp.button, mp.clicks);
                        EM.performInput(ME_STUB);
                    }

                    // mouse released can happen at new location, so move owner has to be corrected
                    // and mouse exited entered event has to be generated. 
                    // the correction takes effect if we have just completed dragging or mouse pressed
                    // event target doesn't match pkg.$mouseMoveOwner   
                    if (zebra.isTouchable === false) {    //!!! mouse entered / exited event cannot be generated for touch screens 
                        var mo = pkg.$mouseMoveOwner;
                        if (mp.draggedComponent != null || (po != null && po != mo)) {
                            var nd = this.getComponentAt(x, y);
                            if (nd != mo) {
                                if (mo != null) {
                                    //debug("mouseExited << ", -1);
                                    ME_STUB.reset(mo, MEXITED, x, y, -1, 0);
                                    EM.performInput(ME_STUB);
                                }

                                if (nd != null && nd.isEnabled === true){
                                    pkg.$mouseMoveOwner = nd;

                                    //debug("mouseEntered >> ", 1);

                                    ME_STUB.reset(nd, MENTERED, x, y, -1, 0);
                                    EM.performInput(ME_STUB);
                                }
                            }
                        }
                    }

                    // release mouse pressed event without removal the event from object
                    // keeping event in object is used to handle double click
                    $mousePressedEvents[id].canvas = null;
                }
            };

            this.mousePressed = function(id, e, button) {
                // release mouse pressed if it has not happened before but was not released
                var mp = $mousePressedEvents[id];
                if (mp != null && mp.canvas != null) {
                    this.mouseReleased(id, mp);
                }

                //debug("mousePressed ", 0);

                // store mouse pressed event 
                var clicks = mp != null && (new Date().getTime() - mp.time) <= pkg.doubleClickDelta ? 2 : 1 ;
                mp = $mousePressedEvents[id] = {
                    pageX       : e.pageX,
                    pageY       : e.pageY,
                    identifier  : id,
                    target      : e.target,
                    canvas      : this,
                    button      : button,
                    component   : null,
                    mouseDragged: null,
                    time        : (new Date()).getTime(),
                    clicks      : clicks
                };

                var x = $meX(e, this), y = $meY(e, this);
                mp.x = x;
                mp.y = y;

                // send mouse event to a layer and test if it has been activated
                for(var i = this.kids.length - 1; i >= 0; i--){
                    var l = this.kids[i];
                    l.layerMousePressed(x, y,button);
                    if (l.isLayerActive && l.isLayerActive(x, y)) break;
                }

                var d = this.getComponentAt(x, y);
                if (d != null && d.isEnabled === true){
                    mp.component = d;
                    ME_STUB.reset(d, ME.PRESSED, x, y, button, clicks);
                    EM.performInput(ME_STUB);
                }

                //!!! this prevent DOM elements selection on the page 
                //!!! this code should be still double checked
                //!!!! THIS CODE BRINGS SOME PROBLEM TO IE. IF CURSOR IN ADDRESS TAB PRESSING ON CANVAS
                //!!!! GIVES FOCUS TO CANVAS BUT KEY EVENT GOES TO ADDRESS BAR 
                //e.preventDefault();

                // on mobile devices this force to leave edit component by grabbing focus from 
                // the editor component (input text field)
                if (document.activeElement != this.canvas) {
                    this.canvas.focus();  
                }
            };

            this.getComponentAt = function(x,y){
                for(var i = this.kids.length; --i >= 0; ){
                    var tl = this.kids[i];
                    if (tl.isLayerActive && tl.isLayerActive(x, y)) {
                        return EM.getEventDestination(tl.getComponentAt(x, y));
                    }
                }
                return null;
            };

            this.recalcOffset = function() {
                // calculate offset
                var poffx = this.offx,
                    poffy = this.offy,
                    ba    = this.canvas.getBoundingClientRect();

                this.offx = ((ba.left + 0.5) | 0) + measure(this.canvas, "padding-left") + window.pageXOffset;
                this.offy = ((ba.top  + 0.5) | 0) + measure(this.canvas, "padding-top" ) + window.pageYOffset;

                if (this.offx != poffx || this.offy != poffy) {
                    this.relocated(this, poffx, poffy);
                }
            };
        },


        function(canvas, w, h) {
            //!!! flag to block wrongly coming double onfocus
            //!!! events 
            this.$focusGainedCounter = 0;

            var pc = canvas, $this = this;

            //  todo ...
            //!!! touch event listeners have to be taking also 
            //    in account
            this.nativeListeners = {
                "onmousemove": null,
                "onmousedown": null,
                "onmouseup": null,
                "onmouseover": null,
                "onmouseout": null,
                "onkeydown": null,
                "onkeyup": null,
                "onkeypress": null
            };

            var addToBody = true;
            if (zebra.isBoolean(canvas)) {
                addToBody = canvas;
                canvas = null;
            }
            else {
                if (zebra.isString(canvas)) { 
                    canvas = document.getElementById(canvas);
                    if (canvas != null && pkg.$detectZCanvas(canvas)) {
                        throw new Error("Canvas id='" + pc + "'' is already in use");
                    }
                }
            }
            
            if (canvas == null) {
                canvas = document.createElement("canvas");
                canvas.setAttribute("class", "zebcanvas");
                canvas.setAttribute("width",  w <= 0 ? "400" : "" + w);
                canvas.setAttribute("height", h <= 0 ? "400" : "" + h);
                canvas.setAttribute("id", pc);
                if (addToBody) document.body.appendChild(canvas);
            }

            //!!! Pay attention IE9 handles padding incorrectly 
            //!!! the padding has to be set to 0px by appropriate 
            //!!! style sheet getPropertySetter
            if (canvas.getAttribute("tabindex") === null) {
                canvas.setAttribute("tabindex", "1");
            }

            /**
             * Keeps rectangular "dirty" area of the canvas component
             * @private
             * @attribute $da
             * @type {Object} 
                    { x:Integer, y:Integer, width:Integer, height:Integer }
             */
            this.$da = { x:0, y:0, width:-1, height:0 };

            /**
             * Reference to HTML Canvas element  where the zebra canvas UI 
             * components are hosted 
             * @protected
             * @readOnly
             * @attribute canvas
             * @type {Canvas}
             */
            this.canvas = canvas; //!!! canvas field  has to be set before super 

            // specify canvas specific layout that stretches all kids to fill the whole canvas area
            this.$super(new pkg.zCanvas.Layout());
        
            for(var i=0; i < pkg.layers.length; i++) {
                var l = pkg.layers[i];
                this.add(l.$new ? l.$new() : l);
            }
        
            if (zebra.isTouchable) {
                new pkg.TouchHandler(canvas, [
                    function $prototype() {
                        this.started = function(e) {
                            ME_STUB.touch          = e;
                            ME_STUB.touches        = this.touches;
                            ME_STUB.touchCounter   = this.touchCounter;
                            $this.mousePressed(e.identifier, e, 
                                               this.touchCounter == 1 ? ME.LEFT_BUTTON 
                                                                      : (e.group && e.group.size == 2 && e.group.index == 1 ? ME.RIGHT_BUTTON : 0)); 
                        };

                        this.ended = function(e) {
                            ME_STUB.touch          = e;
                            ME_STUB.touches        = this.touches;
                            ME_STUB.touchCounter   = this.touchCounter; 
                            $this.mouseReleased(e.identifier, e); 
                        };

                        this.moved = function(e) {
                            ME_STUB.touch          = e;
                            ME_STUB.touches        = this.touches;
                            ME_STUB.touchCounter   = this.touchCounter;
                            $this.mouseMoved(e.identifier, e);  
                        };                    
                    }
                ]);  
            }
            else {
                this.canvas.onmousemove = function(e) { 
                    $this.mouseMoved(1, e);   
                    e.stopPropagation();
                };
                
                this.canvas.onmousedown = function(e) { 
                    $this.mousePressed(1, e, e.button === 0 ? ME.LEFT_BUTTON
                                                            : (e.button == 2 ? ME.RIGHT_BUTTON : 0)); 
                    e.stopPropagation();
                };
                
                this.canvas.onmouseup = function(e) { 
                    $this.mouseReleased(1, e);
                    e.stopPropagation();
                };

                this.canvas.onmouseover = function(e) { 
                    $this.mouseEntered(1, e); 
                    e.stopPropagation();
                };
                
                this.canvas.onmouseout = function(e) { 
                    $this.mouseExited(1, e);  
                    e.stopPropagation();
                };
                
                this.canvas.oncontextmenu = function(e) {
                    e.preventDefault();
                };

                this.canvas.onkeydown = function(e) {
                    $this.keyPressed(e);
                    e.stopPropagation();
                };

                this.canvas.onkeyup = function(e) {
                    $this.keyReleased(e); 
                    e.stopPropagation();
                };
                
                this.canvas.onkeypress = function(e) {
                    $this.keyTyped(e);
                    e.stopPropagation();
                };
            }

            this.canvas.onfocus = function(e) {
                if ($this.$focusGainedCounter++ > 0) {
                    e.preventDefault();
                    return;
                }

                if (pkg.focusManager.canvasFocusGained) {
                    pkg.focusManager.canvasFocusGained($this);
                }
            };
            
            this.canvas.onblur = function(e) {
                //!!! sometimes focus lost comes incorrectly
                //    ignore focus lost if canvas still holds focus
                if (document.activeElement == $this.canvas) {
                    e.preventDefault();
                    return;
                }

                if ($this.$focusGainedCounter !== 0) {
                    $this.$focusGainedCounter = 0;

                    if (pkg.focusManager.canvasFocusLost) {
                        pkg.focusManager.canvasFocusLost($this);
                    }
                }
            };


            var addons = pkg.zCanvas.addons;
            if (addons) {
                for (var i=0; i<addons.length; i++) {
                    (new (Class.forName(addons[i]))()).setup(this);
                }
            }
                  
            // !!!
            // save canvas in list of created Zebra canvas
            // do it before setSize
            $canvases.push(this);

            this.setSize(parseInt(this.canvas.width, 10), 
                         parseInt(this.canvas.height, 10));

            if (this.loadAfterCreated) {
                this.loadAfterCreated();
            }
        },

        function setLocation(x, y) {
            this.canvas.style.top  = y + "px";
            this.canvas.style.left = x + "px";
            this.canvas.style.position = "fixed";  
            this.recalcOffset();
        },

        function setSize(w, h) {
            if (this.width != w || h != this.height) {
                var pw = this.width, ph = this.height;

                this.canvas.style.width  = "" + w  + "px";
                this.canvas.style.height = "" + h + "px";
      
                if (this.$context) {
                    this.$context.reset(w, h);
                }
                else { 
                    this.$context = pkg.$createContext(this.canvas, w, h);
                }

                // take in account that canvas can be visualized on 
                // Retina screen where the size of canvas (backstage)
                // can be less than it is real screen size. Let's 
                // make it match each other
                this.canvas.width  = w * this.$context.$ratio;
                this.canvas.height = h * this.$context.$ratio;

                // again something for Retina screen
                if (this.$context.$ratio != 1) {
                    // call original method
                    this.$context.$scale(this.$context.$ratio, 
                                      this.$context.$ratio);
                }

                this.width = w;
                this.height = h;

                if (zebra.isTouchable) {
                    // the strange fix for Android native browser
                    // that can render text blurry before you click
                    // it happens because the browser auto-fit option 
                    var $this = this;
                    setTimeout(function() {
                        $this.invalidate();
                        $this.validate();
                        $this.repaint();
                    }, 200);  
                }
                else {
                    this.invalidate();
                    this.validate();      
                    this.repaint();
                }

                if (w != pw || h != ph) {
                    this.resized(pw, ph);
                }

                // let know to other zebra canvases that 
                // the size of an element on the page has 
                // been updated and they have to correct 
                // its anchor. 
                elBoundsUpdated();

            }
        },


        function setEnabled(b) {
            if (this.isEnabled != b) {

                // !!!
                // Since disabled state for Canvas element doesn't work
                // we have to emulate it via canvas listeners removal 
                // 
                for(var k in this.nativeListeners ) {
                    if (b) {
                        this.canvas[k] = this.nativeListeners[k];  
                        this.nativeListeners[k] = null;
                    }
                    else {
                        this.nativeListeners[k] = this.canvas[k];  
                        this.canvas[k] = null;            
                    }
                }

                // have to be decided if super has to be called
                //this.$super(b);
            
                this.isEnabled = b;
            }
        },


        function requestFocus() {
            this.canvas.focus();
        }

};



})(zebra("ui"), zebra.Class, zebra.Interface);