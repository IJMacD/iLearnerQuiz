var GE = (function(GE){

	GE.Comp = GE.Comp || {};

	var GameObject = GE.GameObject,
		GameComponent = GE.GameComponent,
		GEC = GE.Comp;

	function BackgroundSystem(coords){
		this.coords = coords;
	}
	GE.BackgroundSystem = BackgroundSystem;
	BackgroundSystem.prototype = new GameObject();
	BackgroundSystem.prototype.update = function(parent, delta){
		GameObject.prototype.update.call(this);
	}

	function BackgroundCollisionComponent(backgroundSystem){
		this.backgroundSystem = backgroundSystem;
	}
	GEC.BackgroundCollisionComponent = BackgroundCollisionComponent;
	BackgroundCollisionComponent.prototype = new GameComponent();
	BackgroundCollisionComponent.prototype.update = function(parent, delta)
	{
		var c = this.backgroundSystem.coords,
			i = 0,
			l = c.length,
			t,u,
			f = 0.9,
			e = 0.5,
			p = vec2.create(),
			r = vec2.create(),
			q = vec2.create(),
			s = vec2.create(),
			q_p = vec2.create(),
			q_p_r = vec3.create(),
			q_p_s = vec3.create(),
			r_s = vec3.create(),
			n = vec2.create(),
			w = vec2.create(),
			v = vec2.create();
		if(this.lastX){
			for(;i<l-3;i+=2)
			{
				// http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
				vec2.set(p, c[i],   c[i+1]);
				vec2.set(r, c[i+2], c[i+3]);
				vec2.subtract(r, r, p);
				vec2.set(q, this.lastX, this.lastY);
				vec2.subtract(s, parent.position, q);

				vec2.subtract(q_p, q, p);
				vec2.cross(q_p_s, q_p, s);
				vec2.cross(q_p_r, q_p, r);
				vec2.cross(r_s, r, s);
				t = q_p_s[2] / r_s[2];
				u = q_p_r[2] / r_s[2];
				if(t >= 0 && t <= 1 && u >= 0 && u <= 1)
				{
					parent.position[0] = this.lastX;
					parent.position[1] = this.lastY;
					// http://stackoverflow.com/questions/573084/how-to-calculate-bounce-angle
					vec2.normalize(n, r);
					// rotate 90 deg
					vec2.set(n, -n[1], n[0]);
					vec2.copy(v, parent.velocity);
					u = vec2.create();
					vec2.scale(u, n, vec2.dot(n, v));
					// w = vec2.clone(v);
					vec2.subtract(w, v, u);
					vec2.scale(w, w, f);
					vec2.scale(u, u, e);
					// vec2.copy(parent.velocity, w);
					vec2.subtract(parent.velocity, w, u);
					break;
				}
			}
		}
		this.lastX = parent.position[0];
		this.lastY = parent.position[1];
	}

	return GE;
}(GE || {}));
