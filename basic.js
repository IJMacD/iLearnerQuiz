var GE = (function(GE){
	"GravityComponent:nomunge, PointGravityComponent: nomunge";

	GE.Comp = GE.Comp || {};

	var GameComponent = GE.GameComponent,
		GEC = GE.Comp;

	GameComponent.create(function GravityComponent(){},{
		update: function(parent, delta) {
			parent.velocity[1] += 0.001*delta;
		}
	});

	GameComponent.create(function PointGravityComponent (target) {
		this.target = target;
		this.vector = vec3.create();
	}, {
		update: function(parent, delta) {
			vec3.subtract(this.vector, this.target.position, parent.position);
			var scale = this.target.mass*delta/vec3.squaredLength(this.vector);
			vec3.normalize(this.vector, this.vector);
			vec3.scaleAndAdd(parent.velocity, parent.velocity, this.vector, scale);
		}
	});

	function MoveComponent () {};
	GEC.MoveComponent = MoveComponent;
	MoveComponent.prototype = new GameComponent();
	MoveComponent.prototype.update = function(parent, delta) {
		vec3.scaleAndAdd(parent.position, parent.position, parent.velocity, delta);
	};


	function RandomMotionComponent(){}
	GEC.RandomMotionComponent = RandomMotionComponent;
	RandomMotionComponent.prototype = new GameComponent();
	RandomMotionComponent.prototype.update = function(parent, delta) {
		if(Math.random()<0.001)
			vec3.random(parent.velocity, Math.random());
	};


	function RotationComponent (dth) {
		this.rotationSpeed = dth;
	};
	GEC.RotationComponent = RotationComponent;
	RotationComponent.prototype = new GameComponent();
	RotationComponent.prototype.update = function(parent, delta) {
		parent.setRotation(parent.rotation + this.rotationSpeed * delta);
	};

	function AnimatedSpriteComponent(images, speed){
		this.images = images;
		this.delay = 1000 / speed;
		this.lastChange = 0;
		this.imageIndex = 0;
	}
	GEC.AnimatedSpriteComponent = AnimatedSpriteComponent;
	AnimatedSpriteComponent.prototype = new GameComponent();
	AnimatedSpriteComponent.prototype.update = function(parent, delta) {
		if(this.lastChange > this.delay){
			this.imageIndex = (this.imageIndex + 1) % this.images.length;
			parent.sprite = this.images[this.imageIndex];
			this.lastChange = 0;
		}
		else {
			this.lastChange += delta;
		}
	};

	GameComponent.create(function FollowComponent(object) {
		this.target = object;
	}, {
		update: function(parent, delta) {
			vec3.copy(parent.position, this.target.position);
		}
	});
	GameComponent.create(function FollowAtDistanceComponent(object, distance) {
		this.target = object;
		this.distance = distance;
	}, {
		update: function(parent, delta) {
			vec3.add(parent.position, this.target.position, this.distance);
		}
	});

	GameComponent.create(function CounterRotationComponent(object) {
		this.target = object;
	}, {
		update: function(parent, delta) {
			parent.rotation = -this.target.rotation;
		}
	});

	GameComponent.create(function PhysicsComponent() {
		this.bounciness = 0.5;
		this.frictionCoefficient = 0.5;
	}, {
		update: function(parent, delta) {

			// Background Collisions
			if(parent.collisionNormal && vec2.squaredLength(parent.collisionNormal) > 0){
				// http://stackoverflow.com/questions/573084/how-to-calculate-bounce-angle

				var n = parent.collisionNormal,
					v = parent.velocity,
					u = vec2.create(),
					w = vec2.create(),
					f = this.frictionCoefficient,
					e = this.bounciness;

				// u: Movement perpendicular to wall
				vec2.scale(u, n, vec2.dot(n, v));
				// w: Movement parallel to wall
				vec2.subtract(w, v, u);

				// Apply friction and bounciness
				vec2.scale(w, w, f);
				vec2.scale(u, u, e);

				// Collision causes an impulse
				// ---Impulse is sum of w and (-u)--
				// vec2.add(parent.impulse, parent.impulse, w);
				// vec2.subtract(parent.impulse, parent.impulse, u);

				// New velocity is sum of w and (-u)
				vec2.subtract(parent.velocity, w, u);
			}

			// Resolve Impulses
			vec2.add(parent.velocity, parent.velocity, parent.impulse);
			vec2.set(parent.impulse, 0, 0);

			if(Math.abs(parent.velocity[0]) < 0.01){
				parent.velocity[0] = 0;
			}

			if(Math.abs(parent.velocity[1]) < 0.01){
				parent.velocity[1] = 0;
			}
		}
	});

	return GE;
}(GE || {}));
