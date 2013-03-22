var Pathways = {
    init : function() {
        this._pathways = [];
        var borders = [ 
            {x : Config.getChromeWidth()-1.5, y : Config.getChromeWidth()-1.5},
            {x : Config.getGameWidth()-Config.getChromeWidth()+1.5, y : Config.getChromeWidth()-1.5},
            {x : Config.getGameWidth()-Config.getChromeWidth()+1.5, y : Config.getGameHeight()-Config.getChromeWidth()+1.5},
            {x : Config.getChromeWidth()-1.5, y : Config.getGameHeight()-Config.getChromeWidth()+1.5}
        ];
//        this._addPathway(borders[0].x, borders[0].y, borders[1].x, borders[1].x);    

        for(var i=0;i<borders.length-1;i++) {
            this._addPathway(borders[i].x, borders[i].y, borders[i+1].x, borders[i+1].y);    
        }
        this._addPathway(borders[i].x, borders[i].y, borders[0].x, borders[0].y);    
        this._addPathway(214.5, 14.5, 214.5, 114.5);    
        this._addPathway(14.5, 114.5, 214.5, 114.5);    
    },
    _addPathway : function(x1, y1, x2, y2) {
        if (x1 < x2 || y1 < y2) {
            this._pathways.push([x1, y1, x2, y2]);
        } else {
            this._pathways.push([x2, y2, x1, y1]);
        }
    },
    findRouteToPathwayPoint : function(x, y) { // find a route to the pathway point - main entry point function
        var routes = [];
        var targetCoords = this._findNearestPathwayEndpoint(x, y);
//        var way = this._pathways[targetCoords[2]];
        var linkedPaths = this._findShortestRoute(Player.getCoords(), targetCoords);
        if (linkedPaths == null) return [];
                // for(var i=0;i<linkedPaths.length;i++) {
        //     var link = linkedPaths[i];
        //     routes[i] = {d : (link[0]-coords[0])+(link[1]-coords[1]), w : link};
        // }
        return routes[0];
    },
    _findNearestPathwayEndpoint : function(x, y) { // return the pathway that the x and y coordinates are on.
        var points = [];
        var n = 0;
//        console.log(this._pathways);
        for(var i=0;i<this._pathways.length;i++) {
            var way = this._pathways[i];
            if (this._inRangeOf(way[0], x) || this._inRangeOf(way[1], y)) {
                points.push([way[0], way[1], i]);
            }
            if (this._inRangeOf(way[2], x) || this._inRangeOf(way[3], y)) {
                points.push([way[2], way[3], i]);
            }
        }
        var nearestPoint = [1000, 1000, 0];
        for(var p=0;p<points.length;p++) {
            nearestPoint = this._getClosestPoint(points[p], [x, y], nearestPoint);
        }
        return nearestPoint;
    },
    _findShortestRoute : function(sourceCoords, targetCoords) { // find the shortest route from one point to another
        var sourceIndex = null;
        var targetIndex = null;
        for(var i=0;i<this._pathways.length;i++) {
            if (this._areCoordsOnPathway(sourceCoords, this._pathways[i])) {
                sourceIndex = i;
            }
            if (this._areCoordsOnPathway(targetCoords, this._pathways[i])) {
                targetIndex = i;
            }
        }
        if (sourceIndex == null || targetIndex == null) return null; // could not find a pathway for one of the coordinates. null is allowed here.
        // if all coordinates are locatable (meaning the user clicked on a pathway), then please continue
        var routes = [];

        routes = this._appendRoutes(routes, sourceCoords, sourceIndex);
        // pass through all the routes and 
        for(var r=0;r<routes.length;r++) {
            var endPoint = routes[r][3];
            var newRoutes = this._findRoutesByEndpoint(endPoint[0], endPoint[1]);
            for(var n=0;n<newRoutes.length;n++) {
                routes[r] = this._appendRoutes([routes[r]], endPoint, newRoutes[n]);
            }
        }
        console.log(routes);

    },
    _findRoutesByEndpoint : function(x, y) {
        var stack = [];
        for(var p=0;p<this._pathways.length;p++) {
            if (this._pathways[p][0] == x && this._pathways[p][1] == y) {
                stack.push(p);
            } else if (this._pathways[p][2] == x && this._pathways[p][3] == y) {
                stack.push(p);
            }
        }
        return stack;
    },
    _appendRoutes : function(routes, sourceCoords, pathwayIndex) {
        if (this._inRangeOf(sourceCoords[0], this._pathways[pathwayIndex][2])) { // cursor on X axis? give Y movement
            var distance = sourceCoords[1]-this._pathways[pathwayIndex][3];
            routes.push([distance, 'n', pathwayIndex, [this._pathways[pathwayIndex][2], this._pathways[pathwayIndex][3]]]);
            distance = this._pathways[pathwayIndex][1]-sourceCoords[1];
            routes.push([distance, 's', pathwayIndex, [this._pathways[pathwayIndex][0], this._pathways[pathwayIndex][1]]]);
        } else { // cursor on Y axis? give X movement
            var distance = sourceCoords[0]-this._pathways[pathwayIndex][0];
            routes.push([distance, 'w', pathwayIndex, [this._pathways[pathwayIndex][0], this._pathways[pathwayIndex][1]]]);
            distance = this._pathways[pathwayIndex][2]-sourceCoords[0];
            routes.push([distance, 'e', pathwayIndex, [this._pathways[pathwayIndex][2], this._pathways[pathwayIndex][3]]]);
        }
        return routes;
    },
    _getClosestPoint : function(newPoint, mousePoint, shortestPoint) {
        if (this._inRangeOf(mousePoint[0], newPoint[0])) { // is it X axis?
            if (mousePoint[0]*1-newPoint[0]*1 < shortestPoint[0]) return [newPoint[0], mousePoint[1], newPoint[2], 'x']; 
        } else if (this._inRangeOf(mousePoint[1], newPoint[1])) { // is it Y axis?
            if (mousePoint[0]*1-newPoint[1]*1 < shortestPoint[1]) return [mousePoint[0], newPoint[1], newPoint[2], 'y'];
        }
        return shortestPoint;
    },
    _findLinkedPath : function(targetCoords) {
        var paths = [];
        for(var i=0;i<this._pathways.length;i++) {
            var way = this._pathways[i];
            if ( (way[0] == targetCoords.x && way[1] == targetCoords.y) || (way[2] == targetCoords.x && way[3] == targetCoords.y) ) {
                paths.push(way);
            }
        }
        return paths;
    },
    _inRangeOf : function(target, source) {
        return (source < target+Config.getClickMargin() && source > target-Config.getClickMargin());
    },
    _areCoordsOnPathway : function(coords, pathway) { // determine if coordinates are on a given pathway
        return (this._inRangeOf(coords[0], pathway[0]) || this._inRangeOf(coords[1], pathway[1]));
    },
    draw : function(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        for(var i=0;i<this._pathways.length;i++) {
            var way = this._pathways[i];
            ctx.moveTo(way[0], way[1])
            ctx.lineTo(way[2], way[3]);
            ctx.moveTo(way[2], way[3])
            ctx.stroke();
        }
        ctx.closePath();
    }
};