const BACKGROUND_IMAGE_PATH = "assets/mountains-back.png";
const MOVE_SPEED = 1; // how fast will background move
const WIDTH = 640;
const HEIGHT = 320;

function preload() {
    var canvas1, canvas2, rootNode, nodes1, nodes2;

    canvas1 = document.getElementById("canvas-1");
    canvas2 = document.getElementById("canvas-2");

    // create child structure
    var nodes1 = preloadDemo(canvas1);
    var nodes2 = preloadDemo(canvas2);

    // notify renderers about 
    canvas1.addEventListener("click", (e) => nodes1.demoRenderer.propagateInteraction(e), false);
    canvas1.addEventListener("click", (e) => nodes2.demoRenderer.propagateInteraction(e), false);

    // change behavior for second demo to skip every 15 updates 
    nodes2.demoNode.skippedUpdates = 0;
    nodes2.demoNode.accumulateDeltaTime = 0;
    nodes2.demoNode.update = function (deltaTime) {
        this.skippedUpdates++;
        this.accumulateDeltaTime += deltaTime;
        if (this.skippedUpdates === 15) {
            Chronos.prototype.update.call(nodes2.demoNode, this.accumulateDeltaTime);
            this.skippedUpdates = 0;
            this.accumulateDeltaTime = 0;
        }
    };

    // define root structure and bind child demo nodes
    rootNode = new TopChronos();
    rootNode.registerListener(nodes1.demoNode);
    rootNode.registerListener(nodes2.demoNode);
    rootNode.start();
}

function preloadDemo(canvas) {

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    ctx = canvas.getContext("2d");

    var demoNode = new Chronos();

    var demoRenderer = new RenderManager(ctx, WIDTH, HEIGHT);
    demoNode.registerListener(demoRenderer);

    // return nodes for custom binding
    return {
        demoNode, demoRenderer
    };
};


var RenderManager = function (ctx, width, height) {
    Chronos.call(this);
    this.moved;
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.data = {};
    this._initData();
    this._initChain();
};

RenderManager.prototype = Object.assign({}, Chronos.prototype, {
    _initData: function () {
        Object.assign(this.data, {
            bgData: {
                xShift: 0,
                moveSpeed: MOVE_SPEED
            },
            groundData: {
                xShift: 0,
                moveSpeed: MOVE_SPEED
            },
            ballData: {
                ballYPosition: 0,
                moveSpeed: MOVE_SPEED,
                acceleration: 0
            }
        });
    },
    _initChain: function () {
        this.bgRenderer = new BackgroundRenderer(this.ctx, this.width, this.height, this.data.bgData);
        this.registerListener(this.bgRenderer);

        this.groundRenderer = new GroundRenderer(this.ctx, this.width, this.height, this.data.groundData);
        this.registerListener(this.groundRenderer);

        this.ballRenderer = new BallRenderer(this.ctx, this.width, this.height, this.data.ballData);
        this.registerListener(this.ballRenderer);

    },
    update: function (deltaTime) {

        var modedTime = deltaTime * 60 * 0.001;

        // prepare for fresh rendering
        this.ctx.clearRect(0, 0, this.width, this.height);

        Chronos.prototype.update.call(this, modedTime)
    },
    propagateInteraction: function (e) {
        var animator = new Animator(this.data);
        this.prependListener(animator);
        this.propagateInteraction = function (e) {
            animator.ballJump(e);
        }
    }
});

//========================================================
// Animator is responsible for changing object orientation
//========================================================

var Animator = function (data) {
    this.groundData = data.groundData;
    this.ballData = data.ballData;
    this.bgData = data.bgData;
    this.jump = false;
};

Animator.prototype = {
    animateBgPosition: function (deltaTime) {
        this.bgData.xShift += this.bgData.moveSpeed * deltaTime;
    },
    animateBallPosition: function (deltaTime) {
        // check if we jump and if jump is valid
        // make acceleration upward
        if (this.jump === true && this.bgData.xShift * 2 <= WIDTH * 0.5 && Math.abs(this.ballData.ballYPosition) < 0.001) {
            this.ballData.acceleration -= 1; // force directly up
            this.jump = false; // dont jump in next loop
        }

        // increase falling speed and adjust position
        if (this.bgData.xShift * 2 > WIDTH * 0.5 || this.ballData.ballYPosition > 0 || this.ballData.acceleration < 0) {
            this.ballData.ballYPosition -= (this.ballData.acceleration * 2 + 0.01 * deltaTime) * 0.5 * deltaTime;
            this.ballData.acceleration += 0.01 * deltaTime;
        }

        // remove falling force if the ball is on the ground
        if (this.bgData.xShift * 2 <= WIDTH * 0.5 && this.ballData.ballYPosition < 0) {
            this.ballData.ballYPosition = 0;
            this.ballData.acceleration = 0;
        }
    },
    animateGroundPosition: function (deltaTime) {
        this.groundData.xShift += this.bgData.moveSpeed * deltaTime * 2;
    },
    update: function (deltaTime) {
        this.animateBgPosition(deltaTime);
        this.animateBallPosition(deltaTime);
        this.animateGroundPosition(deltaTime);
    },
    ballJump: function (e) {
        this.jump = true;
    }
};

//===============================================
// Renderers are responsible for specific objects
//===============================================

var BackgroundRenderer = function (ctx, width, height, data) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.backgroundImg = new Image();
    this.data = data;
    this._init();
};

BackgroundRenderer.prototype = {
    _init: function () {
        // load the background image
        this.backgroundImg.addEventListener("load", () => {
            this.update = this._update;
        });
        this.backgroundImg.src = BACKGROUND_IMAGE_PATH;
    },
    update: function () {

    },
    _update: function (modedTime) { // renders new background with each update
        var img = this.backgroundImg;

        this.ctx.drawImage(img, this.data.xShift % img.width, 0, img.width * 0.5, img.width * 0.5, // source image
            0, 60, this.width, this.height);  // destination
        // second background
        this.ctx.drawImage(img, -img.width + (this.data.xShift % img.width), 0, img.width * 0.5, img.width * 0.5,
            0, 60, this.width, this.height);
    }
};


var BallRenderer = function (ctx, width, height, data) {
    this.ctx = ctx;
    this.centerX = width * 0.5;
    this.centerY = height * 0.5;
    this.groundOffset = 0.46875 * height;
    this.ballRadius = 20;
    this.data = data;
};

BallRenderer.prototype = {
    update: function (modedTime) { // renders new ball with each update
        // render the ball
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.groundOffset - this.ballRadius - this.data.ballYPosition, this.ballRadius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = '#772324';
        this.ctx.fill();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = '#BB4521';
        this.ctx.stroke();
    }
};

var GroundRenderer = function (ctx, width, height, data) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.groundYOffset = 0.46875 * this.height;
    this.groundXOffset = -0.001953125 * this.width;
    this.data = data;
};

GroundRenderer.prototype = {
    update: function (modedTime) {  // renders new ground with each update
        this.ctx.fillStyle = '#335533';
        this.ctx.fillRect(this.groundXOffset - this.data.xShift, this.groundYOffset, this.width, this.height);
    },
};

// start demo with preload
preload();