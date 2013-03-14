var Bootstrap =  {
    init : function() {
        var gameArea = document.getElementById('stixGame');
        if (!gameArea) {
            this.addCanvas();        
            Game.start(gameArea); // game starts immediately for now
 //           mainloop();
            var frameRateInterval = 1000.0 / 25.0;
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