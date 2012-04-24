package test;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class ReadPropertiesFile
{
    private Properties props = null;
    
    public ReadPropertiesFile(String path) 
    throws IOException
    {
        this.props = new Properties();
        this.props.load(new FileInputStream(path));
    }
    
    public Properties getProperties() {
        return this.props;
    }
    
    public static void main(String[] args) 
    throws IOException
    {
        ReadPropertiesFile rf = new ReadPropertiesFile("test.properties");
        System.out.println(rf.getProperties().toString());
    }
}