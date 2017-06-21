(function() {

    /**
     * WEB environment implementation. Provides elementary API zebkit needs to perform an
     * environment specific operations.
     * @class environment
     * @access package
     */
    var zebkitEnvironment = function() {
        var pkg    = {},
            hostRe = /([a-zA-Z]+)\:\/\/([^/:]+)/,
            isFF   = typeof navigator !== 'undefined' &&
                     navigator.userAgent.toLowerCase().indexOf('firefox') >= 0;
        function $sleep() {
            var r = new XMLHttpRequest(),
                t = (new Date()).getTime().toString(),
                i = window.location.toString().lastIndexOf("?");
            r.open('GET', window.location + (i > 0 ? "&" : "?") + t, false);
            r.send(null);
        }

        function $Request() {
            this.responseText = this.statusText = "";
            this.onreadystatechange = this.responseXml = null;
            this.readyState = this.status = 0;
        }

        $Request.prototype.open = function(method, url, async, user, password) {
            var m = url.match(hostRe);
            if (window.location.scheme.toLowerCase() === "file:" ||
                  (m           !== null &&
                   typeof m[2] !== 'undefined' &&
                   m[2].toLowerCase() === window.location.host.toLowerCase()))
            {
                this._request = new XMLHttpRequest();
                this._xdomain = false;

                var $this = this;
                this._request.onreadystatechange = function() {
                    $this.readyState = $this._request.readyState;
                    if ($this._request.readyState === 4) {
                        $this.responseText = $this._request.responseText;
                        $this.responseXml  = $this._request.responseXml;
                        $this.status       = $this._request.status;
                        $this.statusText   = $this._request.statusText;
                    }

                    if ($this.onreadystatechange) {
                        $this.onreadystatechange();
                    }
                };

                return this._request.open(method, url, (async !== false), user, password);
            } else {
                this._xdomain = true;
                this._async = (async === true);
                this._request = new XDomainRequest();
                return this._request.open(method, url);
            }
        };

        $Request.prototype.send = function(data) {
            if (this._xdomain) {
                var originalReq = this._request,
                    $this       = this;

                //!!!! handler has to be defined after
                //!!!! open method has been called and all
                //!!!! four handlers have to be defined
                originalReq.ontimeout = originalReq.onprogress = function () {};

                originalReq.onerror = function() {
                    $this.readyState = 4;
                    $this.status = 404;
                    if ($this._async && $this.onreadystatechange) {
                        $this.onreadystatechange();
                    }
                };

                originalReq.onload  = function() {
                    $this.readyState = 4;
                    $this.status = 200;

                    if ($this._async && $this.onreadystatechange) {
                        $this.onreadystatechange(originalReq.responseText, originalReq);
                    }
                };

                //!!! set time out zero to prevent data lost
                originalReq.timeout = 0;

                if (this._async === false) {
                    originalReq.send(data);

                    while (this.status === 0) {
                        pkg.$sleep();
                    }

                    this.readyState = 4;
                    this.responseText = originalReq.responseText;

                } else {
                    //!!!  short timeout to make sure bloody IE is ready
                    setTimeout(function () {
                       originalReq.send(data);
                    }, 10);
                }
            } else  {
                return this._request.send(data);
            }
        };

        $Request.prototype.abort = function(data) {
            return this._request.abort();
        };

        $Request.prototype.setRequestHeader = function(name, value) {
            if (this._xdomain) {
                if (name === "Content-Type") {
                    //!!!
                    // IE8 and IE9 anyway don't take in account the assignment
                    // IE8 throws exception every time a value is assigned to
                    // the property
                    // !!!
                    //this._request.contentType = value;
                    return;
                } else {
                    throw new Error("Method 'setRequestHeader' is not supported for " + name);
                }
            } else {
                this._request.setRequestHeader(name, value);
            }
        };

        $Request.prototype.getResponseHeader = function(name) {
            if (this._xdomain) {
                throw new Error("Method is not supported");
            }
            return this._request.getResponseHeader(name);
        };

        $Request.prototype.getAllResponseHeaders = function() {
            if (this._xdomain) {
                throw new Error("Method is not supported");
            }
            return this._request.getAllResponseHeaders();
        };

        pkg.getHttpRequest = function() {
            if (typeof XMLHttpRequest !== "undefined") {
                var r = new XMLHttpRequest();

                if (isFF) {
                    r.__send = r.send;
                    r.send = function(data) {
                        // !!! FF can throw NS_ERROR_FAILURE exception instead of
                        // !!! returning 404 File Not Found HTTP error code
                        // !!! No request status, statusText are defined in this case
                        try { return this.__send(data); }
                        catch(e) {
                            if (!e.message || e.message.toUpperCase().indexOf("NS_ERROR_FAILURE") < 0) {
                                // exception has to be re-instantiate to be Error class instance
                                throw new Error(e.toString());
                            }
                        }
                    };
                }
                return ("withCredentials" in r) ? r  // CORS is supported out of box
                                                : new $Request(); // IE
            }
            throw new Error("Archaic browser detected");
        };

        pkg.parseXML = function(s) {
            function rmws(node) {
                if (node.childNodes !== null) {
                    for (var i = node.childNodes.length; i-- > 0;) {
                        var child= node.childNodes[i];
                        if (child.nodeType === 3 && child.data.match(/^\s*$/) !== null) {
                            node.removeChild(child);
                        }

                        if (child.nodeType === 1) {
                            rmws(child);
                        }
                    }
                }
                return node;
            }

            if (typeof DOMParser !== "undefined") {
                return rmws((new DOMParser()).parseFromString(s, "text/xml"));
            } else {
                for (var n in { "Microsoft.XMLDOM":0, "MSXML2.DOMDocument":1, "MSXML.DOMDocument":2 }) {
                    var p = null;
                    try {
                        p = new ActiveXObject(n);
                        p.async = false;
                    } catch (e) {
                        continue;
                    }

                    if (p === null) {
                        throw new Error("XML parser is not available");
                    }
                    p.loadXML(s);
                    return p;
                }
            }
            throw new Error("No XML parser is available");
        };

        /**
         * Loads an image by the given URL.
         * @param  {String|HTMLImageElement} img an image URL or image object
         * @param  {Function} ready a call back method to be notified when the image has been completely
         * loaded or failed. The method gets three parameters

            - an URL to the image
            - boolean loading result. true means success
            - an image that has been loaded

        * @example
            // load image
            zebkit.environment.loadImage("test.png", function(image) {
                 // handle loaded image
                 ...
            }, function (img, exception) {
                // handle error
                ...
            });
         * @return {HTMLImageElement}  an image
         * @for  zebkit.web
         * @method  loadImage
         */
        pkg.loadImage = function(ph, success, error) {
            var img = null;
            if (ph instanceof Image) {
                img = ph;
            } else {
                img = new Image();
                img.crossOrigin = '';
                img.crossOrigin ='anonymous';
                img.src = ph;
            }

            if (img.complete === true && img.naturalWidth !== 0) {
                success.call(this, img);
            } else {
                var pErr  = img.onerror,
                    pLoad = img.onload,
                    $this = this;

                img.onerror = function(e) {
                    img.onerror = null;
                    try {
                        if (typeof error !== 'undefined') {
                            error.call($this, img, new Error("Image '" + ph + "' cannot be loaded " + e));
                        }
                    } finally {
                        if (typeof pErr === 'function') {
                            img.onerror = pErr;
                            pErr.call(this, e);
                        }
                    }
                };

                img.onload  = function(e) {
                    img.onload = null;
                    try {
                        success.call($this, img);
                    } finally {
                        if (typeof pLoad === 'function') {
                            img.onload = pLoad;
                            pLoad.call(this, e);
                        }
                    }
                };
            }

            return img;
        };

        pkg.parseJSON = JSON.parse;

        pkg.stringifyJSON = JSON.stringify;

        pkg.setInterval = function (cb, time) {
            return window.setInterval(cb, time);
        };

        pkg.clearInterval = function (id) {
            return window.clearInterval(id);
        };

        if (typeof window !== 'undefined') {
            var $taskMethod = window.requestAnimationFrame       ||
                              window.webkitRequestAnimationFrame ||
                              window.mozRequestAnimationFrame    ||
                              function(callback) { return setTimeout(callback, 35); };

            pkg.decodeURIComponent = window.decodeURIComponent;
            pkg.encodeURIComponent = window.encodeURIComponent;

        } else {
            pkg.decodeURIComponent = function(s) { return s; } ;
            pkg.encodeURIComponent = function(s) { return s; } ;
        }

        /**
         * Request to run a method as an animation task.
         * @param  {Function} f the task body method
         * @method  animate
         * @for  zebkit.web
         */
        pkg.animate = function(f){
            return $taskMethod.call(window, f);
        };

        function buildFontHelpers() {
            //  font metrics API
            var e = document.getElementById("zebkit.fm");
            if (e === null) {
                e = document.createElement("div");
                e.setAttribute("id", "zebkit.fm");  // !!! position fixed below allows to avoid 1px size in HTML layout for "zebkit.fm" element
                e.setAttribute("style", "visibility:hidden;line-height:0;height:1px;vertical-align:baseline;position:fixed;");
                e.innerHTML = "<span id='zebkit.fm.text' style='display:inline;vertical-align:baseline;'>&nbsp;</span>" +
                              "<img id='zebkit.fm.image' style='width:1px;height:1px;display:inline;vertical-align:baseline;' width='1' height='1'/>";
                document.body.appendChild(e);
            }
            var $fmCanvas = document.createElement("canvas").getContext("2d"),
                $fmText   = document.getElementById("zebkit.fm.text"),
                $fmImage  = document.getElementById("zebkit.fm.image");

            $fmImage.onload = function() {
                // TODO: hope the base64 specified image load synchronously and
                // checking it with "join()"
            };

            // set 1x1 transparent picture
            $fmImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII%3D';

            pkg.fontMeasure = $fmCanvas;

            pkg.fontStringWidth = function(font, str) {
                if (str.length === 0) {
                    return 0;
                } else {
                    if ($fmCanvas.font !== font) {
                        $fmCanvas.font = font;
                    }
                    return ($fmCanvas.measureText(str).width + 0.5) | 0;
                }
            };

            pkg.fontMetrics = function(font) {
                if ($fmText.style.font !== font) {
                    $fmText.style.font = font;
                }

                var height = $fmText.offsetHeight;
                //!!!
                // Something weird is going sometimes in IE10 !
                // Sometimes the property offsetHeight is 0 but
                // second attempt to access to the property gives
                // proper result
                if (height === 0) {
                    height = $fmText.offsetHeight;
                }

                return {
                    height : height,
                    ascent : $fmImage.offsetTop - $fmText.offsetTop + 1
                };
            };
        }

        if (typeof document !== 'undefined') {
            document.addEventListener("DOMContentLoaded", buildFontHelpers);
        }

        return pkg;
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports.zebkitEnvironment = zebkitEnvironment;

        // TODO:
        // typeof the only way to make environment visible is makling it global
        // since module cannot be applied in the ase of browser context
        if (typeof global !== 'undefined') {
            global.zebkitEnvironment = zebkitEnvironment;
        }
    } else {
        window.zebkitEnvironment = zebkitEnvironment;
    }
})();