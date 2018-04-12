// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/cXgA1d_E-jY

// Class is exported (eslint flag)
/* exported Bird */
class Bird {
  constructor() {
    this.y = height / 2;
    this.x = max(canvas.width * 0.2, 64);

    this.gravity = 0.6;
    this.lift = -7.25;
    this.velocity = 0;

    this.icon = birdSprite;
    this.width = BIRD_SIZE;
    this.height = BIRD_SIZE;
    this.tint = [Math.random(), 1, 1];
    this.fitness = 1;
    this.dead = false;
  }

  show() {
    // draw the icon CENTERED around the X and Y coords of the bird object
    // push();
    // tint(...this.tint);
    image(
      this.icon,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
    // pop();
  }

  up() {
    this.velocity = this.lift;
  }

  update() {
    this.velocity += this.gravity;
    // this.velocity *= 0.9;
    this.y += this.velocity;

    if (this.y >= height - this.height / 2) {
      this.y = height - this.height / 2;
      this.velocity = 0;
    }

    if (this.y <= this.height / 2) {
      this.y = this.height / 2;
      this.velocity = 0;
    }
  }
}
