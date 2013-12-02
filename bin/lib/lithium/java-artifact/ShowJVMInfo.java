package lithium.java;



public class ShowJVMInfo
{
  public static void main (String[] args) {
    System.out.println(System.getProperties().getProperty("java.version"));
    System.out.println(System.getProperties().getProperty("java.home"));
  }
}



