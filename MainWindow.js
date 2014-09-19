class MainWindow{
	var glContext;

	function start(){
		var canvas = document.getElementById("glcanvas");
		
		glContext = initGLContext(canvas);
		
		
		glContext.clearColor(0.0, 0.0, 0.0, 1.0);
		glContext.enable(glContext.DEPTH_TEST);
		glContext.depthFunc(glContext.LEQUAL);
		//glContext.viewport(0, 0, canvas.width, canvas.height);
		glContext.clear(glContext.COLOR_BUFFER_BIT|glContext.DEPTH_BUFFER_BIT);
		
		render();
	}

	function stop(){

	}

	function update(){

	}

	function render(){

	}
	
	function initGLContext(canvas){
		glContext = null;
  
		try {
				// Try to grab the standard context. If it fails, fallback to experimental.
				glContext = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
				glContext.viewportWidth = canvas.width;
				glContext.viewportHeight = canvas.height;
		}
		catch(e) {}
	  
		// If we don't have a GL context, give up now
		if (!glContext) {
				alert("Unable to initialize WebGL. Your browser may not support it.");
				glContext = null;
		}
	  
		return glContext;
	}
}