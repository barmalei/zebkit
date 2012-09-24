package gravity.zebra.json;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;

public class CrossDomainFilter 
implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException 
    {
        final HttpServletRequest httpRequest = (HttpServletRequest) request;
        final HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.addHeader("Access-Control-Allow-Origin", "*");
        httpResponse.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        httpResponse.addHeader("Access-Control-Allow-Headers", "Content-Type");
        chain.doFilter(request, response);
    }
    
    @Override
    public void destroy() {}

    @Override
    public void init(javax.servlet.FilterConfig conf) {}
}