(function() {
    var initContext = zebra.ui.zCanvas.prototype.initContext;
    zebra.ui.zCanvas.prototype.initContext = function(w, h) {
        var ctx = initContext.call(this, w, h);

        if (ctx.$patchedPrecision !== true) {
            ctx.$patchedPrecision = true;

            ctx.translate = function(dx, dy) {
                if (dx !== 0 || dy !== 0) {
                    var c = this.$states[this.$curState];
                    c.x  -= dx;
                    c.y  -= dy;
                    c.dx += dx;
                    c.dy += dy;
                }
            };

            var moveTo = ctx.moveTo;
            ctx.moveTo = function(x, y) {
                var c = this.$states[this.$curState];
                moveTo.call(this, x + c.dx, y + c.dy);
            };

            var lineTo = ctx.lineTo;
            ctx.lineTo = function(x, y) {
                var c = this.$states[this.$curState];
                lineTo.call(this, x + c.dx, y + c.dy);
            };

            var fillText = ctx.fillText;
            ctx.fillText = function(t, x, y) {
                var c = this.$states[this.$curState];
                fillText.call(this, t, x + c.dx, y + c.dy);
            };

            var strokeText = ctx.strokeText;
            ctx.strokeText = function(t, x, y) {
                var c = this.$states[this.$curState];
                strokeText.call(this, t, x + c.dx, y + c.dy);
            };

            for(var k in { "rect":null, "clearRect":null, "fillRect":null, "strokeRect":null}) {
                (function(kk) {
                    var f = ctx[kk];
                    ctx[kk] = function(x, y, w, h) {
                        var c = this.$states[this.$curState];
                        f.call(this, x + c.dx, y + c.dy, w, h);
                    };
                })(k);
            }

            var arc = ctx.arc;
            ctx.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
                var c = this.$states[this.$curState];
                arc.call(this, x + c.dx, y + c.dy, radius, startAngle, endAngle, anticlockwise);
            };

            var arcTo = ctx.arcTo;
            ctx.arcTo = function(x1, y1, x2, y2, radius) {
                var c = this.$states[this.$curState];
                arcTo.call(this, x1 + c.dx, y1 + c.dy, x2 + c.dx, y2 + c.dy, radius);
            };

            var createLinearGradient = ctx.createLinearGradient;
            ctx.createLinearGradient = function(x0, y0, x1, y1) {
                var c = this.$states[this.$curState];
                return createLinearGradient.call(this, x0 + c.dx, y0 + c.dy, x1 + c.dx, y1 + c.dy);
            };

            var createRadialGradient = ctx.createRadialGradient;
            ctx.createRadialGradient = function(x0, y0, r0, x1, y1, r1) {
                var c = this.$states[this.$curState];
                createRadialGradient.call(this, x0 + c.dx, y0 + c.dy, r0, x1 + c.dx, y1 + c.dy, r1);
            };

            var bezierCurveTo = ctx.bezierCurveTo;
            ctx.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
                var c = this.$states[this.$curState];
                return bezierCurveTo.call(this, cp1x + c.dx, cp1y + c.dy, cp2x + c.dx, cp2y + c.dy, x + c.dx, y + c.dy);
            };

            var quadraticCurveTo = ctx.quadraticCurveTo;
            ctx.quadraticCurveTo = function(cpx, cpy, x, y) {
                var c = this.$states[this.$curState];
                return quadraticCurveTo.call(this, cpx + c.dx, cpy + c.dy, x + c.dx, y + c.dy);
            };

            var drawImage = ctx.drawImage;
            ctx.drawImage = function(image, dx, dy) {
                var c = this.$states[this.$curState];
                if (arguments.length < 6) {
                    drawImage.call(this, image, dx + c.dx, dy + c.dy, arguments[3], arguments[4]);
                }
                else {
                    drawImage.call(this, image, dx, dy, arguments[3], arguments[4], arguments[5] + c.dx, arguments[6] + c.dy, arguments[7], arguments[8]);
                }
            };
        }

        return ctx;
    }
})();