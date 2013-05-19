// Constructor
MoveApp = function()
{
  Sim.App.call(this);
}

// Subclass Sim.App
MoveApp.prototype = new Sim.App();

// Our custom initializer
MoveApp.prototype.init = function(param)
{
  // Call superclass init code to set up scene, renderer, default camera
  Sim.App.prototype.init.call(this, param);

  // Create a directional light to show off the model
  var light = new THREE.DirectionalLight( 0xffffff, 1);
  light.position.set(0, 0, 1).normalize();
  this.scene.add(light);

  this.camera.position.set(0, 0, 6);

  // Create the model and add it to our sim
  var model = new Model();
  model.init();
  this.addObject(model);

  // Add the dragger now, couldn't do that until we have a scene
  model.createDragger();

  this.model = model;

  this.lastX = 0;
  this.lastY = 0;
  this.mouseDown = false;
}


MoveApp.prototype.handleMouseDown = function(x, y)
{
  this.lastX = x;
  this.lastY = y;
  this.mouseDown = true;
}

MoveApp.prototype.handleMouseUp = function(x, y)
{
  this.lastX = x;
  this.lastY = y;
  this.mouseDown = false;
}

MoveApp.prototype.handleMouseMove = function(x, y)
{
  if (this.mouseDown)
  {
    // Move the whole scene around the Y axis.
	var dx = x - this.lastX;
	if (Math.abs(dx) > MoveApp.MOUSE_MOVE_TOLERANCE)
	{
	  this.root.rotation.y += (dx * 0.01);
	}
	this.lastX = x;

	return;

    // Move the whole scene around the X axis.
	var dy = y - this.lastY;
	if (Math.abs(dy) > MoveApp.MOUSE_MOVE_TOLERANCE)
	{
	  this.root.rotation.x += (dy * 0.01);

	  // Clamp to some outer boundary values
	  if (this.root.rotation.x < 0)
		this.root.rotation.x = 0;

	  if (this.root.rotation.x > MoveApp.MAX_ROTATION_X)
		this.root.rotation.x = MoveApp.MAX_ROTATION_X;

	}
	this.lastY = y;
  }
}


MoveApp.prototype.handleMouseScroll = function(delta)
{
  var dx = delta;

  this.camera.position.z -= dx;

  // Clamp to some boundary values
  if (this.camera.position.z < MoveApp.MIN_CAMERA_Z)
	this.camera.position.z = MoveApp.MIN_CAMERA_Z;
  if (this.camera.position.z > MoveApp.MAX_CAMERA_Z)
	this.camera.position.z = MoveApp.MAX_CAMERA_Z;
}

MoveApp.MOUSE_MOVE_TOLERANCE = 4;
MoveApp.MAX_ROTATION_X = Math.PI / 2;
MoveApp.MIN_CAMERA_Z = 4;
MoveApp.MAX_CAMERA_Z = 12;


// Custom model class
Model = function()
{
  Sim.Object.call(this);
}

Model.prototype = new Sim.Object();

Model.prototype.init = function(param)
{
  var group = new THREE.Object3D;

  // Create our model
  var geometry = new THREE.SphereGeometry(1, 32, 32);
  var material = new THREE.MeshPhongMaterial(
    { color: 0x0000ff , wireframe: false});
  var mesh = new THREE.Mesh( geometry, material );
  group.add(mesh);

  // Tell the framework about our object
  this.setObject3D(group);
  this.mesh = mesh;
}

Model.prototype.createDragger = function()
{
  this.dragger = new Sim.PlaneDragger();
  this.dragger.init(this);
  this.dragger.subscribe("drag", this, this.handleDrag)
}

Model.prototype.handleMouseOver = function(x, y)
{
  this.mesh.material.ambient.setRGB(.2,.2,.2);
}

Model.prototype.handleMouseOut = function(x, y)
{
  this.mesh.material.ambient.setRGB(0, 0, 0);
}

Model.prototype.handleMouseDown = function(x, y, position, normal)
{
  this.dragger.beginDrag(x, y);
}

Model.prototype.handleMouseUp = function(x, y, position, normal)
{
  this.dragger.endDrag(x, y);
}

Model.prototype.handleMouseMove = function(x, y)
{
  this.dragger.drag(x, y);
}

Model.prototype.handleDrag = function(dragPoint)
{
  this.object3D.position.copy(dragPoint);
}
