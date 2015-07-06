# you can run this script to rename all gpx files to consistent naming convention based on date and time taken.

__author__ = 'arodic'

import os

import sys
import traceback

from xml.dom.minidom import parse

if __name__ == "__main__":

  dir = os.path.dirname(os.path.realpath(__file__))+"/gpx/"

  for file in os.listdir(dir):
    if file.endswith(".gpx") or file.endswith(".GPX"):

      try:

        dom = parse(dir + file)
        time = dom.getElementsByTagName('time')[0].firstChild.nodeValue

        newFile = time[:10] + ' @ ' + time[11:-1].replace(':', '-') + '.gpx'

        if file != newFile:
          os.rename(dir + file, dir + newFile)
          print 'renamed', dir + file, dir + newFile

      except NameError:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
        print ''.join('!! ' + line for line in lines)  # Log it or whatever here:
        print "failed "+ file