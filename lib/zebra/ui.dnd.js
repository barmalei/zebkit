(function(pkg, Class, Interface) {

pkg.DragAndDropManager = Class(Manager, MouseMotionListener, ActionListener, DragDestination,[
        
        // class defined variables
        $('sources', null);
        $('destinations', null);
        $('dragSrc', null);
        $('dragDest', null);
        $('dragData', null);
        $('dragViewComp', null);
        $('dragView', null);
        $('desktop', null);
        $('oldCursor', null);
        $('graphics', null);
        $('prevX', 0);
        $('prevY', 0);
        $('absLoc', null);
        $('support', null);
        $('paintDrag', false);
        this.ENTERED_DRAG_DEST = 1;
        this.DRAG_STARTED = 2;
        this.DRAG_DROPPED = 3;
        
        // constructors
        $(function (paintDrag){
            this.paintDrag = paintDrag;
            if( ! paintDrag){
                this.dragViewComp = new ViewHolderPan();
            }
        });

        
        // public method
        $(function startDragged(e){
            var source = this.identifyDragSrc(e.getComponent());
            if(source != null && (this.dragData = source.fetchDragData(e.getComponent(), e.getX(), e.getY())) != null){
                this.dragSrc = e.source;
                this.desktop = pkg.findCanvas(this.dragSrc);
                this.oldCursor = pkg.cursor.getCurrentCursor();
                this.prevX = e.getX();
                this.prevY = e.getY();
                this.absLoc = L.getAbsLocation(this.prevX, this.prevY, this.dragSrc);
                this.graphics = this.paintDrag ? pkg.paintManeger.getGraphics(this.desktop) : null;
                this.dragView = source.buildDragView(this.dragSrc, this.prevX, this.prevY, this.dragData);
                this.desktop.setProperty(J2Desktop.CURSOR_PROPERTY, new Cursor(this.getDragCursorType()));
                if(this.support != null)
                    this.support.iterate(this, DragAndDropManager.DRAG_STARTED, null);
                this.handleDest(this.absLoc.x, this.absLoc.y);
                if(this.paintDrag)
                    this.paint(this.graphics, this.absLoc.x, this.absLoc.y, this.desktop, false);
                else{
                    this.dragViewComp.setView(this.dragView);
                    this.dragViewComp.toPreferredSize();
                    this.dragViewComp.setLocation(this.absLoc.x + this.getXOffset(), this.absLoc.y + this.getYOffset());
                    this.desktop.getLayer("win").add(this.dragViewComp);
                }
            }
        });

        $(function actionPerformed(src,id,data){
            if(id == DragAndDropManager.ENTERED_DRAG_DEST){
                (data).dragEnteredDest(this.dragSrc, this.dragDest, this.dragData);
            }
            else
                if(id == DragAndDropManager.DRAG_STARTED){
                    (data).dragStarted(this.dragSrc, this.dragData);
                }
                else
                    if(id == DragAndDropManager.DRAG_DROPPED){
                        (data).dragDropped(this.dragSrc, this.dragDest, this.absLoc.x, this.absLoc.y, this.dragData);
                    }
                    else{
                        throw new Error();
                    }
        });

        $(function endDragged(e){
            if(this.dragSrc != null){
                try{
                    pkg.cursor.setCursor(this.oldCursor);
                    if(this.paintDrag) {
                        this.paint(this.graphics, this.absLoc.x, this.absLoc.y, this.desktop, true);
                    }

                    if(this.dragDest != null){
                        var destination = this.getDragDestination(this.dragDest);
                        var p = Toolkit.getRelLocation(this.absLoc.x, this.absLoc.y, this.dragDest);
                        destination.dragDropped(this.dragSrc, this.dragDest, p.x, p.y, this.dragData);
                        if(zebra.instanceOf(this.dragDest,DragListener))
                            this.actionPerformed(this, DragAndDropManager.DRAG_DROPPED, this.dragDest);
                        if(this.support != null)
                            this.support.iterate(this, DragAndDropManager.DRAG_DROPPED, null);
                    }
                }
                finally{
                    if( ! this.paintDrag){
                        var win = this.desktop.getLayer("win");
                        var index = win.indexOf(this.dragViewComp);
                        if(index >= 0)
                            win.remove(index);
                    }
                    this.dragSrc = null;
                    this.dragDest = null;
                    this.desktop = null;
                    this.dragData = null;
                    this.dragView = null;
                    if(this.graphics != null){
                        this.graphics.setPaintMode();
                        this.graphics.dispose();
                        this.graphics = null;
                    }
                }
            }
        });

        $(function mouseDragged(e){
            if(this.dragSrc != null){
                if(this.paintDrag)
                    this.paint(this.graphics, this.absLoc.x, this.absLoc.y, this.desktop, true);
                this.absLoc.x += (e.getX() - this.prevX);
                this.absLoc.y += (e.getY() - this.prevY);
                this.prevX = e.getX();
                this.prevY = e.getY();
                this.handleDest(this.absLoc.x, this.absLoc.y);
                if(this.paintDrag)
                    this.paint(this.graphics, this.absLoc.x, this.absLoc.y, this.desktop, false);
                else
                    this.dragViewComp.setLocation(this.absLoc.x + this.getXOffset(), this.absLoc.y + this.getYOffset());
            }
        });


        $(function regDragSource(c){
            this.sources = this._reg(this.sources, c, new DefDragSource());
        });

        $(function regDragSource(c,source){
            this.sources = this._reg(this.sources, c, source);
        });

        $(function regDragDestination(c){
            this.destinations = this._reg(this.destinations, c, this);
        });

        $(function regDragDestination(c,dest){
            this.destinations = this._reg(this.destinations, c, dest);
        });

        $(function getDragSource(c){
            return this.sources != null ? this.sources.get(c) : null;
        });

        $(function getDragDestination(c){
            return this.destinations != null ? this.destinations.get(c) : null;
        });

        $(function canDropData(dragSrc,possibleDest,data){
            return true;
        });

        $(function dragDropped(dragSrc,dragDest,x,y,data){
        });

        $(function dragMoved(dragSrc,dragDest,x,y,data){
        });

        $(function getDragView(){
            return this.dragView;
        });

        $(function getDragSrc(){
            return this.dragSrc;
        });

        $(function getDragDest(){
            return this.dragDest;
        });

        $(function getDragData(){
            return this.dragData;
        });

        $(function getDragCursorType(){
            return Cursor.HAND_CURSOR;
        });

        $(function paint(g,x,y,d,paintToRestore){
            if(this.dragView != null){
                g.setXORMode(java.awt.Color.white);
                this.dragView.paint(g, x + this.getXOffset(), y + this.getYOffset(), d);
            }
        });

        $(function findDragDest(d,x,y){
            for(
                var i = d.count() - 1;i >= 0; i -- ){
                var l = d.get(i);
                if(l.count() > 0 && l.isVisible()){
                    var cc = l.getComponentAt(x, y);
                    if(cc != null && cc != l)
                        return this.identifyDragDest(l, x, y);
                }
            }
            return null;
        });

        $(function getCursorLoc(){
            return new Point(this.absLoc);
        });

        $(function identifyDragSrc(c){
            var source = this.getDragSource(c);
            return (source == null && zebra.instanceOf(c,DragSource)) ? c : source;
        });

        $(function identifyDragDest(l,x,y){
            var target = Toolkit.getEventManager().getEventDestination(l.getComponentAt(x, y));
            var destination = this.getDragDestination(target);
            destination = (destination == null && zebra.instanceOf(target,DragDestination)) ? target : destination;
            return (destination != null && destination.canDropData(this.dragSrc, target, this.dragData)) ? target : null;
        });

        $(function getXOffset(){
            return 10;
        });

        $(function getYOffset(){
            return  - 4;
        });

        
        // static methods declaration
        this.getDefManager = function(){
            var dd = Toolkit.getObject("d&d");
            if(dd == null){
                dd = new DragAndDropManager(false);
                Toolkit.getContext().getObjectsBag().putObject("d&d", dd);
            }
            return dd;
        }

        $(function handleDest(x,y){
            var prevDest = this.dragDest;
            this.dragDest = this.findDragDest(this.desktop, x, y);
            if(this.dragDest != prevDest){
                if(zebra.instanceOf(this.dragDest,DragListener))
                    this.actionPerformed(this, DragAndDropManager.ENTERED_DRAG_DEST, this.dragDest);
                if(this.support != null)
                    this.support.iterate(this, DragAndDropManager.ENTERED_DRAG_DEST, null);
            }
            if(this.dragDest != null){
                var p = Toolkit.getRelLocation(x, y, this.dragDest);
                this.getDragDestination(this.dragDest).dragMoved(this.dragSrc, this.dragDest, p.x, p.y, this.dragData);
            }
        });

        $(function _reg(h,c,data){
            if(data == null)
                delete h[c];
            else
                if(h == null)
                    h = {};
            h[c] = data;
            return h;
        });

]);

})(zebra("ui"), zebra.Class, zebra.Interface);