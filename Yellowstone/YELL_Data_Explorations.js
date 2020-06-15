var YELL = ee.Image("users/jadler/asset_20200204025808999");

var LandsatToNIS = 
{
  "Landsat8_B1":[10,16],"Landsat8_B2":[16,28],"Landsat8_B3":[30,44],
  "Landsat8_B4":[52,58],"Landsat8_B5":[94,100],"Landsat8_B6":[237,255],
  "Landsat8_B7":[345,382],"Landsat8_B8":[24,61],"Landsat8_B9":[197,201],
  "Landsat8_B10":-1,"Landsat8_B11":-1
}

Map.setCenter(-110.51996,44.9198,12)
Map.addLayer(YELL,{min:1,max:1000, bands:["band53","band35","band19"]},"RGB")


var bandRange = function(array)
{
  var start = array[0]
  var end = array[1]
  
  var bands = [];
  for (var i = start; i <= end; i++) 
  {
    bands.push('band'+ i);
  }
  return bands;
};


var NDVI = function()
{
  //var R_Bands = YELL.select(bandRange(52,58))
  var R_Bands = YELL.select(bandRange(LandsatToNIS["Landsat8_B4"]))

  //var NIR_Bands = YELL.select(bandRange(94,100))
  var NIR_Bands = YELL.select(bandRange(LandsatToNIS["Landsat8_B5"]))
  
  var NIR_Image = NIR_Bands.reduce(ee.Reducer.mean());
  NIR_Image = NIR_Image.rename(["NIR"])

  var R_Image = R_Bands.reduce(ee.Reducer.mean());
  R_Image = R_Image.rename(["R"])
  
  var both_NIR_and_R = NIR_Image.addBands(R_Image)

  var NDVI = both_NIR_and_R.normalizedDifference(["NIR","R"])

  Map.centerObject(YELL, 12);
  var ndviViz={min:-0.5, max:1,palette:['blue', 'brown', 'white']}
  Map.addLayer(NDVI, ndviViz,"NDVI");
}

var falseColor = function()
{
  var Bands_5 = YELL.select("band96")
  var Bands_4 = YELL.select("band56")
  var Bands_3 = YELL.select("band37")

  var falseColor = Bands_5.addBands(Bands_4)
  falseColor = falseColor.addBands(Bands_3)
  
  var vizParams = {min: 1, max: 6000, gamma: [0.95, 1.3, 1.5]}
  
  Map.addLayer(falseColor, vizParams,"False Color")
}

NDVI()
falseColor()
