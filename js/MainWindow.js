
	//Checks if WebGl is supported.
	if (! Detector.webgl) {

		Detector.addGetWebGLMessage();
		document.getElementById('container').innerHTML ='';

	}

	var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 1024;
	
	var scene;
	var camera;
	var renderer;

	//Lights
	var lightVal = 0, lightDirection = 1;
	var spotLight, directionalLight;

	//Shader variablse
	var uniformsTerrain;

	//Clickable objects
	var projector, raycaster;
	var mouse = new THREE.Vector2();
	var intersected, selection;
	var labelsList = [];

	//GUI
	var gui;
	var locations =  {city: 'Select city', mountain: 'Select mountain'};
	var showLabels = {cities: true, mountains: true};

	//Terrain and materials
	var terrain;
	var materialLibrary = {};
	var textureCounter = 0;

	//Clock
	var clock = new THREE.Clock();
	
	//Proj4 constants
	var WGS84_TO_UTM33 = '+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ';
	var UTMXX_CENTER_X = 600000;
	var UTMXX_CENTER_Y = 7600000;
	var COORD_CENTER = {x:600000,y:7600000};

	//Settlements
	var COORD_NARVIK = proj4(WGS84_TO_UTM33, [17.427778,68.439167]); //[68.435675,17.435281]);//[17.435281,68.435675]); //5.999.869, 7.600.760
	var COORD_BJERKVIK = proj4(WGS84_TO_UTM33, [17.550278,68.551944]);//[68.551944,17.550278,68]);//[17.550278,68.551944]);
	var COORD_ANKENES = proj4(WGS84_TO_UTM33, [17.365111,68.421722]);//[68.421722,17.365111]);//[17.365111,68.421722]);

	//Mountains
	var COORD_SKJOMTIND = {x:596965,y:7583005};

	//Sprite tags
	var tagNarvik;
	var tagBjerkvik;
	var tagAnkenes;

	var tagSkjomtind;
	
	init();
	render();
	
	//--------------------------
	//	Initialization logic
	//--------------------------

	/**
	 *	Primary initialization function which sets up the scene, camera, renderer
	 *	and calls the other init functions.
	 */
	function init(){
		scene = new THREE.Scene();
		
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
		camera.position.x = 0;
		camera.position.y = 400;
		camera.position.z = 0;
		camera.lookAt(scene.position);
		
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
		
		initControllers();
		initGUI();
		initLights();
		addTerrainUsingHeightMap('res/maps/narvik_scale.png');


		initSprites();

	}

	/**
	 *	Initializes scene lights
	 */
	function initLights(){
		// Spotlight
        spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2, 1);
        scene.add(spotLight);
        spotLight.position.x = 2000;
		spotLight.position.y = 6000;
		spotLight.position.z = -2000;
		spotLight.intensity = 17.2;
        spotLight.target.position.set(0, 0, 0);
		scene.add(spotLight);
		
		//Directional light
        directionalLight = new THREE.DirectionalLight(0xffffff, 1.15);
        directionalLight.position.set(1000, 4000, 0); 
        scene.add(directionalLight);

		scene.add(new THREE.AmbientLight(0x111111));
	}
	
	/**
	 *	Initializes the various event handlers and
	 *	controllers.
	 */
	function initControllers(){
		window.addEventListener('resize', onWindowResize, false);
		controls = new THREE.FirstPersonControls(camera, renderer.domElement);
		controls.movementSpeed = 500;
		controls.lookSpeed = 0.20;

		renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
		renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
		renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
	}

	/**
	 *	Initializes the GUI
	 */
	function initGUI(){
		gui = new dat.GUI();

		var guiFolder1 = gui.addFolder('Camera positions');

		guiFolder1.add(camera.position, 'x', -4100, 4100).listen();
		guiFolder1.add(camera.position, 'y', 0, 1000).listen();
		guiFolder1.add(camera.position, 'z', -4100, 4100).listen();

		var guiFolder2 = gui.addFolder('Camera target');

		/*guiFolder2.add(camera.targetPosition, 'x', -4100, 4100).listen();
		guiFolder2.add(camera.targetPosition, 'y', 0, 1000).listen();
		guiFolder2.add(camera.targetPosition, 'z', -4100, 4100).listen();*/

		var guiFolder3 = gui.addFolder('Preset locations');
		guiFolder3.add(locations, 'city', ['Narvik', 'Bjerkvik', 'Ankenes']).name('Settlements').onChange(cityChanged);
		guiFolder3.add(locations, 'mountain', ['Skjomtind'/*, 'Stetind', 'Linken'*/]).name('Mountains').onChange(mountainChanged);

		var guiFolder4 = gui.addFolder('Toggle labels');
		guiFolder4.add(showLabels,'cities').name('Settlements').onChange(function(value){
			tagNarvik.visible = value;
			tagAnkenes.visible = value;
			tagBjerkvik.visible = value;
		});
		guiFolder4.add(showLabels, 'mountains').name('Mountains').onChange(function(value){
			tagSkjomtind.visible = value;
		});
	}	

	/**
	 *	Initializes the sprites in the scene.
	 */
	function initSprites(){
      	tagNarvik = makeTextSprite('Narvik', {fontsize: 72, borderColor: {r:255, g:255, b:255, a:0.7}, 
        											backgroundColor: {r:255, g:255, b:255, a:0.7} });
        tagNarvik.position.set((COORD_CENTER.x - COORD_NARVIK[0])/10, 200, (COORD_CENTER.y - COORD_NARVIK[1])/10);
        scene.add(tagNarvik);
        labelsList.push(tagNarvik);

      	tagBjerkvik = makeTextSprite('Bjerkvik', {fontsize: 72, borderColor: {r:255, g:255, b:255, a:0.7}, 
        											backgroundColor: {r:255, g:255, b:255, a:0.7} });
        tagBjerkvik.position.set((COORD_CENTER.x - COORD_BJERKVIK[0])/10, 200, (COORD_CENTER.y - COORD_BJERKVIK[1])/10);
        scene.add(tagBjerkvik);
        labelsList.push(tagBjerkvik);

      	tagAnkenes = makeTextSprite('Ankenes', {fontsize: 72, borderColor: {r:255, g:255, b:255, a:0.7}, 
        											backgroundColor: {r:255, g:255, b:255, a:0.7} });
        tagAnkenes.position.set((COORD_CENTER.x - COORD_ANKENES[0])/10, 200, (COORD_CENTER.y - COORD_ANKENES[1])/10);
        scene.add(tagAnkenes);
        labelsList.push(tagAnkenes);

      	tagSkjomtind = makeTextSprite('Skjomtind', {fontsize: 72, borderColor: {r:255, g:255, b:255, a:0.7}, 
        											backgroundColor: {r:255, g:255, b:255, a:0.7} });
        tagSkjomtind.position.set((COORD_CENTER.x - COORD_SKJOMTIND.x)/10, 200, (COORD_CENTER.y - COORD_SKJOMTIND.y)/10);
        scene.add(tagSkjomtind);
        labelsList.push(tagSkjomtind);
	}
	
	/**
	 *	Creates a 8192x8192 terrain based on a given heigthmap.
	 *
	 *	@param {string} path This string is the path to the height map to load.
	 *	@param {number} height This double represents what the highest point of
	 *		the heightmap is. Is set to 196.18 (10 meters) by default.
	 */
	function addTerrainUsingHeightMap(path, height){
		// load the heightmap as a texture
		var heightMap = THREE.ImageUtils.loadTexture(path, null, loadTextures);
 
        // Loading textures
        var detailTexture = THREE.ImageUtils.loadTexture('res/textures/grass.JPG', null, loadTextures);
		detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
		
		var diffuseTexture = THREE.ImageUtils.loadTexture('res/textures/sand.jpg', null, loadTextures);
		diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;

		var diffuseTexture2 = THREE.ImageUtils.loadTexture('res/textures/bg.jpg', null, loadTextures);
		diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;

       	// Terrain shader
        var terrainShader = THREE.ShaderTerrain[ 'terrain' ];
        uniformsTerrain = THREE.UniformsUtils.clone(terrainShader.uniforms);


        uniformsTerrain[ 'tNormal' ].value = diffuseTexture2;
        uniformsTerrain[ 'uNormalScale' ].value = 3.0;
 
        // the displacement determines the height of a vector, mapped to
        // the heightmap
        uniformsTerrain[ 'tDisplacement' ].value = heightMap;
        if(height == undefined)
        	uniformsTerrain[ 'uDisplacementScale' ].value = 195.18;
        else
        	uniformsTerrain[ 'uDisplacementScale' ].value = height;
 
		//uniformsTerrain[ 'enableDiffuse1' ].value = true;
		//uniformsTerrain[ 'enableDiffuse2' ].value = true;
		uniformsTerrain[ 'enableSpecular' ].value = true;
		
        uniformsTerrain[ 'tDiffuse1' ].value = diffuseTexture2;
        uniformsTerrain[ 'tDiffuse2' ].value = diffuseTexture2;
        uniformsTerrain[ 'tDetail' ].value = detailTexture;
 
        // Light settings
        uniformsTerrain[ 'diffuse' ].value.setHex(0xcccccc);
        uniformsTerrain[ 'specular' ].value.setHex(0xff0000);
        uniformsTerrain[ 'ambient' ].value.setHex(0x0000cc);
 
        // how shiny is the terrain
        uniformsTerrain[ 'shininess' ].value = 3;
 
        // handles light reflection
        uniformsTerrain[ 'uRepeatOverlay' ].value.set(6, 6);

        uniformsTerrain[ 'enableColorHeight'].value = true;

		var parameters = [
				/*['normal', normalShader.fragmentShader, normalShader.vertexShader, uniformsNormal, false],*/
				['terrain', terrainShader.fragmentShader, terrainShader.vertexShader, uniformsTerrain, true]
		];
 
		for(var i = 0; i < parameters.length; i++){
			var material = new THREE.ShaderMaterial({
				uniforms: parameters[i][3],
				vertexShader: parameters[i][2],
				fragmentShader: parameters[i][1],
				lights: parameters[i][4],
				fog: false
			});
			materialLibrary[parameters[i][0]] = material;
		}
 
        var geometryTerrain = new THREE.PlaneGeometry(8192, 8192, 256, 256);
        geometryTerrain.computeTangents();

        terrain = new THREE.Mesh(geometryTerrain, materialLibrary['terrain']);
        terrain.position.set(0, -3, 0);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        terrain.castShadow = true;
		terrain.visible = false;
 
        // add the terrain
        scene.add(terrain);
	}

	/**
	 *	Function which makes sure terrain doesn't display before all
	 *	textures have been loaded
	 */
	function loadTextures(){
		textureCounter += 1;
		
		if(textureCounter == 4){
			terrain.visible = true;
		}
	}

	/**
	 *	Function to create a text sprite to display in the world. Found at:
	 *	http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
	 *
	 *	@param {string} message This string is the message to show in the sprite.
	 *	@param {array} parameters Array of parameters to use, valid parameters:
	 *		-	fontface: 			{number}
	 *		-	fontsize: 			{number}
	 *		-	borderThickness		{number}
	 *		-	borderColor			{ r:0-255, g:0-255, b:0-255, a: 0.0-1.0}
	 *		-	backgroundColor		{ r:0-255, g:0-255, b:0-255, a: 0.0-1.0}
	 *	@return {object} sprite A THREE.Sprite with the given message and parameters.
	 */
	function makeTextSprite(message, parameters)
	{
		if (parameters === undefined) parameters = {};
		
		var fontface = parameters.hasOwnProperty('fontface') ? 
			parameters['fontface'] : 'Arial';
		
		var fontsize = parameters.hasOwnProperty('fontsize') ? 
			parameters['fontsize'] : 18;
		
		var borderThickness = parameters.hasOwnProperty('borderThickness') ? 
			parameters['borderThickness'] : 4;
		
		var borderColor = parameters.hasOwnProperty('borderColor') ?
			parameters['borderColor'] : { r:0, g:0, b:0, a:1.0 };
		
		var backgroundColor = parameters.hasOwnProperty('backgroundColor') ?
			parameters['backgroundColor'] : { r:255, g:255, b:255, a:1.0 };

		//var spriteAlignment = THREE.SpriteAlignment.topLeft;
			
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		context.font = 'Bold ' + fontsize + 'px ' + fontface;
	    
		// get size data (height depends only on font size)
		var metrics = context.measureText(message);
		var textWidth = metrics.width;
		
		// background color
		context.fillStyle   = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ','
									  + backgroundColor.b + ',' + backgroundColor.a + ')';
		// border color
		context.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ','
									  + borderColor.b + ',' + borderColor.a + ')';

		context.lineWidth = borderThickness;
		roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
		// 1.4 is extra height factor for text below baseline: g,j,p,q.
		
		// text color
		context.fillStyle = 'rgba(0, 0, 0, 1.0)';

		context.fillText(message, borderThickness, fontsize + borderThickness);
		
		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas) 
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial(
			{ map: texture, useScreenCoordinates: false /*alignment: spriteAlignment */});
		var sprite = new THREE.Sprite(spriteMaterial);
		sprite.scale.set(100,50,1.0);
		return sprite;	
	}

	/**
	 * Function for drawing rounded rectangles, used in makeTextSprite()
	 * http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
	 */
	function roundRect(ctx, x, y, w, h, r) 
	{
	    ctx.beginPath();
	    ctx.moveTo(x+r, y);
	    ctx.lineTo(x+w-r, y);
	    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
	    ctx.lineTo(x+w, y+h-r);
	    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
	    ctx.lineTo(x+r, y+h);
	    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
	    ctx.lineTo(x, y+r);
	    ctx.quadraticCurveTo(x, y, x+r, y);
	    ctx.closePath();
	    ctx.fill();
		ctx.stroke();   
	}

	//--------------------------
	//	Event handlers
	//--------------------------
	
	/**
	 *	Updates the camera aspects when window is resized.
	 */
	function onWindowResize(){
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		
		renderer.setSize(window.innerWidth, window.innerHeight);
		
		controls.handleResize();
	}

	/**
	 *	In document mouse move handler for selecting objects in the scene.
	 */
	function onDocumentMouseMove(event){
		event.preventDefault();

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = (event.clientY / window.innerHeight) * 2 + 1;

		if(selection){
			return;
		}

		//Find intersections
		var vector = new THREE.Vector3(mouse.x, mouse.y, camera.near);

		projector = new THREE.Projector();
		projector.unprojectVector(vector, camera);

		raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
		var intersects = raycaster.intersectObjects(labelsList);

		if(intersects.length > 0){
			if(intersected != intersects[0].object)
			{
				intersected = intersects[0].object;
				console.log('Mouseover object detected: ' + intersects[0].object.position.x + ',' + intersects[0].object.position.y + ',' + intersects[0].object.position.z);
			}
			else{
				//if(intersected) intersected.material.emissive.setHex(intersected.currentHex);
				//console.log("Intersection removed!");
				intersected = null;
			}
		}
	}

	/**
	 *	In document mouse key handler for selecting objects in the scene.
	 */
	function onDocumentMouseDown(event){
		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0:
				var vector = new THREE.Vector3(mouse.x, mouse.y, camera.near);

				projector = new THREE.Projector();
				projector.unprojectVector(vector, camera);

				raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
				var intersects = raycaster.intersectObjects(labelsList);

				if(intersects.length > 0){
					controls.enabled = false;

					selection = intersects[0].object;

					camera.position.x = selection.position.x - 200;
					camera.position.y = 200;
					camera.position.z = selection.position.z - 200;
					camera.lookAt(selection.position.x , 0, selection.position.z);
				}
				break;
		}
	}

	/**
	 *	In document mouse key handler for selecting objects in the scene.
	 */
	function onDocumentMouseUp(event){
		event.preventDefault();
		event.stopPropagation();

		controls.enabled = true;

		if(intersected){
			intersected = null;
		}
	}

	/**
	 *	GUI event handler for settlement jumping
	 */
	function cityChanged(){
		var value = locations.city;

		if(value == 'Narvik'){
			camera.position.x = (COORD_CENTER.x - COORD_NARVIK[0])/10 - 200;
			camera.position.y = 200;
			camera.position.z = (COORD_CENTER.y - COORD_NARVIK[1])/10 - 200;
			camera.lookAt((COORD_CENTER.x - COORD_NARVIK[0])/10 , 0, (COORD_CENTER.y - COORD_NARVIK[1])/10);
		}
		else if(value == 'Ankenes'){
			camera.position.x = (COORD_CENTER.x - COORD_ANKENES[0])/10 - 200;
			camera.position.y = 200;
			camera.position.z = (COORD_CENTER.y - COORD_ANKENES[1])/10 - 200;
			camera.lookAt((COORD_CENTER.x - COORD_ANKENES[0])/10 , 0, (COORD_CENTER.y - COORD_ANKENES[1])/10);
		}
		else if(value == 'Bjerkvik'){
			camera.position.x = (COORD_CENTER.x - COORD_BJERKVIK[0])/10 - 200;
			camera.position.y = 200;
			camera.position.z = (COORD_CENTER.y - COORD_BJERKVIK[1])/10 - 200;
			camera.lookAt((COORD_CENTER.x - COORD_BJERKVIK[0])/10 , 0, (COORD_CENTER.y - COORD_BJERKVIK[1])/10);
		}
	}

	/**
	 *	GUI event handler for mountain jumping
	 */
	function mountainChanged(){
		var value = locations.mountain;

		if(value == 'Skjomtind'){
			camera.position.x = (COORD_CENTER.x - COORD_SKJOMTIND[0])/10 - 200;
			camera.position.y = 200;
			camera.position.z = (COORD_CENTER.y - COORD_SKJOMTIND[1])/10 - 200;
			camera.lookAt((COORD_CENTER.x - COORD_SKJOMTIND[0])/10 , 0, (COORD_CENTER.y - COORD_SKJOMTIND[1])/10);
		}
		/*else if(value == 'Linken'){

		}
		else if(value == 'Stetind'){
			
		}*/
	}

	//--------------------------
	//	Render and update logic
	//--------------------------
	
	/**
	 *	Render function
	 */
	function render(){
		requestAnimationFrame(render);

		var delta = clock.getDelta();

		//controls.update();
		

		if(terrain.visible){
			
			controls.update(delta);

			renderer.render(scene,camera);
		}
	}
