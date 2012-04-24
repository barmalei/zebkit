var cached = {};

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft, curtop];
}

function getFileById(id, callback) {
    if (id == "-1") {
        setJavaText("");
        setJSText("");
        return;
    }

    MAP = {
        "hello" :"HelloWorld.java",
        "props" :"ReadPropertiesFile.java",
        "io"    :"ReadFile.java",
        "inheritance":"Inheritance.java",
        "inner" :"InnerClass.java",
        "abstract":"AbstractAndFinal.java"
    };
    
	if (id in cached) {
		callback(id, cached[id]);
		return;
	}
	if (!(id in MAP)) {
	    throw new Error("File '" + id + "' not found ");
	}
	
	
	start_wait("javasrc_container");
	var r = getXmlHttp();
	r.open("GET", "/java/" + MAP[id], true);
	
	r.onreadystatechange = function() {
	 	if (r.readyState == 4) 
		{
			stop_wait();
	     	if(r.status == 200) {
				cached[id] = r.responseText;
				var t = r.responseText;
				if (t && t.indexOf("!Error") == 0) {
					error(t.substring(6));
				}
				else {
					callback(id, r.responseText);
				}
	        }
			else {
				//error(r.statusText + " ("+r.status+")");
			}
	  	}
	};
	r.send(null);
}

function start_wait(target_id) {
	stop_wait(target_id);
	if (!target_id) target_id = "container";
	
	var container = document.getElementById("container");
	var pos       = findPos(container);
	var shimDiv   = document.createElement('div');  
	shimDiv.id = 'wait';  
	shimDiv.style.position = 'absolute';  
	shimDiv.style.top = "" + pos[1] + "px";  
	shimDiv.style.left = "" + pos[0] + "px";  
	shimDiv.style.width = "" + container.offsetWidth + "px";  
	shimDiv.style.height = "" + container.offsetHeight + "px";   
	shimDiv.style.backgroundColor = '#000000'; 
	shimDiv.style.zIndex = 3;
	shimDiv.style.opacity = '0.0';
	shimDiv.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)';

	var rel    = document.getElementById(target_id);
	var img    = document.createElement('img');  
	var relPos = findPos(rel);

	img.id = "wait_img";
	img.style.backgroundColor = '#000000'; 
	img.style.zIndex = 3;
	img.style.position = 'absolute';  
	img.style.left = "" + (relPos[0] + (rel.offsetWidth  - 75)/2 ) + "px";
	img.style.top  = "" + (relPos[1] + (rel.offsetHeight - 75)/2 ) + "px";
	img.setAttribute("src", "wait.gif");

	document.body.appendChild(shimDiv);
	document.body.appendChild(img);
}

function stop_wait() {
	if (document.getElementById("wait")) document.body.removeChild(document.getElementById("wait"));
	if (document.getElementById("wait_img")) document.body.removeChild(document.getElementById("wait_img"));
}

function getXmlHttp(){
  	try {
    	return new ActiveXObject("Msxml2.XMLHTTP");
  	} 
	catch (e) {
    	try {  return new ActiveXObject("Microsoft.XMLHTTP"); } 
		catch (ee) {}
  	}
  	return new XMLHttpRequest();
}

function setMessage(txt) {
	var e = document.getElementById("message");
	e.innerHTML = txt;
}

function setup() {
	if(typeof String.prototype.trim !== 'function') {
	  	String.prototype.trim = function() {
	    	return this.replace(/^\s+|\s+$/g, ''); 
	  	}
	}

	cached = {};
	
	var bt = document.getElementById("convert");
	if (bt.addEventListener) {
		bt.addEventListener('click', convert, true);
	}
	else  {
	   	bt.attachEvent("onclick", convert);
	}
	
	var sl = document.getElementById('select');
	if(sl.addEventListener){
	    sl.addEventListener('change', select, false);
	}
	else {
	    sl.attachEvent('onchange', select, false);
	}
	
	var src = document.getElementById('javasrc');
    if(/^[0-9]+$/.test(src.getAttribute("maxlength"))) { 
      	var func = function() {
        	var len = parseInt(src.getAttribute("maxlength")); 
        	if (src.value.length >= len) {
				setMessage("Java code length is limited to " + len + " characters");
          		src.value = src.value.substr(0, len); 
          		return false; 
        	} 
			else {
				setMessage("");
			}
      	}

		if(src.addEventListener){
		    src.addEventListener('keyup', func, false);
			src.addEventListener('onblur', func, false);
		}
		else {
		   src.attachEvent('onkeyup', func);
		   src.attachEvent('onblur', func);
		}
    } 
	
	sl.selectedIndex = 0;
	setJavaText("");
	setJSText("");
}

function error(msg) {
	alert(msg);
}

function setJavaText(t) {
	document.getElementById("javasrc").value = t;
}

function setJSText(t) {
	var gen = document.getElementById("jscell");
	if (gen.hasChildNodes()) {
	    while (gen.childNodes.length >= 1) {
	        gen.removeChild(gen.firstChild);       
	    } 
	}

	if (t) {
		document.getElementById("jscell").innerHTML =  "<pre id='11'>" + t + "</pre>";
		SyntaxHighlighter.highlight({ "quick-code": false, 
									  "brush"     : "js", 
									  "toolbar"   : false, 
									  "gutter"    : false  }, document.getElementById("11"));	
	}
}

function select() {
	function gotfile(id, content) {
		setJavaText(arguments[1]);
		setJSText(null);
	}
	
	try {
		var sl = document.getElementById('select');
		getFileById(sl.value, gotfile);
	}
	catch(e) {
		stop_wait();
		error(e.toString());
	}
}

function convert() {
	try {
		start_wait("jssrc_container");
		setJSText("");
		
		var src = document.getElementById("javasrc").value;
		if (src.trim().length == 0) {
			throw new Error("Java source code has not been found");
		}

		if (/package\s+[a-zA-Z.\*_0-9]+;/.exec(src) == null) {
			throw new Error("Java package has to be declared");
		}
		
		var r = getXmlHttp(); 
		r.open("POST", "/cgi-bin/j2js.rb", true);
	
		r.onreadystatechange = function() {
		 	if (r.readyState == 4) 
			{
				stop_wait();
				var t = decodeURIComponent(r.responseText);
		     	if(r.status == 200) {
					if (t && t.indexOf("!Error") == 0) {
						error(t.substring(6));
					}
					else {
						setJSText(t);
					}	
		        }
				else {
					//error(r.statusText + " (" +r.status +")");
				}
		  	}
		};
		r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		r.send("javasrc=" + encodeURIComponent(src));
	}
	catch(e) {
		stop_wait();
		error(e.toString());
	}
}

