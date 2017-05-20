var $Request = pkg.$Request = function() {
    this.responseText = this.statusText = "";
    this.onreadystatechange = this.responseXml = null;
    this.readyState = this.status = 0;
};

$Request.prototype.open = function(method, url, async, user, password) {
    if (location.protocol.toLowerCase() == "file:" ||
        (new zebkit.URL(url)).host.toLowerCase() == location.host.toLowerCase())
    {
        this._request = new XMLHttpRequest();
        this._xdomain = false;

        var $this = this;
        this._request.onreadystatechange = function() {
            $this.readyState = $this._request.readyState;
            if ($this._request.readyState == 4) {
                $this.responseText = $this._request.responseText;
                $this.responseXml  = $this._request.responseXml;
                $this.status     = $this._request.status;
                $this.statusText = $this._request.statusText;
            }

            if ($this.onreadystatechange) {
                $this.onreadystatechange();
            }
        };

        return this._request.open(method, url, (async !== false), user, password);
    }
    else {
        this._xdomain = true;
        this._async = (async === true);
        this._request = new XDomainRequest();
        return this._request.open(method, url);
    }
};

$Request.prototype.send = function(data) {
    if (this._xdomain) {
        var originalReq = this._request, $this = this;

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
            return;
        }

        //!!!  short timeout to make sure bloody IE is ready
        setTimeout(function () {
           originalReq.send(data);
        }, 10);
    }
    else  {
        return this._request.send(data);
    }
};

$Request.prototype.abort = function(data) {
    return this._request.abort();
};

$Request.prototype.setRequestHeader = function(name, value) {
    if (this._xdomain) {
        if (name == "Content-Type") {
            //!!!
            // IE8 and IE9 anyway don't take in account the assignment
            // IE8 throws exception every time a value is assigned to
            // the property
            // !!!
            //this._request.contentType = value;
            return;
        }
        else {
            throw new Error("Method 'setRequestHeader' is not supported for " + name);
        }
    }
    else {
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

