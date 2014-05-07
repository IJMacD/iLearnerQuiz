$(function() {
    var GameObject = GE.GameObject,
        GameComponent = GE.GameComponent,
        GEC = GE.Comp,

        canvas = $('#surface'),
        context = canvas[0].getContext("2d"),
        gl = context,
        canvasWidth = canvas.width(),
        canvasHeight = canvas.height(),
        gameRoot = new GE.GameObjectManager(),
        backgroundSystem,
        inputSystem,
        cameraSystem,
        renderSystem,
        cameraDistance,
        lastTime = 0;

    function initCanvas(){
        canvas[0].width = canvasWidth;
        canvas[0].height = canvasHeight;
        gl.viewportWidth = canvasWidth;
        gl.viewportHeight = canvasHeight;
        cameraSystem && cameraSystem.setScreenSize(canvasWidth, canvasHeight);
        renderSystem && renderSystem.setCanvasSize(canvasWidth, canvasHeight);
    }

    var textures = [],
        texturePaths = [
            "sprite_player.png",
            "sprite_ai.png",
            "sprite34.png",
            "sprite_player_r.png"
        ];
    function initTextures() {
        $.each(texturePaths, function(i,path){
            var texture = {};
            texture.image = new Image();
            texture.image.onload = function() {
                handleLoadedTexture(texture)
            }
            texture.image.src = path;
            textures[i] = texture;
        });
    }

    function handleLoadedTexture(texture) { }

    initCanvas();

    initTextures();

    function goFullscreen(){
        canvas[0].webkitRequestFullscreen();
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        initCanvas();
    }

    function toggleDebug(){
        GE.DEBUG = !GE.DEBUG;
        debugBtn.toggleClass("active", GE.DEBUG);
        if(GE.DEBUG){
        }
        else {
        }
    }

    $('#fullscr-btn').on("click", goFullscreen);

    var debugBtn = $('#debug-btn').on("click", toggleDebug);

    $(window).on("resize", function(){
        canvasWidth = canvas.width();
        canvasHeight = canvas.height();
        initCanvas();
    }).on("keyup", function(e){
        if(e.which == 122){ // F11
            goFullscreen();
            e.preventDefault();
        }
    });


    function SpriteMovementComponent(sprites){
        this.sprites = sprites;
    }
    SpriteMovementComponent.prototype = new GameComponent();
    SpriteMovementComponent.prototype.update = function(parent, delta){
        var epsilon = 0.025;

        if(this.sprites.moveLeft && parent.velocity[0] < -epsilon){
            parent.sprite = this.sprites.moveLeft;
            return;
        }

        if(this.sprites.moveRight && parent.velocity[0] > epsilon){
            parent.sprite = this.sprites.moveRight;
            return;
        }

        if(this.sprites.move && Math.abs(parent.velocity[0]) > epsilon){
            parent.sprite = this.sprites.move;
            return;
        }

        if(this.sprites.stop && Math.abs(parent.velocity[0]) < epsilon){
            parent.sprite = this.sprites.stop;
            return;
        }
    }


    function SpriteSheetRenderingComponent(renderSystem){
        this.renderSystem = renderSystem;
    }
    SpriteSheetRenderingComponent.prototype = new GameComponent();
    SpriteSheetRenderingComponent.prototype.update = function(parent, delta) {
        var frame = parent.sprite[parent.spriteIndex%parent.sprite.length],
            image = frame && frame.i;
        this.renderSystem.push(function(context){
            var x = parent.position[0],
                y = parent.position[1],
                w = frame.w,
                h = frame.h;
            context.translate(x,y);
            context.rotate(parent.rotation);
            context.drawImage(image, frame.x, frame.y, w, h, -frame.ox, -frame.oy, w, h);
        });
    };

    function SpriteAnimationComponent(duration){
        this.duration = duration;
        this.countdown = duration;
    }
    SpriteAnimationComponent.prototype = new GameComponent();
    SpriteAnimationComponent.prototype.update = function(parent, delta) {
        var spriteCount = parent.sprite.length;
        this.countdown -= delta;
        if(this.countdown < 0){
            parent.spriteIndex = (parent.spriteIndex + 1) % spriteCount;
            this.countdown = this.duration;
        }
    };

    GE.GameComponent.create(function PlayerComponent(){},
    {
        update: function(parent, delta){
            if(inputSystem.lastKey == 37){
                parent.velocity[0] = -0.1;
            }
            else if(inputSystem.lastKey == 39){
                parent.velocity[0] = 0.1;
            }
            else if(inputSystem.lastKey == 32){
                parent.velocity[1] = -0.5;
            }
        }
    });



    var playerSpriteDataRight = [
            {i:textures[0].image,x:0,y:0,w:187,h:171,ox:50,oy:150},
            {i:textures[0].image,x:187,y:0,w:187,h:171,ox:50,oy:150},
            {i:textures[0].image,x:0,y:171,w:187,h:171,ox:50,oy:150},
            {i:textures[0].image,x:187,y:171,w:187,h:171,ox:50,oy:150},
            {i:textures[0].image,x:0,y:342,w:187,h:171,ox:50,oy:150},
            {i:textures[0].image,x:187,y:342,w:187,h:171,ox:50,oy:150},
            {i:textures[0].image,x:0,y:513,w:187,h:171,ox:50,oy:150},
            // {x:187,y:513,w:187,h:171,ox:50,oy:150}
            // {x:0,y:684,w:187,h:171,ox:50,oy:150},
            // {x:187,y:684,w:187,h:171,ox:50,oy:150}
        ],
        playerSpriteDataLeft = [
            {i:textures[3].image,x:0,y:0,w:187,h:171,ox:50,oy:150},
            {i:textures[3].image,x:187,y:0,w:187,h:171,ox:50,oy:150},
            {i:textures[3].image,x:0,y:171,w:187,h:171,ox:50,oy:150},
            {i:textures[3].image,x:187,y:171,w:187,h:171,ox:50,oy:150},
            {i:textures[3].image,x:0,y:342,w:187,h:171,ox:50,oy:150},
            {i:textures[3].image,x:187,y:342,w:187,h:171,ox:50,oy:150},
            {i:textures[3].image,x:0,y:513,w:187,h:171,ox:50,oy:150},
            // {x:187,y:513,w:187,h:171,ox:50,oy:150},
            // {x:0,y:684,w:187,h:171,ox:50,oy:150},
            // {x:187,y:684,w:187,h:171,ox:50,oy:150}
        ],
        playerSpriteDataStop = [
            {i:textures[0].image,x:187,y:171,w:187,h:171,ox:50,oy:150}
        ],
        aiSpritesMove = [
            {i:textures[1].image,x:0,y:0,w:83,h:158,ox:40,oy:140},
            {i:textures[1].image,x:83,y:0,w:86,h:154,ox:40,oy:140},
            {i:textures[1].image,x:169,y:0,w:90,h:151,ox:40,oy:140},
            {i:textures[1].image,x:259,y:0,w:87,h:138,ox:40,oy:140},
            {i:textures[1].image,x:346,y:0,w:88,h:160,ox:40,oy:140},
            {i:textures[1].image,x:0,y:160,w:87,h:154,ox:40,oy:140},
            {i:textures[1].image,x:87,y:160,w:90,h:151,ox:40,oy:140},
            // {x:177,y:160,w:85,h:140,ox:40,oy:140}
        ],
        aiSpritesStop = [
            {i:textures[1].image,x:177,y:160,w:85,h:140,ox:40,oy:140}
        ],

        world = {
            bounds: [0,0,2046,canvasHeight-100],
            background: [   0,   0,
                         2046,   0,
                         2046, 300,
                            0, 300,
                            0,   0]
        };





    inputSystem = new GE.InputSystem();
    backgroundSystem = new GE.BackgroundSystem(world.background);
    cameraSystem = new GE.CameraSystem(0, 0, canvasWidth, canvasHeight);
    renderSystem = new GE.CanvasRenderSystem(context, canvasWidth, canvasHeight, cameraSystem);
    cameraDistance = 1000;
    cameraSystem.setScale(1000/cameraDistance);
    cameraSystem.setPosition(0,150);
    // cameraSystem.rotation = 0;

    gameRoot.addObject(backgroundSystem);
    gameRoot.addObject(cameraSystem);
    gameRoot.addObject(renderSystem);

    backgroundSystem.addComponent(new GEC.DebugDrawPathComponent(renderSystem, world.background));
    backgroundSystem.addComponent(new GEC.DebugDrawPathNormalsComponent(renderSystem, world.background));

    var background;

    background = new GameObject();
    background.setPosition(0,200);
    background.sprite = textures[2].image;
    background.addComponent(new GEC.CanvasSpriteRenderingComponent(renderSystem));
    gameRoot.addObject(background);

    background = new GameObject();
    background.setPosition(1032,200);
    background.sprite = textures[2].image;
    background.addComponent(new GEC.CanvasSpriteRenderingComponent(renderSystem));
    gameRoot.addObject(background);

    background = new GameObject();
    background.setPosition(2064,200);
    background.sprite = textures[2].image;
    background.addComponent(new GEC.CanvasSpriteRenderingComponent(renderSystem));
    gameRoot.addObject(background);

    var player = new GameObject();

    player.setPosition(10, 10);

    player.addComponent(new GEC.PlayerComponent());

    player.addComponent(new GEC.GravityComponent());

    player.addComponent(new GEC.MoveComponent());

    player.addComponent(new GEC.BackgroundCollisionComponent(backgroundSystem));

    player.addComponent(new SpriteMovementComponent({
        moveLeft: playerSpriteDataLeft,
        moveRight: playerSpriteDataRight,
        stop: playerSpriteDataStop
    }));
    player.addComponent(new SpriteAnimationComponent(66));
    player.addComponent(new SpriteSheetRenderingComponent(renderSystem));

    player.spriteIndex = 0;
    player.sprite = playerSpriteDataStop;

    player.addComponent(new GEC.DebugDrawTrailComponent(renderSystem));
    player.addComponent(new GEC.DebugDrawDataComponent(renderSystem));
    player.addComponent(new GEC.DebugDrawCenterComponent(renderSystem));


    var ai = new GameObject();

    ai.setPosition(200, 200);

    ai.addComponent(new SpriteMovementComponent({
        move: aiSpritesMove,
        stop: aiSpritesStop
    }));
    ai.addComponent(new SpriteAnimationComponent(66));
    ai.addComponent(new SpriteSheetRenderingComponent(renderSystem));

    ai.spriteIndex = 0;
    ai.sprite = aiSpritesStop;

    ai.addComponent(new GEC.GravityComponent());

    ai.addComponent(new GEC.MoveComponent());
    ai.setVelocity(0.11,0);

    ai.addComponent(new GEC.BackgroundCollisionComponent(backgroundSystem));

    ai.addComponent(new GEC.DebugDrawCenterComponent(renderSystem));



    gameRoot.addObject(ai);
    gameRoot.addObject(player);

    gameRoot.addObject(inputSystem);

    cameraSystem.addComponent({
        update: function(parent, delta){
            parent.position[0] = player.position[0] + canvasWidth/2 - 200;
        }
    });

    function loop(time){
        requestAnimationFrame(loop);
        gameRoot.update(Math.min(time - lastTime,100));
        lastTime = time;
    }
    loop(0);

});
