package test;

class C
{
    private String a;
    
    public void methodA() {
        a = "ABC";
    }

    public void methodA(int a) {
        methodA();
    }

    public void methodA(int a, int b) {
        methodA(a);
    }
}

public class D
extends C
{
    public void methodA() {
        this.a = "CDE" + super.methodA(); 
    }
    
    public static void main(String[] args) {
        (new D()).methodA(1, 2);
    }
}
