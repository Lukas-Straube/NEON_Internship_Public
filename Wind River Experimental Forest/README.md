# Summer 2020 NEON Remote Internship 

---
## Display_WREF_Image

Lukas Straube

Last Updated: July 7th 2020

Objectives
---
- Understand basic image manipulation
- Utilize Google Earth Engine's (GEE) charting tools
- Be able to create your own charts for any given NEON image

Requirements
---
-	Access to GEE software (accounts require a @gmail.com email address)
-	A NEON image to work with (may be a subset of an image)
When working with images from NEON it is import to understand what you want to see and do. Important questions to ask yourself are: What image visualization style do I want, and which wavelengths will accentuate the features I want to see. In this tutorial we will be using a flight line subset from the Wind River Experimental Forest (WREF) site.
We'll start with importing the image to a GEE workspace. This can be done in two ways:
1.	Directly as seen below, given you have the path to the image
2.	By searching for the image at the top of the GEE workspace in the Search places and datasets... and clicking import

```javascript
var WREF_171004 = ee.Image("users/jnmusinsky/NIS_Images/171004_subset4");
```
Adding a new layer to the map window is very easy to do. 
The variables that you see below are:
- min, max, bands:

These make up what are called Visualization Parameters that allow you to achieve your desired visual effect. We will assign them to a new variable called visParams.
```javascript
var visParams = {
min: 1, 
max: 1000, 
bands: ['b53', 'b35', 'b19']
};
Map.addLayer(WREF_171004, visParams,'WREF');
Map.setCenter(-121.7840531635723,45.83971877476468, 15);
```
min is the value(s) that you want mapped to 0, and max is the value(s) that you map to 255. What does this mean? Well, it is a way to force pixels into a specified range of minimum and maximum brightness. A good baseline for NEON data would be min = 1 and max = 1000; you can then tweak these values to your liking.

When executing the command Map.addLayer(WREF_171004, visParams,"WREF"); the image name needs to be specified first, then the visual parameters, and finally the name you would like to be displayed in the Layer Manager in the map window. Map.setCenter(-121.7840531635723,45.83971877476468, 15); specifies the latitude and a longitude as well as the zoom level you would like to use for centering and then displaying the image.

Next, we want to add a button with a label in the map window, enabling users to interact with the layer we added to the map. This is done using a function called ui.Label and setting its position on the map display.

```javascript
var title = ui.Label('Click on map to inspect');
title.style().set('position', 'top-center');
Map.add(title);
```
Now we create the framework in which a chart will be added that displays the wavelengths of the pixels at specific locations on the image that we select with our mouse. The y-axis will be the band mean value and the x-axis will be the band name.
```javascript
var panel = ui.Panel();
panel.style().set({
  width: "600px",
  position: "bottom-right"
});
Map.add(panel);
```
These parameters can be changed to your liking; positional values are strings that follow the structure above.

To continue with plotting the data onto a graph it is important to understand the mechanics of the function ui.Chart.image.regions(). This function takes an image and generates a graph of band means of the image. In our case we will be limiting it to one pixel. The function takes the bands and sorts them alphabetically and in doing so places the bands out of order. Since to a computer the letter 1 is followed by the letter 10, we need to run an algorithm to zero pad the numbers. Basically, 2 goes in and 002 comes out, and then the numbers will be sorted in the order that you count.

```javascript
var zeroPaddingBands = function() 
{
  var copyOfOriginal = WREF_171004
  
  //get list of band names
  var bandList =  ee.List(copyOfOriginal.bandNames());
  
  //new array
  var indexList = [];
  
  //get the length of the bandList
  var bandsLength = bandList.length().getInfo();
  
  //create an array of numbers from [0-length of bandlist];
  for(var i = 0; i != bandsLength; i++)
  
    //push all the values into the array
    //as well as adding the padding to them
    indexList.push(String(("000" + i).slice(-3)));
    
  //construct a new list with the old list
  indexList = ee.List(indexList);

  //assign new names to all values in the original image, basically remove 'b'
  var fixedImage = copyOfOriginal.rename(indexList);
  
  //return the fixed image
  return(fixedImage);
}
```

Now that we have an image with the bands in order such that ui.Chart.image.regions() is sorted the way we want, we can create a function that will run whenever a point on the map is clicked. In the following code section, you can see that we have a variable called point, seen here var point = ee.Geometry.Point(coords.lon, coords.lat);. This variable will take the coordinates of the pixel that the cursor was on when the mouse clicks occurred. The next few lines format and arrange the latitude and longitude coordinates into a string so that can be used to title the graph. Finally, the image that we created with zeroPaddingBands() is used to create the chart.

Now, to explain what exactly var chart = ui.Chart.image.regions(fixedImage, point, null, 30) needs. The four parameters passed in are as follows: an image, a geometry, a reducer, and a scaler. fixedImage is the original image, but with the band names zero padded. The geometry is the point that we clicked on. We are not using a reducer, so we use a default of null instead. The scale is set to 30 since this correctly displays the results as values between 1 and 10,000.

```javascript
Map.onClick(function(coords) 
{
  panel.clear();

  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var coordLon = coords.lon;
  var coordLat = coords.lat;
  var coordLonFixed = coordLon.toFixed(7);
  var coordLatFixed = coordLat.toFixed(7);
  var coordLatLonCombo = 'Band values for pixel at: '+coordLonFixed+', '+coordLatFixed;

  var fixedImage = zeroPaddingBands();
  
  var chart = ui.Chart.image.regions(fixedImage, point, null, 30);
  
  chart.setOptions({title: coordLatLonCombo});
  
  panel.add(chart);

});
```
Now you should have an image displayed on your map and when you click on a pixel of the image a graph should render telling you the band values for all 426-band plotted on a line graph.

You can add a few more lines so that you can display up to 3 or more graphs at time. By replacing the panel.clear() line at the start of the Map.onClick with:

```javascript
  if(clickCounter == 3)
  {
    panel.clear()
    clickCounter = 0
  }
  clickCounter++
```
As well as adding var clickCounter = 0 to the line before Map.onClick is declared, when clicking you will see that up to three graphs will appear, and then all will be cleared and replaced with a new one.

Thank You
---
