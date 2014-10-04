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
		var data = initHeightMap('..\res\maps\narvik.png');

		camera.position.z = 5;
	}

	function render(){
		requestAnimationFrame(render);
		//testCube.rotation.x += 0.1;
		testCube.rotation.y += 0.1;

		renderer.render(scene,camera);
	}
	
	
	function initHeightMap(path){
		var img = new Image();
		img.src = path;
		
		var size = img.width * img.height;
		var data = new Uint8Array( size );
		
		var tempCanvas = document.createElement('canvas');
		var context = tempCanvas.getContext('2d');
		context.drawImage(img,0,0);

		for(i = 0; i < img.height; i++){
			for(j = 0; j < img.width; j++){
				data.push(context.getImageData(j,i,1,1).data);
			}
		}
		
		return data;
	}

	

