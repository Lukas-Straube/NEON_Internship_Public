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

To start with this tutorial we must first upload a data set. For this one we will be using the Yellowstone Northern Range (Frog Rock). Start by uploading the image.
```javascript
var YELL = ee.Image("users/jadler/asset_20200204025808999");
```
Once uploaded the first thing we want to do is display an RGB image so that we can see what the image looks like. To display the image is simply two lines. I go more indepth in the previous tutroial. See [WREF](https://github.com/Lukas-Straube/NEON_Internship_Public/tree/master/Wind%20River%20Experimental%20Forest).

We need to initalize the center of the map in lat and lon. As well as the zoom.
Then we need to place the image with its parameters and title, all done in one step
```javascript
Map.setCenter(-110.51996,44.9198,12)
Map.addLayer(YELL,{min:1,max:1000, bands:["band53","band35","band19"]},"RGB")
```
Once ran in GEE it should look like this

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/RGB%20YELL.PNG)

---
Now we get into the new stuff. 

To display a new image with the intent to make it a false color composite it is important to know that there is an easier way than what I am showing here. However, for the purpose of learning how to use GEE and the tools provided I will take the longer way. This will help us when we want to make an NDVI image and especially when we want to make an EVI image.

To start we will need to select the bands of light that make up a false color image. For simplicity sake, given I will be going more indepth later about this, they are bands 96, 56 and 37. 
Here we have our function decleration as well as the first step, selecting the bands.
```javascript
var falseColor = function()
{
  var NIR_Band = YELL.select("band96")
  var RED_Band = YELL.select("band56")
  var GREEN_Band = YELL.select("band37")
}
```
The next we need to combine the images into a single image so that it can be displayed as well as further manipulated. Within the same function a.k.a falsecolor we will combine them using `image.addBands(image)`. This can be seen here:
```javascript
  var falseColorImage = NIR_Band.addBands(RED_Band)
  falseColorImage = falseColorImage.addBands(GREEN_Band)
```
In the second line we did coding 'trick' in which we are reassigning the variable of `falseColorImage` to itself + the GREEN_Band. It is a little confusing but helps us save lines and makes out code a little bit cleaner.

The final step is to create the image parameters and display a new map layer. The newest parameter that we are using is gamma, what it does is change the reletive brightness of each pixel for each band value. We are using three bands and therefore we have three gamma values. In laymans terms the NIR_Band will be a little bit darker while RED and GREEN bands will be a little bit brighter.
```javascript
  var vizParams = {min: 1, max: 6000, gamma: [0.95, 1.3, 1.5]}
  Map.addLayer(falseColor, vizParams,"False Color")
```
All thats left is to call the falseColor function by adding `falseColor()` to the end of the file and the image should look like this:

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/FalseColor%20YELL.PNG)

---
With the knowledge of how to build an image from multiple images we can move on to a more advanced image resampling technique, creating an NDVI for the entire image. 
The steps required to accomplish this are as follows:
- Select the bands that we want
- Prefroming and NDVI
- Displaying the image











