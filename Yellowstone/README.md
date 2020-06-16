# Summer 2020 NEON Remote Internship 

---
## YELL_Data_Explorations

Lukas Straube

Last Updated: June 15th 2020

Objectives
---
- Understand intermediate image manipulation
- Utilize Google Earth Engine's (GEE) image visualation tools
- Creating your own EVI since GEE does not have a built in function for it

Requirements
---
- Access to GEE software (Accounts require an @gmail.com email address)
- A NEON image to work with (Can be a subset image)
- An intermediate understanding of JavaScript
- Familiarity with Landsat8

To start with this tutorial we must first upload a data set. For this one we will be using the Yellowstone Northern Range (Frog Rock). Start by uploading the image.
```javascript
var YELL = ee.Image("users/jadler/asset_20200204025808999");
```
Once uploaded the first thing we want to do is display an RGB image so that we can see what the image looks like. To display the image is simply two lines. I go more indepth in the previous tutroial. See [WREF](https://github.com/Lukas-Straube/NEON_Internship_Public/tree/master/Wind%20River%20Experimental%20Forest).

We need to initalize the center of the map in lat and lon. As well as the zoom.
Then we need to place the image with its parameters and title, all done in one step
```javascript
Map.setCenter(-110.51996,44.9198,12);
Map.addLayer(YELL,{min:1,max:1000, bands:["band53","band35","band19"]},"RGB");
```
Once ran in GEE it should look like this:

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/RGB%20YELL.PNG)

---
Now we get into the new stuff. 

To display a new image with the intent to make it a false color composite it is important to know that there is an easier way than what I am showing here. However, for the purpose of learning how to use GEE and the tools provided I will take the longer way. This will help us when we want to make an NDVI image and especially when we want to make an EVI image.

To start we will need to select the bands of light that make up a false color image. For simplicity sake, given I will be going more indepth later about this, they are bands 96, 56 and 37. 
Here we have our function decleration as well as the first step, selecting the bands.
```javascript
var falseColor = function()
{
  var NIR_Band = YELL.select("band96");
  var RED_Band = YELL.select("band56");
  var GREEN_Band = YELL.select("band37");
};
```
The next we need to combine the images into a single image so that it can be displayed as well as further manipulated. Within the same function a.k.a falsecolor we will combine them using `image.addBands(image);`. This can be seen here:
```javascript
  var falseColorImage = NIR_Band.addBands(RED_Band);
  falseColorImage = falseColorImage.addBands(GREEN_Band);
```
In the second line we did coding 'trick' in which we are reassigning the variable of `falseColorImage` to itself + the GREEN_Band. It is a little confusing but helps us save lines and makes out code a little bit cleaner.

The final step is to create the image parameters and display a new map layer. The newest parameter that we are using is gamma, what it does is change the reletive brightness of each pixel for each band value. We are using three bands and therefore we have three gamma values. In laymans terms the NIR_Band will be a little bit darker while RED and GREEN bands will be a little bit brighter.
```javascript
  var vizParams = {min: 1, max: 6000, gamma: [0.95, 1.3, 1.5]};
  Map.addLayer(falseColor, vizParams,"False Color");
```
All thats left is to call the falseColor function by adding `falseColor()` to the end of the file and the image should look like this:

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/FalseColor%20YELL.PNG)

---
With the knowledge of how to build an image from multiple images we can move on to a more advanced image resampling technique, creating an NDVI for the entire image. 
The steps required to accomplish this are as follows:

- Select the bands that we want
- Prefroming and NDVI
- Displaying the image

The first step is a little bit more complicated than just using `YELL.select("band96");`, since we want to create a an image takes more than just one wavelength. This will give use more acccurate information. To accomplish this we need to delve into the working of GEE's Reducers. 
These are a group of function and helpers that will allow us to take large quantites of data and compress or reduce it down into more manageable chunks. We will be using `image.reduce(Reducer);` to help us take the mean band values for each pixel and create a new image.
To help lower the amount of redundent typing I have created a dictonary and helper function which easily converts Landsat8 bands to NIS data which can be used to create more accurate NDVI's. 
The two parts can be seen here:
```javascript
var LandsatToNIS = 
{
  "Landsat8_B1":[10,16],"Landsat8_B2":[16,28],"Landsat8_B3":[30,44],
  "Landsat8_B4":[52,58],"Landsat8_B5":[94,100],"Landsat8_B6":[237,255],
  "Landsat8_B7":[345,382],"Landsat8_B8":[24,61],"Landsat8_B9":[197,201]
};

/*
  The function below is used to take an array of two numbers and return an array with a lenght of the diffrence of 
  the two numbers passed in. The value that this brings is that it lowers the amount of typing it takes to 
  select a large amount of bands with in a given range of values. This method is not useful for selected 
  disparent bands and should not be used to select two individual bands.
*/

var bandRange = function(array)
{
  //Take the first index in the array and set it to be start
  var start = array[0];
  //Take the second index in the array and set it to be start
  var end = array[1];
  
  //Create an empty array to be returned
  var bands = [];
  //loop as many times as there are values between start and end
  for (var i = start; i <= end; i++) 
  {
    //push strings in the form 'band' + i into the array bands
    bands.push('band'+ i);
  }
  //return the new array to the function that called it
  return bands;
};
```
- Landsat8_B10 and B11 are not in the dictonary since the cameras at NEON are not equiped to capture those wavelengths.

So why do we need these two tools. Well, it is so that we avoid having to write and remember the NEON bands that are associated with the more commonly use Landsat8 bands. [More Landsat version dictionaries are here.](www.google.com)
Now that we have the abality a large amount of bands within a range quickly, we can use that to take the average of the NIR and RED bands to create an NDVI of the Yellowstone data, with Landsat8 bands ranges but NIS bands.
We start with selecting the images that we want, in this case we want NIS bands that are in the NIR and Red bands for Landsat8 this is done with the dictonary and the helper function.
```javascript
var NDVI = function()
{
  var RED_Bands = YELL.select(bandRange(LandsatToNIS["Landsat4"]));
  var NIR_Bands = YELL.select(bandRange(LandsatToNIS["Landsat5"]));
};
```
The next step is to reduce the images so that we are left with one value for the NIR and RED bands. This is done with `image.reduce(ee.Reducer.mean())`. This function provided by GEE creates a new image and names the band to 'mean'. This is not very useful since we lose information, therefore we rename the band in the following line.
```javascript
  var NIR_Image = NIR_Bands.reduce(ee.Reducer.mean());
  NIR_Image = NIR_Image.rename(["NIR"]);

  var RED_Image = RED_Bands.reduce(ee.Reducer.mean());
  RED_Image = RED_Image.rename(["RED"]);
```
Now that we have the images with their reduced values we can use the same tactic as above to combine the images.
```javascript
  var both_NIR_and_R = NIR_Image.addBands(RED_Image);
```
The final two steps are to run the NDVI and then display the image as a new map layer. To run an NDVI is quite simple, since there is a "built in" function that GEE has to create it for us. its called `.normalizedDifference(["first","second"])`. This can all be done in one line and quite simply.
```javascript
  var NDVI = both_NIR_and_RED.normalizedDifference(["NIR","RED"]);
```
Since an NDVI takes the NIR band and RED band and combines them into a value range of -1 to 1 can use those to create our image visualization. In addition to this min and max we will also be implementing a color palette into our visualization. The palette will be blue, brown and white. You can use Hex color values or HTML color names
The colors will correspond to a color ramp which will use the colors to highlight diffrent areas within the image. The algrothim of how a color is chosen for a given pixel is determined by its intensity, the higher the intensity the more likely the right most color will be chosen and visersa. 
```javascript
  Map.centerObject(YELL, 12);
  var ndviViz={min:-0.5, max:1,palette:['blue', 'brown', 'white']};
  Map.addLayer(NDVI, ndviViz,"NDVI");
```
The final image when calling `NDVI();` should look like this:

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/NDVI%20YELL.PNG)

---

The most advanced image rendering for this tutorial will be an EVI which requires the following steps:
- 
- 
- 









