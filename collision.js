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

		// TODO: clear temp surfaces
	}
	BackgroundSystem.prototype.testCollision = function(x1, y1, x2, y2){
		var c = this.coords,
			i = 0,
			l = c.length,
			t,u,
			p = vec2.create(),
			r = vec2.create(),
			q = vec2.create(),
			s = vec2.create(),
			q_p = vec2.create(),
			q_p_r = vec3.create(),
			q_p_s = vec3.create(),
			r_s = vec3.create(),
			intersection = vec2.create(),
			normal = vec2.create();

		for(;i<l-3;i+=2)
		{
			// http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
			vec2.set(p, c[i],   c[i+1]);
			vec2.set(r, c[i+2], c[i+3]);
			vec2.subtract(r, r, p);
			vec2.set(q, x1, y1);
			vec2.set(s, x2 - x1, y2 - y1);

			vec2.subtract(q_p, q, p);
			vec2.cross(q_p_s, q_p, s);
			vec2.cross(q_p_r, q_p, r);
			vec2.cross(r_s, r, s);
			t = q_p_s[2] / r_s[2];
			u = q_p_r[2] / r_s[2];
			if(t >= 0 && t <= 1 && u >= 0 && u <= 1)
			{
				vec2.set(intersection, p[0] + t*r[0], p[1] + t*r[1]);
				vec2.normalize(normal, r);
				// rotate 90 degrees
				vec2.set(normal, -normal[1], normal[0]);
				return {
					position: intersection,
					normal: normal
				}
			}
		}
	}

	/**
	 * Component to detect collisions with background
	 *
	 * @class BackgroundCollisionComponent
	 * @param backgroundSystem {BackgroundSystem}
	 * @param bounds {object} Object describing GamesObject's bounding box relative to its origin
	 *        has four properties: left, right, top, bottom.
	 *        e.g. { left: -25, right: 25, top: -50, bottom: 50 }
	 */
	function BackgroundCollisionComponent(backgroundSystem, bounds){
		this.backgroundSystem = backgroundSystem;
		this.bounds = bounds;
		this.lastPosition = vec2.create();
	}
	GEC.BackgroundCollisionComponent = BackgroundCollisionComponent;
	BackgroundCollisionComponent.prototype = new GameComponent();
	BackgroundCollisionComponent.prototype.update = function(parent, delta)
	{
		var backgroundSystem = this.backgroundSystem,
			movingHorizontally = Math.abs(parent.velocity[0]) > Math.abs(parent.velocity[1]),
			lastPosition = this.lastPosition,
			currentPosition = parent.position,
			delta = vec2.create(),
			bounds = this.bounds,
			left = currentPosition[0] + bounds.left,
			right = currentPosition[0] + bounds.right,
			top = currentPosition[1] + bounds.top,
			bottom = currentPosition[1] + bounds.bottom,
			x1, y1, x2, y2,
			hit,
			horizontalHit,
			verticalHit,
			centreX = (left + right) / 2,
			centreY = (top + bottom) / 2;

		parent.collisionNormal = null;

		if(vec2.squaredLength(lastPosition) > 0){
			vec2.subtract(delta, currentPosition, lastPosition);

			// Test ray from previous centre to current edge of box taking into account
			// direction of movement.
			// Test primary movement direction first, then secondary
			if(movingHorizontally)
			{

				// test horizontal
				horizontalHit = backgroundSystem.testCollision(
						lastPosition[0],
						lastPosition[1],
						delta[0] > 0 ? right : left,
						lastPosition[1]
					);

				if(horizontalHit){
					parent.position[0] = delta[0] > 0 ?
						horizontalHit.position[0] - bounds.right :
						horizontalHit.position[0] - bounds.left;
				}

				// test vertical
				verticalHit = backgroundSystem.testCollision(
						lastPosition[0],
						lastPosition[1],
						lastPosition[0],
						delta[1] > 0 ? bottom : top
					);

				if(verticalHit){
					parent.position[1] = delta[1] > 0 ?
						verticalHit.position[1] - bounds.bottom :
						verticalHit.position[1] - bounds.top;
				}
			}
			else
			{

				// test vertical
				verticalHit = backgroundSystem.testCollision(
						lastPosition[0],
						lastPosition[1],
						lastPosition[0],
						delta[1] > 0 ? bottom : top
					);

				if(verticalHit){
					parent.position[1] = delta[1] > 0 ?
						verticalHit.position[1] - bounds.bottom :
						verticalHit.position[1] - bounds.top;
				}

				// test horizontal
				horizontalHit = backgroundSystem.testCollision(
						lastPosition[0],
						lastPosition[1],
						delta[0] > 0 ? right : left,
						lastPosition[1]
					);

				if(horizontalHit){
					parent.position[0] = delta[0] > 0 ?
						horizontalHit.position[0] - bounds.right :
						horizontalHit.position[0] - bounds.left;
				}
			}

			// Special tests for more accurate alignment on slopes
			// Test ray straight through centre of box vertically
			hit = backgroundSystem.testCollision(centreX, top, centreX, bottom);

			if(hit){
				parent.position[1] = delta[1] > 0 ?
					hit.position[1] - bounds.bottom :
					hit.position[1] - bounds.top;
			}

			// Test ray straight through centre of box horizonatally
			hit = backgroundSystem.testCollision(left, centreY, right, centreY);

			if(hit){
				parent.position[0] = delta[0] > 0 ?
					hit.position[0] - bounds.right :
					hit.position[0] - bounds.left;
			}


			// Now set the collision normals
			if(horizontalHit && verticalHit){
				parent.collisionNormal = vec2.create();
				vec2.add(parent.collisionNormal, horizontalHit, verticalHit);
				vec2.normalize(parent.collisionNormal, parent.collisionNormal);
			}
			else if(horizontalHit){
				parent.collisionNormal = vec2.clone(horizontalHit);
			}
			else if(verticalHit){
				parent.collisionNormal = vec2.clone(verticalHit);
			}
		}

		// save last position for next frame
		vec2.copy(lastPosition, parent.position);
	}

	return GE;
}(GE || {}));
