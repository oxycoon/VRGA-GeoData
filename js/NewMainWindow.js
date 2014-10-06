
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
	
	var n =0;
	
	init();
	//render();

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

		//testGeo = new THREE.PlaneGeometry(512, 512, 128, 128);//new THREE.BoxGeometry(1,1,1);
		//testGeo.applyMatrix(new THREE.Matrix4().makeRotationX( -Math.PI / 2)); //rotates plane
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
		
		addTerrainUsingHeightMap('res/maps/narvik.png');
/* 		var img = new Image();
		img.onload = function() {
			var data = getHeightData(img);
			
			var geometry = new THREE.PlaneGeometry(2000, 2000, 256, 256); //bug exists here, can't find reason
			geometry.applyMatrix(new THREE.Matrix4().makeRotationX( -Math.PI / 2));
			var texture = THREE.ImageUtils.loadTexture('res/textures/sand.jpg');
			var material = new THREE.MeshLambertMaterial( { map: texture } );
			
			var plane = new THREE.Mesh(geometry, material);
			
			for(var i = 0; i < plane.geometry.vertices.length; i++){
				plane.geometry.vertices[i].y = data[i];
			}
			
			scene.add(plane);
		};
		img.src = 'res/maps/narvik.png'; */


	}

	function render(){
		requestAnimationFrame(render);
		//testCube.rotation.x += 0.1;
		//testCube.rotation.y += 0.1;

		renderer.render(scene,camera);
	}
	
	//http://www.smartjava.org/content/threejs-render-real-world-terrain-heightmap-using-open-data
	/**
	*	
	*	@param {string} path This string is the path to the height map to load.
	*/
	function addTerrainUsingHeightMap(path){
		//Load heightmap as texture
		console.log('Loading heightmap: ' + path);
		var heightMap = THREE.ImageUtils.loadTexture(path);
		//Load diffuse texture
		console.log('Loading texture: /res/textures/sand.jpg');
		var texture = THREE.ImageUtils.loadTexture('/res/textures/sand.jpg');
		
		//terrain shader
		console.log('Initializing terrain shader');
		var terrainShader = THREE.ShaderTerrain[ 'terrain' ];
        var uniformsTerrain = THREE.UniformsUtils.clone(terrainShader.uniforms);
		
		console.log('Initialing uniforms');
		//Sets the heightmap
		uniformsTerrain['tDisplacement'].texture = heightMap;
		uniformsTerrain['uDisplacementScale'].value = 100;
		
		// how to treat abd scale the normal texture
        uniformsTerrain[ 'tNormal' ].texture = texture;
        uniformsTerrain[ 'uNormalScale' ].value = 1;

		uniformsTerrain['tDiffuse1'].texture = texture;
        uniformsTerrain['tDetail'].texture = texture;
        uniformsTerrain['enableDiffuse1'].value = true;
        uniformsTerrain['enableDiffuse2'].value = true;
        uniformsTerrain['enableSpecular'].value = true;
		
		// diffuse is based on the light reflection
		uniformsTerrain[ 'uDiffuseColor' ].value.setHex(0xcccccc);
        uniformsTerrain[ 'uSpecularColor' ].value.setHex(0xff0000);
        // is the base color of the terrain
        uniformsTerrain[ 'uAmbientColor' ].value.setHex(0x0000cc);
 
        // how shiny is the terrain
        uniformsTerrain[ 'uShininess' ].value = 3;
 
        // handles light reflection
        uniformsTerrain[ 'uRepeatOverlay' ].value.set(3, 3);
 
		console.log('Initializing material')
        // configure the material that reflects our terrain
        var material = new THREE.ShaderMaterial({
            uniforms:uniformsTerrain,
            vertexShader:terrainShader.vertexShader,
            fragmentShader:terrainShader.fragmentShader,
            lights:true,
            fog:false
        });
		//var material = new THREE.MeshLambertMaterial( { map: texture } );
		
		console.log('Initializing geometry');
		var geometryTerrain = new THREE.PlaneGeometry(2000, 2000, 256, 256);
		geometryTerrain.applyMatrix(new THREE.Matrix4().makeRotationX( Math.PI / 2)); //rotates plane
        geometryTerrain.computeFaceNormals();
        geometryTerrain.computeVertexNormals();
        geometryTerrain.computeTangents();
 
        // create a 3D object to add
		console.log('Initializing mesh');
        var terrain = new THREE.Mesh(geometryTerrain, material);
        terrain.position.set(0, -125, 0);
        terrain.rotation.x = -Math.PI / 2;
 
        // add the terrain
		console.log('Adding mesh to scene');
        scene.add(terrain);

	}
	
	//http://danni-three.blogspot.no/2013/09/threejs-heightmaps.html
	function getHeightData(img,scale){
		if(scale===undefined) scale = 1;
		
		var canv = document.createElement('canvas');
		canv.width = img.width;
		canv.height = img.height;
		
		var cont = canv.getContext('2d');
		
		var size = img.width * img.height;
		data = new Float32Array(size);
		
		cont.drawImage(img,0,0);
		for( var i=0; i < size; i++){
			data[i] = 0;
		}
		var imageData = cont.getImageData(0,0,img.width,img.height);
		var pixels = imageData.data;
		
		var j = 0;
		for(var i = 0; i < size; i+= 4){
			var all = pixels[i] + pixels[i+1] + pixels[i+2];
			data[j++] = all / (12*scale);
		}
		return data;
	}

	

