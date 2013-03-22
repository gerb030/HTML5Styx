var UserEvent = {
    x : null,
    y : null,
    type : null,
    create : function(x, y, type) {
        this.x = x-18;
        this.y = y-14;
        this.type = type;
        return this;
    }
};
