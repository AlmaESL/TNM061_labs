var container;
var camera, scene, renderer;
var mouseX = 0,
    mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

//light - pointlight
const lightPoint = new THREE.PointLight( 0xffffff , 1, 0 );
//light - ambient
const lightAm = new THREE.AmbientLight( 0x202020 ); // soft white light

//sun 
var sunSpin = new THREE.Group();
var sunTranslate = new THREE.Group(); 

// Object3D ("Group") nodes and Mesh nodes
var sceneRoot = new THREE.Group();
//earth 
var earthOrbit = new THREE.Group(); 
var earthSpin = new THREE.Group();
var earthTilt = new THREE.Group(); //tilt earth 
var earthPosition = new THREE.Group();
var earthMesh;

//moon nodes and mesh nodes 
var moonTranslate = new THREE.Group(); //move moon and
var moonRotate = new THREE.Group(); //rotate moon around earth
//var moonOrbit = new THREE.Group(); 
var moonMesh; 

var animation = true;

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    // mouseX, mouseY are in the range [-1, 1]
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
}

function createSceneGraph() {
    scene = new THREE.Scene();
	
	//adds light within the placement of the sun
	scene.add( lightPoint );
	scene.add( lightAm );
	
	//compute earth tilt 
	earthTilt.rotation.z = -0.41;
	//compute earth position - will be used for relative moon position 
	earthPosition.position.x= 3.0; 
	//moon posistion 
	moonTranslate.position.x = 1.0; 
	//sun posistion
	sunTranslate.position.set(0.0,0.0,0.0);
	
    // Top-level node
    scene.add(sceneRoot);
	
	//sun
	sceneRoot.add(sunTranslate); 
	sunTranslate.add(sunSpin); 
	sunSpin.add(sunMesh); 
	
    // earth branch
	sceneRoot.add(earthOrbit);
	earthOrbit.add(sunTranslate); 
	sunTranslate.add(earthPosition);
	earthPosition.add(earthTilt); //add earth tilt to scene
	earthTilt.add(earthSpin); //add earth spin from earth mesh to tilt
	earthSpin.add(earthMesh);
	
	//moon 
	earthPosition.add(moonRotate);	
	moonRotate.add(moonTranslate); 
	moonTranslate.add(moonMesh); 
}

function init() {
    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    
    var texloader = new THREE.TextureLoader();
	
	//sun
	var geometrySun = new THREE.SphereGeometry(1.6, 100,100); 
	var materialSun = new THREE.MeshBasicMaterial();
	materialSun.combine = 0; 
	materialSun.needsUpdate=true; 
	materialSun.wireframe = false; 
    
    // Earth mesh
	var geometryEarth = new THREE.SphereGeometry(0.7,100, 100);    
	//radius, number of horizontal segments, number of vertical segments 
	
    var materialEarth = new THREE.MeshLambertMaterial();
    materialEarth.combine = 0;
    materialEarth.needsUpdate = true;
    materialEarth.wireframe = false;    
	
	//moon sphere 
	var geometryMoon = new THREE.SphereGeometry(0.1, 100, 100); 
	//moon material 
	var materialMoon = new THREE.MeshLambertMaterial();
	materialMoon.combine = 0; 
	materialMoon.needsUpdate=true; 
	materialMoon.wireframe = false; 
	
	
    //
    // Task 2: uncommenting the following two lines requires you to run this example with a (local) webserver
    //
    // For example using python:
    //    1. open a command line and go to the lab folder
    //    2. run "python -m http.server"
    //    3. open your browser and go to http://localhost:8000
    //
    // see https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally
    //
    
	//earth texture 
	const earthTexture = texloader.load('tex/2k_earth_daymap.jpg');
    materialEarth.map = earthTexture;
    
	//moon texture 
	const moonTexture = texloader.load('tex/2k_moon.jpg'); 
	materialMoon.map = moonTexture; 
	
	//add sun texture 
	const sunTexture = texloader.load('tex/2k_sun.jpg'); 
	materialSun.map = sunTexture; 

    // Task 7: material using custom Vertex Shader and Fragment Shader
    
	var uniforms = THREE.UniformsUtils.merge( [
	    { 
	    	colorTexture : { value : new THREE.Texture() },
			specularMap: { value: new THREE.Texture() }
    	},
	    THREE.UniformsLib[ "lights" ]
	] );

	const shaderMaterial = new THREE.ShaderMaterial({
		uniforms : uniforms,
		vertexShader : document.getElementById('vertexShader').textContent.trim(),
		fragmentShader : document.getElementById('fragmentShader').textContent.trim(),
		lights : true
	});
	shaderMaterial.uniforms.colorTexture.value = earthTexture;
	
	//spec map for shader
	const specularMap = texloader.load("tex/2k_earth_specular_map.jpg");
	shaderMaterial.uniforms.specularMap.value = specularMap;


	//add earth object to mesh 
    earthMesh = new THREE.Mesh(geometryEarth, shaderMaterial);
	//earthMesh = uniforms;
	
	//add moon object to mesh 
	moonMesh = new THREE.Mesh(geometryMoon, materialMoon); 
	
	//sun mesh 
	sunMesh = new THREE.Mesh(geometrySun, materialSun); 

    createSceneGraph();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    var checkBoxAnim = document.getElementById('animation');
    animation = checkBoxAnim.checked;
    checkBoxAnim.addEventListener('change', (event) => {
    	animation = event.target.checked;
    });

	var checkBoxWireframe = document.getElementById('wireframe');
	//earth 
    earthMesh.material.wireframe = checkBoxWireframe.checked;
	moonMesh.material.wireframe = checkBoxWireframe.checked;
	sunMesh.material.wireframe = checkBoxWireframe.checked; 
    checkBoxWireframe.addEventListener('change', (event) => {
    	earthMesh.material.wireframe = event.target.checked;
		moonMesh.material.wireframe = event.target.checked; 
		sunMesh.material.wireframe = event.target.checked; 
		
    });
	

}

function render() {
    // Set up the camera
    camera.position.x = mouseX * 10;
    camera.position.y = -mouseY * 10;
    camera.lookAt(scene.position);

    // Perform animations
    if (animation) {
    	earthSpin.rotation.y += Math.PI*2/60;
		earthOrbit.rotation.y += (Math.PI*2/60)/365; 
		moonRotate.rotation.y += (Math.PI*2 /60)/27.3; 
		sunSpin.rotation.y += (Math.PI*2/60)/25; 
    }
	
	
	
    // Render the scene
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate); // Request to be called again for next frame
    render();
}

init(); // Set up the scene
animate(); // Enter an infinite loop
