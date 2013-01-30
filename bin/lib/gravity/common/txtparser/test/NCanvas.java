package lwc.ui;

import java.awt.event.FocusEvent;
import java.awt.event.FocusEvent;

/**
 * This class is J2SE and J2ME Personal Profile native canvas (java.awt.Panel)
 * representation.
 */
public class NCanvas
extends java.awt.Panel
{
  private Desktop   desktop;
  private boolean   enableRepaint = true;

 /**
  * Constructs the class instance.
  */
  NCanvas()
  {
    setLayout (null);
    init(this);
    enableEvents (java.awt.AWTEvent.FOCUS_EVENT_MASK);
  }


  synchronized void perform (int startRow, int len, boolean state)
  {
    if (ssupport != null)
    {
      evStartRow = startRow;
      evLen      = len;
      evState    = state;
      ssupport.iterate (this, -1, this);
    }
  }



 /**
  * Invoked when a component gains the keyboard focus.
  */
  protected void processFocusEvent(FocusEvent e) {
    desktop.activate(e.getID() == FocusEvent.FOCUS_GAINED);
  }

  void setDesktop (Desktop d) {
    desktop = d;
  }

  public void doLayout()
  {
    synchronized(PaintManager.LOCKER)
    {
      enableRepaint = false;
      java.awt.Dimension nsize = getSize();
      desktop.setSize (nsize.width, nsize.height);
      desktop.validate();
      enableRepaint = true;
    }
    super.doLayout();
  }

  public void repaint (int x, int y, int w, int h)
  {
    synchronized(PaintManager.LOCKER)
    {
      if (enableRepaint && w > 0 && h > 0)
      {
        enableRepaint = false;
        super.repaint(x, y, w, h);
      }
    }
  }

  public void repaint ()
  {
    synchronized(PaintManager.LOCKER)
    {
      if (enableRepaint)
      {
        enableRepaint = false;
        super.repaint();
      }
    }
  }

  public void update(java.awt.Graphics g) {
    paint(g);
  }

  public void paint (java.awt.Graphics g)
  {
    synchronized (PaintManager.LOCKER)
    {
      if (getParent() != null && getParent().isVisible())
         Toolkit.getPaintManager().startPaint(new Graphics(g), desktop);

      enableRepaint = true;
    }
  }

  public java.awt.Dimension getPreferredSize () {
    return desktop.getPreferredSize();
  }

 /**
  * Returns whether this component can be traversed using Tab or Shift-Tab keyboard
  * focus traversal. If this method returns "false", this component may still
  * request the keyboard focus using requestFocus(), but it will not automatically
  * be assigned focus during tab traversal.
  */
  public boolean isFocusTraversable() {
    return true;
  }

 /**
  * Performs native specific operations for the given native component.
  * @param nc the given native component.
  */
  static void init (java.awt.Component nc)
  {
    //!!!
    // Fix problem with the focus under JDK1.4
    //!!!
    try {
      java.lang.reflect.Method m = nc.getClass().getMethod ("setFocusTraversalKeysEnabled", new Class[] { Boolean.TYPE });
      m.invoke (nc, new Object[] { Boolean.FALSE } );
    }
    catch (NoSuchMethodException e) { }
    catch (Exception e) {
      e.printStackTrace();
    }
  }
}

