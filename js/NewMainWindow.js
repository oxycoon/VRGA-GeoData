
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

	var world, worldTexture;
	var worldWidth, worldHeight;
	var meshList;
	
	var clock = new THREE.Clock();
	
	init();
	render();

	function init(){
		scene = new THREE.Scene();
		
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
		camera.position.x = 1000;
		camera.position.y = 600;
		camera.position.z = 1300;
		camera.lookAt(scene.position);
		
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		//testGeo = new THREE.BoxGeometry(1,1,1);
		//testMatr = new THREE.MeshBasicMaterial({color: 0x00ff00});
		//testCube = new THREE.Mesh(testGeo, testMatr);
		//scene.add(testCube);
		
		       // add a light
        var pointLight = new THREE.PointLight(0xFFFFFF);
        scene.add(pointLight);
        pointLight.position.x = 1000;
        pointLight.position.y = 3000;
        pointLight.position.z = -1000;
        pointLight.intensity = 8.6;
		
		addTerrainUsingHeightMap('../res/maps/narvik.png');


	}

	function render(){
		requestAnimationFrame(render);
		//testCube.rotation.x += 0.1;
		//testCube.rotation.y += 0.1;

		renderer.render(scene,camera);
	}
	
	//http://www.smartjava.org/content/threejs-render-real-world-terrain-heightmap-using-open-data
	function addTerrainUsingHeightMap(path){
		var heightMap = THREE.ImageUtils.loadTexture(path);
		var texture = THREE.ImageUtils.loadTexture('../res/textures/sand.jpg');;
		
		var terrainShader = THREE.ShaderTerrain['terrain'];
		var uniformsTerrain = THREE.UniformsUtils.clone(terrainShader.uniforms);
		
		//Sets the heightmap
		uniformsTerrain['tDisplacement'].texture = heightMap;
		uniformsTerrain['uNormalScale'].value = 1;
		
		uniformsTerrain['tDiffuse1'].texture = texture;
        uniformsTerrain['tDetail'].texture = texture;
        uniformsTerrain['enableDiffuse1'].value = true;
        uniformsTerrain['enableDiffuse2'].value = true;
        uniformsTerrain['enableSpecular'].value = true;
		
		uniformsTerrain[ "uDiffuseColor" ].value.setHex(0xcccccc);
        uniformsTerrain[ "uSpecularColor" ].value.setHex(0xff0000);
        // is the base color of the terrain
        uniformsTerrain[ "uAmbientColor" ].value.setHex(0x0000cc);
 
        // how shiny is the terrain
        uniformsTerrain[ "uShininess" ].value = 3;
 
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
		
		//console.log(heightMap.image.src);
		
		//var geometryTerrain = new THREE.PlaneGeometry(heightMap.image.width, heightMap.image.height, heightMap.image.width / 2, heightMap.image.height / 2);
		var geometryTerrain = new THREE.PlaneGeometry(2000, 2000, 256, 256);
		geometryTerrain.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        geometryTerrain.computeFaceNormals();
        geometryTerrain.computeVertexNormals();
        geometryTerrain.computeTangents();
 
        // create a 3D object to add
        terrain = new THREE.Mesh(geometryTerrain, material);
        terrain.position.set(0, -125, 0);
        terrain.rotation.x = -Math.PI / 2;
 
        // add the terrain
        scene.add(terrain);
	}

	

