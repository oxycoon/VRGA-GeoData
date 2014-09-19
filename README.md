VRGA-GeoData
============

Virtual Reality, Graphics and Animation 2 assignment 2: build a website which displays elevation data and overlays some real geographic data.

<h1>Assignment 2</h1>

In this assignment you have to build a website which displays elevation data and overlays some real geographic data. A demo showing these tiles overlayed with the peaks visible from narvik.

<h2>Requirements and resources</h2>

Use WebGL and JavaScript.

Once you got your grip on JS and WebGL, advance to the THREE.js library which provides a number of useful features for us.

As your code matures you will eventually need to host it, one of the simplest ways is to run python3 -m http.server in the directory of your html and then visit the locally hosted site.

<h2>Loading the elevation data</h2>

You should be able to load/process (and display) the elevation data. 

We use real topographic data from Statkart. You can find processed heightmap textures around Narvik directly from the Statkart tiles here or one combined tile. On these images a pixel corresponds to a 10mx10m block in UTM 33 datum, while black represents the sea level (-3m) and white corresponds to 1951.8m. If you wan to use the raw data, but you are unable to download it from the official site, you can find it here. To convert the dem elevation data into images you can use GDAL library, for more details, follow this blog post. 

One method of displaying the elevation data using THREE.js is PlaneGeometry as displayed here.

<h2>Navigation</h2>

Provide an intuitive navigation via keyboard and/or mouse if it makes sense for the application, for some intuition browse the three.js examples which use these controls.

<h2>Geospatial data</h2>

Layer some geospatial data on your heightmap, e.g. loading user files, showing georeferenced images, showing/following a gps trace. or something clickable

Most of the geographic data is given in Mercator WGS84 (Latency + Longitude), however the elevation data from Statkart is given in UTM 33. To convert between these formats you can use the Proj4js library, one example of its usage is

<code>var center = {x:600000,y:7600000}; //the center of the tileset in UTM33 datum</code><br>
<code>var utm33 = '+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ';</code><br>
<code>var narvik = proj4(utm33, [17.435281,68.435675]); //narvik[0] and narvik[1] holds our UTM33 datum</code><br>

	
<h2>Interactivity</h2>	
Make sure that your site hase some form of user interaction, e.g. clickable positions, navigation, switching display modes, etc.

<h2>Coding style</h2>

Adhere to the google styleguide in coding.

<h2>Attribution</h2>

Feel free to take ideas from other places, but make sure that you properly attribute them in the manual/report.