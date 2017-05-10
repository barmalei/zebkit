
![ScreenShot](http://repo.zebkit.org/zebkit.logo.png)

## Requirements 

Zebkit works in MS Internet Explorer 9+, MS Edge, FireFox 3+, Safari 5+, Google Chrome. It should support iOS 7+ and Android 4+ mobile browsers.

To build the package install nodejs. To generate zebkit artifacts install jekyll (https://jekyllrb.com/). 

## Installation 

To install required packages run the following: 
```bash
    $ npm install
```

## Building zebkit artifacts

To build main artifacts like JS code, website:
```bash
   $ gulp
```

To build runtime package 
```bash
   $ gulp runtime
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
