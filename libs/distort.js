var Distort = (function () {
    function slider(min, max, value) {
        this.min = min;
        this.max = max;
        this.value = value;
    }

    function enumType(values, value) {
        this.values = values;
        this.value = value;
    }

    function boolean(value) {
        this.value = !!value;
    }

    function point(x, y) {
        this.x = x;
        this.y = y;
    }

    function Wave(amplitude, wavelength, phase) {
        this.amplitude = amplitude;
        this.wavelength = wavelength;
        this.phase = phase;
    }

    function PolarCoordinates(x, y) {
        this.r = Math.sqrt(x * x + y * y);
        this.theta = Math.atan2(y, x);
    }

    function ZigZag(amount, frequency) {
        this.amount = amount;
        this.frequency = frequency;
    }

    function swirl(x, y, centerX, centerY, strength) {
        var dx = x - centerX;
        var dy = y - centerY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dy, dx) + strength * dist * 0.001;
        return {
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist
        };
    }

    function PinchBulge(x, y, centerX, centerY, radius, strength) {
        var dx = x - centerX;
        var dy = y - centerY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) return { x: x, y: y };
        var factor = 1 + strength * (1 - dist / radius);
        return {
            x: centerX + dx * factor,
            y: centerY + dy * factor
        };
    }

    function Ripple(x, y, centerX, centerY, amplitude, wavelength) {
        var dx = x - centerX;
        var dy = y - centerY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var offset = Math.sin(dist / wavelength) * amplitude;
        return {
            x: x + (dx / dist) * offset,
            y: y + (dy / dist) * offset
        };
    }

    function Transform2D(x, y, matrix) {
        return {
            x: matrix[0] * x + matrix[2] * y + matrix[4],
            y: matrix[1] * x + matrix[3] * y + matrix[5]
        };
    }

    function Kaleidoscope(x, y, centerX, centerY, segments) {
        var dx = x - centerX;
        var dy = y - centerY;
        var polar = new PolarCoordinates(dx, dy);
        var angle = polar.theta;
        var slice = (Math.PI * 2) / segments;
        angle = angle % slice;
        if (angle < 0) angle += slice;
        if (angle > slice / 2) angle = slice - angle;
        return {
            x: centerX + Math.cos(angle) * polar.r,
            y: centerY + Math.sin(angle) * polar.r
        };
    }

    return {
        slider: slider,
        enum: enumType,
        boolean: boolean,
        point: point,
        Wave: Wave,
        PolarCoordinates: PolarCoordinates,
        ZigZag: ZigZag,
        swirl: swirl,
        PinchBulge: PinchBulge,
        Ripple: Ripple,
        Transform2D: Transform2D,
        Kaleidoscope: Kaleidoscope
    };
})();
