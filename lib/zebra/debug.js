(function(pkg, Class) {

var HTTP = zebra.io.HTTP;

    var original = zebra.out;

    pkg.RemoteOutput = Class(pkg.Output, [
        function(url) {
            this.http   = new HTTP(url);
            this.apikey = "19751975";
            this.buffer = [];
        },

        function $prototype() {
            this.query = function(cmd,args) {
                var s = "apikey=" + this.apikey + "&command=" + cmd;
                if (args != null) {
                    for(var k in args) s += "&" + k + "=" + args[k];
                }
                return s;
            };

            this.print = function(s,f) { this.out("info", s,f);    };
            this.error = function(s,f) { this.out("error", s,f);   };
            this.warn  = function(s,f) { this.out("warning", s,f); };

            this.out = function(l, s, f) {

                if (f == null) {
                    this.buffer.push({ level: l, message: s, time:(new Date()).toString() });

                    if (this.buffer.length == 1) {
                        var $this = this;
                        this.$timer = setTimeout(function() {
                            $this.$timer = null;

                            var q = $this.query("log", {});
                            for(var i=0; i < $this.buffer.length; i++) {
                                q   += "&level=" + $this.buffer[i]["level"];
                                q   += "&message=" +  $this.buffer[i]["message"];
                                q   += "&time=" + $this.buffer[i]["time"];
                            }
                            $this.buffer.length= 0;

                            var r = $this.http.POST(q).split("\n");
                            if (parseInt(r[0], 10) < 0) throw new Error(r[1]);
                        }, 2500);
                    }
                }
                else {
                    this.http.POST(this.query("log", { "level"  : l, "message": s, "time": (new Date()).toString() }),
                                    function(result, req) {
                                        var r = result.split("\n");
                                        if (parseInt(r[0], 10) < 0) throw new Error(r[1]);
                                        f(r);
                                    }
                    );
                }
            };

            this.tail = function(l) {
                var s = this.query("tail", { startline:l }),
                    r = this.http.GET(s).split("\n"),
                    c = parseInt(r[0].split(" ")[0], 10);

                if (c < 0) {
                    throw new Error(r[1]);
                }

                r.shift();
                r.pop();
                return r;
            };

            this.clear = function() {
                var r = this.http.POST(this.query("clear")).split("\n");
                if (parseInt(r[0],10) < 0) {
                    throw new Error(r[1]);
                }
            };
        }
    ]);

    pkg.trace = function(methodName, instance, callback) {
        if (instance[methodName] == "function") {
            throw new Error("Invalid method");
        }

        var $original = instance[methodName],
            $wrapper  = function() {
                try {
                    if (callback) callback.before(methodName, arguments);
                    $original.apply(instance, arguments);
                    if (callback) callback.after(methodName, arguments);
                }
                catch(ee) { zebra.out.error("methodName:" + ee.toString()); }
            };

        for(var k in $original) {
            $wrapper[k] = $original[k];
        }

        instance[methodName] = $wrapper;
    };

})(zebra, zebra.Class);