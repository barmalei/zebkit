(function(pkg) {

pkg.Output = function() {
    this.print = function(o) { print(this.format(o)); } 
    this.error = function(o) { this.print(o); } 
    this.warn  = function(o) { this.print(o); } 
    this.format = function(o) {
        if (o && o.stack) return [o.toString() + ":",  o.stack.toString()].join("\n");
        if (o == null) return "__null__";
        if (typeof o === "undefined") return "__undefined__";
        return o.toString();
    }
} 

pkg.BrowserOutput = function() {
    pkg.Output.apply(this);
    
    this.print = function(o) { 
        o = this.format(o);
        if (pkg.isIE) alert(o); 
        else console.log(o); 
    } 
    
    this.error = function(o) { 
        o = this.format(o);
        if (pkg.isIE) alert(o); 
        else console.error(o); 
    } 
    
    this.warn  = function(o) { 
        o = this.format(o);
        if (pkg.isIE) alert(o); 
        else console.warn(o); 
    } 
} 

pkg.HtmlOutput = function(element) {
    pkg.BrowserOutput.apply(this);
    element = element || "zebra.out";
    this.el = (element.constructor === String) ? document.getElementById(element) : element;
    if (this.el == null) throw new Error("Unknown HTML output element");
    this.print = function(s) { this.el.innerHTML += "<div class='zebra.out.print'>" + this.format(s) + "</div>"; }
    this.error = function(s) { this.el.innerHTML += "<div class='zebra.out.error' style='color:red;'>" + this.format(s)+ "</div>"; }
    this.warn  = function(s) { this.el.innerHTML += "<div class='zebra.out.warn'  style='color:orange;'>" + this.format(s) + "</div>"; }
} 

pkg.isInBrowser = typeof navigator !== "undefined";
pkg.isIE        = pkg.isInBrowser && /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
pkg.isOpera     = pkg.isInBrowser && !/opera/i.test(navigator.userAgent);
pkg.isChrome    = pkg.isInBrowser && typeof(window.chrome) !== "undefined";
pkg.isSafari    = pkg.isInBrowser && !pkg.isChrome && /Safari/i.test(navigator.userAgent);

pkg.out = pkg.isInBrowser ? new pkg.BrowserOutput() : new pkg.Output();

pkg.env = {};
if (typeof window !== 'undefined') {
    var m = window.location.search.match(/[?&][a-zA-Z0-9_]+=[^?&=]+/g); 
    for(var i=0; m && i < m.length;i++) {
        var l = m[i].split('=');
        pkg.env[l[0].substring(1)] = l[1];
    }
}

})(zebra);
