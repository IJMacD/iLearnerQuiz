var GE = (function(GE){

	GE.Comp = GE.Comp || {};

	var GameComponent = GE.GameComponent,
		GEC = GE.Comp;

	GameComponent.create(function DebugDrawPathComponent(renderSystem, path){
		this.renderSystem = renderSystem;
		this.path = path;
	},{
		update: function(parent, delta){
			if(GE.DEBUG){
				this.renderSystem.strokePath(this.path, "#000000");
			}
		}
	});
	GameComponent.create(function DebugDrawPathNormalsComponent(renderSystem, path){
		this.renderSystem = renderSystem;
		this.path = path;
	},{
		update: function(parent, delta){
			var c = this.path,
				l = c.length;
			if(GE.DEBUG){
				this.renderSystem.push(function(context){
					context.strokeStyle = "#08f";
					context.beginPath();
					for(i=0;i<l-3;i+=2){
						var x1 = c[i],
							y1 = c[i+1],
							x2 = c[i+2],
							y2 = c[i+3],
							dx = x2 - x1,
							dy = y2 - y1,
							mx = x1 + dx * 0.5,
							my = y1 + dy * 0.5,
							mag = Math.sqrt(dy * dy + dx * dx),
							nx = -dy / mag,
							ny = dx / mag;
						context.moveTo(mx,my);
						context.lineTo(mx+nx*30,my+ny*30);
					}
					context.stroke();
				});
			}
		}
	});


	function DebugDrawTrailComponent (renderSystem, object){
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
	GEC.DebugDrawTrailComponent = DebugDrawTrailComponent;
	DebugDrawTrailComponent.prototype = new GameComponent();
	DebugDrawTrailComponent.prototype.update = function(parent, delta) {
		if(GE.DEBUG){
			var px = parent.position[0],
				py = parent.position[1],
				vx = parent.velocity[0],
				vy = parent.velocity[1],
				ax = (vx - this.lastVx)/delta,
				ay = (vy - this.lastVy)/delta,
				rx = this.relativeTo[0],
				ry = this.relativeTo[1],
				skip = this.pathIndex % this.pathSize,
				path = [px, py];

			// Draw Trail
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
				this.renderSystem.strokePath(path,"#CCF");
			else
				this.renderSystem.strokePath(path,"#CCC");

			this.pathIndex++;
			this.path[skip] = [px-rx,py-ry];

			// Draw Velocity
			this.renderSystem.strokePath([px, py, px+vx*100, py+vy*100], "rgba(0,128,255,0.7)");

			// Draw Acceleration
			this.renderSystem.strokePath([px, py, px+ax*4e5, py+ay*4e5], "rgba(0,255,0,0.7)");
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

	GameComponent.create(function DebugDrawCenterComponent (renderSystem){
		this.renderSystem = renderSystem;
	}, {
		update: function(parent, delta) {
			if(GE.DEBUG){
				this.renderSystem.push(function(context){
					context.strokeStyle = "#ffffff";
					context.beginPath();
					context.moveTo(parent.position[0], parent.position[1]-10);
					context.lineTo(parent.position[0], parent.position[1]+10);
					context.stroke();
					context.beginPath();
					context.moveTo(parent.position[0]-10, parent.position[1]);
					context.lineTo(parent.position[0]+10, parent.position[1]);
					context.stroke();
				});
			}
		}
	});

	GameComponent.create(function DebugDrawBoundsComponent (renderSystem, bounds){
		this.renderSystem = renderSystem;
		this.bounds = bounds;
	}, {
		update: function(parent, delta) {
			var bounds = this.bounds,
				pos = parent.position,
				left = pos[0] + bounds.left,
				right = pos[0] + bounds.right,
				top = pos[1] + bounds.top,
				bottom = pos[1] + bounds.bottom;
			if(GE.DEBUG){
				this.renderSystem.push(function(context){
					context.strokeStyle = "#ffffff";
					context.beginPath();
					context.moveTo(left, top);
					context.lineTo(right, top);
					context.lineTo(right, bottom);
					context.lineTo(left, bottom);
					context.lineTo(left, top);
					context.stroke();
				});
			}
		}
	});

	return GE;
}(GE || {}));
