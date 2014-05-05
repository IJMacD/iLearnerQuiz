var GE = (function(GE){

	GE.Comp = GE.Comp || {};

	var GameComponent = GE.GameComponent,
		GEC = GE.Comp;


	function DebugDrawPathComponent (renderSystem, object){
		this.path = [];
		this.pathSize = 1000;
		this.pathIndex = 0;
		this.lastVx = 0;
		this.lastVy = 0;
		this.renderSystem = renderSystem;
		if(object instanceof GE.GameObject)
			this.relativeTo = object.position;
		else
			this.relativeTo = vec2.create();
	}
	GEC.DebugDrawPathComponent = DebugDrawPathComponent;
	DebugDrawPathComponent.prototype = new GameComponent();
	DebugDrawPathComponent.prototype.update = function(parent, delta) {
		if(GE.DEBUG){
			var px = parent.position[0],
				py = -parent.position[2],
				vx = parent.velocity[0],
				vy = -parent.velocity[2],
				ax = (vx - this.lastVx)/delta,
				ay = (vy - this.lastVy)/delta,
				rx = this.relativeTo[0],
				ry = this.relativeTo[1],
				skip = this.pathIndex % this.pathSize,
				path = [px, py];

			// Draw Path
			if(this.pathIndex > this.pathSize){
				for(var i = this.pathSize-1;i>=0;i--){
					var index = (i + skip + this.pathSize) % this.pathSize;
					path.push(
						this.path[index][0]+rx,
						this.path[index][1]+ry
					);
				}
			}else{
				for(var i = this.pathIndex-1;i>=0;i--){
					path.push(
						this.path[i][0]+rx,
						this.path[i][1]+ry
					);
				}
			}

			if(rx || ry)
				this.renderSystem.strokePath(path,"#CCF",0);
			else
				this.renderSystem.strokePath(path,"#CCC",0);

			this.pathIndex++;
			this.path[skip] = [px-rx,py-ry];

			// Draw Velocity
			this.renderSystem.strokePath([px, py, px+vx*100, py+vy*100], "rgba(0,128,255,0.7)",0);

			// Draw Acceleration
			this.renderSystem.strokePath([px, py, px+ax*4e5, py+ay*4e5], "rgba(0,255,0,0.7)",0);
			this.lastVx = vx;
			this.lastVy = vy;
		}else{
			this.pathIndex = 0;
		}
	};


	function DebugDrawDataComponent (renderSystem){
		this.renderSystem = renderSystem;
	}
	GEC.DebugDrawDataComponent = DebugDrawDataComponent;
	DebugDrawDataComponent.prototype = new GameComponent();
	DebugDrawDataComponent.prototype.update = function(parent, delta) {
		if(GE.DEBUG){
			this.renderSystem.push(function(context){
				context.strokeStyle = "#ffffff";
				context.fillStyle = "#ff0000";
				context.fillText("x: " + parent.position[0], 10, 10);
				context.fillText("y: " + parent.position[1], 10, 20);
				context.fillText("Vx: " + parent.velocity[0], 10, 30);
				context.fillText("Vy: " + parent.velocity[1], 10, 40);
			}, "overlay");
		}
	};

	return GE;
}(GE || {}));
