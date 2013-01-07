package test;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.ByteArrayOutputStream;

public class ReadFile
{
    private String path;
    
    public ReadFile(String path) {
        this.path = path;
    }
    
    public String readAsString() 
    throws IOException
    {
        FileInputStream       fi = null;
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        int b = -1;
        try {
            fi = new FileInputStream(this.path);
            while ((b = fi.read()) > 0) {
                bo.write(b);
            }
        }
        finally {
            if (fi != null) fi.close();
        }
        return bo.toString();
    }
    
    public static void main(String[] args) 
    throws IOException
    {
        ReadFile rf = new ReadFile("test.txt");
        System.out.println(rf.readAsString());
    }
}