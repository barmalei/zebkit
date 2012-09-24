package gravity.zebra.json;

import java.util.*;
import com.googlecode.jsonrpc4j.*;

interface DummyServerAPI  {
    String   echo(String s);
    int      sum(int a, int b);
    HashMap  objEcho(HashMap obj);
}


public class DummyServer
implements DummyServerAPI
{
    public String echo(String s) {
        return s;
    }

    public int sum(int a, int b) {
        return a + b;
    }

    public HashMap objEcho(HashMap obj) {
        return obj;
    }
}

