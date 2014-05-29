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
		this.bounciness = 0.4;
		this.frictionCoefficient = 0.5;
		this.mass = 1;
	}, {
		update: function(parent, delta) {

			// Background Collisions
			if(parent.collisionNormal && vec2.squaredLength(parent.collisionNormal) > 0){

				var impulse = parent.impulse,
					outImpulse = vec2.clone(impulse),
					surfaceNormal = parent.collisionNormal,
					relativeVelocity = vec2.clone(parent.velocity),
					relativeDotNormal,
					j,
					mass = this.mass;

				vec2.add(relativeVelocity, relativeVelocity, impulse);

				relativeDotNormal = vec2.dot(relativeVelocity, surfaceNormal);

				if(relativeDotNormal < 0){
					j = (-(1 + this.bounciness) * relativeDotNormal) / vec2.squaredLength(surfaceNormal) * mass;

					vec2.copy(outImpulse, surfaceNormal);
					vec2.scale(outImpulse, outImpulse, j);
					vec2.scale(outImpulse, outImpulse, 1 / mass);
					vec2.add(outImpulse, outImpulse, impulse);
				}

				vec2.copy(parent.impulse, outImpulse);
			}

			// Resolve Impulses
			var newVelocity = vec2.clone(parent.velocity);
			vec2.add(newVelocity, newVelocity, parent.impulse);

			if(parent.touchingGround){
				var frictionCoeffecient = 0.025;
				frictionCoeffecient *= delta;

				// Friction = cofN, where cof = friction coefficient and N = force
				// perpendicular to the ground.
				var maxFriction = Math.abs(0.001) * this.mass * frictionCoeffecient;

				if (maxFriction > Math.abs(newVelocity[0])) {
					newVelocity[0] = 0;
				} else {
					newVelocity[0] = (newVelocity[0] - (maxFriction * sign(newVelocity[0])));
				}
			}

			if(Math.abs(newVelocity[0]) < 0.01){
				newVelocity[0] = 0;
			}

			if(Math.abs(newVelocity[1]) < 0.01){
				newVelocity[1] = 0;
			}
			vec2.copy(parent.velocity, newVelocity);
			vec2.set(parent.impulse, 0, 0);
		}
	});

	function sign(x){
		return x<0?-1:1;
	}

	return GE;
}(GE || {}));
