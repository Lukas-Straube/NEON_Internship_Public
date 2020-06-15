var YELL = ee.Image("users/jadler/asset_20200204025808999");

var LandsatToNIS = 
{
  "Landsat1":[10,16],"Landsat2":[16,28],"Landsat3":[30,44],
  "Landsat4":[52,58],"Landsat5":[94,100],"Landsat6":[237,255],
  "Landsat7":[345,382],"Landsat8":[24,61],"Landsat9":[197,201],
  "Landsat10":-1,"Landsat11":-1
}

Map.setCenter(-110.51996,44.9198,12)
Map.addLayer(YELL,{min:1,max:1000, bands:["band53","band35","band19"]},"RGB")


var bandRange = function(start, end)
{
  var start = array[0]
  var end = array[1]
  
  var bands = [];
  for (var i = start; i <= end; i++) 
  {
    bands.push('band' + (i>100 ? '': '') + (i>10 ? '': '') + i);
  }
  return bands;
};


var NDVI = function()
{
  //var R_Bands = YELL.select(bandRange(52,58))
  var R_Bands = YELL.select(bandRange(LandsatToNIS["Landsat4"]))

  //var NIR_Bands = YELL.select(bandRange(94,100))
  var NIR_Bands = YELL.select(bandRange(LandsatToNIS["Landsat5"]))
  
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

var H20MaskOne = function()
{
  var H20_Bands = YELL.select(bandRange([93,95]))
  
  var H20_Image = H20_Bands.reduce(ee.Reducer.mean());
  H20_Image = H20_Image.rename(["H20_Mask_One"])
  
  Map.centerObject(YELL, 12);
  Map.addLayer(H20_Image, {max:6000},"H20_Mask_One")
}

var falseColor = function()
{
  var Bands_5S = YELL.select("band96")
  var Bands_4 = YELL.select("band56")
  var Bands_3 = YELL.select("band37")

  var falseColorS = Bands_5S.addBands(Bands_4S)
  falseColorS = falseColorS.addBands(Bands_3S)
  
  var vizParamsS = {min: 1, max: 6000, gamma: [0.95, 1.3, 1.5]}
  
  Map.addLayer(falseColorS, vizParamsS,"False ColorS")
}

H20MaskOne()
NDVI()
falseColor()
