var streams = void 0;

function setup() {
  createCanvas(innerWidth, innerHeight);
  textFont('monospace', 16);
  colorMode(HSL);
  streams = Streams();
}

function draw() {
  // opacity set on background to add a bit of a blur effect
  background(0, 0, 0, 0.6);
  streams.draw();
}

function Streams() {
  // set up the streams
  var streams = [];
  for (var i = 0; i < innerWidth / textSize(); i++) {
    var x = i * textSize();
    var y = round(random(-1000, 0));
    var speed = round(random(3, 7));
    var length = round(random(1, innerHeight / textSize()));
    var stream = Stream(x, y, speed, length);
    streams.push(stream);
  }

  // return object with access to draw function
  return {
    draw: function draw() {
      for (var _i = 0, _length = streams.length; _i < _length; _i++) {
        streams[_i].draw();
      }
    }
  };
}

function Stream(x, y, speed, length) {
  // setup symbols in stream
  var symbols = [];
  for (var i = 0; i < length; i++) {
    var changeRate = round(random(20, 40));
    var lightness = void 0;
    if (i === 0) {
      lightness = (1 - i / length) * 100;
    } else if (i === 1) {
      lightness = (1 - i / length) * 95;
    } else if (i === 2) {
      lightness = (1 - i / length) * 90;
    } else {
      lightness = (1 - i / length) * 50;
    }
    var colour = [120, 100, lightness];
    var symbol = _Symbol(x, y, speed, changeRate, colour);
    symbols.push(symbol);
    y -= textSize();
  }

  // return object with access to draw function
  return {
    draw: function draw() {
      for (var _i2 = 0, _length2 = symbols.length; _i2 < _length2; _i2++) {
        symbols[_i2].draw();
      }
    }
  };
}

function _Symbol(x, y, speed, changeRate, colour) {
  var character = void 0;

  // return object with access to draw function
  return {
    draw: function draw() {
      if (frameCount % changeRate === 0 || !character) {
        character = char(round(random(65381, 65440)));
      }
      y = y > height + textSize() ? 0 : y + speed;
      fill(colour);
      text(character, x, y);
    }
  };
}

function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
  streams = Streams();
}