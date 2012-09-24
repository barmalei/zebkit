package gravity.zebra.json;

import javax.servlet.*;
import javax.servlet.http.*;
import com.googlecode.jsonrpc4j.*;

public class RPCServlet
extends HttpServlet 
{
    private JsonRpcServer jsonRpcServer;

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        try {
            System.out.println("DO_POST");
            jsonRpcServer.handle(req, resp);
        }
        catch(java.io.IOException e) {
            e.printStackTrace();
        }
    }

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        try {
            jsonRpcServer.handle(req, resp);
        }
        catch(java.io.IOException e) {
            e.printStackTrace();
        }
    }

    public void init(ServletConfig config) 
    {
        try {
            this.jsonRpcServer = new JsonRpcServer(Class.forName(config.getInitParameter("server")).newInstance(), 
                                                    DummyServer.class);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }
}