// Copyright Austen Adler 2020

//Beginning band number, there was no 1, so we used 2.

var start = 1;

//Ending band number, normally should be beginning+426 but...= 2+424 = 426

var end = 426;

// this simple code does just the first six bands.

var elements = Array.from(start - end + 1)

//creates 
for(var i = start; i <= end; i++) 
    elements.push(String(("000" + i).slice(-3)));


var result = JSON.stringify({
  //Where to place the assets in GEE
  //Austen Adler naming convention is saved here \/
  //'name': `projects/earthengine-legacy/assets/projects/neon/test_asset_${(new Date()).toISOString().replace(/[^0-9]/g, '')}`
  'name': `projects/earthengine-legacy/assets/projects/neon/TALL_2017/fullsite_TALL_2017`

  ,

  'tilesets': elements.map(e => ({

      'id': `tileset_for_band${e}`,

      'sources': [

          {
			  //Replace 'tall_2017/2017_TALL_3_Band' with the name of inital name of the files within the google cloud
              'uris': [`gs://tall_2017/2017_TALL_3_Band${e}.tif`],
          },

      ],

  }))

  ,

   //adding the timecode here, but you must convert to the proper epoch.

        'start_time':{'seconds': 1563602401},

        'end_time'  :{'seconds': 1563602401},

 'bands': elements.map(e => ({

      'id': `band${e}`,

      // 'tileset_band_index': e,

    

      'tileset_id': `tileset_for_band${e}`,

  })),

});
//start copy
var ncp = require("copy-paste")
ncp.copy(result)

console.log(result);
console.log("\x1b[36m%s\x1b[0m","Copy Successful")

"done";
