class MainWindow{
	var gl;

	function start(){
		var canvas = document.getElementById("glcanvas");
		
		gl = initGL(canvas);
		
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		//
		
		
		render();
	}

	function stop(){

	}

	function update(){

	}

	function render(){
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	}
	
	function initGL(canvas){
		gl = null;
  
		try {
				// Try to grab the standard context. If it fails, fallback to experimental.
				gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
				gl.viewportWidth = canvas.width;
				gl.viewportHeight = canvas.height;
		}
		catch(e) {}
	  
		// If we don't have a GL context, give up now
		if (!gl) {
				alert("Unable to initialize WebGL. Your browser may not support it.");
				gl = null;
		}
	  
		return gl;
	}
}