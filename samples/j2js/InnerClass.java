package test;

public class InnerClass
{
    static final int DEF_VALUE = 100;
    
    private int value;
    
    public InnerClass() {
        this.value = DEF_VALUE;
    }
    
    public int getValue() {
        return value;
    }
    
    public String[] getStr() {
        return new String[] ;
    }
    
	public static void main(String[] args) {
        InnerClass ic = new InnerClass() {
            public int getValue() {
                return 0;
            }
        };
        
        System.out.println(ic.getValue());
	}
}

