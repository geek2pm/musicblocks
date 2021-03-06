class PitchnessBlock extends ValueBlock {
    constructor() {
        super('pitchness', _('pitch'));
        this.setPalette('sensors');
    }

    arg(logo, turtle, blk) {
        if (logo.mic === null || _THIS_IS_TURTLE_BLOCKS_) {
            return 440;
        }
        if (logo.pitchAnalyser == null) {
            logo.pitchAnalyser = new Tone.Analyser({
                'type': 'fft',
                'size': this.limit
            });

            this.mic.connect(this.pitchAnalyser);
        }

        var values = logo.pitchAnalyser.getValue();
        var max = 0;
        var idx = 0;
        for (var i = 0; i < this.limit; i++) {
            var v2 = values[i] * values[i];
            if (v2 > max) {
                max = v2;
                idx = i;
            }
        }

        return idx;
    }
}

class LoudnessBlock extends ValueBlock {
    constructor() {
        super('loudness', _('loudness'));
        this.setPalette('sensors');
    }

    arg(logo) {
        if (logo.mic === null) {
            return 0;
        } 
        if (_THIS_IS_TURTLE_BLOCKS_) {
            return Math.round(logo.mic.getLevel() * 1000);
        }
        if (logo.volumeAnalyser == null) {
            logo.volumeAnalyser = new Tone.Analyser({
                'type': 'waveform',
                'size': logo.limit
            });

            logo.mic.connect(logo.volumeAnalyser);
        }

        var values = logo.volumeAnalyser.getValue();
        var sum = 0;
        for (var k = 0; k < logo.limit; k++) {
            sum += values[k] * values[k];
        }

        var rms = Math.sqrt(sum / logo.limit);
        return Math.round(rms * 100);
    }
}

class MyClickBlock extends ValueBlock {
    constructor() {
        super('myclick', _('click'));
        this.setPalette('sensors');
    }

    arg(logo, turtle) {
        return 'click' + logo.turtles.turtleList[turtle].name;
    }
}

class GetBlueBlock extends ValueBlock {
    constructor() {
        super('getblue', _('blue'));
        this.setPalette('sensors');
    }

    arg(logo, turtle) {
        var colorString = logo.turtles.turtleList[turtle].canvasColor;
        if (colorString[2] === '#')
            colorString = hex2rgb(colorString.split('#')[1]);
        var obj = colorString.split('(')[1].split(',');
        return parseInt(Number(obj[0]) / 2.55);

    }
}

class GetGreenBlock extends ValueBlock {
    constructor() {
        super('getgreen', _('green'));
        this.setPalette('sensors');
    }

    arg(logo, turtle) {
        var colorString = logo.turtles.turtleList[turtle].canvasColor;
        if (colorString[1] === '#')
            colorString = hex2rgb(colorString.split('#')[1]);
        var obj = colorString.split('(')[1].split(',');
        return parseInt(Number(obj[0]) / 2.55);

    }
}

class GetRedBlock extends ValueBlock {
    constructor() {
        super('getred', _('red'));
        this.setPalette('sensors');
    }

    arg(logo, turtle) {
        var colorString = logo.turtles.turtleList[turtle].canvasColor;
        if (colorString[0] === '#')
            colorString = hex2rgb(colorString.split('#')[1]);
        var obj = colorString.split('(')[1].split(',');
        return parseInt(Number(obj[0]) / 2.55);
    }
}

class GetColorPixelBlock extends ValueBlock {
    constructor() {
        super('getcolorpixel', _('pixel color'));
        this.setPalette('sensors');
    }

    arg(logo, turtle) {
        var wasVisible = logo.turtles.turtleList[turtle].container.visible;
        logo.turtles.turtleList[turtle].container.visible = false;
        var x = logo.turtles.turtleList[turtle].container.x;
        var y = logo.turtles.turtleList[turtle].container.y;
        logo.refreshCanvas();

        var canvas = docById('overlayCanvas');
        var ctx = canvas.getContext('2d');
        var imgData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        var color = searchColors(imgData[0], imgData[1], imgData[2]);
        if (imgData[3] === 0) {
            color = body.style.background.substring(body.style.background.indexOf('(') + 1, body.style.background.lastIndexOf(')')).split(/,\s*/),
            color = searchColors(color[0], color[1], color[2]);
        }

        if (wasVisible) {
            logo.turtles.turtleList[turtle].container.visible = true;
        }
        return color;
    }
}

class TimeBlock extends ValueBlock {
    constructor() {
        super('time', _('time'));
        this.setPalette('sensors');
    }

    arg(logo) {
        var d = new Date();
        return (d.getTime() - logo.time) / 1000;
    }
}

class MouseYBlock extends ValueBlock {
    constructor() {
        super('mousey', _('cursor y'));
        this.setPalette('sensors');
    }

    arg(logo) {
        return logo.getStageY();
    }
}

class MouseXBlock extends ValueBlock {
    constructor() {
        super('mousex', _('cursor x'));
        this.setPalette('sensors');
    }

    arg(logo) {
        return logo.getStageX();
    }
}

class MouseButtonBlock extends BooleanSensorBlock {
    constructor() {
        super('mousebutton', _('mouse button'));
        this.setPalette('sensors');
        this.extraWidth = 20;
    }

    arg(logo) {
        return logo.getStageMouseDown();
    }
}

class ToASCIIBlock extends LeftBlock {
    constructor() {
        super('toascii', _('to ASCII'));
        this.setPalette('sensors');
        this.formBlock({
            args: 1, defaults: [65]
        });
    }

    arg(logo, turtle, blk, receivedArg) {
        if (logo.inStatusMatrix && logo.blocks.blockList[logo.blocks.blockList[blk].connections[0]].name === 'print') {
            logo.statusFields.push([blk, 'toascii']);
        } else {
            var cblk1 = logo.blocks.blockList[blk].connections[1];
            if (cblk === null) {
                logo.errorMsg(NOINPUTERRORMSG, blk);
                return 'A';
            }
            var a = logo.parseArg(logo, turtle, cblk1, blk, receivedArg);
            if (typeof(a) === 'number') {
                if (a < 1)
                    return 0;
                else
                    return String.fromCharCode(a);
            } else {
                logo.errorMsg(NANERRORMSG, blk);
                return 0;
            }
        }
    }
}

class KeyboardBlock extends ValueBlock {
    constructor() {
        super('keyboard', _('keyboard'));
        this.setPalette('sensors');
        this.makeMacro((x, y) => [
            [0, 'toascii', x, y, [null, 1]],
            [1, 'keyboard', 0, 0, [0, null]]
        ]);
    }

    arg(logo) {
        logo.lastKeyCode = logo.getCurrentKeyCode();
        let val = logo.lastKeyCode;
        logo.clearCurrentKeyCode();
        return val;
    }
}

function setupSensorsBlocks() {
    new PitchnessBlock().setup();
    new LoudnessBlock().setup();
    new MyClickBlock().setup();
    new GetBlueBlock().setup();
    new GetGreenBlock().setup();
    new GetRedBlock().setup();
    new GetColorPixelBlock().setup();
    new TimeBlock().setup();
    new MouseYBlock().setup();
    new MouseXBlock().setup();
    new MouseButtonBlock().setup();
    new ToASCIIBlock().setup();
    new KeyboardBlock().setup();
}
