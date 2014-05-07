var GE = (function(GE){

	GE.Comp = GE.Comp || {};

	var GameComponent = GE.GameComponent,
		GEC = GE.Comp;

	function InputSystem(){
		this.lastKey = null;

		var that = this;
		$(window).on("keydown", function(e){
			that.lastKey = e.which;
			e.preventDefault();
		});
	}
	InputSystem.prototype = new GE.GameObject();
	GE.InputSystem = InputSystem;
	InputSystem.prototype.update = function(){
		this.lastKey = null;
	}

	return GE;
}(GE || {}));
