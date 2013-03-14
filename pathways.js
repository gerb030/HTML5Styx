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