var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dots = function () {
    function Dots(width, height, spacing) {
        _classCallCheck(this, Dots);

        this.spacing = spacing;
        this.dots = [];
        this.alphaStep = 1 / 10;
        this.cols = Math.floor(width / spacing);
        this.rows = Math.floor(height / spacing);

        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;
        this.canvas = canvas;
        this.ctx = ctx;

        this.draw();
    }

    _createClass(Dots, [{
        key: 'draw',
        value: function draw() {
            var _this = this;

            var ctx = this.ctx,
                spacing = this.spacing;

            ctx.fillStyle = 'rgba(24, 129, 141, .1)';
            this.dots = Array.apply(null, Array(this.cols)).map(function (n, x) {
                return Array.apply(null, Array(_this.rows)).map(function (p, y) {
                    var dot = {
                        opacity: 0.1,
                        x: x * spacing,
                        y: y * spacing
                    };

                    ctx.fillRect(dot.x, dot.y, 1, 1);
                    return dot;
                });
            });
        }
    }, {
        key: 'ghost',
        value: function ghost() {
            var ghostDots = document.createElement('canvas');
            ghostDots.width = this.canvas.width;
            ghostDots.height = this.canvas.height;

            var dotsCtx = ghostDots.getContext('2d');
            dotsCtx.fillStyle = 'rgb(24, 129, 141)';
            this.dots.forEach(function (col) {
                col.forEach(function (dot) {
                    dotsCtx.fillRect(dot.x, dot.y, 1, 1);
                });
            });

            return ghostDots;
        }
    }]);

    return Dots;
}();

var Circuits = function () {
    function Circuits(width, height, size, minLength, maxLength) {
        var _this2 = this;

        _classCallCheck(this, Circuits);

        this.size = size;
        this.width = width;
        this.height = height;
        this.cols = ~~(width / size);
        this.rows = ~~(height / size);

        this.scene = Array.apply(null, Array(this.cols)).map(function () {
            return new Col(_this2.rows);
        });

        this.collection = [];
        this.minLength = minLength;
        this.maxLength = maxLength;

        this.populate();
        this.draw();
    }

    _createClass(Circuits, [{
        key: 'draw',
        value: function draw() {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                size = this.size;

            canvas.width = this.width;
            canvas.height = this.height;

            ctx.strokeStyle = 'rgba(59, 177, 188, 1)';
            ctx.lineWidth = Math.round(size / 10);
            this.collection.forEach(function (circuit) {
                var point = [circuit.start[0], circuit.start[1]],
                    path = circuit.path;

                ctx.beginPath();
                ctx.moveTo(point[0] * size + size / 2 + path[0][0] * size / 4, point[1] * size + size / 2 + path[0][1] * size / 4);
                path.forEach(function (dir, index) {
                    point[0] += dir[0];
                    point[1] += dir[1];
                    if (index === path.length - 1) {
                        ctx.lineTo(point[0] * size + size / 2 - dir[0] * size / 4, point[1] * size + size / 2 - dir[1] * size / 4);
                    } else {
                        ctx.lineTo(point[0] * size + size / 2, point[1] * size + size / 2);
                    }
                });
                ctx.stroke();
            });

            ctx.lineWidth = ~~(this.size / 5);
            ctx.strokeStyle = 'rgba(59, 177, 188, .6)';
            this.collection.forEach(function (circuit) {
                ctx.beginPath();
                ctx.arc(circuit.start[0] * size + size / 2, circuit.start[1] * size + size / 2, size / 4, 0, 2 * Math.PI, false);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(circuit.end[0] * size + size / 2, circuit.end[1] * size + size / 2, size / 4, 0, 2 * Math.PI, false);
                ctx.stroke();
            });

            this.canvas = canvas;
        }
    }, {
        key: 'populate',
        value: function populate() {
            var size = this.size;

            var start = null,
                n = 1000,
                maxLength = this.maxLength,
                minLength = this.minLength,
                length = 0,
                dir = null;

            while ((start = this.getStart()) && n--) {
                length = minLength + ~~(Math.random() * (maxLength - minLength));
                dir = this.getDir(start);

                this.setUsed(start[0], start[1]);
                // if we can move from this point
                if (dir[0] !== 0 || dir[1] !== 0) {
                    var circuit = new Circuit(start, size),
                        moving = true,
                        path = [start[0], start[1]],
                        coords = [start[0], start[1]];
                    length--;

                    while (moving && length) {
                        circuit.path.push(dir);
                        circuit.coords.push([path[0], path[1]]);

                        path[0] += dir[0];
                        path[1] += dir[1];

                        // set used
                        this.setUsed(path[0], path[1]);
                        // get new dir
                        dir = this.getDir(path, dir);
                        if (dir[0] === 0 && dir[1] === 0) {
                            moving = false;
                        }
                        length--;
                    }

                    if (circuit.path.length >= minLength) {
                        circuit.end = path;
                        circuit.coords.push([path[0], path[1]]);

                        var speed = Math.random() * 0.5 + 0.5;

                        circuit.things.push(things.create(circuit, speed * 1));

                        if (circuit.path.length > maxLength / 3) {
                            speed = Math.random() * 0.5 + 0.5;
                            circuit.things.push(things.create(circuit, -speed, circuit.path.length * size));
                        }

                        if (circuit.path.length > maxLength / 1.5) {
                            speed = Math.random() * 0.5 + 0.5 * (Math.random() >= 0.5 ? -1 : 1);
                            circuit.things.push(things.create(circuit, speed, Math.random() * circuit.path.length * size));
                        }

                        circuit.length = circuit.path.length * size;
                        this.collection.push(circuit);
                    }
                }
            }
        }
    }, {
        key: 'getStart',
        value: function getStart() {
            var found = false,
                col = null,
                row = null,
                free = [],
                result = false;

            var scene = this.scene;

            // select cols with free cell
            scene.forEach(function (col, index) {
                if (col.free) {
                    free.push(index);
                }
            });

            if (free.length) {
                // pick one of the col
                col = this.pickOne(free);

                // select the free cells in the col
                free.length = 0;
                scene[col].rows.forEach(function (row, index) {
                    if (row === 0) {
                        free.push(index);
                    }
                });

                // pick one of the cell
                row = this.pickOne(free);

                result = [col, row];
            }
            return result;
        }
    }, {
        key: 'pickOne',
        value: function pickOne(array) {
            return array[~~(Math.random() * array.length)];
        }
    }, {
        key: 'setUsed',
        value: function setUsed(x, y) {
            this.scene[x].rows[y] = 1;
            this.scene[x].free--;
        }
    }, {
        key: 'isAvailable',
        value: function isAvailable(x, y) {
            var scene = this.scene;
            var result = false;
            if (typeof scene[x] !== 'undefined') {
                if (typeof scene[x].rows[y] !== 'undefined') {
                    if (scene[x].rows[y] === 0) {
                        result = true;
                    }
                }
            }
            return result;
        }

        // get direction
        // if a current direction is given, there is 50% chances to go in the same

    }, {
        key: 'getDir',
        value: function getDir(fromPoint) {
            var oldDir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var possibleX = [],
                possibleY = [],
                result = [0, 0];

            if (oldDir && Math.random() <= 0.5) {
                if (this.isAvailable(fromPoint[0] + oldDir[0], fromPoint[1] + oldDir[1])) {
                    return oldDir;
                }
            }

            // Xs
            if (this.isAvailable(fromPoint[0] - 1, fromPoint[1])) {
                possibleX.push(-1);
            }
            if (this.isAvailable(fromPoint[0] + 1, fromPoint[1])) {
                possibleX.push(1);
            }

            // Ys
            if (this.isAvailable(fromPoint[0], fromPoint[1] - 1)) {
                possibleY.push(-1);
            }
            if (this.isAvailable(fromPoint[0], fromPoint[1] + 1)) {
                possibleY.push(1);
            }

            if (possibleX.length && Math.random() < 0.5) {
                result[0] = this.pickOne(possibleX);
            } else if (possibleY.length) {
                result[1] = this.pickOne(possibleY);
            }

            return result;
        }
    }]);

    return Circuits;
}();

var Col = function Col(rows) {
    _classCallCheck(this, Col);

    this.rows = Array.apply(null, Array(rows)).map(function () {
        return 0;
    });
    this.free = rows;
};

var Circuit = function Circuit(start, size) {
    _classCallCheck(this, Circuit);

    this.start = start;
    this.cellSize = size;
    this.path = [];
    this.end = null;
    this.things = [];
    this.length = 0;
    this.coords = [];
};

var Things = function () {
    function Things(width, height) {
        _classCallCheck(this, Things);

        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');

        this.collection = [];
    }

    _createClass(Things, [{
        key: 'create',
        value: function create(circuit, velocity) {
            var done = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            var thing = new Thing(circuit, velocity, done);
            this.collection.push(thing);
            return thing;
        }
    }, {
        key: 'update',
        value: function update() {
            this.collection.forEach(function (thing) {
                thing.update();
            });
        }
    }, {
        key: 'draw',
        value: function draw() {
            var _this3 = this;

            var ctx = this.ctx,
                radius = this.lightRadius,
                diameter = radius * 2,
                space = radius / 3;

            var radial = null,
                diffX = null,
                diffY = null;
            ctx.clearRect(0, 0, this.width, this.height);
            this.collection.forEach(function (thing) {
                thing.update();
                radial = _this3.ghostRadial;
                diffX = diffY = radius;
                if (thing.distFromSister() <= space) {
                    radial = _this3.ghostSuperRadial;
                    diffX = radial.width / 2;
                    diffY = radial.height / 2;
                }
                ctx.drawImage(radial, thing.x - diffX, thing.y - diffY, radial.width, radial.height);
            });

            ctx.save();
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(this.dotsGhost, 0, 0);
            ctx.restore();

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#afe3e9';
            this.collection.forEach(function (thing) {
                ctx.beginPath();
                ctx.arc(thing.x, thing.y, radius / 6, 0, 2 * Math.PI, false);
                ctx.fill();
            });
            ctx.restore();
        }
    }, {
        key: 'setDotsGhost',
        value: function setDotsGhost(canvas) {
            this.dotsGhost = canvas;
        }
    }, {
        key: 'setLight',
        value: function setLight(lightRadius) {
            this.lightRadius = lightRadius;

            this.ghostRadial = document.createElement('canvas');
            this.ghostRadial.width = lightRadius * 2;
            this.ghostRadial.height = lightRadius * 2;

            var radialCtx = this.ghostRadial.getContext('2d');
            var gradient = radialCtx.createRadialGradient(lightRadius, lightRadius, lightRadius, lightRadius, lightRadius, 0);
            gradient.addColorStop(0, "rgba(24, 129, 141, 0)");
            gradient.addColorStop(1, "rgba(24, 129, 141, .6)");

            radialCtx.fillStyle = gradient;
            radialCtx.fillRect(0, 0, lightRadius * 2, lightRadius * 2);

            // star
            this.ghostSuperRadial = document.createElement('canvas');
            var radWidth = this.ghostSuperRadial.width = lightRadius * 15;
            var radHeight = this.ghostSuperRadial.height = lightRadius * 20;

            var superRadialCtx = this.ghostSuperRadial.getContext('2d');

            //gradient = superRadialCtx.createRadialGradient(lightRadius * 1.5, lightRadius * 1.5, lightRadius * 1.5, lightRadius * 1.5, lightRadius * 1.5, 0);
            gradient = superRadialCtx.createRadialGradient(radWidth / 2, radHeight / 2, radWidth / 2, radWidth / 2, radHeight / 2, 0);
            gradient.addColorStop(0, "rgba(37, 203, 223, 0)");
            gradient.addColorStop(1, "rgba(37, 203, 223,  .4)");

            superRadialCtx.fillStyle = gradient;
            //superRadialCtx.fillRect(0, 0, lightRadius * 3, lightRadius * 3);

            superRadialCtx.beginPath();
            superRadialCtx.moveTo(radWidth / 2 + lightRadius / 6, radHeight / 2 - lightRadius / 3);
            superRadialCtx.lineTo(radWidth, 0);
            superRadialCtx.lineTo(radWidth / 2 + lightRadius / 3, radHeight / 2 - lightRadius / 6);
            superRadialCtx.lineTo(3 * radWidth / 4, radHeight / 2);
            superRadialCtx.lineTo(radWidth / 2 + lightRadius / 3, radHeight / 2 + lightRadius / 6);
            superRadialCtx.lineTo(radWidth, radHeight);
            superRadialCtx.lineTo(radWidth / 2 + lightRadius / 6, radHeight / 2 + lightRadius / 3);
            superRadialCtx.lineTo(radWidth / 2, 3 * radHeight / 4);
            superRadialCtx.lineTo(radWidth / 2 - lightRadius / 6, radHeight / 2 + lightRadius / 3);
            superRadialCtx.lineTo(0, radHeight);
            superRadialCtx.lineTo(radWidth / 2 - lightRadius / 3, radHeight / 2 + lightRadius / 6);
            superRadialCtx.lineTo(radWidth / 4, radHeight / 2);
            superRadialCtx.lineTo(radWidth / 2 - lightRadius / 3, radHeight / 2 - lightRadius / 6);
            superRadialCtx.lineTo(0, 0);
            superRadialCtx.lineTo(radWidth / 2 - lightRadius / 6, radHeight / 2 - lightRadius / 3);
            superRadialCtx.lineTo(radWidth / 2, radHeight / 4);
            superRadialCtx.lineTo(radWidth / 2 + lightRadius / 6, radHeight / 2 - lightRadius / 3);
            superRadialCtx.fill();
        }
    }]);

    return Things;
}();

var Thing = function () {
    function Thing(circuit, velocity) {
        var done = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        _classCallCheck(this, Thing);

        this.circuit = circuit;
        this.velocity = velocity;
        this.done = done;
        this.x = 0;
        this.y = 0;
        this.dots = [];
    }

    _createClass(Thing, [{
        key: 'update',
        value: function update() {
            var circuit = this.circuit,
                size = circuit.cellSize;

            var x = 0,
                y = 0;
            // update this
            var length = circuit.length,
                start = circuit.start,
                end = circuit.end,
                path = circuit.path;
            this.done += this.velocity;
            if (this.done <= 0) {
                this.done = 0;
                this.velocity = -this.velocity;
            } else if (this.done >= length) {
                this.done = length;
                this.velocity = -this.velocity;
            }

            if (this.done <= size / 2) {
                x = start[0] * size + size / 2 + this.done * path[0][0];
                y = start[1] * size + size / 2 + this.done * path[0][1];
            } else if (this.done > length - size / 2) {
                x = end[0] * size + size / 2 - (length - this.done) * path[path.length - 1][0];
                y = end[1] * size + size / 2 - (length - this.done) * path[path.length - 1][1];
            } else {

                var index = ~~(this.done / size),
                    done = this.done - index * size,
                    dir = [path[index][0], path[index][1]],
                    point = circuit.coords[index];

                x = point[0] * size + size / 2 + done * dir[0];
                y = point[1] * size + size / 2 + done * dir[1];
            }
            x = ~~x;
            y = ~~y;
            this.x = x;
            this.y = y;
        }
    }, {
        key: 'distFromSister',
        value: function distFromSister() {
            var _this4 = this;

            var circuit = this.circuit;
            var dist = Infinity,
                tmp = null;
            circuit.things.forEach(function (thing) {
                if (thing !== _this4) {
                    tmp = Math.abs(thing.done - _this4.done);
                    if (tmp < dist) {
                        dist = tmp;
                    }
                }
            });

            return dist;
        }
    }]);

    return Thing;
}();

var Background = function () {
    function Background(width, height) {
        _classCallCheck(this, Background);

        this.width = width;
        this.height = height;
    }

    _createClass(Background, [{
        key: 'getBackground',
        value: function getBackground() {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');

            canvas.width = this.width;
            canvas.height = this.height;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.drawImage(dots.canvas, 0, 0);
            ctx.drawImage(circuits.canvas, 0, 0);

            return canvas;
        }
    }]);

    return Background;
}();

//

// background init


var bgCanvas = document.getElementById('c'),
    width = bgCanvas.width = window.innerWidth,
    height = bgCanvas.height = window.innerHeight,
    bgCtx = bgCanvas.getContext('2d');

// dots
var dots = new Dots(width, height, 2);

// things
var things = new Things(width, height);
// get dot ghost
// it will serve as a clip canvas for the gradients to only show where there is originally dots in the background
things.setDotsGhost(dots.ghost());
things.setLight(dots.spacing * 4);

// circuits
var maxLength = 16,
    minLength = 3,
    cellSize = 10,
    circuits = new Circuits(width, height, cellSize, minLength, maxLength);

// background first and only draw
var background = new Background(width, height),
    staticBG = background.getBackground();
bgCtx.drawImage(staticBG, 0, 0);

// animation
var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

function loop() {
    // update things
    //things.update();

    ctx.clearRect(0, 0, width, height);
    // draw things
    things.draw();
    ctx.drawImage(things.canvas, 0, 0);

    requestAnimationFrame(loop);
}

// draw bg (dots + circuit) on the main canvas

loop();