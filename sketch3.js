const p5Container = document.querySelector(".pingpong_everything");
let w = p5Container.clientWidth;
let h = p5Container.clientHeight;



let cnv;

//////// Sketch 1 variables ////////
let balls = [];
let images = [];
let texts = [
  "FILM & MEDIA", "FINANCE", "FOOD & BEVERAGE",
  "EDUCATION", "LIFESTYLE", "SOCIAL IMPACT", "WELLNESS"
];

let active1 = false;

//////// Sketch 2 variables ////////
let cities = [
  "UK", "NETHERLANDS", "GERMANY", "PHILIPPINES", "MALAYSIA",
  "THAILAND", "AUSTRALIA", "INDIA", "AFRICA", "SOUTH AMERICA", "USA"
];

let angleOffset = 0;
let explosionProgress = 0;
const expansionDuration = 120;
const retractDuration = 20;
let active2 = false;

let cityRadiusMin = [];
let cityRadiusMax = [];

function preload() {
  for (let i = 0; i < 9; i++) {
    images.push(loadImage('assets/everything_' + i + '.png'));
  }
}

function setup() {
  // Create one canvas large enough to cover both containers or choose one container
  // Here, I'll create a canvas that fills the window and position containers absolutely in CSS
  cnv = createCanvas(w, h);
  cnv.parent(pingpong_everything);

  textAlign(CENTER, CENTER);
  textSize(12);
  pixelDensity(2);

  // Setup sketch1 balls
  for (let i = 0; i < texts.length; i++) {
    let r = random(h / 14, h / 5);
    balls.push(new Ball(random(r, width - r), 0, r, 'text', texts[i]));
  }
  for (let i = 0; i < images.length; i++) {
    let r = random(h / 14, h / 5);
    balls.push(new Ball(random(r, width - r), 0, r, 'image', null, images[i])); //instead of 0--- random(-h*0.5, -h*0.4)
  }

  // Setup sketch2 city radius ranges
  for (let i = 0; i < cities.length; i++) {
    cityRadiusMin.push(random(h / 7, h / 4));
    cityRadiusMax.push(random(h / 4, h / 3));
  }

  // Buttons for sketch 1
  const btn1 = document.getElementById('everything');
  btn1.addEventListener('mouseenter', () => {
    startSketch1();
  });
  btn1.addEventListener('mouseleave', () => {
    stopSketch1();
  });

  // Buttons for sketch 2
  const btn2 = document.getElementById('everywhere');
  btn2.addEventListener('mouseenter', () => {
    startSketch2();
  });
  btn2.addEventListener('mouseleave', () => {
    stopSketch2();
  });
}

function draw() {
  background(255);

  if (active1) {
    drawSketch1();
  }

  if (active2) {
    drawSketch2();
  }
}

// --- Sketch1 methods ---

function drawSketch1() {
  for (let i = 0; i < balls.length; i++) {
    let b = balls[i];
    b.applyGravity();
    b.update();
    b.checkGroundCollision();
    b.checkWallCollision();

    for (let j = i + 1; j < balls.length; j++) {
      b.checkCollision(balls[j]);
    }

    b.display();
  }
}

function startSketch1() {
  for (let b of balls) {
    let r = b.r;
    b.x = random(r, width - r);
    b.y = random(-h*0.5, -h*0.4);
    b.vx = 0;
    b.vy = 0;
  }
  active1 = true;
}

function stopSketch1() {
  active1 = false;
  
}

// Ball class remains same as your sketch 1
class Ball {
  constructor(x, y, r, type, label = "", img = null) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.2;
    this.bounciness = 0.4;
    this.type = type;
    this.label = label;
    this.img = img;
    this.masked = null;

    if (type === 'image') {
      this.createMaskedImage();
    }
  }

  createMaskedImage() {
    let g = createGraphics(this.r * 2, this.r * 2);
    g.pixelDensity(2);
    g.noStroke();
    g.ellipse(this.r, this.r, this.r * 2);
    g.drawingContext.globalCompositeOperation = 'source-in';
    g.imageMode(CENTER);
    g.image(this.img, this.r, this.r, this.r * 2, this.r * 2);
    this.masked = g;
  }

  applyGravity() {
    this.vy += this.gravity;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  checkGroundCollision() {
    if (this.y + this.r > height) {
      this.y = height - this.r;
      this.vy *= -this.bounciness;
      if (abs(this.vy) < 0.5) this.vy = 0;
    }
  }

  checkWallCollision() {
    if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx *= -this.bounciness;
    }
    if (this.x + this.r > width) {
      this.x = width - this.r;
      this.vx *= -this.bounciness;
    }
  }

  checkCollision(other) {
    let dx = other.x - this.x;
    let dy = other.y - this.y;
    let dist = sqrt(dx * dx + dy * dy);
    let minDist = this.r + other.r;

    if (dist < minDist && dist !== 0) {
      let overlap = (minDist - dist) / 2;
      let angle = atan2(dy, dx);
      let ox = cos(angle) * overlap;
      let oy = sin(angle) * overlap;

      this.x -= ox;
      this.y -= oy;
      other.x += ox;
      other.y += oy;

      let vxTotal = this.vx - other.vx;
      let vyTotal = this.vy - other.vy;

      this.vx -= vxTotal * this.bounciness;
      this.vy -= vyTotal * this.bounciness;
      other.vx += vxTotal * other.bounciness;
      other.vy += vyTotal * other.bounciness;
    }
  }

  display() {
    noStroke();

    if (this.type === 'text') {
      fill('#FFD60D');
      ellipse(this.x, this.y, this.r * 2);
      fill(0);
      textSize(12);
      text(this.label, this.x, this.y);
    } else if (this.type === 'image' && this.masked) {
      imageMode(CENTER);
      image(this.masked, this.x, this.y);
    }
  }
}

// --- Sketch2 methods ---

function drawSketch2() {

  translate(width / 2, height * 0.35);

  // Update expansion or retraction progress
  if (explosionProgress < 1 && active2) {
    explosionProgress += 1 / expansionDuration;
    explosionProgress = min(explosionProgress, 1);
  } else if (!active2 && explosionProgress > 0) {
    explosionProgress -= 1 / retractDuration;
    explosionProgress = max(explosionProgress, 0);
  }

  for (let i = 0; i < cities.length; i++) {
    let angle = map(i, 0, cities.length, 0, TWO_PI) + angleOffset;

    // Varying the base radius
    let radius = map(sin(frameCount * 0.01 + i), -1, 1, cityRadiusMin[i], cityRadiusMax[i]);

    // Elliptical radii
    let radiusX = radius * 2.5; // Wider horizontal radius
    let radiusY = radius;       // Normal vertical radius

    // Compute elliptical position
    let x = cos(angle) * radiusX;
    let y = sin(angle) * radiusY;

    // Animate explosion/retraction
    let targetX = x;
    let targetY = y;
    x = lerp(0, targetX, easeOutQuart(explosionProgress));
    y = lerp(0, targetY, easeOutQuart(explosionProgress));

    // Line endpoint slightly before city
    let margin = 20;
    let distToCity = dist(0, 0, x, y);
    let lineX = x * (distToCity - margin) / distToCity;
    let lineY = y * (distToCity - margin) / distToCity;

    stroke('#FFD60D');
    strokeWeight(2);
    line(0, 0, lineX, lineY);
    noStroke();

    // Label background
    let labelWidth = textWidth(cities[i]) + 10;
    let labelHeight = 20;
    fill(255);
    rectMode(CENTER);
    rect(lineX, lineY, labelWidth, labelHeight);

    // Label text
    fill(0);
    text(cities[i], x, y);
  }

  // Center circle (drawn last so it’s above lines)
  fill(255);
  noStroke();
  ellipse(0, 0, 120, 120);
  fill(0);
  text("all at once.", 0, 0);

  angleOffset += 0.002;
}

function startSketch2() {
    explosionProgress = 0;  
  angleOffset = 0;
  active2 = true;
}

function stopSketch2() {
  active2 = false;
}

function easeOutQuart(t) {
  return 1 - pow(1 - t, 4);
}

function windowResized() {
w = p5Container.clientWidth;
h = p5Container.clientHeight;
resizeCanvas(w, h);
redraw();
}
