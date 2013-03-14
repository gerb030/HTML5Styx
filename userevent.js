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
