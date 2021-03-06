var GE = (function(GE){

	GE.Comp = GE.Comp || {};

	var WorldBounceComponent = GE.Comp.WorldBounceComponent = function WorldBounceComponent (width, height, bounds) {
		this.ax = width / 2;
		this.ay = height / 2;
		this.bx1 = bounds[0] + this.ax;
		this.by1 = bounds[1] + this.ay;
		this.bx2 = bounds[2] - this.ax;
		this.by2 = bounds[3] - this.ay;
	};

	WorldBounceComponent.prototype = new GE.GameComponent();

	WorldBounceComponent.prototype.update = function(parent, delta) {
		var coef = 0.9,
			friction = 0.9;
		if(parent.position[0] < this.bx1){
			parent.position[0] = this.bx1;
			parent.velocity[0] = -parent.velocity[0]*coef;
			parent.velocity[1] = parent.velocity[1]*friction;
		}
		else if(parent.position[0] > this.bx2){
			parent.position[0] = this.bx2;
			parent.velocity[0] = -parent.velocity[0]*coef;
			parent.velocity[1] = parent.velocity[1]*friction;
		}
		if(parent.position[1] < this.by1){
			parent.position[1] = this.by1;
			parent.velocity[1] = -parent.velocity[1]*coef;
			parent.velocity[0] = parent.velocity[0]*friction;
		}
		else if(parent.position[1] > this.by2){
			parent.position[1] = this.by2;
			parent.velocity[1] = -parent.velocity[1]*coef;
			parent.velocity[0] = parent.velocity[0]*friction;
		}
	};

	var WorldBoundsComponent = GE.Comp.WorldBoundsComponent = function WorldBoundsComponent (width, height, bounds) {
		this.ax = 0;width / 2;
		this.ay = 0;height / 2;
		this.bx1 = bounds[0] + this.ax;
		this.by1 = bounds[1] + this.ay;
		this.bx2 = bounds[2] - this.ax;
		this.by2 = bounds[3] - this.ay;
	};
	WorldBoundsComponent.prototype = new GE.GameComponent();
	WorldBoundsComponent.prototype.update = function(parent, delta) {
		if(parent.position[0] < this.bx1){
			parent.position[0] = this.bx1;
			parent.velocity[0] = 0;
		}
		else if(parent.position[0] > this.bx2){
			parent.position[0] = this.bx2;
			parent.velocity[0] = 0;
		}
		if(parent.position[1] < this.by1){
			parent.position[1] = this.by1;
			parent.velocity[1] = 0;
		}
		else if(parent.position[1] > this.by2){
			parent.position[1] = this.by2;
			parent.velocity[1] = 0;
		}
	};

	var WorldWrapComponent = GE.Comp.WorldWrapComponent = function WorldWrapComponent (bounds) {
		this.ax = bounds[0];
		this.ay = bounds[1];
		this.bx = bounds[2];
		this.by = bounds[3];
	};

	WorldWrapComponent.prototype = new GE.GameComponent();

	WorldWrapComponent.prototype.update = function(parent, delta) {
		if(parent.position[0] < this.ax){
			parent.position[0] = this.bx;
		}
		else if(parent.position[0] > this.bx){
			parent.position[0] = this.ax;
		}
		if(parent.position[1] < this.ay){
			parent.position[1] = this.by;
		}
		else if(parent.position[1] > this.by){
			parent.position[1] = this.ay;
		}
	};

	return GE;
}(GE || {}));
