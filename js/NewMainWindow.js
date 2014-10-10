
	//Checks if WebGl is supported.
	if ( ! Detector.webgl ) {

		Detector.addGetWebGLMessage();
		document.getElementById( 'container' ).innerHTML ='';

	}
	
	var scene;
	var camera;
	var renderer;

	//Lights
	var lightVal = 0, lightDirection = 1;
	var pointLight, directionalLight;

	//Shader uniforms
	var uniformsTerrain, uniformsNormal;


	var terrain;

	var materialLibrary = {};
	
	var clock = new THREE.Clock();
	
	var textureCounter = 0;
	
	init();
	render();
	
	//--------------------------
	//	Initialization logic
	//--------------------------
	
	function init(){
		scene = new THREE.Scene();
		
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
		//camera.z = 5;
		camera.position.x = 1000;
		camera.position.y = 600;
		camera.position.z = 1300;
		camera.lookAt(scene.position);
		
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
		
		initControllers();

		// Lights
        pointLight = new THREE.PointLight(0xFFFFFF);
        scene.add(pointLight);
		pointLight.position.x = 1000;
        pointLight.position.y = 3000;
        pointLight.position.z = -1000;
        pointLight.intensity = 8.6;
		
        directionalLight = new THREE.DirectionalLight(0xffffff, 1.15);
        directionalLight.position.set(500, 2000, 0);
        scene.add(directionalLight);

		scene.add( new THREE.AmbientLight( 0x111111 ) );

		addTerrainUsingHeightMap('res/maps/narvik_scale.png');
 		/*var img = new Image();
		img.onload = function() {
			var data = getHeightData(img);
			
			var geometry = new THREE.PlaneGeometry(2000, 2000, 511, 511); //bug exists here, can't find reason
			geometry.applyMatrix(new THREE.Matrix4().makeRotationX( -Math.PI / 2));
			var texture = THREE.ImageUtils.loadTexture('res/textures/sand.jpg');
			var material = new THREE.MeshLambertMaterial( { map: texture } );
			
			var plane = new THREE.Mesh(geometry, material);
			
			for(var i = 0; i < plane.geometry.vertices.length; i++){
				plane.geometry.vertices[i].y = data[i];
			}
			//TESTING
			//plane.rotation.x = -Math.PI / 2;
			
			scene.add(plane);
		};
		img.src = 'res/maps/narvik_scale.png';*/
	}
	
	function initControllers(){
		//document.addEventListener('mousemove', onDocumentMouseMove, false);
		window.addEventListener('resize', onWindowResize, false);
		controls = new THREE.FirstPersonControls(camera);
		controls.movementSpeed = 500;
		controls.lookSpeed = 0.20;
		/*controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = false;
		controls.dynamicDampingFactor = 0.15;*/
	}

	/*function addTerrainUsingHeightMap(path){
		var heightMap = new THREE.ImageUtils.loadTexture(path);


		var shader = THREE.ShaderTerrain['terrain'];
		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);


		//console.log(heightMap.src);
	}*/
	
	//http://www.smartjava.org/content/threejs-render-real-world-terrain-heightmap-using-open-data
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
		var normalShader = THREE.NormalMapShader;
		uniformsNormal = THREE.UniformsUtils.clone(normalShader.uniforms);

		var rx = 256, ry = 256;
		var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
		var normalMap = new THREE.WebGLRenderTarget(rx, ry, pars);

		uniformsNormal.height.value = 100;
		uniformsNormal.resolution.value.set(rx,ry);
		uniformsNormal.heightMap.value = heightMap;

        //var vertShader = document.getElementById('vertexShader').textContent;


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
				['normal', normalShader.fragmentShader, normalShader.vertexShader, uniformsNormal, false],
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
		

        // configure the material that reflects our terrain
       /*var material = new THREE.ShaderMaterial({
            uniforms:uniformsTerrain,
            vertexShader:terrainShader.vertexShader,
            fragmentShader:terrainShader.fragmentShader,
            lights:true,
            fog:false
        });*/
		
		//var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
		
		
 
        // we use a plain to render as terrain
        var geometryTerrain = new THREE.PlaneGeometry(5120, 5120, 256, 256);
        geometryTerrain.computeTangents();
 
        // create a 3D object to add
        terrain = new THREE.Mesh(geometryTerrain, materialLibrary['terrain']);//materialLibrary['terrain']);
        terrain.position.set(0, -3, 0);
        terrain.rotation.x = -Math.PI / 2;
		//terrain.visible = false;
 
        // add the terrain
        scene.add(terrain);

	}

	
	function loadTextures(){
		textureCounter += 1;
		
		if(textureCounter == 3){
			//terrain.visible = true;
		}
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
	
	function onDocumentMouseMove(){
	
	}

	//--------------------------
	//	Render and update logic
	//--------------------------
	
	function render(){
		requestAnimationFrame(render);
		//testCube.rotation.x += 0.1;
		//testCube.rotation.y += 0.1;
		var delta = clock.getDelta();

		//controls.update();
		

		if(terrain.visible){
			//console.log(camera.position);
			controls.update(delta);


			var time = Date.now() * 0.001;
			var fLow = 0.1, fHigh = 0.8;

			lightVal = THREE.Math.clamp(lightVal + 0.5 * delta * lightDirection, fLow, fHigh);
			var valNorm = (lightVal - fLow) / (fHigh - fLow);

			directionalLight.intensity = THREE.Math.mapLinear(valNorm, 0, 1, 0.1, 1.15);
			pointLight.intensity = THREE.Math.mapLinear(valNorm, 0, 1, 0.9, 1.15);

			uniformsTerrain['uNormalScale'].value = THREE.Math.mapLinear(valNorm, 0, 1, 0.6, 3.5);


			renderer.render(scene,camera);
		}
	}
	

