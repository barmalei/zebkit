zebkit.package("ui", function() {
    var ctx = zebkit.ui.HtmlCanvas.$ContextMethods;

    ctx.translate = function(dx, dy) {
        if (dx !== 0 || dy !== 0) {
            var c = this.$states[this.$curState];
            c.x  -= dx;
            c.y  -= dy;
            c.dx += dx;
            c.dy += dy;
        }
    };

    ctx.moveTo = function(x, y) {
        var c = this.$states[this.$curState];
        this.$moveTo(x + c.dx, y + c.dy);
    };

    ctx.lineTo = function(x, y) {
        var c = this.$states[this.$curState];
        this.$lineTo(x + c.dx, y + c.dy);
    };

    ctx.fillText = function(t, x, y) {
        var c = this.$states[this.$curState];
        this.$fillText(t, x + c.dx, y + c.dy);
    };

    ctx.strokeText = function(t, x, y) {
        var c = this.$states[this.$curState];
        this.$strokeText(t, x + c.dx, y + c.dy);
    };

    ctx.clearRect = function(x, y, w, h) {
        var c = this.$states[this.$curState];
        this.$clearRect(x + c.dx, y + c.dy, w, h);
    };

    ctx.rect = function(x, y, w, h) {
        var c = this.$states[this.$curState];
        this.$rect(x + c.dx, y + c.dy, w, h);
    };

    ctx.fillRect = function(x, y, w, h) {
        var c = this.$states[this.$curState];
        this.$fillRect(x + c.dx, y + c.dy, w, h);
    };

    ctx.strokeRect = function(x, y, w, h) {
        var c = this.$states[this.$curState];
        this.$strokeRect(x + c.dx, y + c.dy, w, h);
    };

    ctx.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
        var c = this.$states[this.$curState];
        this.$arc(x + c.dx, y + c.dy, radius, startAngle, endAngle, anticlockwise);
    };

    ctx.arcTo = function(x1, y1, x2, y2, radius) {
        var c = this.$states[this.$curState];
        this.$arcTo(x1 + c.dx, y1 + c.dy, x2 + c.dx, y2 + c.dy, radius);
    };

    ctx.createLinearGradient = function(x0, y0, x1, y1) {
        var c = this.$states[this.$curState];
        return this.$createLinearGradient(x0 + c.dx, y0 + c.dy, x1 + c.dx, y1 + c.dy);
    };

    ctx.createRadialGradient = function(x0, y0, r0, x1, y1, r1) {
        var c = this.$states[this.$curState];
        this.$createRadialGradient(x0 + c.dx, y0 + c.dy, r0, x1 + c.dx, y1 + c.dy, r1);
    };

    ctx.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
        var c = this.$states[this.$curState];
        return this.$bezierCurveTo(cp1x + c.dx, cp1y + c.dy, cp2x + c.dx, cp2y + c.dy, x + c.dx, y + c.dy);
    };

    ctx.quadraticCurveTo = function(cpx, cpy, x, y) {
        var c = this.$states[this.$curState];
        return this.$quadraticCurveTo(cpx + c.dx, cpy + c.dy, x + c.dx, y + c.dy);
    };

    ctx.drawImage = function(image, dx, dy) {
        var c = this.$states[this.$curState];
        if (arguments.length < 6) {
            this.$drawImage(image, dx + c.dx, dy + c.dy, arguments[3], arguments[4]);
        } else {
            this.$drawImage(image, dx, dy, arguments[3], arguments[4],
                                           arguments[5] + c.dx, arguments[6] + c.dy,
                                           arguments[7], arguments[8]);
        }
    };
});