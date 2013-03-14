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
