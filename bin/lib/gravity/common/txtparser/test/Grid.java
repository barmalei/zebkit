package lwc.ui.grid;

public class Grid
extends Panel
{
    public void select (int row, boolean b)
    {
      if (isSelected(row) != b)
      {
        if (isMultiSelectEnabled())
        {
          selected[row] = b?1:0;
          perform (row, 1, b);
          repaintRows(row, row);
        }
        else
        {
          int prev = selectedIndex;
          if (selectedIndex >= 0) clearSelect();
          if (b)
          {
            selectedIndex = row;
            perform (row, 1, b);
            repaintRows(row, prev);
          }
        }
      }
    }

    protected synchronized void perform (int startRow, int len, boolean state)
    {
      if (ssupport != null)
      {
        evStartRow = startRow;
        evLen      = len;
        evState    = state;
        ssupport.iterate (this, -1, this);
      }
    }


    public void actionPerformed(Object src, int id, Object data)
    {
      if (evStartRow >= 0)
        ((SelectListener)data).selected(src, evStartRow, evLen, evState);
      else
        ((SelectListener)data).cleared(src, evState);
    }

    public boolean isSelected (int row) {
      return (selected == null)?row == selectedIndex:selected[row] > 0;
    }

    public void addSelectListener (SelectListener l) {
      if (ssupport != null) ssupport = new ListenerContainer();
      ssupport.addListener (l);
    }

    public void removeSelectListener (SelectListener l) {
      if (ssupport != null) ssupport.removeListener (l);
    }

    public /*C#override*/ boolean canHaveFocus() {
      return editor == null;
    }

   /**
    * Sets the editor provider. The provider is used to define how the specified
    * cell should be edited.
    * @param p the specified editor provider.
    */
    public /*C#virtual*/ void setEditorProvider (EditorProvider p)
    {
      if (p != editors) {
        stopEditing(true);
        editors = p;
      }
    }

    public /*C#virtual*/ EditorProvider getEditorProvider() {
      return editors;
    }

   /**
    * Gets the net mask.
    * @return a net mask.
    */
    public int getNetMask () {
      return (bits & (DRAW_HLINES | DRAW_VLINES));
    }

   /**
    * Sets the specified net mask. The net mask is a bit mask that defines
    * what grid lines should be painted. There are four ways to paint grid lines:
    * <ul>
    *   <li>To paint only horizontal lines. Use DRAW_HLINES bit mask.</li>
    *   <li>To paint only vertical lines. Use DRAW_VLINES bit mask.</li>
    *   <li>To paint vertical and horizontal lines. Use DRAW_VLINES | DRAW_HLINES bit mask.</li>
    *   <li>To paint no lines. Use zero bits mask.</li>
    * </ul>
    * The default net mask is DRAW_VLINES | DRAW_HLINES.
    * @param mask the specified net mask.
    */
    public void setNetMask (int mask)
    {
      if (mask != getNetMask())
      {
        bits = MathBox.getBits(bits, DRAW_HLINES, (mask & DRAW_HLINES) > 0);
        bits = MathBox.getBits(bits, DRAW_VLINES, (mask & DRAW_VLINES) > 0);
        repaint();
      }
    }

   /**
    * Sets the specified grid metric type. There are two metric types:
    * <ul>
    *  <li>
    *    Preferred size metric type.
    *  </li>
    *  <li>
    *    Custom metric type.
    *  </li>
    * </ul>
    * The default metric type is custom metric type.
    * @param b use <code>true</code> to set preferred size metric type;
    *  <code>false</code> to set custom metric type.
    */
    public void usePsMetric (boolean b)
    {
      if (isUsePsMetric() != b)
      {
        bits = MathBox.getBits(bits, USE_PSMETRIC, b);
        vrp();
      }
    }

   /**
    * Tests if the grid uses preferred size to set columns widths
    * and rows heights.
    * @return <code>true</code> if the grid uses preferred size to set columns widths
    * and rows heights.
    */
    public boolean isUsePsMetric() {
      return MathBox.checkBit(bits, USE_PSMETRIC);
    }

   /**
    * Gets the position controller.
    * @return a position controller.
    */
    public PosController getPosController() {
      return controller;
    }

    public void setXORSelection(boolean b)
    {
      if (isXORSelection() != b)
      {
        bits = MathBox.getBits(bits, USE_XORSEL, b);
        repaint();
      }
    }

    public boolean isXORSelection() {
      return MathBox.checkBit(bits, USE_XORSEL);
    }

   /**
    * Sets the position controller. The controller can be set to <code>null</code>, in this
    * case it will be impossible to navigate over the grid component rows.
    * @param p the specified position controller.
    */
    public void setPosController(PosController p)
    {
      if (controller != p)
      {
        if (controller != null) controller.removePosListener(this);
        controller = p;
        if (controller != null)
        {
          controller.addPosListener(this);
          controller.setPosInfo(this);
        }
        repaint();
      }
    }

   /**
    * Gets the data model.
    * @return a data model.
    */
    public MatrixModel getModel () {
      return data;
    }

   /**
    * Gets the view provider.
    * @return a view provider.
    */
    public /*C#virtual*/ GridViewProvider getViewProvider() {
      return provider;
    }

   /**
    * Sets the view provider.
    * @param p the view provider.
    */
    public /*C#virtual*/ void setViewProvider(GridViewProvider p)
    {
      if (provider != p)
      {
        provider = p;
        vrp();
      }
    }

   /**
    * Sets the data model.
    * @param d the data model.
    */
    public /*C#virtual*/ void setModel (MatrixModel d)
    {
      if (d != data)
      {
        clearSelect();

        if (data != null) data.removeMatrixListener(this);
        data = d;
        if (data != null) data.addMatrixListener(this);
        if (controller != null) controller.clearPos();

        if (data != null && selected != null) {
          selected = new int[data.getRows()];
        }

        vrp();
      }
    }

  /**
   * Sets the specified color to render the given element. Use the SEL1_COLOR, SEL2_COLOR
   * or NET_COLOR constant as the type value.
   * @param type the specified element type.
   * @param c the specified color.
   */
    public void setColor (int type, Color c)  {
      colors[type] = c;
      repaint();
    }

   /**
    * Gets the color for the specified element.
    * @param type the specified element type.
    * @return a color.
    */
    public Color getColor (int type) {
      return colors[type];
    }

   /**
    * Gets the grid cells insets. The insets specifies the top, left, bottom and
    * right indents.
    * @return a grid cells insets.
    */
    public Insets getCellInsets () {
      return new Insets (cellInsetsTop, cellInsetsLeft, cellInsetsBottom, cellInsetsRight);
    }

   /**
    * Sets the grid cells insets.
    * @param t the top cell indent.
    * @param l the left cell indent.
    * @param b the bottom cell indent.
    * @param r the right cell indent.
    */
    public void setCellInsets (int t, int l, int b, int r)
    {
      int nt = (t<0)?cellInsetsTop:t, nl = (l<0)?cellInsetsLeft:l;
      int nb = (b<0)?cellInsetsBottom:b, nr = (r<0)?cellInsetsRight:r;

      if (nt != cellInsetsTop    || nl != cellInsetsLeft ||
          nb != cellInsetsBottom || nr != cellInsetsRight    )
      {
        cellInsetsTop    = nt;
        cellInsetsLeft   = nl;
        cellInsetsBottom = nb;
        cellInsetsRight  = nr;
        vrp();
      }
    }

    public void matrixResized(Object target, int prevRows, int prevCols)
    {
      clearSelect();
      if (selected != null) selected = new int[getModel().getRows()];

      vrp();
      if (controller != null) controller.clearPos();
    }

    public void cellModified (Object target, int row, int col, Object prevValue) {
      if (isUsePsMetric()) invalidate();
    }

    public /*C#override*/ void paint(Graphics g)
    {
      vVisibility();
      if (visibility.hasVisibleCells())
      {
        if (!isXORSelection()) paintSelection(g);

        Rectangle r = null;
        if (leftCaption != null ||  topCaption != null)
        {
          r = g.getClipBounds();
          g.clipRect(leftCaption!=null && leftCaption.isVisible()?leftCaption.getX() + leftCaption.getWidth() - dx:r.x,
                     topCaption !=null &&  topCaption.isVisible()?topCaption.getY()  + topCaption.getHeight() - dy:r.y,
                     width, height);
        }
        paintData  (g);
        paintNet (g);
        paintMarker(g);
        if (r != null) g.setClip(r);
      }
    }

    public /*C#override*/ void paintOnTop(Graphics g) {
      if (visibility.hasVisibleCells() && isXORSelection()) paintSelection(g);
    }

    protected /*C#override*/ void laidout()  {
      vVisibility ();
    }

    protected /*C#override*/ void recalc ()
    {
      if (isUsePsMetric()) rPsMetric();
      else                 rCustomMetric();
      rPs();
    }

    public /*C#override*/ void invalidate()
    {
      super.invalidate();
      iColVisibility(0);
      iRowVisibility(0);
    }

    public /*C#virtual*/ void setRowHeight (int row, int h)
    {
      if (!isUsePsMetric())
      {
        validate();
        if (rowHeight(row) != h)
        {
          stopEditing(false);
          psHeight_ += (h - rowHeight(row));
          rowHeights[row] = h;

          updateCashedPs(-1, getTop() + getBottom() + psHeight_ + ((topCaption != null && topCaption.isVisible())?topCaption.getPreferredSize().height:0));
          if (parent != null) parent.invalidate();
          iRowVisibility(0);

          // Invalidate layout
          isValidValue = false;
          repaint();
        }
      }
    }

    public /*C#override*/ boolean isInvalidatedByChild(Component c) {
      return c != editor || isUsePsMetric();
    }

    public /*C#virtual*/ void setColWidth (int col, int w)
    {
      if (!isUsePsMetric())
      {
        validate();
        if (colWidth(col) != w)
        {
          stopEditing(false);

          //???int prevWidth = colWidths[col];

          psWidth_ += (w - colWidth(col));
          colWidths[col] = w;
          updateCashedPs(getRight() + getLeft() + psWidth_ + ((leftCaption != null && leftCaption.isVisible())?leftCaption.getPreferredSize().width:0), -1);
          if (parent != null) parent.invalidate();

          //???iColVisibility((w > prevWidth)?-1:1);
          iColVisibility(0);

          // Invalidate layout
          isValidValue = false;
          repaint();
        }
      }
    }

    public /*C#override*/ Point getOrigin () {
      return new Point (dx, dy);
    }

    public /*C#virtual*/ Point getSOLocation() {
      return getOrigin ();
    }

    public /*C#virtual*/ void setSOLocation(int x, int y)
    {
      if (x != dx || y != dy)
      {
        int offx = x - dx, offy = y - dy;

        if (offx != 0) iColVisibility(offx > 0?1:-1);
        if (offy != 0) iRowVisibility(offy > 0?1:-1);

        dx = x;
        dy = y;

        stopEditing(false);
        repaint();
      }
    }

    public /*C#virtual*/ Dimension getSOSize() {
      return getPreferredSize();
    }

    public boolean moveContent() {
      return true;
    }

    public void setScrollMan (ScrollMan m) {
      man = m;
    }

    public /*C#virtual*/ void mouseClicked (MouseEvent e) {
      if (se(pressedRow, pressedCol, e)) pressedRow = -1;
    }

    public /*C#virtual*/ void mouseReleased(MouseEvent e) {
      if (se(pressedRow, pressedCol, e)) pressedRow = -1;
    }

    public /*C#virtual*/ void mouseEntered (MouseEvent e) {
    }
    public /*C#virtual*/ void mouseExited  (MouseEvent e) {
    }

    public /*C#virtual*/ void mousePressed (MouseEvent e)
    {
      pressedRow = -1;
      if (visibility.hasVisibleCells())
      {
        stopEditing(true);
        if (Toolkit.isActionMask(e.getMask()))
        {
          Point p = cellByLocation(e.getX(), e.getY());
          if (p != null)
          {
            if (controller != null)
            {
              int off = controller.getCurrentLine();
              if (off == p.x) calcOrigin(off, getRowY(off));
              else
              {
                //!!!
                if ((e.getMask() & KeyEvent.CTRL_MASK) == 0) clearSelect();
                controller.setOffset (p.x);
              }
            }

            if (!se(p.x, p.y, e))
            {
              pressedRow = p.x;
              pressedCol = p.y;
            }
          }
        }
      }
    }

    public int getLines() {
      return getGridRows();
    }

    public int getLineSize(int line) {
      return 1;
    }

    public int getMaxOffset() {
      return getGridRows()-1;
    }

    public /*C#virtual*/ void posChanged(Object target, int prevOffset, int prevLine, int prevCol)
    {
      int off = controller.getCurrentLine();
      if (off >= 0)
      {
        int y = getRowY(off);
        calcOrigin(off, y);

        select(off, true);

        /*if (prevOffset >= 0)
        {
          int yy = getRowY(prevOffset);
          repaint (0, Math.min(yy, y) + dy, width, Math.abs(yy - y) + rowHeight(Math.max(off, prevOffset)));
        }
        else*/ repaintRows (prevOffset, off);
      }
    }

    public /*C#virtual*/ void keyPressed(lwc.ui.event.KeyEvent e)
    {
      if (controller != null)
      {
        boolean ctrl = (e.getMask() & KeyEvent.CTRL_MASK) > 0;
        int     cl   = controller.getCurrentLine();
        switch (e.getKeyCode())
        {
          case KeyEvent.VK_LEFT     : controller.seek(-1); break;
          case KeyEvent.VK_UP       : controller.seekLineTo(PosController.UP); break;
          case KeyEvent.VK_RIGHT    : controller.seek(1); break;
          case KeyEvent.VK_DOWN     : controller.seekLineTo(PosController.DOWN); break;
          case KeyEvent.VK_PAGE_UP  : controller.seekLineTo(PosController.UP,   pageSize(-1)); break;
          case KeyEvent.VK_PAGE_DOWN: controller.seekLineTo(PosController.DOWN, pageSize(1)); break;
          case KeyEvent.VK_END      : if (ctrl) controller.setOffset(getLines()-1); break;
          case KeyEvent.VK_HOME     : if (ctrl) controller.setOffset(0); break;
        }
        se(controller.getCurrentLine(), controller.getCurrentCol(), e);

        if (cl != controller.getCurrentLine() && cl >= 0) {
          //!!!!
          for (int i=0; i < getGridRows(); i++) {
            if (i != controller.getCurrentLine()) select (i, false);
          }
        }
      }
    }

    public /*C#virtual*/ void keyReleased(lwc.ui.event.KeyEvent e) {
    }
    public /*C#virtual*/ void keyTyped   (lwc.ui.event.KeyEvent e) {
    }

    public /*C#virtual*/ void layout(LayoutContainer target)
    {
      int topHeight  = (topCaption != null && topCaption.isVisible())?topCaption.getPreferredSize().height:0;
      int leftWidth  = (leftCaption != null && leftCaption.isVisible())?leftCaption.getPreferredSize().width:0;

      if (stub != null && stub.isVisible())
      {
        Dimension stubPs = stub.getPreferredSize();
        leftWidth = Math.max(leftWidth, stubPs.width);
        topHeight = Math.max(topHeight, stubPs.height);
        stub.setSize(leftWidth, topHeight);
        stub.setLocation(getLeft(), getTop());
      }

      if (topCaption != null)
      {
        topCaption.setLocation (getLeft() + leftWidth, getTop());
        topCaption.setSize(Math.min(target.getWidth() - getLeft() - getRight() - leftWidth, psWidth_), topHeight);
      }

      if (leftCaption != null)
      {
        leftCaption.setLocation (getLeft(), getTop() + topHeight);
        leftCaption.setSize(leftWidth, Math.min(target.getHeight() - getTop() - getBottom() - topHeight, psHeight_));
      }

      if (editors != null              && editor != null &&
          editor.getParent() == this && editor.isVisible())
      {
        int w = colWidth(editingCol), h = rowHeight(editingRow);
        int x = getColX_(editingCol), y = getRowY_(editingRow);
        if (isUsePsMetric())
        {
          x += cellInsetsLeft;
          y += cellInsetsTop;
          w -= (cellInsetsLeft + cellInsetsRight);
          h -= (cellInsetsTop  + cellInsetsBottom);
        }

        editor.setLocation(x + dx, y + dy);
        editor.setSize(w, h);
      }
    }

    public /*C#virtual*/ void componentAdded(Object id, Layoutable lw, int index)
    {
      if (TOP_CAPTION_EL.equals(id))
      {
        topCaption = (Component)lw;
        if (lw instanceof GridCaption) {
          ((GridCaption)lw).setup (this, Toolkit.HORIZONTAL);
        }
      }
      else
      if (EDITOR_EL.equals(id)) editor = (Component)lw;
      else
      if (LEFT_CAPTION_EL.equals(id))
      {
        leftCaption = (Component)lw;
        if (lw instanceof GridCaption) {
          ((GridCaption)lw).setup (this, Toolkit.VERTICAL);
        }
      }
      else
      if (STUB_EL.equals(id)) stub = (Component)lw;
    }

    public /*C#virtual*/ void componentRemoved(Layoutable lw, int index)
    {
      if (lw == editor) editor = null;
      else
      if (lw == topCaption) {
        if (lw instanceof GridCaption) ((GridCaption)lw).setup (null, Toolkit.HORIZONTAL);
        topCaption = null;
      }
      else
      if (lw == leftCaption) {
        if (lw instanceof GridCaption) ((GridCaption)lw).setup (null, Toolkit.VERTICAL);
        leftCaption = null;
      }
      else
      if (lw == stub) stub = null;
    }

    public /*C#virtual*/ Dimension calcPreferredSize(LayoutContainer target) {
      return new Dimension (psWidth_  + ((leftCaption != null && leftCaption.isVisible())?leftCaption.getPreferredSize().width:0),
                            psHeight_ + ((topCaption != null && topCaption.isVisible())?topCaption.getPreferredSize().height:0));
    }

    public /*C#virtual*/ int getGridRows() {
      return data != null?data.getRows():0;
    }

    public /*C#virtual*/ int getGridCols() {
      return data != null?data.getCols():0;
    }

    public /*C#virtual*/ int getRowHeight(int row) {
      validate();
      return rowHeight(row);
    }

    public /*C#virtual*/ int getColWidth (int col) {
      validate();
      return colWidth(col);
    }

    public CellsVisibility getCellsVisibility() {
      validate();
      return visibility;
    }

    public int getNetGap() {
      return netSize;
    }

    public /*C#virtual*/ int getColX (int col) {
      validate();
      return getColX_(col);
    }

    private int getColX_ (int col)
    {
      int start = 0, d = 1;
      int x = getLeft() + getLeftCaptionWidth() + netSize;
      if (visibility.hasVisibleCells())
      {
        start = visibility.fc.x;
        x     = visibility.fc.y;
        d     = (col > visibility.fc.x)?1:-1;
      }
      for (int i=start; i != col; x += ((colWidth(i) + netSize)*d), i+=d);
      return x;
    }

    public /*C#virtual*/ int getRowY (int row) {
      validate();
      return getRowY_(row);
    }

    private int getRowY_(int row)
    {
      int start = 0, d = 1;
      int y = getTop() + getTopCaptionHeight() + netSize;
      if (visibility.hasVisibleCells())
      {
        start = visibility.fr.x;
        y     = visibility.fr.y;
        d     = (row > visibility.fr.x)?1:-1;
      }
      for (int i=start; i != row; y += ((rowHeight(i) + netSize)*d), i+=d);
      return y;
    }

    public void childInputEvent(InputEvent e)
    {
      if (e.getID() == KeyEvent.KEY_PRESSED &&
          Toolkit.CANCEL_KEY == Toolkit.getKeyType(((lwc.ui.event.KeyEvent)e).getKeyCode(), ((lwc.ui.event.KeyEvent)e).getMask()))
      {
        stopEditing(false);
      }
    }

    public void childCompEvent(int id, Component c) {
    }
    public void childContEvent(int id, Container p, Object constr, Component c) {
    }

   /**
    * Starts editing of the specified grid cell. The method initiates editing process if
    * the editor provider has been defined for the grid component and the editor component
    * exists.
    * @param row the specified cell row.
    * @param col the specified cell column.
    */
    public /*C#virtual*/ void startEditing (int row, int col)
    {
      stopEditing (true);

      if (editors != null)
      {
        Component editor = editors.getEditor(row, col, getDataToEdit(row, col));
        if (editor != null)
        {
          editingRow = row;
          editingCol = col;
          if (isExternatEditor(row, col, editor))
          {
            Point p = Toolkit.getAbsLocation(getColX(col) + dx, getRowY(row) + dy, this);
            editor.setLocation (p.x, p.y);
            Toolkit.makeFullyVisible(Toolkit.getDesktop(this), editor);
            this.editor = editor;
            Toolkit.getDesktop(this).getLayer (WinLayer.ID).add ( new Object[] { WinLayer.MODAL_WIN, this }, editor);
          }
          else add(EDITOR_EL, editor);
          Toolkit.getFocusManager().requestFocus((Component)editor);
        }
      }
    }

   /**
    * Stops the cell editing. The method has effect if the editing process has been initiated
    * before.
    * @param applyData use <code>true</code> value if the edited data should be
    * applied to data model, use <code>false</code> otherwise.
    */
    public /*C#virtual*/ void stopEditing(boolean applyData)
    {
      if (editors != null && editingRow >= 0 && editingCol >= 0)
      {
        try
        {
          if (editor instanceof Grid) {
            ((Grid)editor).stopEditing (applyData);
          }

          Object data = getDataToEdit(editingRow, editingCol);
          if (applyData)
          {
            setEditedData(editingRow, editingCol,
                          editors.fetchEditedValue (editingRow, editingCol, data, (Component)editor));
          }
          else {
            editors.editingCanceled(editingRow, editingCol, data, (Component)editor);
          }
        }
        finally
        {
          editingRow = -1;
          editingCol = -1;
          if (indexOf(editor) >= 0) remove((Component)editor);
          editor = null;
          requestFocus();
        }
      }
    }

   /**
    * Gets the grid top caption component.
    * @return a grid top caption component.
    */
    public Component getTopCaption() {
      return topCaption;
    }

   /**
    * Gets the grid left caption component.
    * @return a grid left caption component.
    */
    public Component getLeftCaption() {
      return leftCaption;
    }

    public int getXOrigin () {
      return dx;
    }

    public int getYOrigin () {
      return dy;
    }

    public /*C#virtual*/ int getColPSWidth(int col) {
      return getPSSize(col, false);
    }

    public /*C#virtual*/ int getRowPSHeight(int row) {
      return getPSSize(row, true);
    }

    public Point getEditingCell () {
      return (editingRow >= 0 && editingCol >= 0)?new Point(editingRow, editingCol)
                                                 :null;
    }

    public void winOpened(Layer winLayer, Component target, boolean b) {
      if (editor == target && !b) {
        stopEditing(((ExternalEditor)editor).isAccepted());
      }
    }

    public void winActivated(Layer winLayer, Component target, boolean b) {
    }

    public Object getConstraints(Layoutable c)
    {
      if (c == editor     ) return EDITOR_EL;
      if (c == topCaption ) return TOP_CAPTION_EL;
      if (c == leftCaption) return LEFT_CAPTION_EL;
      if (c == stub) return STUB_EL;
      throw new IllegalArgumentException ();
    }

   /**
    * Returns the specified column width. The method is used by all other methods
    * (except recalculation) to get the actual column width.
    * @param col the specified column.
    * @return the specified column width.
    */
    protected /*C#virtual*/ int colWidth (int col) {
      return colWidths[col];
    }

   /**
    * Returns the specified row height. The method is used by all other methods
    * (except recalculation) to get the actual row height.
    * @param row the specified row.
    * @return the specified row height.
    */
    protected /*C#virtual*/ int rowHeight (int row) {
      return rowHeights[row];
    }

   /**
    * Invoked whenever the component wants fetch data from the data model for
    * the specified cell editing.
    * @param row the specified row.
    * @param col the specified column.
    * @return data model value to edit.
    */
    protected /*C#virtual*/ Object getDataToEdit (int row, int col) {
      return data.get(row, col);
    }

   /**
    * Invoked whenever the component wants applies the edited value (for the specified cell)
    * to the grid data model.
    * @param row the specified row.
    * @param col the specified column.
    * @param value the specified edited value.
    */
    protected /*C#virtual*/ void setEditedData (int row, int col, Object value) {
      data.put (row, col, value);
    }

   /**
    * Invoked whenever the component paints the specified cell to fetch data from the
    * grid data model.
    * @param row the specified row.
    * @param col the specified column.
    * @return data to be painted.
    */
    protected /*C#virtual*/ Object dataToPaint (int row, int col) {
      return data.get(row, col);
    }

   /**
    * Calculates the preferred size of the grid component. The method calls
    * <code>colWidth</code> and <code>rowHeight</code> to get actual columns
    * widths and rows heights. The method is called by <code>vMetric</code>
    * method.
    * @return a calculated preferred size;
    */
    private void rPs()
    {
      int cols = getGridCols();
      int rows = getGridRows();
      psWidth_  = netSize * (cols + 1);
      psHeight_ = netSize * (rows + 1);
      for (int i=0; i<cols; i++) { psWidth_  += colWidth(i); }
      for (int i=0; i<rows; i++) { psHeight_ += rowHeight(i);  }
    }

   /**
    * Paints the grid lines.
    * @param g the specified graphics context.
    */
    protected /*C#virtual*/ void paintNet (Graphics g)
    {
      int topX = visibility.fc.y - netSize;
      int topY = visibility.fr.y - netSize;
      int botX = visibility.lc.y + colWidth (visibility.lc.x);
      int botY = visibility.lr.y + rowHeight(visibility.lr.x);

      g.setColor(colors[NET_COLOR]);
      if (MathBox.checkBit(bits, DRAW_HLINES))
      {
        int y = topY;
        for (int i = visibility.fr.x; i <= visibility.lr.x; i++)
        {
          g.drawLine(topX, y, botX, y);
          y += rowHeight(i) + netSize;
        }
        g.drawLine(topX, y, botX, y);
      }

      if (MathBox.checkBit(bits, DRAW_VLINES))
      {
        for (int i = visibility.fc.x; i <= visibility.lc.x; i++)
        {
          g.drawLine(topX, topY, topX, botY);
          topX += colWidth(i) + netSize;
        }
        g.drawLine(topX, topY, topX, botY);
      }
    }

   /**
    * Paints the grid cells.
    * @param g the specified graphics context.
    */
    protected /*C#virtual*/ void paintData (Graphics g)
    {
      int y    = visibility.fr.y + cellInsetsTop;
      int addW = cellInsetsLeft + cellInsetsRight;
      int addH = cellInsetsTop  + cellInsetsBottom;
      Rectangle r = g.getClipBounds();
      Rectangle res = new Rectangle();

      for (int i=visibility.fr.x; i<=visibility.lr.x && y < r.y + r.height; i++)
      {
        if (y + rowHeight(i) > r.y)
        {
          int x = visibility.fc.y + cellInsetsLeft;
          for (int j=visibility.fc.x; j<=visibility.lc.x; j++)
          {
             Color bg = provider.getCellColor(i, j);
             if (bg != null)
             {
               g.setColor(bg);
               g.fillRect(x - cellInsetsLeft, y - cellInsetsTop, colWidth(j), rowHeight(i));
             }

             View v = (i == editingRow && j == editingCol)?null:provider.getView(i, j, dataToPaint(i, j));
             if (v != null)
             {
               int w = colWidth (j) - addW;
               int h = rowHeight(i) - addH;

               MathBox.intersection(x, y, w, h, r.x, r.y, r.width, r.height, res);
               if (res.width > 0 && res.height > 0)
               {
                 g.setClip(res);
                 if (isUsePsMetric() || v.getType() == View.STRETCH) v.paint(g, x, y, w, h, this);
                 else
                 {
                   Dimension ps = v.getPreferredSize();
                   v.paint(g, x + Toolkit.getXLoc(ps.width,  provider.getXAlignment(i, j), w),
                              y + Toolkit.getYLoc(ps.height, provider.getYAlignment(i, j), h),
                              ps.width, ps.height, this);
                 }
                 g.setClip (r);
               }
             }
             x += (colWidth(j) + netSize);
          }
        }
        y += (rowHeight(i) + netSize);
      }
    }

   /**
    * Paints the grid marker.
    * @param g the specified graphics context.
    */
    protected /*C#virtual*/ void paintMarker (Graphics g)
    {
      if (colors[MARKER_COLOR] != null && controller != null &&
          controller.getOffset() >= 0 && hasFocus())
      {
        int offset = controller.getOffset();
        if (offset >= visibility.fr.x && offset <= visibility.lr.x)
        {
          g.clipRect(getLeftCaptionWidth() - dx, getTopCaptionHeight() - dy, width, height);

          g.setColor (colors[MARKER_COLOR]);
          g.drawRect (visibility.fc.y, getRowY(offset),
                      visibility.lc.y - visibility.fc.y + getColWidth(visibility.lc.x) - 1,
                      rowHeight(offset) - 1);
        }
      }
    }

    protected /*C#virtual*/ void paintSelection (Graphics g)
    {
         boolean isXor = isXORSelection();

         //???
         Rectangle r = isXor?null:g.getClipBounds();
         g.clipRect(getLeftCaptionWidth() - dx, getTopCaptionHeight() - dy, width, height);

         for (int j=visibility.fr.x; j<=visibility.lr.x; j++)
         {
           if (isSelected (j))
           {
             int x = visibility.fc.y;
             int y = getRowY(j), h = rowHeight(j);
             for (int i=visibility.fc.x; i<=visibility.lc.x; i++)
             {
               if (i != editingCol || editingRow != j)
               {
                 if (isXor)
                 {
                   Color bg = provider.getCellColor(j, i);
                   if (bg == null) bg = getBackground();
                   Toolkit.drawMarker(g, x, y, colWidth(i), h, bg, colors[hasFocus()?SEL1_COLOR:SEL2_COLOR]);
                 }
                 else
                 {
                   g.setColor(colors[hasFocus()?SEL1_COLOR:SEL2_COLOR]);
                   g.fillRect (x, y, colWidth(i), h);
                 }
               }
               x += colWidth(i) + netSize;
             }
           }
         }
         if (r != null) g.setClip(r);
    }

    protected void repaintRows(int r1, int r2)
    {
      if (r1 < 0) r1 = r2;
      if (r2 < 0) r2 = r1;
      if (r1 > r2)
      {
        int i = r2;
        r2 = r1;
        r1 = i;
      }
      int y1 = getRowY(r1), y2 = (r1 == r2)?y:getRowY(r2) + rowHeight(r2);
      repaint(0, y1 + dy, width, y2 - y1);
    }

    protected /*C#override*/ Layout getDefaultLayout() {
      return this;
    }

   /**
    * Finds and returns grid cell row and column at the specified location.
    * The result is presented with java.awt.Point class where <code>x</code>
    * field corresponds to row and <code>y</code> field corresponds to column.
    * @param x the specified x coordinate.
    * @param y the specified y coordinate.
    * @return a cell at the specified location.
    */
    public /*C#virtual*/ Point cellByLocation(int x, int y)
    {
      validate();
      int ry1 = visibility.fr.y + dy;
      int ry2 = visibility.lr.y + rowHeight(visibility.lr.x) + dy;
      int rx1 = visibility.fc.y + dx;
      int rx2 = visibility.lc.y + colWidth(visibility.lc.x) + dx;

      int row = -1, col = -1;

      if (y > ry1 && y < ry2)
      {
         for (int i = visibility.fr.x; i<=visibility.lr.x; ry1 += rowHeight(i) + netSize, i++)
         {
           if (y > ry1 && y < ry1 + rowHeight(i))
           {
             row = i;
             break;
           }
         }
      }

      if (x > rx1 && x < rx2)
      {
         for (int i = visibility.fc.x; i<=visibility.lc.x; rx1 += colWidth(i) + netSize, i++)
         {
           if (x > rx1 && x < rx1 + colWidth(i))
           {
             col = i;
             break;
           }
         }
      }
      return (col >= 0 && row >=0)?new Point(row, col):null;
    }

   /**
    * Invoked by <code>vMetric</code> method to calculate preferred size metric type.
    */
    protected /*C#virtual*/ void rPsMetric()
    {
      int cols = getGridCols(), rows = getGridRows();
      if (colWidths  == null || colWidths.length  != cols) colWidths  = new int[cols];
      if (rowHeights == null || rowHeights.length != rows) rowHeights = new int[rows];

      int addW = cellInsetsLeft + cellInsetsRight;
      int addH = cellInsetsTop  + cellInsetsBottom;

      for (int i=0; i<cols ;i++) { colWidths [i] = 0; }
      for (int i=0; i<rows ;i++) { rowHeights[i] = 0; }

      for (int i=0; i<cols ;i++)
      {
        for (int j=0; j<rows; j++)
        {
          View v = provider.getView(j, i, data.get(j, i));
          if (v != null)
          {
            Dimension ps = v.getPreferredSize();
            ps.width  += addW;
            ps.height += addH;
            if (ps.width  > colWidths[i] ) colWidths [i] = ps.width;
            if (ps.height > rowHeights[j]) rowHeights[j] = ps.height;
          }
          else
          {
            if (DEF_COLWIDTH  > colWidths [i]) colWidths [i] = DEF_COLWIDTH;
            if (DEF_ROWHEIGHT > rowHeights[j]) rowHeights[j] = DEF_ROWHEIGHT;
          }
        }
      }
    }

    protected /*C#virtual*/ int getPSSize(int rowcol, boolean b)
    {
      if (isUsePsMetric()) return b?getRowHeight(rowcol):getColWidth(rowcol);
      else
      {
        int max = 0, count = b?getGridCols():getGridRows();
        for (int j=0; j<count; j++)
        {
          int r = b?rowcol:j, c = b?j:rowcol;
          View v = provider.getView(r, c, data.get(r, c));
          if (v != null)
          {
            Dimension ps = v.getPreferredSize();
            if (b)
            {
              if (ps.height > max) max = ps.height;
            }
            else if (ps.width > max) max = ps.width;
          }
        }
        return max + netSize*2 + (b?cellInsetsTop + cellInsetsBottom:cellInsetsLeft + cellInsetsRight);
      }
    }

   /**
    * Invoked by <code>vMetric</code> method to calculate custom metric type.
    */
    protected /*C#virtual*/ void rCustomMetric()
    {
      int start = 0;
      if (colWidths != null)
      {
        start = colWidths.length;
        if (colWidths.length != getGridCols())
        {
          int[] na = new int[getGridCols()];
          System.arraycopy(colWidths, 0, na, 0, Math.min(colWidths.length, na.length));
          colWidths = na;
        }
      }
      else colWidths = new int[getGridCols()];
      for (; start<colWidths.length; start++) colWidths[start] = DEF_COLWIDTH;

      start = 0;
      if (rowHeights != null)
      {
        start = rowHeights.length;
        if (rowHeights.length != getGridRows())
        {
          int[] na = new int[getGridRows()];
          System.arraycopy(rowHeights, 0, na, 0, Math.min(rowHeights.length, na.length));
          rowHeights = na;
        }
      }
      else rowHeights = new int[getGridRows()];
      for (;start<rowHeights.length; start++) { rowHeights[start] = DEF_ROWHEIGHT; }
    }

   /**
    * Returns the page size for the specified direction.
    * @param d the specified direction. Use <code>-1</code> value to specify bottom-up direction and
    * <code>1</code> value to specify up-bottom direction.
    * @return a page size.
    */
    protected /*C#virtual*/ int pageSize(int d)
    {
      validate();
      if (visibility.hasVisibleCells())
      {
        int off = controller.getOffset();
        if (off >= 0)
        {
           int hh = visibleArea.height - getTopCaptionHeight();
           int sum = 0, poff = off;
           for (;off >=0 && off < getGridRows() && sum < hh; sum += rowHeight(off) + netSize, off+=d);
           return Math.abs(poff - off);
        }
      }
      return 0;
    }

   /**
    * Invalidates columns visibility properties.
    */
    protected /*C#virtual*/ void iColVisibility(int off) {
      colOffset = (colOffset == 100)?colOffset = off
                                    :((off != colOffset)?0:colOffset);
    }

   /**
    * Invalidates rows visibility properties.
    */
    protected /*C#virtual*/ void iRowVisibility(int off) {
      rowOffset = (rowOffset == 100)?off
                                    :(((off + rowOffset) == 0)?0:rowOffset);
    }

    private Point colVisibility(int col, int x, int d, boolean b)
    {
      int cols = getGridCols();
      if (cols == 0) return null;

      int left = getLeft(), right = getRight();
      int xx1  = Math.min(visibleArea.x + visibleArea.width, width - right);
      int xx2 =  Math.max(left, visibleArea.x + getLeftCaptionWidth());
      for (;col < cols && col >=0; col+=d)
      {
        if (x + dx < xx1 && (x + colWidth(col) + dx) > xx2)
        {
          if (b) return new Point (col, x);
        }
        else if (!b) return colVisibility(col, x, (d > 0?-1:1), true);

        if (d < 0) {
          if (col > 0) x -= (colWidth(col - 1) + netSize);
        }
        else if (col < cols - 1) x += (colWidth(col) + netSize);
      }

      return b?null
              :((d > 0)?new Point(col - 1, x)
                       :new Point(0, left + getLeftCaptionWidth() + netSize));

    }

    private Point rowVisibility(int row, int y, int d, boolean b)
    {
      int rows = getGridRows();
      if (rows == 0) return null;

      int top = getTop(), bottom = getBottom();
      int yy1 = Math.min(visibleArea.y + visibleArea.height, height - bottom);
      int yy2 = Math.max(visibleArea.y, top + getTopCaptionHeight());
      for (;row < rows && row >= 0; row+=d)
      {
        if (y + dy < yy1 && (y + rowHeight(row) + dy) > yy2)
        {
          if (b) return new Point (row, y);
        }
        else if (!b) return rowVisibility(row, y, (d > 0?-1:1), true);

        if (d < 0)  {
          if (row > 0) y -= (rowHeight(row - 1) + netSize);
        }
        else if (row < rows - 1) y += (rowHeight(row) + netSize);
      }

      return b?null
              :((d > 0)?new Point(row - 1, y)
                       :new Point(0, top + getTopCaptionHeight() + netSize));
    }

    private void vVisibility ()
    {
      Rectangle va = cvp(new Rectangle());
      if (va == null)
      {
        visibleArea = null;
        visibility.cancelVisibleCells();
        return;
      }
      else
      {
        if (!va.equals(visibleArea))
        {
          iColVisibility(0);
          iRowVisibility(0);
          visibleArea = va;
        }
      }

      boolean b = visibility.hasVisibleCells();
      if (colOffset != 100)
      {
        if (colOffset > 0 && b)
        {
          visibility.lc = colVisibility(visibility.lc.x, visibility.lc.y, -1, true);
          visibility.fc = colVisibility(visibility.lc.x, visibility.lc.y, -1, false);
        }
        else
        if (colOffset < 0 && b)
        {
          visibility.fc = colVisibility(visibility.fc.x, visibility.fc.y, 1, true);
          visibility.lc = colVisibility(visibility.fc.x, visibility.fc.y, 1, false);
        }
        else
        {
          visibility.fc = colVisibility(0, getLeft() + netSize + getLeftCaptionWidth(), 1, true);
          visibility.lc = (visibility.fc != null)?colVisibility(visibility.fc.x, visibility.fc.y, 1, false)
                                                 :null;
        }
        colOffset = 100;
      }

      if (rowOffset != 100)
      {
        if (rowOffset > 0 && b)
        {
          visibility.lr = rowVisibility(visibility.lr.x, visibility.lr.y, -1, true);
          visibility.fr = rowVisibility(visibility.lr.x, visibility.lr.y, -1, false);
        }
        else
        if (rowOffset < 0 && b)
        {
          visibility.fr = rowVisibility(visibility.fr.x, visibility.fr.y, 1, true);
          visibility.lr = (visibility.fr != null)?rowVisibility(visibility.fr.x, visibility.fr.y, 1, false):null;
        }
        else
        {
          visibility.fr = rowVisibility(0, getTop() + getTopCaptionHeight() + netSize, 1, true);
          visibility.lr = (visibility.fr != null)?rowVisibility(visibility.fr.x, visibility.fr.y, 1, false):null;
        }
        rowOffset = 100;
      }
    }

    private void calcOrigin(int off, int y)
    {
      Insets i = getInsets();
      i.top  += getTopCaptionHeight();
      i.left += getLeftCaptionWidth();
      Point o = Toolkit.calcOrigin(getColX(0) - netSize, y - netSize, psWidth_, rowHeight(off) + 2*netSize, dx, dy, this, i);
      if (man != null) man.moveScrolledObj(o.x, o.y);
      else             setSOLocation(o.x, o.y);
    }

    private boolean se(int row, int col, InputEvent e)
    {
      if (row >= 0)
      {
        stopEditing(true);
        if (editors != null && editors.shouldStartEdit(row, col, e))
        {
          startEditing(row, col);
          return true;
        }
      }
      return false;
    }

   /**
    * Gets the grid top caption component height.
    * @return a grid top caption component height.
    */
    protected int getTopCaptionHeight() {
      return (topCaption != null && topCaption.isVisible())?topCaption.getHeight():0;
    }

   /**
    * Gets the grid left caption component width.
    * @return a grid left caption component width.
    */
    protected int getLeftCaptionWidth() {
      return (leftCaption != null && leftCaption.isVisible())?leftCaption.getWidth():0;
    }

    protected boolean isExternatEditor(int row, int col, Component editor) {
      return (editor instanceof ExternalEditor);
    }

   /**
    * Use preferred size metric bit mask.
    */
    private static final int USE_PSMETRIC = 64;

   /**
    * Use XOR selection.
    */
    private static final int USE_XORSEL   = 512;




}


