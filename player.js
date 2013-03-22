var Player = {
    _x : Config.getGameWidth()/2,
    _y : Config.getGameHeight()-Config.getChromeWidth(),
    _targetX : null,
    _targetY : null,
    _onEdge : true,
    _route : [],
    setEdge : function(edgeType) {
         this._onEdge = edgeType;
    },
    create : function() {
//        console.log(Config.getGameHeight()-100);
    },
    setTargetCoordinates : function(x, y) {
        this._route = Pathways.findRouteToPathwayPoint(x, y);
        // TODO: walk through route and set new endpoints
        for(var r=0;r<route.length;r++) {
            //route[r].;
        }
        this._targetX = x;
        this._targetY = y;
    },
    getCoords : function() {
        return [this._x, this._y];
    },
    update : function(frame) {
        if (this._checkIfDrawingFrame(frame)) {
            switch(this._onEdge) {
                case 'bottom':
                case 'top':
                    // move left and right only
                    if (this._x >= this._targetX-Config.getPlayerEdgeSpeed() && this._x <= this._targetX+Config.getPlayerEdgeSpeed()) {
                        // do nothing
                    } else if (this._targetX > this._x) {
                        this._x += Config.getPlayerEdgeSpeed();
                    } else {
                        this._x -= Config.getPlayerEdgeSpeed();
                    }
                    break;
                case 'left':
                case 'right':
                    // move up and down only
                    if (this._y >= this._targetY-Config.getPlayerEdgeSpeed() && this._y <= this._targetY+Config.getPlayerEdgeSpeed()) {
                        // do nothing
                    } else if (this._targetY > this._y-1) {
                        this._y += Config.getPlayerEdgeSpeed();
                    } else {
                        this._y -= Config.getPlayerEdgeSpeed();
                    }
                    break;
                default:
                    // we're out in the open fields... 
                    break;
            }
        }
    },
    _checkIfDrawingFrame : function(frame) { 
        return (frame % Config.getPlayerKeyFrameSpeed() == 0);
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