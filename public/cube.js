
    /* mobile fix */
    var mobi = document.createElement("meta");
    mobi.name = "viewport";
    mobi.content = "width=device-width, initial-scale=1, maximum-scale=1";
    document.head.appendChild(mobi);
    
    var fh = 17;
    var fw = 9;
    
    var d = document,
        w = window,
        b = d.getElementById("cube-anim") || false,
        he = d.head,
        pp = d.createElement("pre"),
        p = d.createElement("span"),
        cols = w.innerWidth/fw|0,
        rows = w.innerHeight/fh|0,
        a = [],
        ctx;
    
    if (b != false) {
        
   /*  var canvas = document.createElement("canvas");
    canvas.width = cols;
    canvas.height = rows;
    b.appendChild(canvas);
    ctx = canvas.getContext("2d");
     */
    
    b.appendChild(pp);
    pp.appendChild(p);
    b.style.margin = 0;
    
    for(var y = 0; y < rows; y++) {
        a[y] = [];
        for(var x = 0; x < cols; x++) {
            a[y][x] = 0;
        }
    }
    
    function get(x,y) {
        return a[y][x];
    }
    
    function s(v,x,y) {
        
        y = y/fh*fw; // Normalize to font
        
        x = x|0;
        y = y|0;
        if (x>=cols||y>=rows||y<0||x<0) return;
        a[y%rows][x%cols] = v;
        
        /* DEBUG *
        ctx.fillStyle = "rgba(255,0,0.8)";
        ctx.fillRect( x, y, 1, 1 );
        /**/
    }
    
    function clear() {
        if (ctx) ctx.clearRect(0,0,cols,rows);
        a = a.map(function(aa){ return aa.map(function() { return 0; }); });
    }
    
    function line(x0,y0,x1,y1) {
        
        /* DEBUG *
        ctx.fillStyle = "rgba(0,0,255,0.3)";
        ctx.beginPath();
        ctx.moveTo(x0+cols/2,y0+rows/2);
        ctx.lineTo(x1+cols/2,y1+rows/2);
        ctx.stroke();
        /**/
        
        x0 = x0+cols/2;
        y0 = y0+rows/2;
        x1 = x1+cols/2;
        y1 = y1+rows/2;
        
        if ((x0>x1&&x0>0)||
            (x0<x1&&x0<0)) {
            var tmpx0 = x0;
            x0 = x1;
            x1 = tmpx0;
            var tmpy0 = y0;
            y0 = y1;
            y1 = tmpy0;
        }
        
        
        var swap = Math.abs(x1-x0) < Math.abs(y1-y0);
        if (swap) {
            var tmpx1 = x0;
            var tmpx2 = x1;
            var tmpy1 = y0;
            var tmpy2 = y1;
            x0 = tmpy1;
            x1 = tmpy2;
            y0 = tmpx1;
            y1 = tmpx2;
        }
        
        
        if ((y0>y1&&y0>0)||
            (y0<y1&&y0<0)) {
            var tmpx0 = x0;
            x0 = x1;
            x1 = tmpx0;
            var tmpy0 = y0;
            y0 = y1;
            y1 = tmpy0;
        }
        
        x0 = x0|0;
        x1 = x1|0;
        y0 = y0|0;
        y1 = y1|0;
        
        /* DEBUG *
        ctx.fillRect( x0, y0, 2, 2 );
        ctx.fillRect( x1, y1, 2, 2 );
        /**/
        
        var deltax = x1 - x0;
        var deltay = y1 - y0;
        var error = 0;
        var deltaerr = Math.abs(deltay / deltax);
        var y = y0;
        for(var x = x0; x != x1; x += ((x<x1)?1:-1)) {
            s(1-Math.abs(error),swap?y:x,swap?x:y);
            //if(error != 0) s(Math.abs(error), x, y + (error > 0 ? 1 : -1));
            error = error + deltaerr;
            if (error >= 0.5) {
                y = y + (y>0?1:-1);
                error = error - 1.0;
            }
        }
    }
    
    var values = " .'`,^:;~-_+i!lI?/\|()1{}[]rcvunxzjftLCJUYXZO0Qoahkbdpqwm*WMB8&%$#@".split("");
    function value(v) {
        return values[Math.floor(values.length*v*0.999)];
    }
    
    function render() {
        p.innerHTML = a.map(function(x) { return x.map(value).join(""); }).join("\n");
    }
    
    /*d.onmousemove = function() {
        clear();
        var x = w.event.clientX / w.innerWidth * cols | 0;
        var y = (w.innerHeight-w.event.clientY) / w.innerHeight * rows | 0;
        line(cols-1,rows-1,x,y);
        render();
    }*/
    
    function Scene() {
        this.objects = [];
    }
    Scene.prototype.draw = function() {
        this.objects.forEach(function(obj) {
            obj.draw();
        });
    }
    Scene.prototype.addChild = function(obj) {
        this.objects.push(obj);
    }
    
    var scene = new Scene;
    
    
    function v2(x,y) {
        this.x = x;
        this.y = y;
    }
    function v3(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    v3.prototype.m = function(multiplier) {
        return new v3(
            this.x*multiplier,
            this.y*multiplier,
            this.z*multiplier
        )
    }
    v3.prototype.a = function(add) {
        return new v3(
            this.x+add.x,
            this.y+add.y,
            this.z+add.z
        )
    }
    
    function ProjectV3toV2(v3p) {
        var focalLength = 60;
        var scale = focalLength/(v3p.z+focalLength);
        
        return new v2(v3p.x*scale, v3p.y*scale);
    }
    
    function l3(from, to) {
        this.from = from;
        this.to = to;
    }
    l3.prototype.draw = function() {
        p0 = ProjectV3toV2(this.from);
        p1 = ProjectV3toV2(this.to);
        
        line(p0.x,p0.y,p1.x,p1.y);
    }
    function sq(point, width) {
        this.point = point;
        this.width = width;
    }
    sq._top = [
        new v3(-0.5,0.5,-0.5),
        new v3(0.5,0.5,-0.5),
        new v3(0.5,0.5,0.5),
        new v3(-0.5,0.5,0.5)
    ];
    sq._bottom = [
        new v3(-0.5,-0.5,-0.5),
        new v3(0.5,-0.5,-0.5),
        new v3(0.5,-0.5,0.5),
        new v3(-0.5,-0.5,0.5)
    ];
    
    sq.prototype.draw = function() {
        var top = [
            new v3(-0.5,0.5,-0.5),
            new v3(0.5,0.5,-0.5),
            new v3(0.5,0.5,0.5),
            new v3(-0.5,0.5,0.5)
        ];
        var bottom = [
            new v3(-0.5,-0.5,-0.5),
            new v3(0.5,-0.5,-0.5),
            new v3(0.5,-0.5,0.5),
            new v3(-0.5,-0.5,0.5)
        ];
        
        var allPoints = [];
        top.forEach(function(p){allPoints.push(p);});
        bottom.forEach(function(p){allPoints.push(p);});
        var rotate = new v3(
            (new Date().getTime()/2000)%Math.PI,
            (new Date().getTime()/2000)%Math.PI,
            (new Date().getTime()/2000)%Math.PI
        );
        
        allPoints.forEach(function(p){
            
            var d1x = Math.cos(rotate.y)*p.x + Math.sin(rotate.y)*p.z;
            var d1y = p.y;
            var d1z = Math.cos(rotate.y)*p.z - Math.sin(rotate.y)*p.x;
            
            var d2x = d1x;
            var d2y = Math.cos(rotate.x)*d1y - Math.sin(rotate.x)*d1z;
            var d2z = Math.cos(rotate.x)*d1z + Math.sin(rotate.x)*d1y;
            
            var d3x = Math.cos(rotate.z)*d2x + Math.sin(rotate.z)*d2y;
            var d3y = Math.cos(rotate.z)*d2y - Math.sin(rotate.z)*d2x;
            var d3z = d2z;
            
            p.x = d3x;
            p.y = d3y;
            p.z = d3z;
            
        });
        
        
        for(var i = 0; i < top.length; i++) {
            var lineTop = new l3(
                top[i].m(this.width).a(this.point),
                top[(i+1)%top.length].m(this.width).a(this.point)
            );
            var lineBottom = new l3(
                bottom[i].m(this.width).a(this.point),
                bottom[(i+1)%top.length].m(this.width).a(this.point)
            );
            var lineBetween = new l3(
                top[i].m(this.width).a(this.point),
                bottom[i].m(this.width).a(this.point)
            );
            lineTop.draw();
            lineBottom.draw();
            lineBetween.draw();
        }
    }
    


    var movingSquare = new sq(
        new v3(0,20,150),
        60
    );
    scene.addChild(movingSquare);
    
    setInterval(function() {
        clear();
        //movingSquare.point.x = Math.sin(new Date().getTime()/1000)*cols;
        //movingSquare.point.y = Math.sin(new Date().getTime()/3000)*rows;
        //movingSquare.point.z = Math.sin(new Date().getTime()/2000)*70 + 80;
        scene.draw();
        render();
        jehna.draw();
    },1000/30);
    
    }