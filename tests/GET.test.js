
if (typeof(XMLHttpRequest) === 'undefined') {
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

if (typeof(zebkit) === "undefined") {
    require('../build/easyoop.js');
    require('../src/js/misc/tools.js');
}

zebkit.package("test", function() {

var assert = zebkit.assert,
    Class = zebkit.Class,
    GET = zebkit.GET,
    assertException = zebkit.assertException,
    assertObjEqual = zebkit.assertObjEqual;


zebkit.runTests("GET test",
    function test_GET() {
        var line = " dsds sad asd asd,s      ";


        var re = /\s+/g, pos = 0, m = null, b = true, tokenEnd = 0, tokenStart = 0, prevStart;
        for(var i = 0; tokenEnd < line.length; i++) {
            if (b) {
                m = re.exec(line)
            }

            prevStart = tokenStart;
            if (m === null) {
                tokenStart = tokenEnd;
                tokenEnd   = line.length;
            } else {
                if (m.index > tokenEnd) {
                    tokenStart = tokenEnd;
                    tokenEnd   = m.index;
                    b = false;
                } else {
                    // spaces found
                    tokenStart = m.index;
                    tokenEnd   = m.index + m[0].length;
                    b = true;
                }
            }

           // console.log("'" + line.substring(tokenStart, tokenEnd) + "'," + line.substring(tokenStart, tokenEnd).length);

            //pos = tokenEnd;

            //al += font.stringWidth(line.substring(tokenStart, tokenEnd));
            // if (al > maxWidth) {
            //      break;
            //      if (i === 0) {
            //
            //      } else {
            //          i--;
            //          tokenStart;
            //      }
            // }
        }
    },

    function test_tt() {
        var Font  = function() {};
        Font.prototype.stringWidth = function(s) {
            return s.length;
        };


        var searchRE = /\s+/g;

        function breakLine(font, maxWidth, line, result) {
            if (line === "") {
                result.push(line);
            } else {
                var len = font.stringWidth(line);
                if (len <= maxWidth) {
                    result.push(line);
                } else {
                    var m   = "not null",
                        b   = true,
                        i   = 0,
                        pos = 0,
                        skip = false,
                        tokenEnd = 0,
                        tokenStart = -1;

                    for(; pos !== line.length; ) {
                        if (skip !== true && m !== null) {
                            if (b) {
                                m = searchRE.exec(line);
                                if (m === null) {
                                    tokenStart = tokenEnd;
                                    tokenEnd   = line.length;
                                }
                            }

                            if (m !== null) {
                                if (m.index > tokenEnd) {
                                    // word token detected
                                    tokenStart = tokenEnd;
                                    tokenEnd   = m.index;
                                    b = false;
                                } else {
                                    // space token detected
                                    tokenStart = m.index;
                                    tokenEnd   = m.index + m[0].length;
                                    b = true;
                                }
                            }
                        }

                        skip = false;

                        al = font.stringWidth(line.substring(pos, tokenEnd));

//                        console.log(">>> token='" + line.substring(tokenStart, tokenEnd) + "', evaluated = '" + line.substring(pos, tokenEnd) +"'" + " " + (al > maxWidth)) ;

                        if (al > maxWidth) {
                            if (i === 0) {
                                result.push(line.substring(pos, tokenEnd));
                                pos = tokenEnd;
                            } else {
                                result.push(line.substring(pos, tokenStart));
                                pos = tokenStart;
                                skip = true;
                                i = 0;
                            }
                        } else {
                            if (tokenEnd === line.length) {
                                result.push(line.substring(pos, tokenEnd));
                                break;
                            } else {
                                i++;
                            }
                        }
                    }
                }
            }
        }

        var font     = new Font(),
            maxWidth = 10,
            line1     = " asda asda  sadsadas asdsadasdasdasdasd    asdasdasdasdasdasd ",
            line2     = " asda asda  sadsadasdasdadas",
            line3     = "sadsadasdasdadas",
            //          0123456789012345678901
            result   = [];

//        console.log(">>> '" + line + "'");


        breakLine(font, maxWidth, line1, result);
        console.log(result);

        result   = [];
        breakLine(font, maxWidth, line2, result);
        console.log(result);

        result   = [];
        breakLine(font, maxWidth, line3, result);
        console.log(result);

    }
);

});