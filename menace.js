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
            var fudgeFactor = 3;
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
        return (frame % Config.getMenaceKeyFrameSpeed() == 0);
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