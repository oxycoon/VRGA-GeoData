/**
http://toddmotto.com/mastering-the-module-pattern/
http://www.bookofspeed.com/chapter3.html
http://javascript.crockford.com/private.html
http://learningwebgl.com/blog/?p=28
http://www.w3schools.com/js/js_whereto.asp
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript
https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml#delete
https://google-styleguide.googlecode.com/svn/trunk/htmlcssguide.xml
*/


/**
 * 	MainWindow module
 */
var MainWindow = (function() {

	var gl;
	var map;

	

	function stop(){

	}

	function update(){

	}

	function render(){
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		
		//mat4.perspective(45, gl.viewportWidth / gl.viewportWidth, 0.1, 100.0, pMatrix);
		//mat4.identity(mvMatrix);
		//mat4.translate(mvMatrix,  [-1.5, 0.0, -7.0]);

		
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
	
	function initBuffers(){
		map = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, map);
		
		var vertices = [
			 0.0,  1.0,  0.0,
			-1.0, -1.0,  0.0,
			 1.0, -1.0,  0.0
		];
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	}
	
	function initShaders(){}
	
	return {
		start : function(){
			var canvas = document.getElementById("glcanvas");
			
			gl = initGL(canvas);
			initShaders();
			initBuffers();
			
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			
			
			render();
		}
	};
})();

	//////////////////////////////////////////////////////////////////////
	//
	//	MAP DATA
	//
	//////////////////////////////////////////////////////////////////////

var Map = (function() {})();
	