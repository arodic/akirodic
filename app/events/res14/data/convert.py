__author__ = 'akira'

import os

import sys
import traceback

from xml.dom.minidom import parse

gpxFiles = ''
gpxPoints = ''

currentmonth = ''
currentFile = False

if __name__ == "__main__":

  dir = os.path.dirname(os.path.realpath(__file__))+"/gpx/"
  files = os.listdir(dir)
  files.sort()

  for file in files:
    if file.endswith(".gpx") or file.endswith(".GPX"):
      try:

        dom = parse(dir + file)
        time = dom.getElementsByTagName('time')[0].firstChild.nodeValue

        date = time[:10].split("-")
        thismonth = date[0]+date[1]

        if thismonth != currentmonth:

          if currentFile:
            currentFile.write('{"points":[\n')
            currentFile.write(gpxPoints[:-2])
            currentFile.write('\n]}')
            currentFile.close()

          gpxFiles += '\t"data/json/'+thismonth+'.json",\n'
          gpxPoints = ''

          currentmonth = thismonth
          currentFile = open(os.path.dirname(os.path.realpath(__file__)) + "/json/"+currentmonth+".json", 'w')
          

        points = dom.getElementsByTagName('trkpt')

        for point in points:

          lat = point.getAttributeNode('lat').nodeValue
          lon = point.getAttributeNode('lon').nodeValue
          
          ele = "0"
          if (point.getElementsByTagName('ele')):
            ele = point.getElementsByTagName('ele')[0].firstChild.nodeValue
          
          time = "0"
          if (point.getElementsByTagName('time')):
            time = point.getElementsByTagName('time')[0].firstChild.nodeValue

          gpxPoints += '\t["'+time+'",'+lat+','+lon+','+ele+'],\n'


      except NameError:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
        print ''.join('!! ' + line for line in lines)  # Log it or whatever here:
        print "failed "+ file

  if currentFile:
    currentFile.write('{"points":[\n')
    currentFile.write(gpxPoints[:-2])
    currentFile.write('\n]}')
    currentFile.close()

  f = open(os.path.dirname(os.path.realpath(__file__)) + "/trackList.json", 'w')
  f.truncate()
  f.write('{"tracks":[\n')
  f.write(gpxFiles[:-2])
  f.write('\n]}')
  f.close()