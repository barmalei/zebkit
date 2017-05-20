class Bootstrap {
    constructor(path = './zebkit.json') {
        this.path = path;
    }

    boot() {
        this.busy();
        pkg.load(path).then(() => {
            this.ready();
        }.catch((e) => {
            console.log("Config JSON loading failed:" + (e.stack != null ? e.stack : e));
        }
    }

    busy() {

    }

    ready() {
        
    }

    //!!!
    // IE9 has an error: first mouse press formally pass focus to
    // canvas, but actually it doesn't get key events. To fix it
    // it is necessary to pass focus explicitly to window
    if (zebkit.isIE) {
        window.focus();
    }
};