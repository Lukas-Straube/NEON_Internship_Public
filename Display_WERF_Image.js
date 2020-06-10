var WREF_171004 = ee.Image("users/jnmusinsky/NIS_Images/171004_subset4");

//print(WREF_171004)
Map.addLayer(WREF_171004, {min:1, max:1000, bands:['b53', 'b35', 'b19']},'WREF')
Map.setCenter(-121.7840531635723,45.83971877476468, 15); //WREF

// Create the title label.
var title = ui.Label('Click on map to inspect');
title.style().set('position', 'top-center');
Map.add(title);

// Create a panel to hold the chart.
var panel = ui.Panel();
panel.style().set({
  width: '600px',
  //height: '300px',
  position: 'bottom-right'
});
Map.add(panel);

var zeroPaddingBands = function(geometry) 
{
  var makeSureIDontUseTheOriginal = WREF_171004
  //get list of bandnames
  var bandList =  ee.List(makeSureIDontUseTheOriginal.bandNames())
  //new array
  var indexList = [];
  //get the length of the bandList
  var bandsLength = bandList.length().getInfo()
  //create an array of numbers from [0-length of bandlist]
  for(var i = 0; i != bandsLength; i++) 
    //push all the values into the array
    //indexList.push(String(i)) **** HAS THE STRING ****
    //indexList.push(i)  **** Int does not work ****
    indexList.push(String(("000" + i).slice(-3)));
  //construct a new list with the old list
  indexList = ee.List(indexList)
  //print(indexList)
  //assign new names to all values in the original image, basically remove 'b'
  var fixedImage = makeSureIDontUseTheOriginal.rename(indexList)
  //print(fixedImage)
  //print new chart
  return(ui.Chart.image.regions(fixedImage, geometry, null, 30))
}

// Register a function to draw a chart when a user clicks on the map.
Map.onClick(function(coords) 
{
  //panel.clear();
  
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  
  var coordLoN = coords.lon
  var coordLaT = coords.lat
  
  var coordLoNFixed = coordLoN.toFixed(7)
  var coordLaTFixed = coordLaT.toFixed(7)
  
  var combo = 'Band values for pixel at: '+coordLoNFixed+', '+coordLaTFixed
  
  print(combo)

  var chart = zeroPaddingBands(point);
  
  
  chart.setOptions({title: combo});
  panel.add(chart);
  
});
