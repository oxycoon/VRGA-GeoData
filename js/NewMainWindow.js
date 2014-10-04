
	//Checks if WebGl is supported.
	if ( ! Detector.webgl ) {

		Detector.addGetWebGLMessage();
		document.getElementById( 'container' ).innerHTML ='";

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
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		testGeo = new THREE.BoxGeometry(1,1,1);
		testMatr = new THREE.MeshBasicMaterial({color: 0x00ff00});
		testCube = new THREE.Mesh(testGeo, testMatr);
		scene.add(testCube);
		addTerrainUsingHeightMap('..\\res\\maps\\narvik.png');

		camera.position.z = 5;
	}

	function render(){
		requestAnimationFrame(render);
		//testCube.rotation.x += 0.1;
		testCube.rotation.y += 0.1;

		renderer.render(scene,camera);
	}
	
	//http://www.smartjava.org/content/threejs-render-real-world-terrain-heightmap-using-open-data
	function addTerrainUsingHeightMap(path){
		var heightMap = THREE.ImageUtils.loadTexture(path);
		var texture = THREE.ImageUtils.loadTexture('..\\res\\textures\\sand.jpg');;
		
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
	}

	

