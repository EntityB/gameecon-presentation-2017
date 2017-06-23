const BACKGROUND_IMAGE_PATH = "assets/mountains-back.png";
const MOVE_SPEED = 5; // how fast will background move
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

    backgroundImg = new Image;

    // load the background image
    backgroundImg.addEventListener("load", start.bind(null, ctx1, ctx2, backgroundImg));
    backgroundImg.src = BACKGROUND_IMAGE_PATH;
})();

// start both demos
function start(ctx1, ctx2, backgroundImg) {

    var data = {
        backgroundImg,
        floorOffset: 280,
        ballRadius: 20
    };

    // initilize moved background
    ctx1.moved = 0;
    ctx2.moved = 0;

    renderLoop.call(ctx1, data, 16); // demo with 60FPS
    renderLoop.call(ctx2, data, 50); // demo with 20FPS
};

function renderLoop(data, nextTick) {

    // PROBLEM PART IS HERE
    // --------------------
    // move speed is not modified with delta time
    this.moved += MOVE_SPEED;


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
    var centerX, centerY, ballYPosition;
    centerX = this.width * 0.5;
    centerY = this.height * 0.5;

    // ball jump height formula
    ballYPosition = Math.abs(Math.sin(Math.PI * 2 * this.moved * 0.001)) * 130;

    // render the ball
    this.beginPath();
    this.arc(centerX, data.floorOffset - data.ballRadius - ballYPosition, data.ballRadius, 0, 2 * Math.PI, false);
    this.fillStyle = '#772324';
    this.fill();
    this.lineWidth = 5;
    this.strokeStyle = '#BB4521';
    this.stroke();
}

function renderGround(data) {
    this.fillStyle = '#335533';
    this.fillRect(0, data.floorOffset, WIDTH, HEIGHT);
}