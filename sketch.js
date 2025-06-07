let video;
let handLandmarks = [];
let osc;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  osc = new p5.Oscillator('sine');
  osc.start();
  osc.amp(0);

  const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }});
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  const camera = new Camera(video.elt, {
    onFrame: async () => {
      await hands.send({image: video.elt});
    },
    width: 640,
    height: 480
  });
  camera.start();

  hands.onResults(results => {
    handLandmarks = results.multiHandLandmarks || [];
  });
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  let leftHand = null;
  let rightHand = null;

  if (handLandmarks.length > 0) {
    for (let i = 0; i < handLandmarks.length; i++) {
      let hand = handLandmarks[i];
      for (let point of hand) {
        fill(255, 200);
        noStroke();
        ellipse(point.x * width, point.y * height, 10, 10);
      }

      let wristX = hand[0].x;
      if (wristX < 0.5 && !leftHand) {
        leftHand = hand;
      } else if (wristX >= 0.5 && !rightHand) {
        rightHand = hand;
      }
    }

    if (leftHand) {
      let d = dist(
        leftHand[4].x * width, leftHand[4].y * height,
        leftHand[8].x * width, leftHand[8].y * height
      );
      let freq = map(d, 10, 200, 200, 1000, true);
      osc.freq(freq);
    }

    if (rightHand) {
      let d = dist(
        rightHand[4].x * width, rightHand[4].y * height,
        rightHand[8].x * width, rightHand[8].y * height
      );
      let amp = map(d, 10, 200, 0.0, 1.0, true);
      osc.amp(amp, 0.1);
    }
  }
}
