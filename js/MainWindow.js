
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


	var terrain;
	var materialLibrary = {};
	
	var clock = new THREE.Clock();
	
	var textureCounter = 0;


	//Proj4 variables
	var utm33 = '+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ';
	var COORD_CENTER = {x:600000,y:7600000};
	var COORD_NARVIK = proj4(utm33, [17.435281,68.435675]); //5.999.869, 7.600.760
	
	init();
	render();
	
	//--------------------------
	//	Initialization logic
	//--------------------------
	
	function init(){
		scene = new THREE.Scene();
		
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
		//camera.z = 5;
		/*camera.position.x = 1000;
		camera.position.y = 200;
		camera.position.z = 1300;*/
		camera.position.x = COORD_NARVIK[0];//COORD_CENTER.x;
		camera.position.y = 600;
		camera.position.z = COORD_NARVIK[1];//COORD_CENTER.y;
		camera.lookAt(scene.position);
		
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
		
		initControllers();
		initLights();
		

		addTerrainUsingHeightMap('res/maps/narvik_scale.png');
		//addTerrainUsingHeightMap('res/maps/narvik.png');

		//Sprites
      	var narvikTag = makeTextSprite("Narvik", {fontsize: 128, borderColor: {r:255, g:255, b:255, a:1.0}, 
        											backgroundColor: {r:255, g:255, b:255, a:1.0} } );
        narvikTag.position.set(COORD_NARVIK[0], 2000, COORD_NARVIK[1]);
        scene.add(narvikTag);

        console.log(COORD_NARVIK);
        console.log(COORD_CENTER);
        console.log(narvikTag.position);	//599810, 7593417
        console.log(terrain.position);


	}

	/**
	 *	Initializes scene lights
	 */
	function initLights(){
		// Spotlight
        spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2, 1 );
        scene.add(spotLight);
		spotLight.position.x = 605000;
        spotLight.position.y = 80000;
        spotLight.position.z = 7605000;
        spotLight.intensity = 1.72;
        spotLight.target.position.set( 0, 0, 0 );

        //Shadows cast by spotlight
        spotLight.castShadow = true;
        spotLight.shadowCameraNear = 1200;
        spotLight.shadowCameraFar = 2500;
        spotLight.shadowCameraFov = 50;
    	spotLight.shadowBias = 0.0001;
		spotLight.shadowDarkness = 0.5;
		spotLight.shadowMapWidth = SHADOW_MAP_WIDTH;
		spotLight.shadowMapHeight = SHADOW_MAP_HEIGHT;
		scene.add(spotLight);
		
		//Directional light
        directionalLight = new THREE.DirectionalLight(0xffffff, 1.15);
        directionalLight.position.set(800000, 40000, 7605000);
        scene.add(directionalLight);

		scene.add( new THREE.AmbientLight( 0x111111 ) );
	}
	
	/**
	 *	Initializes the various event handlers and
	 *	controllers.
	 */
	function initControllers(){
		window.addEventListener('resize', onWindowResize, false);
		controls = new THREE.FirstPersonControls(camera);
		controls.movementSpeed = 5000;
		controls.lookSpeed = 0.20;
		/*controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = false;
		controls.dynamicDampingFactor = 0.15;*/

		window.addEventListener( 'keydown', onKeyDown , false );
		window.addEventListener( 'keyup', onKeyUp , false );

		raycaster = new THREE.Raycaster();
		projector = new THREE.Projector();

		var controlButton = document.createElement('div');
		controlButton.id = 'controlButton';
		controlButton.textContent = 'Input coordinates';
		controlButton.addEventListener('click', function(event){

		}, false);
		controlButton.style.display = 'none';
		document.body.appendChild(controlButton);

	}
	
	/**
	 *	
	 *	@param {string} path This string is the path to the height map to load.
	 */
	function addTerrainUsingHeightMap(path){
		// load the heightmap as a texture
		var heightMap = THREE.ImageUtils.loadTexture(path, null, loadTextures);
 
        // Loading textures
        /*var detailTexture = THREE.ImageUtils.loadTexture("res/textures/grass.JPG", null, loadTextures);
		detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;*/
		
		var diffuseTexture = THREE.ImageUtils.loadTexture("res/textures/sand.jpg", null, loadTextures);
		diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;

		var diffuseTexture2 = THREE.ImageUtils.loadTexture("res/textures/bg.jpg", null, loadTextures);
		diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;

		var detailTexture = THREE.ImageUtils.loadTexture("res/textures/bg.jpg", null, loadTextures);
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


        uniformsTerrain[ "tNormal" ].value = diffuseTexture2;
        uniformsTerrain[ "uNormalScale" ].value = 3.0;
 
        // the displacement determines the height of a vector, mapped to
        // the heightmap
        uniformsTerrain[ "tDisplacement" ].value = heightMap;
        uniformsTerrain[ "uDisplacementScale" ].value = 195.18;
        //uniformsTerrain[ "uDisplacementBias" ].value = 1.0;
 
		//uniformsTerrain[ "enableDiffuse1" ].value = true;
		//uniformsTerrain[ "enableDiffuse2" ].value = true;
		//uniformsTerrain[ "enableSpecular" ].value = true;
		
        uniformsTerrain[ "tDiffuse1" ].value = diffuseTexture2;
        uniformsTerrain[ "tDiffuse2" ].value = diffuseTexture2;
        uniformsTerrain[ "tDetail" ].value = detailTexture;
 
        // Light settings
        uniformsTerrain[ "diffuse" ].value.setHex(0xcccccc );
        uniformsTerrain[ "specular" ].value.setHex(0xff0000 );
        uniformsTerrain[ "ambient" ].value.setHex(0x0000cc );
 
        // how shiny is the terrain
        uniformsTerrain[ "shininess" ].value = 3;
 
        // handles light reflection
        uniformsTerrain[ "uRepeatOverlay" ].value.set(6, 6);

        uniformsTerrain[ "enableColorHeight"].value = true;

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
 
        var geometryTerrain = new THREE.PlaneGeometry(819, 819, 256, 256);
        geometryTerrain.computeTangents();

        terrain = new THREE.Mesh(geometryTerrain, materialLibrary['terrain']);
        terrain.position.set(COORD_CENTER.x, -3, COORD_CENTER.y);
        terrain.rotation.x = -Math.PI / 2;
        terrain.scale.set(100,100, 10);
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
		
		var fontface = parameters.hasOwnProperty("fontface") ? 
			parameters["fontface"] : "Arial";
		
		var fontsize = parameters.hasOwnProperty("fontsize") ? 
			parameters["fontsize"] : 18;
		
		var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
			parameters["borderThickness"] : 4;
		
		var borderColor = parameters.hasOwnProperty("borderColor") ?
			parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
		
		var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
			parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

		//var spriteAlignment = THREE.SpriteAlignment.topLeft;
			
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		context.font = "Bold " + fontsize + "px " + fontface;
	    
		// get size data (height depends only on font size)
		var metrics = context.measureText( message );
		var textWidth = metrics.width;
		
		// background color
		context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
									  + backgroundColor.b + "," + backgroundColor.a + ")";
		// border color
		context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
									  + borderColor.b + "," + borderColor.a + ")";

		context.lineWidth = borderThickness;
		roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
		// 1.4 is extra height factor for text below baseline: g,j,p,q.
		
		// text color
		context.fillStyle = "rgba(0, 0, 0, 1.0)";

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
			case 49: // 1 - go to Narvik
				camera.position.x = COORD_NARVIK[0] + 500;//COORD_CENTER.x;
				camera.position.y = 600;
				camera.position.z = COORD_NARVIK[1] + 500;//COORD_CENTER.y;
				camera.lookAt(COORD_NARVIK[0], 0, COORD_NARVIK[1]);
				break;
		}

	};

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

	};

	//--------------------------
	//	Render and update logic
	//--------------------------
	
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
	

