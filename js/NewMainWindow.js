	var scene;
	var camera;
	var renderer;

	var testGeo;
	var testMatr;
	var testCube;

	var world, worldTexture

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

		camera.position.z = 5;
	}

	function render(){
		requestAnimationFrame(render);
		//testCube.rotation.x += 0.1;
		testCube.rotation.y += 0.1;

		renderer.render(scene,camera);
	}

	init();
	render();

