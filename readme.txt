Zebra alpha/prototype version

Functionality
=============

  * [+] Zebra Java to JavaScript converter Ruby code
  * [+] Zebra easy OOP concept JavaScript implementation
  * [+] Zebra HTML5 Canvas based UI
  * [-] Zebra JS XML
  * [-] Zebra XML-RPC DataBus XML
  * [-] Zebra XML UI Form builder
  
Requirements 
============

- Java to JavaScript converter requires Ruby and Treetop PEG parse to be installed

Installation 
============

No particular installation steps are required, except installation of TreeTop PEG parser


Run demos and samples
=====================

1. Zebra HTML5 Canvas based UI:
   - Open terminal
   - Go to zebra home directory
   - Run small python HTTP server on your PC:
      $ python startup.py
   - Open "http://localhost:8080/web/uidemo"
   - Enjoy Zebra UI WEB Demo 

2. Run Java to JavaScript converter sample:
	- Pay attention TreeTop PEG parser has been installed 
	- Open terminal
	- Go to zebra home directory
	- Run, for instance, the following command:
	    $ ruby -Ilib samples/j2js/j2js.converter.rb  samples/j2js/ReadFile.java 
	- Find generated "ReadFile.java.js" and "ReadFile.java.html" files in current directory

License 
=======		

-- General Public License (GPL)
 
Contact
=======

WEB: http://zebra.gravitysoft.org, http://www.gravitysoft.org
e-mail: vish@gravitysoft.org
