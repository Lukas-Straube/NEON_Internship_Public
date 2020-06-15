# Summer 2020 NEON Remote Internship 

---
## Display_WREF_Image

Lukas Straube

Last Updated: June 9th 2020

Objectives
---
- Understand basic image manipulation
- Utilize Google Earth Engine's (GEE) charting tools
- Be able to create your own charts for any given NEON image

Requirements
---
- Access to GEE software (Accounts require an @gmail.com email address)
- A NEON image to work with (Can be a subset image)

When working with images from NEON it is import to understand what you want to see and do. Important questions to ask yourself are; What image visualization style do I want, Which wavelengths of light will accentuate what I want to see, and other like those.
In this tutorial we will be using a flight line subset from the WREF site.
  
We'll start with just importing the image to a GEE workspace, this can be done in two ways:

1. Directly as seen below, given you have the path to the image
2. By searching for the image at the top of the GEE workspace in the `Search places and datasets...` and clicking import
```javascript
var WREF_171004 = ee.Image("users/jnmusinsky/NIS_Images/171004_subset4");
```
To place the image into the GEE scene is done by adding a layer to the Google Map you see taking up half the scene. To add a new layer is very easy to do. 

The variables that you see below are:

min, max, bands

Which make up what is called visParams or Visual Parameters, there are more of these parameters which can allow you achieve your desired visual effect. There is a benefit in tweaking these however, for the sake of simplicity we will skip these. 

[gain, bias, gamma, palette, opacity, format] If you want to learn about these click [here](https://developers.google.com/earth-engine/image_visualization).
```javascript
var visParams = {
min: 1, 
max: 1000, 
bands: ['b53', 'b35', 'b19']
};
Map.addLayer(WREF_171004, visParams,'WREF');
Map.setCenter(-121.7840531635723,45.83971877476468, 15);
```
min is the value(s) that you want mapped to 0, and max are the value(s) that you mapped to 255. What does this mean? Well, it is a way to force pixels to having either a minimum or maximum brightness. A good baseline for NEON data would be min = 1 and max = 1000, some tweaking can occur to your liking.

When executing the command `Map.addLayer(WREF_171004, visParams,"WREF");` the image needs to be passed in first, then your visual parameters, finally what name you want to be displayed in the Layer Manager. `Map.setCenter(-121.7840531635723,45.83971877476468, 15);` takes a latitude and a longitude as well as zoom level.


Next, we want to create a label so that we can inform users of our code on what they can do, as well as how they can interact with the systems that we will create. This is done simply by adding a `ui.Label` and setting its position on the map display.
```javascript
var title = ui.Label('Click on map to inspect');
title.style().set('position', 'top-center');
Map.add(title);
```
Now to create the skeleton from which the charts will be added to so that we can display the band intensity at a given pixels position on the image.
```javascript
var panel = ui.Panel();
panel.style().set({
  width: "600px",
  position: "bottom-right"
});
Map.add(panel);
```
These parameters can be changed to your liking, positional values are strings that follow the structure above

To continue with charting the data onto a graph it is vital to understand a principle mechanics of the method `ui.Chart.image.regions()`. This method takes an image and generates a graph of band means of the image. In our case we will be limiting it to one pixel. The method takes the points and sorts them alphabetically and in doing so places the bands out of order. Since to a computer the letter 1 is followed by the letter 10, therefore we need to run an algorithm to zero pad the numbers. Basically, 2 goes in and 002 comes out, then the numbers will be sorted in order like you count. 
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

Now that we have an image with the bands in order such that `ui.Chart.image.regions()` can sort the way we want too; we can create a function that will run whenever a point on the map is clicked. In the following code section, you can see that we have a variable called point seen here `var point = ee.Geometry.Point(coords.lon, coords.lat);`. This variable will take the coordinates of the pixel that the cursor was on when the click occurred. The next few lines are to format and arrange the lat and lon coords into a string so that it can be used to title the graph. Finally, the image that we created with `zeroPaddingBands()` can be used to create the chart.

Now to explain what exactly `var chart = ui.Chart.image.regions(fixedImage, point, null, 30)` needs. The four parameters passed in are as follows; an image, a geometry, a reducer, and a scaler. fixedImage is the original image but with the points zero padded, the geometry that we want our graph to be about is the point that we clicked on, the reducer would be default so we made it null instead, and the scale is 30 since the resolution of the image is about 1m^2 per pixel. 

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
Now you should have an image displayed on your map and when you click on a pixel of the image a graph should render telling you the band mean of all 426-band plotted on a line graph.

To add to this, you can add a few more lines so that you can display up to 3 or more graphs at time. By replacing the `panel.clear()` line at the start of the `Map.onClick` with:
```javascript
  if(clickCounter == 3)
  {
    panel.clear()
    clickCounter = 0
  }
  clickCounter++
```
As well as adding `var clickCounter = 0` the line before `Map.onClick` is declared, when clicking you will see that up to three graphs will appear then be cleared and replaced with a new one.

Thank You
---
