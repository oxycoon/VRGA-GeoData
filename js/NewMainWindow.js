
	//Checks if WebGl is supported.
	if ( ! Detector.webgl ) {

		Detector.addGetWebGLMessage();
		document.getElementById( 'container' ).innerHTML ='';

	}
	
	var scene;
	var camera;
	var renderer;

	var testGeo;
	var testMatr;
	var testCube;

	var terrain;
	
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

		// add a light
        var pointLight = new THREE.PointLight(0xFFFFFF);
        scene.add(pointLight);
		pointLight.position.x = 1000;
        pointLight.position.y = 3000;
        pointLight.position.z = -1000;
        pointLight.intensity = 8.6;
		
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
		controls.movementSpeed = 100;
		controls.lookSpeed = 0.05;
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
		// load the heightmap we created as a texture
		var heightMap = THREE.ImageUtils.loadTexture(path, null, loadTextures);
 
        // load two other textures we'll use to make the map look more real
        var detailTexture = THREE.ImageUtils.loadTexture("res/textures/grass.JPG", null, loadTextures);
		detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
		
		var diffuseTexture = THREE.ImageUtils.loadTexture("res/textures/sand.jpg", null, loadTextures);
		diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;

		var diffuseTexture2 = THREE.ImageUtils.loadTexture("res/textures/bg.jpg", null, loadTextures);
		diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
 
       // Terrain shader
        var terrainShader = THREE.ShaderTerrain[ "terrain" ];
        var uniformsTerrain = THREE.UniformsUtils.clone(terrainShader.uniforms);
 
        // how to treat abd scale the normal texture
        //uniformsTerrain[ "tNormal" ].value = diffuseTexture2;
        //uniformsTerrain[ "uNormalScale" ].value = 3.0;
 
        // the displacement determines the height of a vector, mapped to
        // the heightmap
        uniformsTerrain[ "tDisplacement" ].value = heightMap;
        uniformsTerrain[ "uDisplacementScale" ].value = 100;
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
        uniformsTerrain[ "uRepeatOverlay" ].value.set(3, 3);
 
        // configure the material that reflects our terrain
        var material = new THREE.ShaderMaterial({
            uniforms:uniformsTerrain,
            vertexShader:terrainShader.vertexShader,
            fragmentShader:terrainShader.fragmentShader,
            lights:true,
            fog:false
        }); 
		
		//var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
		
		
 
        // we use a plain to render as terrain
        var geometryTerrain = new THREE.PlaneGeometry(2000, 2000, 256, 256);
        geometryTerrain.computeTangents();
 
        // create a 3D object to add
        terrain = new THREE.Mesh(geometryTerrain, material);
        terrain.position.set(0, -125, 0);
        terrain.rotation.x = -Math.PI / 2;
		//terrain.visible = false;
 
        // add the terrain
        scene.add(terrain);

	}

	function calculateNormals(image){

	}
	
	function loadTextures(){
		textureCounter += 1;
		
		if(textureCounter == 3){
			//terrain.visible = true;
		}
	}
	
	//http://danni-three.blogspot.no/2013/09/threejs-heightmaps.html
	function getHeightData(img,scale){
		if(scale==undefined) scale = 1;
		
		var canv = document.createElement('canvas');
		canv.width = img.width;
		canv.height = img.height;
		
		var cont = canv.getContext('2d');
		
		var size = img.width * img.height;
		var data = new Float32Array(size);
		
		cont.drawImage(img,0,0);
		for( var i=0; i < size; i++){
			data[i] = 0;
		}
		var imageData = cont.getImageData(0, 0, img.width, img.height);
		var pixels = imageData.data;
		
		var j = 0;
		for(var i = 0; i < size; i+= 4){
			var all = pixels[i] + pixels[i+1] + pixels[i+2];
			data[j++] = all / (12*scale);
		}
		return data;
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

		renderer.render(scene,camera);
	}
	

