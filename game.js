var Config = {
	getHeight : function() {
		return 500;
	},
	getWidth : function() {
		return 500;
	},
    getChromeWidth : function() {
        return 24;
    },
    getGameHeight : function() {
        return 400;
    },
    getGameWidth : function() {
        return 400;
    },
    getGameXOffset : function() {
        return 4;
    },
    getGameYOffset : function() {
        return 8;
    },
    getMaxInitialMenaceLength : function() {
        return 50;
    },
    getMinInitialMenaceLength : function() {
        return 10;
    },
    getMinInitialMenaceSpeed : function() {
        return 2;
    },
    getMaxInitialMenaceSpeed : function() {
        return 8;
    },
    getSpeedIncrementPerLevel : function() {
        return 1;
    },
    getMaxLengthHistoricalPath : function() {
        return 16;
    },
    getMinimalMenaceBrightness : function() {
        return 128;
    },
    getMinRandomizeFrameMoment : function() {
        return 250;
    },
    getMaxRandomizeFrameMoment : function() {
        return 360;
    },
    getFrameSpeed : function() {
        return 3;
    },
    getDebugLinesToShow : function() {
        return 8;
    }

}

var Bootstrap =  {
    init : function() {
        var gameArea = document.getElementById('stixGame');
        if (!gameArea) {
            this.addCanvas();        
            Game.start(gameArea); // game starts immediately for now
            mainloop();
        }
    },
    addCanvas : function() {
        var target = document.getElementById("gamearea");
        target.innerHTML = "";
        target.style.width = Config.getWidth();
        target.style.height = Config.getHeight();
        this._canvas = document.createElement("canvas")
        this._canvas.id = 'stixGame';
        this._canvas.setAttribute('width', Config.getGameWidth());
        this._canvas.setAttribute('height', Config.getGameHeight());
        this._canvas.style.left = Config.getGameYOffset();
        this._canvas.style.top = Config.getGameXOffset();
        target.appendChild(this._canvas);
    }
};

var GameChrome = {
    init : function() {
        this._borders = [ 
            {x : Config.getChromeWidth(), y : Config.getChromeWidth()},
            {x : Config.getGameWidth()-(Config.getChromeWidth()*2), y : Config.getChromeWidth()},
            {x : Config.getGameWidth()-(Config.getChromeWidth()*2), y : Config.getGameHeight()-(Config.getChromeWidth()*2)},
            {x : Config.getChromeWidth(), y : Config.getGameHeight()-(Config.getChromeWidth()*2)}
        ];
    },
    draw : function(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#8080A0";
        ctx.moveTo(this._borders[0].x, this._borders[0].y)
        for(var i=0;i<this._borders.length;i++) {
            ctx.lineTo(this._borders[i].x, this._borders[i].y);
            ctx.stroke();
        }
        ctx.closePath();
    }
};
var Menace = {
    _historicalPath : [],
    _xPosPoint1 : 0,
    _yPosPoint1 : 0,
    _xPosPoint2 : 0,
    _yPosPoint2 : 0,
    _yPosPoint2 : 0,
    _length : null, 
    _nextStrategyChangeMoment : -1,
    _colourStepper : 16, 
    create : function() {
        this._colourStepper = (255 - Config.getMinimalMenaceBrightness()) / Config.getMaxLengthHistoricalPath();
        var points = this._generatePoints();
        this._xPosPoint1 = points.x;
        this._yPosPoint1 = points.y;
        points = this._generatePoints();
        this._xPosPoint2 = points.x;
        this._yPosPoint2 = points.y;
        var length = this._calculcateLength();
        while (length <= Config.getMinInitialMenaceLength() || length >= Config.getMaxInitialMenaceLength()) {
            var points = this._generatePoints();
            this._xPosPoint2 = points.x;
            this._yPosPoint2 = points.y;
            length = this._calculcateLength();
        }
        var randomRange = Game.getMaxMenaceSpeed()-Game.getMinMenaceSpeed();
        this._horizontalSpeed1 = this._generateNewSpeed(randomRange);
        this._verticalSpeed1 = this._generateNewSpeed(randomRange);
        this._horizontalSpeed2 = this._generateNewSpeed(randomRange);
        this._verticalSpeed2 = this._generateNewSpeed(randomRange);
        this._storeNewPoints();
        this._generateNewStrategyChangeMoment();
    },
    _generateNewSpeed : function(randomRange) {
        return (Math.random()*randomRange)+Game.getMinMenaceSpeed();    
    },
    _generateNewStrategyChangeMoment : function() {
        this._nextStrategyChangeMoment = this._nextStrategyChangeMoment + Math.round(Math.random()*(Config.getMaxRandomizeFrameMoment()-Config.getMinRandomizeFrameMoment())+Config.getMinRandomizeFrameMoment());
    },
    update : function(frame) {
        if (frame == this._nextStrategyChangeMoment) {
            var randomRange = Game.getMaxMenaceSpeed()-Game.getMinMenaceSpeed();
            switch(Math.round(Math.random()*8)) {
                case 0:
                    this._horizontalSpeed1 = this._horizontalSpeed1*-1;
                    break;
                case 1:
                    this._verticalSpeed1 = this._verticalSpeed1*-1;
                    break;
                case 2:
                    this._horizontalSpeed2 = this._horizontalSpeed2*-1;
                    break;
                case 3:
                    this._verticalSpeed2 = this._verticalSpeed2*-1;
                    break;
                case 4:
                    this._horizontalSpeed1 = this._generateNewSpeed(randomRange);
                    break;
                case 5:
                    this._verticalSpeed1 = this._generateNewSpeed(randomRange);
                    break;
                case 6:
                    this._horizontalSpeed2 = this._generateNewSpeed(randomRange);
                    break;
                case 7:
                    this._verticalSpeed2 = this._generateNewSpeed(randomRange);
                    break;
            }
            this._generateNewStrategyChangeMoment();
        }
        if (this._checkIfDrawingFrame(frame)) { 
            while (this._historicalPath.length > Config.getMaxLengthHistoricalPath()-1) {
                this._historicalPath.shift();
            }
            // check border collisions
            if (this._xPosPoint1 <= Config.getChromeWidth() || this._xPosPoint1 >= Config.getGameWidth()-Config.getChromeWidth()) {
                this._horizontalSpeed1 = this._horizontalSpeed1*-1;
            }
            if (this._yPosPoint1 <= Config.getChromeWidth() || this._yPosPoint1 >= Config.getGameHeight()-Config.getChromeWidth()) {
                this._verticalSpeed1 = this._verticalSpeed1*-1;
            }
            if (this._xPosPoint2 <= Config.getChromeWidth() || this._xPosPoint2 >= Config.getGameWidth()-Config.getChromeWidth()) {
                this._horizontalSpeed2 = this._horizontalSpeed2*-1;
            }
            if (this._yPosPoint2 <= Config.getChromeWidth() || this._yPosPoint2 >= Config.getGameHeight()-Config.getChromeWidth()) {
                this._verticalSpeed2 = this._verticalSpeed2*-1;
            }
            this._xPosPoint1 = this._xPosPoint1+this._horizontalSpeed1;
            this._yPosPoint1 = this._yPosPoint1+this._verticalSpeed1;
            this._xPosPoint2 = this._xPosPoint2+this._horizontalSpeed2;
            this._yPosPoint2 = this._yPosPoint2+this._verticalSpeed2;
            this._storeNewPoints();
        }
    },
    _checkIfDrawingFrame : function(frame) { 
        return (frame % Config.getFrameSpeed() == 0);
    },
    _storeNewPoints : function() {
        this._historicalPath.push({x1:this._xPosPoint1, y1:this._yPosPoint1, x2:this._xPosPoint2, y2:this._yPosPoint2});
    },
    draw : function(ctx) {
        var total = this._historicalPath.length;
        for(var i=0;i<total;i++) {
            var colour = Config.getMinimalMenaceBrightness()+(this._colourStepper*(i+1));
            ctx.beginPath();
            ctx.lineWidth = (i+2)/total;
            ctx.strokeStyle = "white";
            ctx.moveTo(this._historicalPath[i].x1, this._historicalPath[i].y1);
            ctx.lineTo(this._historicalPath[i].x2, this._historicalPath[i].y2);
            ctx.stroke();
            ctx.closePath();
        }
    },
    _generatePoints : function() {
        var points = {};
        points.x = Math.round(Math.random()*(Config.getGameHeight()-Config.getChromeWidth()*2))+Config.getChromeWidth(); 
        points.y = Math.round(Math.random()*(Config.getGameHeight()-Config.getChromeWidth()*2))+Config.getChromeWidth(); 
        return points;
    },
    _calculcateLength : function() {
        var width = this._xPosPoint2-this._xPosPoint1;
        var height = this._yPosPoint2-this._yPosPoint1;
        var length = 49;
        // TODO: calculate the length of the damn thing
        return length;
    }
};

var Game =  {
    _xPosPlayer : 0,
    _yPosPlayer : 0,
    _menace : null,
    _level : null,
    _canvas : null,
    _frame : 0,
    isRunning : function() {
        return true;
    },
    start : function(canvas) {
        this._level = 0;
        GameChrome.init();
        this._createMenace();
        this._canvas = document.getElementById("stixGame").getContext("2d");
    },
    update : function() {
        this._frame++;
        this._menace.update(this._frame);
        // handle game status
    },
    draw : function() {
        document.getElementById("frames").innerText = this._frame;
        this._canvas.clearRect(0, 0, Config.getGameWidth(), Config.getGameHeight());
        this._menace.draw(this._canvas);
        GameChrome.draw(this._canvas);
        debugLog("gamedraw is done");
        // draw new screen
    },
    _createMenace : function() {
        this._menace = Menace;
        this._menace.create();
    },
    getMinMenaceSpeed : function() {
        return Config.getMinInitialMenaceSpeed() + (this._level * Config.getSpeedIncrementPerLevel());
    },
    getMaxMenaceSpeed : function() {
        return Config.getMaxInitialMenaceSpeed() + (this._level * Config.getSpeedIncrementPerLevel());
    },
    getFrame : function() {
        return this._frame;
    }
};

var debugLog = function(txtToLog) {
    var log = document.getElementById("debugconsole");
    if (log) {
        var oldTxts = log.innerHTML.split("<br\>");
        var newTxts= [];
        for(var n=0;n<Config.getDebugLinesToShow()-1;n++) {
            var el = oldTxts.shift();
            if (el != undefined) {  
                newTxts.push(oldTxts.pop());
            } 
        }
        newTxts.push(txtToLog);
        log.innerHTML = newTxts.join("<br\>");
    }
};




var mainloop = function() {
    if (Game.isRunning()) {
        Game.update();
        Game.draw();
    } else {
        debugLog("Game not running");
    }
};
var frameRateInterval = 1000.0 / 60.0;
setInterval( mainloop, frameRateInterval );
/*
var animFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        null ;

if ( animFrame !== null ) {
    var canvas = $('canvas').get(0);

    if ( $.browser.mozilla ) {
        var recursiveAnim = function() {
            mainloop();
            animFrame();
        };

        // setup for multiple calls
        window.addEventListener("MozBeforePaint", recursiveAnim, false);

        // start the mainloop
        animFrame();
    } else {
        var recursiveAnim = function() {
            mainloop();
            animFrame( recursiveAnim, canvas );
        };

        // start the mainloop
        animFrame( recursiveAnim, canvas );
    }
} else {
    var ONE_FRAME_TIME = 1000.0 / 60.0 ;
    setInterval( mainloop, ONE_FRAME_TIME );
};
*/