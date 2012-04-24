package test;

public abstract class AbstractAndFinal
{
    public int amount, balance;
    
    public final void prepare () {
        amount = 10;
        balance = 20;
    }
    
    public int doit() {
        prepare();
        return calculate();
    }

    public abstract int calculate();

    public static void main(String[] args) 
    {
        AbstractAndFinal c = new AbstractAndFinal() {
            public int calculate() {
                return this.amount + this.balance;
            }
        };
        System.out.println(c.doit());
    }
}