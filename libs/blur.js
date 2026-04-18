var Blur = (function () {
    function slider(min, max, value) {
        return {
            min: min,
            max: max,
            value: value,
            set: function (v) {
                if (v < min) v = min;
                if (v > max) v = max;
                this.value = v;
            }
        };
    }

    function enumType(values, current) {
        return {
            values: values,
            value: current,
            set: function (v) {
                if (values.indexOf(v) !== -1) {
                    this.value = v;
                }
            }
        };
    }

    function booleanType(val) {
        return {
            value: !!val,
            toggle: function () {
                this.value = !this.value;
            }
        };
    }

    function point(x, y) {
        return { x: x, y: y };
    }

    function clamp(v, min, max) {
        return v < min ? min : v > max ? max : v;
    }

    function getPixel(data, width, height, x, y) {
        x = clamp(x, 0, width - 1);
        y = clamp(y, 0, height - 1);
        var i = (y * width + x) * 4;
        return [
            data[i],
            data[i + 1],
            data[i + 2],
            data[i + 3]
        ];
    }

    function setPixel(data, width, x, y, rgba) {
        var i = (y * width + x) * 4;
        data[i] = rgba[0];
        data[i + 1] = rgba[1];
        data[i + 2] = rgba[2];
        data[i + 3] = rgba[3];
    }

    function gaussianKernel(radius) {
        var sigma = radius / 3;
        var size = radius * 2 + 1;
        var kernel = [];
        var sum = 0;
        for (var i = -radius; i <= radius; i++) {
            var value = Math.exp(-(i * i) / (2 * sigma * sigma));
            kernel.push(value);
            sum += value;
        }
        for (var j = 0; j < kernel.length; j++) {
            kernel[j] /= sum;
        }
        return kernel;
    }

    function gaussianblur(imageData, width, height, radius) {
        var src = imageData.slice();
        var tmp = new Uint8ClampedArray(src.length);
        var dst = new Uint8ClampedArray(src.length);
        var kernel = gaussianKernel(radius);

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var r = 0, g = 0, b = 0, a = 0;
                for (var k = -radius; k <= radius; k++) {
                    var px = getPixel(src, width, height, x + k, y);
                    var w = kernel[k + radius];
                    r += px[0] * w;
                    g += px[1] * w;
                    b += px[2] * w;
                    a += px[3] * w;
                }
                setPixel(tmp, width, x, y, [r, g, b, a]);
            }
        }

        for (var x2 = 0; x2 < width; x2++) {
            for (var y2 = 0; y2 < height; y2++) {
                var r2 = 0, g2 = 0, b2 = 0, a2 = 0;
                for (var k2 = -radius; k2 <= radius; k2++) {
                    var py = getPixel(tmp, width, height, x2, y2 + k2);
                    var w2 = kernel[k2 + radius];
                    r2 += py[0] * w2;
                    g2 += py[1] * w2;
                    b2 += py[2] * w2;
                    a2 += py[3] * w2;
                }
                setPixel(dst, width, x2, y2, [r2, g2, b2, a2]);
            }
        }

        return dst;
    }

    function boxblur(imageData, width, height, radius) {
        var src = imageData.slice();
        var dst = new Uint8ClampedArray(src.length);
        var size = radius * 2 + 1;
        var area = size * size;

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var r = 0, g = 0, b = 0, a = 0;
                for (var ky = -radius; ky <= radius; ky++) {
                    for (var kx = -radius; kx <= radius; kx++) {
                        var p = getPixel(src, width, height, x + kx, y + ky);
                        r += p[0];
                        g += p[1];
                        b += p[2];
                        a += p[3];
                    }
                }
                setPixel(dst, width, x, y, [
                    r / area,
                    g / area,
                    b / area,
                    a / area
                ]);
            }
        }

        return dst;
    }

    function directionalblur(imageData, width, height, radius, dir) {
        var src = imageData.slice();
        var dst = new Uint8ClampedArray(src.length);
        var dx = dir.x;
        var dy = dir.y;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= len;
        dy /= len;

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var r = 0, g = 0, b = 0, a = 0;
                var count = 0;
                for (var i = -radius; i <= radius; i++) {
                    var px = getPixel(src, width, height, x + dx * i, y + dy * i);
                    r += px[0];
                    g += px[1];
                    b += px[2];
                    a += px[3];
                    count++;
                }
                setPixel(dst, width, x, y, [
                    r / count,
                    g / count,
                    b / count,
                    a / count
                ]);
            }
        }

        return dst;
    }

    function motionblur(imageData, width, height, radius, angle) {
        var rad = angle * Math.PI / 180;
        var dir = point(Math.cos(rad), Math.sin(rad));
        return directionalblur(imageData, width, height, radius, dir);
    }

    function sharpen(imageData, width, height, strength) {
        var src = imageData.slice();
        var dst = new Uint8ClampedArray(src.length);

        var kernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var r = 0, g = 0, b = 0, a = 0;
                var idx = 0;

                for (var ky = -1; ky <= 1; ky++) {
                    for (var kx = -1; kx <= 1; kx++) {
                        var p = getPixel(src, width, height, x + kx, y + ky);
                        var w = kernel[idx++] * strength;
                        r += p[0] * w;
                        g += p[1] * w;
                        b += p[2] * w;
                        a += p[3];
                    }
                }

                setPixel(dst, width, x, y, [
                    clamp(r, 0, 255),
                    clamp(g, 0, 255),
                    clamp(b, 0, 255),
                    clamp(a, 0, 255)
                ]);
            }
        }

        return dst;
    }

    function unsharpmask(imageData, width, height, radius, amount) {
        var blurred = gaussianblur(imageData, width, height, radius);
        var dst = new Uint8ClampedArray(imageData.length);

        for (var i = 0; i < imageData.length; i += 4) {
            dst[i] = clamp(imageData[i] + amount * (imageData[i] - blurred[i]), 0, 255);
            dst[i + 1] = clamp(imageData[i + 1] + amount * (imageData[i + 1] - blurred[i + 1]), 0, 255);
            dst[i + 2] = clamp(imageData[i + 2] + amount * (imageData[i + 2] - blurred[i + 2]), 0, 255);
            dst[i + 3] = imageData[i + 3];
        }

        return dst;
    }

    return {
        slider: slider,
        enum: enumType,
        boolean: booleanType,
        point: point,
        gaussianblur: gaussianblur,
        boxblur: boxblur,
        directionalblur: directionalblur,
        motionblur: motionblur,
        sharpen: sharpen,
        unsharpmask: unsharpmask
    };
})();
