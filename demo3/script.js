const BACKGROUND_IMAGE_PATH = "assets/mountains-back.png";
const MOVE_SPEED = 1; // how fast will background move
const WIDTH = 640;
const HEIGHT = 320;

// initalize render context
(function preload() {
    var canvas1, canvas2, ctx1, ctx2, backgroundImg;

    canvas1 = document.getElementById("canvas-1");
    canvas2 = document.getElementById("canvas-2");

    canvas1.width = WIDTH;
    canvas1.height = HEIGHT;
    canvas2.width = WIDTH;
    canvas2.height = HEIGHT;

    ctx1 = canvas1.getContext("2d");
    ctx2 = canvas2.getContext("2d");

    // just passing few values with render context
    ctx1.width = WIDTH;
    ctx1.height = HEIGHT;
    ctx2.width = WIDTH;
    ctx2.height = HEIGHT;

    // initalize moveforward
    ctx1.moveForward = false;
    ctx2.moveForward = false;

    //  bind start and jump function on click
    canvas1.addEventListener("click", function startMoving() {
        ctx1.moveForward = true;
        ctx2.moveForward = true;
        canvas1.removeEventListener("click", startMoving);
        canvas1.addEventListener("click", function jumpEvent() {
            ctx1.jump = true;
            ctx2.jump = true;
            canvas1.removeEventListener("click", jumpEvent);
        });
    }, false);

    backgroundImg = new Image;

    // load the background image
    backgroundImg.addEventListener("load", start.bind(null, ctx1, ctx2, backgroundImg));
    backgroundImg.src = BACKGROUND_IMAGE_PATH;
})();

// start both demos
function start(ctx1, ctx2, backgroundImg) {

    var data = {
        backgroundImg,
        floorOffset: 150,
        ballRadius: 20
    };

    // initilize moved background
    ctx1.moved = 0;
    ctx2.moved = 0;
    ctx1.fallingSpeed = 0;
    ctx2.fallingSpeed = 0;
    ctx1.ballYPosition = 0;
    ctx2.ballYPosition = 0;

    // create last time
    var now = performance.now();
    ctx1.lastTime = now;
    ctx2.lastTime = now;

    renderLoop.call(ctx1, data, 16); // demo with 60FPS
    renderLoop.call(ctx2, data, 250); // demo with 20FPS
};

function renderLoop(data, nextTick) {

    var deltaTime, now, mod;
    now = performance.now();
    deltaTime = now - this.lastTime; // calculate delta time
    this.lastTime = now; // change last time we udpated for future usage
    mod = deltaTime * 60 * 0.001;

    // modify move speed with deltaTime
    if (this.moveForward) {
        this.moved += MOVE_SPEED * mod;
    }

    // check if we jump and if jump is valid
    // make acceleration upward
    if (this.jump === true && this.moved * 2 <= WIDTH * 0.5 && Math.abs(this.ballYPosition) < 0.001) {
        this.fallingSpeed -= 1; // force directly up
        this.jump = false; // dont jump in next loop
    }

    // increase falling speed and adjust position
    if (this.moved * 2 > WIDTH * 0.5 || this.ballYPosition > 0 || this.fallingSpeed < 0) {
        this.ballYPosition -= (this.fallingSpeed * 2 + 0.01 * mod) * 0.5 * mod;
        this.fallingSpeed += 0.01 * mod;
    }

    // remove falling force if the ball is on the floor
    if (this.moved * 2 <= WIDTH * 0.5 && this.ballYPosition < 0) {
        this.ballYPosition = 0;
        this.fallingSpeed = 0;
    }

    // prepare for fresh rendering
    this.clearRect(0, 0, this.width, this.height);

    // render entire scene
    renderBackground.call(this, data);
    renderBall.call(this, data);
    renderGround.call(this, data);
    // repetion
    setTimeout(renderLoop.bind(this, data, nextTick), nextTick);
}

function renderBackground(data) {
    var img, aspectRatio, bgSize;
    img = data.backgroundImg;

    this.drawImage(img, this.moved % img.width, 0, img.width * 0.5, img.width * 0.5, // source image
        0, 60, WIDTH, HEIGHT);  // destination
    // second background
    this.drawImage(img, -img.width + (this.moved % img.width), 0, img.width * 0.5, img.width * 0.5,
        0, 60, WIDTH, HEIGHT);
}

function renderBall(data) {
    var centerX, centerY;
    centerX = this.width * 0.5;
    centerY = this.height * 0.5;

    // problem code
    // if ball can jump is resolved in too small chunk


    // render the ball
    this.beginPath();
    this.arc(centerX, data.floorOffset - data.ballRadius - this.ballYPosition, data.ballRadius, 0, 2 * Math.PI, false);
    this.fillStyle = '#772324';
    this.fill();
    this.lineWidth = 5;
    this.strokeStyle = '#BB4521';
    this.stroke();
}

function renderGround(data) {
    this.fillStyle = '#335533';
    this.fillRect(-20 - this.moved * 2, data.floorOffset, WIDTH, HEIGHT);
}