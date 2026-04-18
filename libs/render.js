var Render = (function () {
    function slider(min, max, step, value) {
        var v = value;
        return {
            min: min,
            max: max,
            step: step,
            get: function () { return v; },
            set: function (x) {
                if (x < min) x = min;
                if (x > max) x = max;
                v = Math.round(x / step) * step;
            }
        };
    }

    function _enum(values, value) {
        var v = value;
        return {
            values: values.slice(),
            get: function () { return v; },
            set: function (x) {
                if (values.indexOf(x) !== -1) v = x;
            }
        };
    }

    function boolean(value) {
        var v = !!value;
        return {
            get: function () { return v; },
            set: function (x) { v = !!x; }
        };
    }

    function point(x, y) {
        return {
            x: x,
            y: y,
            set: function (nx, ny) {
                this.x = nx;
                this.y = ny;
            },
            add: function (p) {
                return point(this.x + p.x, this.y + p.y);
            }
        };
    }

    function Mandelbrot(width, height, maxIter) {
        var data = new Uint8ClampedArray(width * height * 4);
        for (var py = 0; py < height; py++) {
            for (var px = 0; px < width; px++) {
                var x0 = (px / width) * 3.5 - 2.5;
                var y0 = (py / height) * 2.0 - 1.0;
                var x = 0;
                var y = 0;
                var iter = 0;
                while (x * x + y * y <= 4 && iter < maxIter) {
                    var xt = x * x - y * y + x0;
                    y = 2 * x * y + y0;
                    x = xt;
                    iter++;
                }
                var idx = (py * width + px) * 4;
                var c = iter === maxIter ? 0 : 255 - Math.floor(255 * iter / maxIter);
                data[idx] = c;
                data[idx + 1] = c;
                data[idx + 2] = c;
                data[idx + 3] = 255;
            }
        }
        return data;
    }

    function Julia(width, height, cx, cy, maxIter) {
        var data = new Uint8ClampedArray(width * height * 4);
        for (var py = 0; py < height; py++) {
            for (var px = 0; px < width; px++) {
                var x = (px / width) * 3.0 - 1.5;
                var y = (py / height) * 2.0 - 1.0;
                var iter = 0;
                while (x * x + y * y <= 4 && iter < maxIter) {
                    var xt = x * x - y * y + cx;
                    y = 2 * x * y + cy;
                    x = xt;
                    iter++;
                }
                var idx = (py * width + px) * 4;
                var c = iter === maxIter ? 0 : 255 - Math.floor(255 * iter / maxIter);
                data[idx] = c;
                data[idx + 1] = 0;
                data[idx + 2] = 255 - c;
                data[idx + 3] = 255;
            }
        }
        return data;
    }

    function Noise(x, y) {
        var n = x + y * 57;
        n = (n << 13) ^ n;
        return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 2147483647) / 1073741824.0);
    }

    function clouds(width, height, scale) {
        var data = new Uint8ClampedArray(width * height * 4);
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var nx = x / width * scale;
                var ny = y / height * scale;
                var e = 0;
                var amp = 1;
                var freq = 1;
                for (var i = 0; i < 5; i++) {
                    e += amp * Noise(nx * freq, ny * freq);
                    amp *= 0.5;
                    freq *= 2;
                }
                e = (e + 1) / 2;
                var c = Math.floor(e * 255);
                var idx = (y * width + x) * 4;
                data[idx] = c;
                data[idx + 1] = c;
                data[idx + 2] = c;
                data[idx + 3] = 255;
            }
        }
        return data;
    }

    return {
        slider: slider,
        enum: _enum,
        boolean: boolean,
        point: point,
        Mandelbrot: Mandelbrot,
        Julia: Julia,
        clouds: clouds,
        Noise: Noise
    };
})();
