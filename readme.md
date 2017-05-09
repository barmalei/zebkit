
![ScreenShot](http://repo.zebkit.org/zebkit.logo.png)

## Requirements 

Zebkit works in MS Internet Explorer 9+, MS Edge, FireFox 3+, Safari 5+, Google Chrome. It should support iOS 7+ and Android 4+ mobile browsers.

To build the package install nodejs. To generate zebkit website install jekyll (https://jekyllrb.com/). 

## Installation 

To install required packages run the following: 
```bash
    $ npm install
```

## Building zebkit artifacts

To build Java Script packages:
```bash
   $ gulp
```

To build all artifacts including web site:
```bash
   $ gulp build
```

To generate apidoc:
```bash
   $ gulp apidoc
```

## Run http server and view web site 

```bash
   $ gulp http
```

Open "http://localhost:8090/index.html" in a browser.
