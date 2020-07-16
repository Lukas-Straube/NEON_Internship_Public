# Creating a link between the TERA-OS and GEE/Google cloud
---

## What we want to accomplish
* Be able to upload images to the GEE
* Create manifests
* Use the images in GEE


### To start you'll need to join the NEON-AOP google group link is [here](https://groups.google.com/forum/#!forum/neon-aop)
---
Once you have joined the group you will have access to the AOP repo with in GEE, it is under the asset tab and should read "project/neon"
This will allow you to have access to any data that we upload to GEE. There will be a more data in the future but for now it will only be 5Tb.

The next few steps will be for people with access to the TERA-OS (Dell PC) and who want to start data transfers for site projects. With everything above the line in the middle of the chart being a onetime set up. The creation of the virtual environment as well as the installation and updating of the GEE-API

![alt text](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/Yellowstone/Images/Uploading%20data%20to%20GEE.png)
---
### Points of interest:
---
* [Manifest Creation edits](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/GEE_Nightmare/README.md#manifest-creation-edits)
* [XML file](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/GEE_Nightmare/README.md#xml-file)
* [Tile Creation](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/GEE_Nightmare/README.md#tile-creation)
* [Google Cloud](https://github.com/Lukas-Straube/NEON_Internship_Public/blob/master/GEE_Nightmare/README.md#google-cloud)

#### Manifest Creation Edits
---
Before creating edits make sure that you are using the ManifestCreation.js provided on the Dell TERA-OS, it is stored on D:\GEE_Data_Uploads\ManifestCreation.js

These are quite simple to do, within notepad++ when looking at the code created by Austen, you’ll need to change two things. 
First is the name of the asset you want to create. Line 24:
```JavaScript
'name': `projects/earthengine-legacy/assets/projects/neon/TALL_2017/fullsite_TALL_2017`
```
You need to keep the ``` 'name': `projects/earthengine-legacy/assets/projects/neon` ``` but you are free to change the subfolder `TALL_2017` and asset name `fullsite_TALL_2017`. Just make sure that the folders you are points to exist within the NEON GEE asset branch. If you want to create a new folder simply click on the red NEW at the top left of the GEE asset page and make sure you change the directory from your personal one to the shared NEON on, then just name the folder whatever you want.

The second change will come from line 36 where you locate all the files from Google Cloud to be uploaded to GEE
```JavaScript
 'uris': [`gs://tall_2017/2017_TALL_3_Band${e}.tif`]
 ```
 The only thing that needs to be done first is the tiles to be uploaded to the Google Cloud. Once there you can access the 'image/asset' link by entering the bucket where you uploaded the images and clicking on anyone of them. You will see a table and one of the rows is named URI, that will be the same for all your pictures given you used Tristan’s band image creator, with the only difference being the band number at the end. 
 Once you have the link you need to just trim it to replace the unique parts of the manifest creation as seen here:
 ```JavaScript
 //original
 'uris': [`gs://tall_2017/2017_TALL_3_Band${e}.tif`]
 
 //new images are in a bucket called yell_2018 with the URI of a random image being gs://yell_2018/2018_YELL_3_Band156
 
 //changed 'uris'
  'uris': [`gs://yell_2018/2018_YELL_3_Band${e}.tif`]
``` 
If you choose to upload only a selt range of bands, it can be done by changing the start and end values on lines 5 & 9. It works inclusively so just change it to the band numbers you want to include.

#### XML File
---
There is not much to say about this other than any flights metadata from that site would work regardless of the day. Just make sure the you do not the wrong year. e.g. Yell_2018 was flown over 3 days, any of the days would work, however, 2017 should not be used. 

#### Tile Creation
---
This is just to go over the process of creating tiles since it is not really intuitive. You'll first need to locate the folder containing the file called `MultiprocessCreateGoogleEarthEngineTiles.py`. It will most likely be in the S:\users\jadler\GEcode or the N:\Dept\AOP\... (I cannot access it so that’s as far as I can be sure) Once you have located the file you will then need to locate two other things. 

First being the folder with all the HDF5 or H5 files from the ECS, make sure you are no inside the folder with images, the path must lead to the first folder after selecting the Domain.`E.g. you download images from CLBJ 2017, that is in Domain 11. So, you go D:\2017\fullsite\D11\2017_CLBJ_2 not any deeper into the folders` 

Second you need the path to the XML file which you can get from the `Remote_view (no number or words)` L3 -> Site XML. Once you have all three different paths you just execute the script by `cd`-ing into the `MultiprocessCreateGoogleEarthEngineTiles.py` location, then executing `python MultiprocessCreateGoogleEarthEngineTiles.py "Path to H5 files" "Path to XML metadata file"`!! Important make sure you keep the "" in as that is how the file know what parameters you passed in are !!

#### Google Cloud
---
At the moment we do not have access to a google cloud account that can be shared by the AOP team. Once that is made this section will be filled out with the steps required to go through image uploading and bucket creation. It is a lot easier than it sounds.


For now we are using jadler@battelleecology.org to have access to the google cloud in which we use to store data. 

To create a new bucket, navigate to Resources (Main Page) -> click on Storage -> Top middle left-ish is a button called "Create Bucket"
* Just name the bucket and then click contuine on everything else, the fine details are not a problem for us to worry about

To upload images just enter the bucket and click on "Upload files" in on the left hand side of the screen. This phase will take about 4-5 hours to upload all 426 bands.




