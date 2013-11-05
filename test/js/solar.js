$(function() {
    var GameObject = GE.GameObject,
        GameComponent = GE.GameComponent,
        GEC = GE.Comp,

        canvas = $('#surface'),
        context = canvas[0].getContext("experimental-webgl"),
        gl = context,
        canvasWidth = canvas.width(),
        canvasHeight = canvas.height(),
        gameRoot = new GE.GameObjectManager(),
        cameraSystem,
        renderSystem,
        planet,
        sun,
        lastTime = 0;

    function initCanvas(width,height){
        // canvas.removeAttr("width");
        // canvas.removeAttr("height");
        // canvasWidth = width||canvas.width();
        // canvasHeight = height||canvas.height();
        canvas[0].width = canvasWidth;
        canvas[0].height = canvasHeight;
        gl.viewportWidth = canvasWidth;
        gl.viewportHeight = canvasHeight,
        cameraSystem && cameraSystem.setScreenSize(canvasWidth, canvasHeight);
        renderSystem && renderSystem.setCanvasSize(canvasWidth, canvasHeight);
    }

    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var shaderProgram;

    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    }

    var textures = [],
        texturePaths = [
            "img/sun-mercator.jpg",
            "img/mercury.jpg",
            "img/venus.jpg",
            "img/earth.jpg",
            "img/mars.jpg",
            "img/jupiter.jpg",
            "img/saturn.jpg",
            "img/uranus.jpg",
            "img/neptune.jpg"
        ];
    function initTextures() {
        $.each(texturePaths, function(i,path){
            var texture = gl.createTexture();
            texture.image = new Image();
            texture.image.onload = function() {
                handleLoadedTexture(texture)
            }
            texture.image.src = path;
            textures[i] = texture;
        });
    }

    function handleLoadedTexture(texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    initCanvas();
    
    initShaders();

    initTextures();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    $('#fullscr-btn').on("click", function(){
        canvas[0].webkitRequestFullscreen();
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        initCanvas();
    });

    $(window).on("resize", function(){
        canvasWidth = canvas.width();
        canvasHeight = canvas.height();
        initCanvas();
    });

    GE.DEBUG = true;

    function RedBallRenderingComponent(renderSystem){
            this.renderSystem = renderSystem;
    }
    RedBallRenderingComponent.prototype = new GameComponent();
    RedBallRenderingComponent.prototype.update = function(parent, delta) {
            this.renderSystem.push(function(context){
                    context.fillStyle = "#ff0000";
                    context.beginPath();
                    context.arc(parent.position[0],parent.position[1],10,0,Math.PI*2,false);
                    context.fill();
            });
    };
    function RedBoxRenderingComponent(renderSystem){
            this.renderSystem = renderSystem;
    }
    RedBoxRenderingComponent.prototype = new GameComponent();
    RedBoxRenderingComponent.prototype.update = function(parent, delta) {
        this.renderSystem.push(function(context){
            var x = parent.position[0],
                y = parent.position[1];
            context.fillStyle = "#ff0000";
            context.translate(x,y);
            context.rotate(parent.rotation);
            context.fillRect(-10,-10,20,20);
        });
    };

    cameraSystem = new GE.CameraSystem(0, 0, canvasWidth, canvasHeight);
    renderSystem = new GE.WebGLRenderSystem(context, canvasWidth, canvasHeight, cameraSystem, shaderProgram);
    cameraSystem.setScale(1.0);
    cameraSystem.setPosition(0,-100,800);
    cameraSystem.rotation = 20*Math.PI/180;
    cameraSystem.rotationAxis = [1,0,0];

    sun = new GameObject();

    var sphereRenderer = GEC.PolyShapeRenderingComponent.createSphere(renderSystem,30,30),
        moveComponent = new GEC.MoveComponent(),
        pointGravityComponent = new GEC.PointGravityComponent(sun),
        sizes = [4,8,10,6,20,18,16,16];

    sun.mass = 1;
    sun.size = vec3.fromValues(30,30,30);
    sun.rotationAxis = vec3.fromValues(0,1,0);
    sun.addComponent(new GEC.RotationComponent(0.001));
    sun.addComponent(sphereRenderer);
    sun.texture = textures[0];

    gameRoot.addObject(sun);
    for(var i = 0; i < 8; i++){
        planet = new GameObject();
        planet.setPosition((i+1) * 50, 0, 0);
        planet.setVelocity(0, 0.01 * Math.pow(i+1,-0.8), 0.06);
        planet.size = vec3.fromValues(sizes[i],sizes[i],sizes[i]);
        planet.rotationAxis = vec3.fromValues(0,1,0);

        planet.texture = textures[i+1];

        planet.addComponent(moveComponent);
        planet.addComponent(pointGravityComponent);
        planet.addComponent(new GEC.RotationComponent(Math.random()*0.002 - 0.001));

        planet.addComponent(sphereRenderer);

        gameRoot.addObject(planet);
    }


    gameRoot.addObject(cameraSystem);
    gameRoot.addObject(renderSystem);


    function loop(time){
        requestAnimationFrame(loop);
        gameRoot.update(Math.min(time - lastTime,100));
        lastTime = time;
    }
    loop(0);

});