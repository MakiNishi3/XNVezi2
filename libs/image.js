var Image = (function () {
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function enumValues(obj) {
        return Object.freeze(obj);
    }

    function boolean(v) {
        return !!v;
    }

    function point(x, y) {
        return { x: x, y: y };
    }

    function getIndex(x, y, w) {
        return (y * w + x) * 4;
    }

    function cloneData(data) {
        return new Uint8ClampedArray(data);
    }

    function applyPerPixel(img, fn) {
        var d = img.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            var a = d[i + 3];
            var res = fn(r, g, b, a);
            d[i] = res[0];
            d[i + 1] = res[1];
            d[i + 2] = res[2];
            d[i + 3] = res[3];
        }
        return img;
    }

    function slider(min, max, value) {
        return {
            min: min,
            max: max,
            value: clamp(value, min, max),
            set: function (v) {
                this.value = clamp(v, this.min, this.max);
            }
        };
    }

    function rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) h = 0;
        else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, v];
    }

    function hsvToRgb(h, s, v) {
        var r, g, b;
        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return [r * 255, g * 255, b * 255];
    }

    function huesaturationwithsliders(img, hueSlider, satSlider) {
        return applyPerPixel(img, function (r, g, b, a) {
            var hsv = rgbToHsv(r, g, b);
            hsv[0] = (hsv[0] + hueSlider.value) % 1;
            hsv[1] = clamp(hsv[1] + satSlider.value, 0, 1);
            var rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);
            return [rgb[0], rgb[1], rgb[2], a];
        });
    }

    function vibrancewithsliders(img, vibSlider) {
        return applyPerPixel(img, function (r, g, b, a) {
            var max = Math.max(r, g, b);
            var avg = (r + g + b) / 3;
            var amt = (Math.abs(max - avg) * 2 / 255) * vibSlider.value;
            r += (max - r) * amt;
            g += (max - g) * amt;
            b += (max - b) * amt;
            return [clamp(r,0,255), clamp(g,0,255), clamp(b,0,255), a];
        });
    }

    function brigtnesscontrastwithsliders(img, bSlider, cSlider) {
        var b = bSlider.value * 255;
        var c = cSlider.value;
        var factor = (259 * (c + 255)) / (255 * (259 - c));
        return applyPerPixel(img, function (r, g, b2, a) {
            r = factor * (r - 128) + 128 + b;
            g = factor * (g - 128) + 128 + b;
            b2 = factor * (b2 - 128) + 128 + b;
            return [clamp(r,0,255), clamp(g,0,255), clamp(b2,0,255), a];
        });
    }

    function invertwithsliders(img, invSlider) {
        return applyPerPixel(img, function (r, g, b, a) {
            var f = invSlider.value;
            return [
                clamp(r * (1 - f) + (255 - r) * f,0,255),
                clamp(g * (1 - f) + (255 - g) * f,0,255),
                clamp(b * (1 - f) + (255 - b) * f,0,255),
                a
            ];
        });
    }

    function bwwithsliders(img, bwSlider) {
        return applyPerPixel(img, function (r, g, b, a) {
            var gray = (r + g + b) / 3;
            var f = bwSlider.value;
            return [
                clamp(r * (1 - f) + gray * f,0,255),
                clamp(g * (1 - f) + gray * f,0,255),
                clamp(b * (1 - f) + gray * f,0,255),
                a
            ];
        });
    }

    function whitebalancewithsliders(img, tempSlider, tintSlider) {
        return applyPerPixel(img, function (r, g, b, a) {
            r += tempSlider.value * 50;
            b -= tempSlider.value * 50;
            g += tintSlider.value * 50;
            return [clamp(r,0,255), clamp(g,0,255), clamp(b,0,255), a];
        });
    }

    function colorbalancewithsliders(img, rS, gS, bS) {
        return applyPerPixel(img, function (r, g, b, a) {
            return [
                clamp(r + rS.value * 255,0,255),
                clamp(g + gS.value * 255,0,255),
                clamp(b + bS.value * 255,0,255),
                a
            ];
        });
    }

    function exposurewithsliders(img, expSlider) {
        var e = Math.pow(2, expSlider.value);
        return applyPerPixel(img, function (r, g, b, a) {
            return [
                clamp(r * e,0,255),
                clamp(g * e,0,255),
                clamp(b * e,0,255),
                a
            ];
        });
    }

    function curveswithpoint(img, points) {
        var map = new Array(256);
        for (var i = 0; i < 256; i++) map[i] = i;
        for (var i = 0; i < points.length - 1; i++) {
            var p1 = points[i];
            var p2 = points[i + 1];
            for (var x = p1.x; x <= p2.x; x++) {
                var t = (x - p1.x) / (p2.x - p1.x);
                map[x] = clamp(p1.y + t * (p2.y - p1.y), 0, 255);
            }
        }
        return applyPerPixel(img, function (r, g, b, a) {
            return [map[r], map[g], map[b], a];
        });
    }

    function gradientmapwithpointandcolor(img, points, colors) {
        function lerp(a, b, t) { return a + (b - a) * t; }
        return applyPerPixel(img, function (r, g, b, a) {
            var gray = (r + g + b) / 3;
            for (var i = 0; i < points.length - 1; i++) {
                if (gray >= points[i] && gray <= points[i + 1]) {
                    var t = (gray - points[i]) / (points[i + 1] - points[i]);
                    var c1 = colors[i];
                    var c2 = colors[i + 1];
                    return [
                        clamp(lerp(c1[0], c2[0], t),0,255),
                        clamp(lerp(c1[1], c2[1], t),0,255),
                        clamp(lerp(c1[2], c2[2], t),0,255),
                        a
                    ];
                }
            }
            return [r, g, b, a];
        });
    }

    return {
        slider: slider,
        enum: enumValues,
        boolean: boolean,
        point: point,
        huesaturationwithsliders: huesaturationwithsliders,
        vibrancewithsliders: vibrancewithsliders,
        brigtnesscontrastwithsliders: brigtnesscontrastwithsliders,
        invertwithsliders: invertwithsliders,
        bwwithsliders: bwwithsliders,
        whitebalancewithsliders: whitebalancewithsliders,
        colorbalancewithsliders: colorbalancewithsliders,
        exposurewithsliders: exposurewithsliders,
        curveswithpoint: curveswithpoint,
        gradientmapwithpointandcolor: gradientmapwithpointandcolor
    };
})();
