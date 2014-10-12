
	//Checks if WebGl is supported.
	if ( ! Detector.webgl ) {

		Detector.addGetWebGLMessage();
		document.getElementById( 'container' ).innerHTML ='';

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

	//GUI
	var gui;

	var terrain;
	var materialLibrary = {};
	
	var clock = new THREE.Clock();
	
	var textureCounter = 0;


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

	var locations =  {city: 'Select city', mountain: 'Select mountain'};
	var showLabels = {cities: true, mountains: true};

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
	
	function init(){
		scene = new THREE.Scene();
		
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
		//camera.z = 5;
		camera.position.x = 0;//1000;
		camera.position.y = 400;
		camera.position.z = 0;//1300;
		/*camera.position.x = COORD_NARVIK[0];//COORD_CENTER.x;
		camera.position.y = 600;
		camera.position.z = COORD_NARVIK[1];//COORD_CENTER.y;*/
		camera.lookAt(scene.position);
		
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
		
		initControllers();
		initGUI();
		initLights();
		

		addTerrainUsingHeightMap('res/maps/narvik_scale.png');
		//addTerrainUsingHeightMap('res/maps/narvik.png');

		//Sprites
      	tagNarvik = makeTextSprite('Narvik', {fontsize: 72, borderColor: {r:255, g:255, b:255, a:0.7}, 
        											backgroundColor: {r:255, g:255, b:255, a:0.7} } );
        tagNarvik.position.set((COORD_CENTER.x - COORD_NARVIK[0])/10, 200, (COORD_CENTER.y - COORD_NARVIK[1])/10);
        scene.add(tagNarvik);

      	tagBjerkvik = makeTextSprite('Bjerkvik', {fontsize: 72, borderColor: {r:255, g:255, b:255, a:0.7}, 
        											backgroundColor: {r:255, g:255, b:255, a:0.7} } );
        tagBjerkvik.position.set((COORD_CENTER.x - COORD_BJERKVIK[0])/10, 200, (COORD_CENTER.y - COORD_BJERKVIK[1])/10);
        scene.add(tagBjerkvik);

      	tagAnkenes = makeTextSprite('Ankenes', {fontsize: 72, borderColor: {r:255, g:255, b:255, a:0.7}, 
        											backgroundColor: {r:255, g:255, b:255, a:0.7} } );
        tagAnkenes.position.set((COORD_CENTER.x - COORD_ANKENES[0])/10, 200, (COORD_CENTER.y - COORD_ANKENES[1])/10);
        scene.add(tagAnkenes);

      	tagSkjomtind = makeTextSprite('Skjomtind', {fontsize: 72, borderColor: {r:255, g:255, b:255, a:0.7}, 
        											backgroundColor: {r:255, g:255, b:255, a:0.7} } );
        tagSkjomtind.position.set((COORD_CENTER.x - COORD_SKJOMTIND.x)/10, 200, (COORD_CENTER.y - COORD_SKJOMTIND.y)/10);
        scene.add(tagSkjomtind);

        /*console.log(tagSkjomtind.position);
        console.log(tagNarvik.position);
        console.log(tagAnkenes.position);
        console.log(tagBjerkvik.position);*/

	}

	/**
	 *	Initializes scene lights
	 */
	function initLights(){
		// Spotlight
        spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2, 1 );
        scene.add(spotLight);
        spotLight.position.x = 2000;
		spotLight.position.y = 6000;
		spotLight.position.z = -2000;
		spotLight.intensity = 17.2;
        spotLight.target.position.set( 0, 0, 0 );

        //Shadows cast by spotlight
        /*spotLight.castShadow = true;
        spotLight.shadowCameraNear = 1200;
        spotLight.shadowCameraFar = 2500;
        spotLight.shadowCameraFov = 50;
    	spotLight.shadowBias = 0.0001;
		spotLight.shadowDarkness = 0.5;
		spotLight.shadowMapWidth = SHADOW_MAP_WIDTH;
		spotLight.shadowMapHeight = SHADOW_MAP_HEIGHT;*/
		scene.add(spotLight);
		
		//Directional light
        directionalLight = new THREE.DirectionalLight(0xffffff, 1.15);
        directionalLight.position.set(1000, 4000, 0); 
        //directionalLight.position.set(800000, 40000, 7605000);
        scene.add(directionalLight);

		scene.add( new THREE.AmbientLight( 0x111111 ) );
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

		window.addEventListener( 'keydown', onKeyDown , false );
		window.addEventListener( 'keyup', onKeyUp , false );

		raycaster = new THREE.Raycaster();
		projector = new THREE.Projector();


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
        /*var detailTexture = THREE.ImageUtils.loadTexture('res/textures/grass.JPG', null, loadTextures);
		detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;*/
		
		var diffuseTexture = THREE.ImageUtils.loadTexture('res/textures/sand.jpg', null, loadTextures);
		diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;

		var diffuseTexture2 = THREE.ImageUtils.loadTexture('res/textures/bg.jpg', null, loadTextures);
		diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;

		var detailTexture = THREE.ImageUtils.loadTexture('res/textures/bg.jpg', null, loadTextures);
		detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
 


		// Normal Shader
		/*var normalShader = THREE.NormalMapShader;
		uniformsNormal = THREE.UniformsUtils.clone(normalShader.uniforms);

		var rx = 256, ry = 256;
		var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
		normalMap = new THREE.WebGLRenderTarget(rx, ry, pars);

		uniformsNormal.height.value = 100;
		uniformsNormal.resolution.value.set(rx,ry);
		uniformsNormal.heightMap.value = heightMap;*/

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
        //uniformsTerrain[ 'uDisplacementBias' ].value = 1.0;
 
		//uniformsTerrain[ 'enableDiffuse1' ].value = true;
		//uniformsTerrain[ 'enableDiffuse2' ].value = true;
		//uniformsTerrain[ 'enableSpecular' ].value = true;
		
        uniformsTerrain[ 'tDiffuse1' ].value = diffuseTexture2;
        uniformsTerrain[ 'tDiffuse2' ].value = diffuseTexture2;
        uniformsTerrain[ 'tDetail' ].value = detailTexture;
 
        // Light settings
        uniformsTerrain[ 'diffuse' ].value.setHex(0xcccccc );
        uniformsTerrain[ 'specular' ].value.setHex(0xff0000 );
        uniformsTerrain[ 'ambient' ].value.setHex(0x0000cc );
 
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
	function makeTextSprite( message, parameters )
	{
		if ( parameters === undefined ) parameters = {};
		
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
		var metrics = context.measureText( message );
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

		context.fillText( message, borderThickness, fontsize + borderThickness);
		
		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas) 
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial( 
			{ map: texture, useScreenCoordinates: false /*alignment: spriteAlignment */} );
		var sprite = new THREE.Sprite( spriteMaterial );
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

	function onKeyDown ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {
			/*case 49: // 1 - go to Narvik
				camera.position.x = COORD_NARVIK[0] + 500;//COORD_CENTER.x;
				camera.position.y = 600;
				camera.position.z = COORD_NARVIK[1] + 500;//COORD_CENTER.y;
				camera.lookAt(COORD_NARVIK[0], 0, COORD_NARVIK[1]);
				break;*/
		}

	}

	function onKeyUp( event ) {

		switch( event.keyCode ) {

			//case 38: /*up*/
			//case 87: /*W*/ this.moveForward = false; break;

			//case 37: /*left*/
			//case 65: /*A*/ this.moveLeft = false; break;

			//case 40: /*down*/
			//case 83: /*S*/ this.moveBackward = false; break;

			//case 39: /*right*/
			//case 68: /*D*/ this.moveRight = false; break;

			//case 82: /*R*/ this.moveUp = false; break;
			//case 70: /*F*/ this.moveDown = false; break;

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
			//console.log(camera.position);


			var time = Date.now() * 0.001;
			var fLow = 0.1, fHigh = 0.8;

			lightVal = THREE.Math.clamp(lightVal + 0.5 * delta * lightDirection, fLow, fHigh);
			var valNorm = (lightVal - fLow) / (fHigh - fLow);

			directionalLight.intensity = THREE.Math.mapLinear(valNorm, 0, 1, 0.1, 1.15);
			spotLight.intensity = THREE.Math.mapLinear(valNorm, 0, 1, 0.9, 1.15);

			uniformsTerrain['uNormalScale'].value = THREE.Math.mapLinear(valNorm, 0, 1, 0.6, 3.5);


			renderer.render(scene,camera);
		}
	}
