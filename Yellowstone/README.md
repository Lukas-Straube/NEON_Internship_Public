# Summer 2020 NEON Remote Internship 

---
## YELL_Data_Explorations

Lukas Straube

Last Updated: July 7th 2020

## Objectives
---
-	Understand intermediate image manipulation
-	Utilize Google Earth Engine's (GEE) image visualization tools
-	Create your own EVI since GEE does not have a built in function for it

## Requirements
---
-	Access to GEE software (accounts require an @gmail.com email address)
-	A NEON image to work with (can be a subset of an image)
-	An intermediate understanding of JavaScript
-	Familiarity with Landsat 8

To begin this tutorial we must first upload a data set, in this case a mosaic of 2018 spectrometer data from the Yellowstone Northern Range (Frog Rock).
```javascript
var YELL = ee.Image("users/jadler/asset_20200204025808999");
```
Once uploaded, the first thing we want to do is display an RGB subset that enables us to see what the entire image looks like. Displaying the image requires two lines of code. (see [WREF](https://github.com/Lukas-Straube/NEON_Internship_Public/tree/master/Wind%20River%20Experimental%20Forest) for a more in-depth discussion).

We also need to specify the center of the map using latitude and longitude coordinates, and an appropriate zoom level that allows the image to fill the screen. We can then display the image in one step by specifying a selection of bands that produce a true color composite parameter, as well as a title (“RGB”). 
```javascript
Map.setCenter(-110.51996,44.9198,12);
Map.addLayer(YELL,{min:1,max:1000, bands:["band53","band35","band19"]},"RGB");
```
When we run this code in GEE, the image should look like this:

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/RGB%20YELL.PNG)

---

Before we display the image as a false color composite, please note that there is an easier method than that shown here. However, for the purpose of practicing with GEE we will demonstrate a slightly more involved process that will help us when we want to create NDVI and EVI images.

To start, we create a function that selects the bands corresponding to the wavelengths that are equivalent to those used when generating a false color image from Landsat data. With the NEON spectrometer data, these are bands 96, 56 and 37.

```javascript
var falseColor = function()
{
  var NIR_Band = YELL.select("band96");
  var RED_Band = YELL.select("band56");
  var GREEN_Band = YELL.select("band37");
};
```
Next we need to combine the bands into a single image so that they can be displayed as well as further manipulated. Within the same falseColor function we will combine them using `image.addBands(image);`. This can be seen here:
```javascript
  var falseColorImage = NIR_Band.addBands(RED_Band);
  falseColorImage = falseColorImage.addBands(GREEN_Band);
```
In the second line we did a coding 'trick' in which we are reassigning the variable of falseColorImage to itself plus the GREEN_Band. It is a little confusing, but helps us save lines and makes the code a little cleaner.

The final step is to create the image parameters and display a new map layer. The newest parameter that we are using is gamma. This changes the relative brightness of each pixel for each band value. We are using three bands and therefore have three gamma values. In lay terms, the NIR_Band will be a little bit darker while the RED and GREEN bands will be a little bit brighter.

```javascript
  var vizParams = {min: 1, max: 6000, gamma: [0.95, 1.3, 1.5]};
  Map.addLayer(falseColorImage, vizParams,"False Color");
```
All that’s left is to call the falseColor function by adding falseColor() to the end of the script, and when we run it the image should look like this:

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/FalseColor%20YELL.PNG)

---
Using the knowledge of how to build an image from multiple images we can move on to a more advanced image resampling technique, creating a Normalized Difference Vegetation Index (NDVI) for the entire image. The steps required to accomplish this are as follows:

- Select the bands that we want
- Calculate and NDVI
- Displaying the image

The first step is a little bit more complicated than just using YELL.select("band96");, since we want to create a an image whose components are derived from more than just one wavelength, matching the wavelengths covered by the spectral bands used in a Landsat 8 NDVI. To accomplish this, we need to delve into the working of GEE's Reducers. These are a group of functions and helpers that allow us to take large quantities of data and compress or reduce them down into more manageable chunks. 

We will be using image.reduce(Reducer); to take the mean band values for each pixel from a range of spectrometer bands that correspond to Landsat bands 4 (red) and 5 (near-IR). To limit the amount of redundant typing required, we create a dictionary and helper function to convert the spectrometer data into an accurate NDVI. 

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
- Landsat 8_B10 and B11 are not in the dictionary since NEON’s hyperspectral imager is not designed to capture those thermal wavelengths.

Why do we need these two tools? It is to avoid having to write and remember the NEON hyperspectral bands that are associated with the more commonly used multispectral Landsat 8 bands. (More Landsat version dictionaries are found here.) Now that we have the ability to select a large number of bands within a range quickly, we can take the average of the NIR and RED bands to create an NDVI of the Yellowstone data, substituting the Landsat 8 bands ranges with the corresponding NIS bands. We start by selecting the NIS bands that correspond to the NIR and Red bands in Landsat 8 using the dictionary and the helper function.

```javascript
var NDVI = function()
{
  var RED_Bands = YELL.select(bandRange(LandsatToNIS["Landsat8_B4"]));
  var NIR_Bands = YELL.select(bandRange(LandsatToNIS["Landsat8_B5"]));
};
```
The next step is to reduce the bands so that we are left with one value for the NIR and RED bands. This is done with `image.reduce(ee.Reducer.mean())`. This function, provided by GEE, creates a new single-band image and renames it to 'mean'. This is not very useful since we lose information, therefore we rename the band in the following line.
```javascript
  var NIR_Image = NIR_Bands.reduce(ee.Reducer.mean());
  NIR_Image = NIR_Image.rename(["NIR"]);

  var RED_Image = RED_Bands.reduce(ee.Reducer.mean());
  RED_Image = RED_Image.rename(["RED"]);
```
Now that we have the images with their reduced values, we can use the same tactic as above to combine the images.

```javascript
  var both_NIR_and_R = NIR_Image.addBands(RED_Image);
```

The final two steps are to run the NDVI and then display the image as a new map layer. To run an NDVI is quite simple, since there is a "built in" function that GEE has to create it for us it’s called: `normalizedDifference(["first","second"])`. This can all be done in one line and quite simply.

```javascript
  var NDVI = both_NIR_and_RED.normalizedDifference(["NIR","RED"]);
```

Since an NDVI takes the NIR band and RED band and combines them into a value range of -1 to 1 can use those to create our image visualization. In addition to this min and max we will also be implementing a color palette into our visualization. The palette will be blue, brown and white. You can use Hex color values or HTML color names the colors will correspond to a color ramp which will use the colors to highlight different areas within the image. The algorithm of how a color is chosen for a given pixel is determined by its intensity, the higher the intensity the more likely the right most color will be chosen and viscera.

```javascript
  Map.centerObject(YELL, 12);
  var ndviViz={min:-0.5, max:1,palette:['blue', 'brown', 'white']};
  Map.addLayer(NDVI, ndviViz,"NDVI");
```

The final image when calling `NDVI();` should look like this:

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/NDVI%20YELL.PNG)

---

### The most advanced image rendering for this tutorial will be an EVI which requires the following steps:

-	Select and combine the bands that we need corresponding to Landsat 8: B5, B4, and B2 
-	Create the equation and plug in values
-	Display the image

The first step is quite simple; we have done this four times now. In addition to selecting bands we will be taking the mean value of the selected bands and renaming them.
```javascript
  var EVI = function()
  {
  //Select the NIR bands that correlate with Landsat8's NIR bands
  var NIR_Bands = YELL.select(bandRange(LandsatToNIS["Landsat8_B5"]))
  
  //Reduce the image so that we take an average of value of the bands
  var NIR_Image = NIR_Bands.reduce(ee.Reducer.mean());
  
  //Rename the band so that it is not "mean"
  NIR_Image = NIR_Image.rename(["NIR"]);
  
  //Select the NIR bands that correlate with Landsat8's RED bands
  var RED_Bands = YELL.select(bandRange(LandsatToNIS["Landsat8_B4"]))
  
  //Reduce the image so that we take an average of value of the bands
  var RED_Image = RED_Bands.reduce(ee.Reducer.mean());
  
  //Rename the band so that it is not "mean"
  RED_Image = RED_Image.rename(["RED"]);
  
  //Select the NIR bands that correlate with Landsat8's BLUE bands
  var BLUE_Bands = YELL.select(bandRange(LandsatToNIS["Landsat8_B2"]))
  
  //Reduce the image so that we take an average of value of the bands
  var BLUE_Image = BLUE_Bands.reduce(ee.Reducer.mean());
  
  //Rename the band so that it is not "mean"
  BLUE_Image = BLUE_Image.rename(["BLUE"]);
  
  //Collect the images into a new image so that it can be processed
  var imageCombination = BLUE_Image.addBands(RED_Image);
  imageCombination = imageCombination.addBands(NIR_Image)
  };
```
The next step is creating the equation. !Disclaimer! I will be using the coefficients adopted in the MODIS-EVI algorithm. If you prefer to use different EVI coefficients then just tweak the values in the equation. Another point is that of EVI scaling: since the data provided is not scaled to the appropriate size we need to multiply the resulting values by a factor of 0.0001. This is because the values inside the image are too large to be used by the equation below, so hence a scaling factor is needed.
```javascript
  var EVI_Image = imageCombination.expression
  (
      'G * ((NIR - RED) / (NIR + C1 * RED - C2 * BLUE + L))', 
      {
        'NIR': imageCombination.select('NIR').multiply(0.0001).float(),
        'RED': imageCombination.select('RED').multiply(0.0001).float(),
        'BLUE': imageCombination.select('BLUE').multiply(0.0001).float(),
        'G':2.5,
        'C1':6.0,
        'C2':7.5,
        'L':1.0
      }
  );
```

As you can see above, the values of `G, C1, C2, and L` are coefficients that you can change to fit your research needs.

Finally, we want to display the image on the map and call the function EVI(); and having done this at least 3 times now we just need to follow the same steps. A point to note is that you can have two different versions, one where you include negative values and one where you omit them. This can be done by changing min to -1 or 0. The color ramp used is customizable, but the example below uses a beige to a dark green color ramp.

```javascript
  Map.centerObject(YELL, 12);
  Map.addLayer(EVI_Image, {min: -1, max: 1, palette: ['EBDED4', '0A2003']}, "EVI" );
  //Map.addLayer(EVI_Image, {min: 0, max: 1, palette: ['EBDED4', '0A2003']}, "EVI" );
```
The final image should look like this (includes negative values).

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/YELL%20EVI.PNG)

---
### As a bonus I will cover two additional topics, an NDVI diffrencing as well as a spacial reduction to a region

To reduce an image to be bounded by a shape file or a set of geomerties drawn by you, is quite simple. You just need to add the line `image.clip(geomerty)` when you are diplaying the image. In this example I am using the EVI image and want to bind it to a rectange that I drew.
```javascript
  Map.addLayer(EVI_Image.clip(rectangle), {min: -1, max: 1, palette: ['EBDED4', '0A2003']}, "EVI" );
```
Where `rectangle` is a geomertry that I drew within GEE and is imported at the top of the code. Since creating the geomerty with code is not really useful since you will be using shape files anywanys there is no point to adding it here.

Finally the NDVI differencing, the process is the same as a normal NDVI however, we need to have two images. They need to be of the same place and at diffrent times. This is where a shape files would be useful since NEON flight paths are usually not the exact same year to year but clipping the image to a specific region is required. Once you have the two NDVI's the process from the first part of the tutorial. We need to do an advanced manuever;
```javascript
var NDVI_Change = ndvi1.subtract(ndvi2)
```
So now that you have the diffrence you just need to display the diffrence like so;
```javascript
Map.addLayer(NDVI_Change, { min:-0.3, max: 0.3, palette: [ 'FFFFFF', '0000FF', 'FF0000']}, "Changes of NDVI  from XXXX to YYYY" );
```
Reminder, the images need to be over lapping. You can do this with images that dont overlap however, it'll just be blank.

## Thanks














