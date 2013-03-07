var Config = {
	getHeight : function() {
		return 500;
	},
	getWidth : function() {
		return 500;
	},
    getChromeWidth : function() {
        return 16;
    },
    getGameHeight : function() {
        return 500;
    },
    getGameWidth : function() {
        return 940;
    },
    getGameXOffset : function() {
        return 4;
    },
    getGameYOffset : function() {
        return 8;
    },
    getPlayerEdgeSpeed : function() {
        return 2;
    },
    getMaxInitialMenaceLength : function() {
        return 50;
        // not used
    },
    getMinInitialMenaceLength : function() {
        return 10;
        // not used
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
 //           mainloop();
            var frameRateInterval = 1000.0 / 60.0;
            setInterval( mainloop, frameRateInterval );
        }
        document.addEventListener("touchstart", Game.handleEvent, true);
        document.addEventListener("touchmove", Game.handleEvent, true);
        document.addEventListener("touchend", Game.handleEvent, true);
        document.addEventListener("touchcancel", Game.handleEvent, true);           
    },
    addCanvas : function() {
        var target = document.getElementById("gamearea");
        target.innerHTML = "";
        // target.style.width = Config.getWidth();
        // target.style.height = Config.getHeight();
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
            {x : Config.getChromeWidth()-1.5, y : Config.getChromeWidth()-1.5},
            {x : Config.getGameWidth()-Config.getChromeWidth()+1.5, y : Config.getChromeWidth()-1.5},
            {x : Config.getGameWidth()-Config.getChromeWidth()+1.5, y : Config.getGameHeight()-Config.getChromeWidth()+1.5},
            {x : Config.getChromeWidth()-1.5, y : Config.getGameHeight()-Config.getChromeWidth()+1.5}
        ];
    },
    draw : function(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.moveTo(this._borders[0].x, this._borders[0].y)
        for(var i=0;i<this._borders.length;i++) {
            ctx.lineTo(this._borders[i].x, this._borders[i].y);
            ctx.moveTo(this._borders[i].x, this._borders[i].y)
            ctx.stroke();
        }
        ctx.lineTo(this._borders[0].x, this._borders[0].y)
        ctx.stroke();
        ctx.closePath();
    }
};
var Menace = {
    _historicalPath : [],
    _xPosPoint1 : 0,
    _yPosPoint1 : 0,
    _xPosPoint2 : 0,
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
            var fudgeFactor = 4;
            if (this._xPosPoint1 <= Config.getChromeWidth()+fudgeFactor || this._xPosPoint1 >= Config.getGameWidth()-Config.getChromeWidth()-fudgeFactor) {
                this._horizontalSpeed1 = this._horizontalSpeed1*-1;
            }
            if (this._yPosPoint1 <= Config.getChromeWidth()+fudgeFactor || this._yPosPoint1 >= Config.getGameHeight()-Config.getChromeWidth()-fudgeFactor) {
                this._verticalSpeed1 = this._verticalSpeed1*-1;
            }
            if (this._xPosPoint2 <= Config.getChromeWidth()+fudgeFactor || this._xPosPoint2 >= Config.getGameWidth()-Config.getChromeWidth()-fudgeFactor) {
                this._horizontalSpeed2 = this._horizontalSpeed2*-1;
            }
            if (this._yPosPoint2 <= Config.getChromeWidth()+fudgeFactor || this._yPosPoint2 >= Config.getGameHeight()-Config.getChromeWidth()-fudgeFactor) {
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
        }
        ctx.closePath();
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

var PencilAnim = {
    draw : function(ctx, x, y, frameNr) {
        if (frameNr < 8 || frameNr > 48)  {
//            debugLog(x+', '+y);
            ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(57.5,0);ctx.lineTo(57.5,96.25);ctx.lineTo(0,96.25);ctx.closePath();ctx.translate(x,y);ctx.translate(x+0,y+0);ctx.scale(1.25,1.25);ctx.translate(9,11);ctx.strokeStyle = 'rgba(0,0,0,0)';ctx.lineCap = 'butt';ctx.lineJoin = 'miter';ctx.miterLimit = 4;ctx.save();ctx.restore();ctx.save();ctx.fillStyle = "rgba(0, 0, 0, 0)";ctx.strokeStyle = "rgba(0, 0, 0, 0)";ctx.save();ctx.restore();ctx.save();ctx.save();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(5.086171,35.037826);ctx.lineTo(2.6592045,54.665015);ctx.lineTo(13.597241,38.135602);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(5.086171,35.037826);ctx.lineTo(17.297966,0.922754);ctx.lineTo(25.990122,4.0864403);ctx.lineTo(13.597241,38.135602);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(5.086171,35.037826);ctx.lineTo(13.597241,38.135602);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(7.80247,36.026478);ctx.lineTo(20.063512,2.3395412);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(10.880942,37.14695);ctx.lineTo(23.141984,3.4600135);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(3.6111825,46.966247);ctx.lineTo(6.5469218,48.49113);ctx.lineTo(6.5469218,48.49113);ctx.fill();ctx.stroke();ctx.restore();ctx.restore();ctx.restore();ctx.restore();
        } else if (frameNr < 16 || frameNr > 40)  {
            ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(62.5,0);ctx.lineTo(62.5,93.75);ctx.lineTo(0,93.75);ctx.closePath();ctx.translate(x,y);ctx.translate(x+0,y+2);ctx.scale(1.25,1.25);ctx.translate(9,10);ctx.strokeStyle = 'rgba(0,0,0,0)';ctx.lineCap = 'butt';ctx.lineJoin = 'miter';ctx.miterLimit = 4;ctx.save();ctx.restore();ctx.save();ctx.fillStyle = "rgba(0, 0, 0, 0)";ctx.strokeStyle = "rgba(0, 0, 0, 0)";ctx.save();ctx.restore();ctx.save();ctx.save();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(6.1533246,34.528987);ctx.lineTo(2.3637274,53.939327);ctx.lineTo(14.428759,38.213448);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(6.1533246,34.528987);ctx.lineTo(20.715094,1.3488582);ctx.lineTo(29.166601,5.1117117);ctx.lineTo(14.428759,38.213448);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(6.1533246,34.528987);ctx.lineTo(14.428759,38.213448);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(8.7944207,35.704879);ctx.lineTo(23.375478,2.9552888);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(11.787663,37.037556);ctx.lineTo(26.36872,4.287966);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(3.850197,46.32562);ctx.lineTo(6.6728448,48.051766);ctx.lineTo(6.6728448,48.051766);ctx.fill();ctx.stroke();ctx.restore();ctx.restore();ctx.restore();ctx.restore();                
        } else if (frameNr < 24 || frameNr > 32) {
            ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(66.25,0);ctx.lineTo(66.25,93.75);ctx.lineTo(0,93.75);ctx.closePath();ctx.translate(x,y);ctx.translate(x+0,y+4);ctx.scale(1.25,1.25);ctx.translate(10,10);ctx.strokeStyle = 'rgba(0,0,0,0)';ctx.lineCap = 'butt';ctx.lineJoin = 'miter';ctx.miterLimit = 4;ctx.save();ctx.restore();ctx.save();ctx.fillStyle = "rgba(0, 0, 0, 0)";ctx.strokeStyle = "rgba(0, 0, 0, 0)";ctx.save();ctx.restore();ctx.save();ctx.save();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(6.7568446,33.991704);ctx.lineTo(1.6219205,53.090115);ctx.lineTo(14.7539585,38.243845);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(6.7568446,33.991704);ctx.lineTo(23.597695,1.9081915);ctx.lineTo(31.76496,6.2508034);ctx.lineTo(14.7539585,38.243845);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(6.7568446,33.991704);ctx.lineTo(14.7539585,38.243845);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(9.309115,35.34877);ctx.lineTo(26.139149,3.6960803);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(12.201688,36.88678);ctx.lineTo(29.031722,5.2340887);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(3.6360954,45.59876);ctx.lineTo(6.3310413,47.51738);ctx.lineTo(6.3310413,47.51738);ctx.fill();ctx.stroke();ctx.restore();ctx.restore();ctx.restore();ctx.restore();
        } else {
            ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(71.25,0);ctx.lineTo(71.25,91.25);ctx.lineTo(0,91.25);ctx.closePath();ctx.translate(x,y);ctx.translate(x+0,y+6);ctx.scale(1.25,1.25);ctx.translate(11,9);ctx.strokeStyle = 'rgba(0,0,0,0)';ctx.lineCap = 'butt';ctx.lineJoin = 'miter';ctx.miterLimit = 4;ctx.save();ctx.restore();ctx.save();ctx.fillStyle = "rgba(0, 0, 0, 0)";ctx.strokeStyle = "rgba(0, 0, 0, 0)";ctx.save();ctx.restore();ctx.save();ctx.save();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(7.3989097,33.427822);ctx.lineTo(0.94425625,52.121515);ctx.lineTo(15.079929,38.227455);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(7.3989097,33.427822);ctx.lineTo(26.43677,2.5972207);ctx.lineTo(34.281215,7.498974);ctx.lineTo(15.079929,38.227455);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(7.3989097,33.427822);ctx.lineTo(15.079929,38.227455);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(9.850299,34.95962);ctx.lineTo(28.847316,4.5580372);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(12.62854,36.695657);ctx.lineTo(31.625557,6.2940748);ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle = "#8b97bc";ctx.lineWidth = 1;ctx.lineCap = "round";ctx.lineJoin = "round";ctx.beginPath();ctx.moveTo(3.4760952,44.78891);ctx.lineTo(6.0306402,46.890847);ctx.lineTo(6.0306402,46.890847);ctx.fill();ctx.stroke();ctx.restore();ctx.restore();ctx.restore();ctx.restore();
        }
    }
}

var Player = {
    _x : Config.getGameWidth()/2,
    _y : Config.getGameHeight()-Config.getChromeWidth(),
    _targetX : null,
    _targetY : null,
    _onEdge : 'bottom',
    setEdge : function(edgeType) {
         this._onEdge = edgeType;
    },
    create : function() {
//        console.log(Config.getGameHeight()-100);
    },
    setTargetCoordinates : function(x, y) {
        this._targetX = x;
        this._targetY = y;
    },
    update : function() {
        switch(this._onEdge) {
            case 'bottom':
            case 'top':
                // move left and right only
                if (this._targetX > this._x) {
                    this._x += Config.getPlayerEdgeSpeed();
                } else {
                    this._x -= Config.getPlayerEdgeSpeed();
                }
                break;
            case 'left':
            case 'right':
                // move up and down only
                if (this._targetY > this._y) {
                    this._y += Config.getPlayerEdgeSpeed();
                } else {
                    this._y -= Config.getPlayerEdgeSpeed();
                }
                break;
            default:
                // we're out in the open fields... 
                break;
        }
    },
    draw : function(ctx, frame) {
        if (this._onEdge != false) {
            PencilAnim.draw(ctx, (this._x-13)/2, (this._y-82)/2, 0);
        } else {
            PencilAnim.draw(ctx, this._x, this._y, this._frame % 32);
        }
        ctx.moveTo(this._x, this._y);
        ctx.beginPath();
        ctx.arc(this._x, this._y+2, 6, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = '#CCCCFF';
        ctx.fill();
    }
}

var UserEvent = {
    x : null,
    y : null,
    type : null,
    create : function(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        return this;
    }
};

var Game =  {
    _player : null,
    _menace : null,
    _level : null,
    _canvas : null,
    _frame : 0,
    isRunning : function() {
        return true;
    },
    handleEvent : function(event) {
        uEvent = this._getEvent(event);
        this._player.setTargetCoordinates(uEvent.x, uEvent.y);
        //          //initMouseEvent(type, canBubble, cancelable, view, clickCount,
        // //           screenX, screenY, clientX, clientY, ctrlKey,
        // //           altKey, shiftKey, metaKey, button, relatedTarget);
        
        // var simulatedEvent = document.createEvent("MouseEvent");
        // simulatedEvent.initMouseEvent(type, true, true, window, 1,
        //                           first.screenX, first.screenY,
        //                           first.clientX, first.clientY, false,
        //                           false, false, false, 0/*left*/, null);
    },
    _getEvent : function(event) {
        var touches = event.changedTouches;
        var uEvent = null;
        if (touches != undefined) {
            var first = touches[0];
            var type = null;
             switch(event.type) {
                case "touchstart": 
                    type = "mousedown"; break;
                case "touchmove": 
                    type="mousemove"; break;        
                case "touchend":
                    type="mouseup"; break;
                default: return;
            }
            uEvent = UserEvent.create(first.clientX, first.clientY, type);
        } else {
            uEvent = UserEvent.create(event.clientX, event.clientY, event.type);
        }
        event.preventDefault();
        return uEvent;
    },
    start : function(canvas) {
        this._level = 0;
        GameChrome.init();
        this._createMenace();
        this._createPlayer();
        this._canvas = document.getElementById("stixGame").getContext("2d");
    },
    update : function() {
        this._frame++;
        this._player.update(this._frame);
        this._menace.update(this._frame);
        // handle game status
    },
    draw : function() {
        this._canvas.clearRect(0, 0, Config.getGameWidth(), Config.getGameHeight());
        this._menace.draw(this._canvas);
        GameChrome.draw(this._canvas);
        this._player.draw(this._canvas, this._frame);
    },
    _createMenace : function() {
        this._menace = Menace;
        this._menace.create();
    },
    _createPlayer : function() {
        this._player = Player;
        this._player.create();
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