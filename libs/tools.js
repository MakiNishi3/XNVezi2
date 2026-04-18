var CanvasApp = (function () {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var drawing = false;
    var currentTool = "paint";
    var currentColor = "#000000";
    var brushSize = 5;
    var scale = 1;
    var offsetX = 0;
    var offsetY = 0;

    function setTool(tool) {
        currentTool = tool;
    }

    function setColor(color) {
        currentColor = color;
    }

    function setBrushSize(size) {
        brushSize = size;
    }

    function getMousePos(e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - offsetX) / scale,
            y: (e.clientY - rect.top - offsetY) / scale
        };
    }

    function startDraw(e) {
        drawing = true;
        var pos = getMousePos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
        if (!drawing) return;
        var pos = getMousePos(e);

        if (currentTool === "paint") {
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = brushSize;
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        } else if (currentTool === "erase") {
            ctx.clearRect(pos.x - brushSize, pos.y - brushSize, brushSize * 2, brushSize * 2);
        }
    }

    function endDraw() {
        drawing = false;
        ctx.closePath();
    }

    function pickColor(e) {
        var pos = getMousePos(e);
        var data = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        currentColor = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
        return currentColor;
    }

    function zoom(factor) {
        scale *= factor;
        redraw();
    }

    function redraw() {
        var temp = document.createElement("canvas");
        var tctx = temp.getContext("2d");
        temp.width = canvas.width;
        temp.height = canvas.height;
        tctx.drawImage(canvas, 0, 0);

        ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(temp, 0, 0);
    }

    function addText(text, x, y) {
        ctx.fillStyle = currentColor;
        ctx.font = brushSize * 5 + "px Arial";
        ctx.fillText(text, x, y);
    }

    canvas.addEventListener("mousedown", function (e) {
        if (currentTool === "color") {
            pickColor(e);
        } else {
            startDraw(e);
        }
    });

    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);

    return {
        paint: function () {
            setTool("paint");
        },
        colorPicker: function (e) {
            return pickColor(e);
        },
        zoom: function (factor) {
            zoom(factor);
        },
        text: function (text, x, y) {
            addText(text, x, y);
        },
        erase: function () {
            setTool("erase");
        },
        setColor: function (color) {
            setColor(color);
        },
        setBrushSize: function (size) {
            setBrushSize(size);
        }
    };
})();
