"""
extremely simple python script to build zebra.js



uasge: zebra [cmd]:
         clean -> clean build
         loop  -> run in background task mode (zebra.js will 
                  be rebuilt as files are modified)

build can be configured by adding a buildconfig.py file, with the following variables:
  OUTPATH -> Build output directory
"""

import os, sys, os.path, time, random, shelve

try:
  import buildconfig
  buildconfig = dict(buildconfig.__dict__)
  
  print("\nBuild options:")
  for k in buildconfig:
    if k.startswith("_"): continue
    print("  "+k + " = " + str(buildconfig[k]))
  print("\n")
except:
  sys.stderr.write("Warning: Could not load config file!")
  buildconfig = {}

def getcfg(key, default):
  if key in buildconfig: return buildconfig[key]
  else: return default

OUTPATH = getcfg("OUTPATH", ".")
OUTPATH = os.path.normpath(OUTPATH)
OUTPATH = os.path.abspath(OUTPATH)
if not OUTPATH.endswith("/") and not OUTPATH.endswith("\\"):
  OUTPATH += os.path.sep

files = [
  "lib/zebra/easyoop.js",
  "lib/zebra/util.js",
  "lib/zebra/data.js",
  "lib/zebra/io.js",
  "lib/zebra/layout.js",
  "lib/zebra/ui.webstuff.js",
  "lib/zebra/canvas.js",
  "lib/zebra/ui.js",
  "lib/zebra/ui.TextField.js",
  "lib/zebra/ui.list.js",
  "lib/zebra/ui.window.js",
  "lib/zebra/ui.designer.js",
  "lib/zebra/ui.html.js",
  "lib/zebra/ui.tree.js",
  "lib/zebra/ui.grid.js"
];

cmd = ""
if len(sys.argv) > 1:
  cmd = sys.argv[1].lower()

def do_rebuild(files):
  times = []
  db = shelve.open(".pybuild", "c");
  
  ret = 1 if cmd == "clean" else 0
  maxtime = 0
  for f in files:
    if f not in db:
      db[f] = [0]
  
    lasttime = os.stat(f).st_mtime
    times.append(lasttime)
    
    maxtime = max(lasttime, maxtime)
    if db[f][0] < lasttime: 
      print(" - " + f + " was modified")
      ret = 1
  
  if os.path.exists(OUTPATH+"zebra.js"):
    lasttime = os.stat(OUTPATH+"zebra.js").st_mtime
    if lasttime < maxtime:
      ret = 1
      print(" - zebra.js is outdated")
   
  db.close();
  
  if ret: print("\n")
  return ret, times

def update_db(files, times):
  db = shelve.open(".pybuild", "c");

  for i, f in enumerate(files):
    if f not in db:
      db[f] = [0]
    
    db[f] = [times[i]]
    
  db.close();
    
def concat(files):
  concat = b"(function() {\n\n"
  for f in files:
    file = open(f, "rb")
    buf = file.read()
    
    if not buf.endswith(b"\n"):
      buf += b"\n"
      
    concat += buf
    file.close()

  concat += b"\n\n\n\n})();"
  
  print("writing zebra.js. . .");
  file = open(OUTPATH+"zebra.js", "wb");
  file.write(concat);
  file.close()

def build(files):
    rebuild, times = do_rebuild(files)
    if rebuild:
      concat(files)
      update_db(files, times)
      
if cmd == "loop":
  while 1:
    build(files)
    time.sleep(0.5)
else:
  build(files)