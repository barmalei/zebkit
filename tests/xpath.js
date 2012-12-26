
if (typeof(zebra) === "undefined") {
    load(arguments[0] + '/lib/zebra/easyoop.js');
    load(arguments[0] + '/lib/zebra/assert.js');
    load(arguments[0] + '/lib/zebra/util.js');
}

var assert = zebra.assert, Class = zebra.Class, assertException = zebra.assertException;

zebra.runTests("Zebra util objects bag",
    function test_emptybag() {
        var tree = {
            name:"test",
            kids:[
                {
                    name:"kid1",
                    a:10,
                    kids:[]
                },
            
                {
                    name:"kid1",
                    a:20,
                    b:109,
                    kids:[]
                },

                {
                    name:"kid2",
                    kids:[
                        {
                            name:"kid2.1",
                            kids:[
                                { name:"kid2.1.1", kids:[], a:10 }
                            ]
                        }
                    ]
                }
            ]
        };



        treeFind(tree, "//*[@a=10]", function(kid) {
            print("............. found : " + kid.name + ',' + kid.b);
           // return true;
        });
    }
);








