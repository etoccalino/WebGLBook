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
  light.position.set(0, -1, 1).normalize();
  this.scene.add(light);

  this.camera.position.set(0, 0, 6);

  // Create the floor for the model
  var floor = new Floor();
  floor.init();
  this.addObject(floor);

  // Create the table in the center
  var table = new Table();
  table.init();
  this.addObject(table);

  this.model = null;
  // Once the robot model is initialized, keep it.
  this.robot = null;
  // Once the block model is initialized, keep it.
  this.block = null;

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

	  // Clamp to some outer boundary values
	  if (this.root.rotation.y < MoveApp.MIN_ROTATION_Y)
	    this.root.rotation.y = MoveApp.MIN_ROTATION_Y;

	  if (this.root.rotation.y > MoveApp.MAX_ROTATION_Y)
	    this.root.rotation.y = MoveApp.MAX_ROTATION_Y;
	}
	this.lastX = x;

	// return;

    // Move the whole scene around the X axis.
	var dy = y - this.lastY;
	if (Math.abs(dy) > MoveApp.MOUSE_MOVE_TOLERANCE)
	{
	  this.root.rotation.x += (dy * 0.01);

	  // Clamp to some outer boundary values
	  if (this.root.rotation.x < MoveApp.MIN_ROTATION_X)
	    this.root.rotation.x = MoveApp.MIN_ROTATION_X;

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

MoveApp.MOUSE_MOVE_TOLERANCE = 2;
MoveApp.MAX_ROTATION_X = Math.PI / 2;
MoveApp.MAX_ROTATION_Y = Math.PI / 2;
MoveApp.MIN_ROTATION_X = -Math.PI / 2;
MoveApp.MIN_ROTATION_Y = -Math.PI / 2;
MoveApp.MIN_CAMERA_Z = 4;
MoveApp.MAX_CAMERA_Z = 12;


MoveApp.prototype.changeToNone = function () {
  if (this.model != null)
  {
    this.removeObject(this.model);
  }
}

MoveApp.prototype.changeToRobot = function () {
  if (this.robot == null)
  {
    // Create the robot and add it to our sim
    var robot = new Robot();
    robot.init();

    this.robot = robot;
  }

  if (this.model != null)
  {
    this.removeObject(this.model);
  }
  this.addObject(this.robot);

  // Add the dragger now, couldn't do that until we have a scene
  robot.createDragger();

  this.model = this.robot;
}

MoveApp.prototype.changeToBlock = function () {
  if (this.block == null)
  {
    // Create the model and add it to our sim
    var block = new BlueBlock();

    block.init();

    this.block = block;
  }

  if (this.model != null)
  {
    this.removeObject(this.model);
  }

  this.addObject(this.block);

  // Add the dragger now, couldn't do that until we have a scene
  block.createDragger();

  this.model = this.block;
}


//
// A base Sim.Object which support dragging
//

Draggable = function ()
{
  return Sim.Object.call(this);
}
Draggable.prototype = new Sim.Object();

Draggable.prototype.createDragger = function()
{
  this.dragger = new Sim.PlaneDragger();
  this.dragger.init(this);
  this.dragger.subscribe("drag", this, this.handleDrag)
}

Draggable.prototype.handleMouseDown = function(x, y, position, normal)
{
  this.dragger.beginDrag(x, y);
}

Draggable.prototype.handleMouseUp = function(x, y, position, normal)
{
  this.dragger.endDrag(x, y);
}

Draggable.prototype.handleMouseMove = function(x, y)
{
  this.dragger.drag(x, y);
}

Draggable.prototype.handleDrag = function(dragPoint)
{
  this.object3D.position.copy(dragPoint);
}


//
// A draggable robot
//

Robot = function()
{
  Draggable.call(this);
}

Robot.prototype = new Draggable();

Robot.prototype.init = function(param)
{
  var group = new THREE.Object3D;

  // Level to the floor

  this.setObject3D(group);

  var that = this;
  var url = '../../models/robot_cartoon_02/robot_cartoon_02.dae';
  var loader = new Sim.ColladaLoader;
  loader.load(url, function (data) {
	that.handleLoaded(data)
  });
}

Robot.prototype.handleLoaded = function(data)
{
  this.model = null;

  if (data)
  {
	var model = data.scene;

	// This model in cm, we're working in meters, scale down
	model.scale.set(.00337, .00337, .00337);

    this.object3D.add(model);

    // Move to a side, and stand up
    model.position.x = 2;
    model.rotation.x = Math.PI / 2;

    this.model = model;
  }
}


//
// A draggable block
//

BlueBlock = function ()
{
  Draggable.call(this);
}

BlueBlock.prototype = new Draggable();

BlueBlock.prototype.init = function(param)
{
  var group = new THREE.Object3D;

  // Create our model
  var geometry = new THREE.CubeGeometry(1, 1, 2, 32, 32, 32);
  var material = new THREE.MeshPhongMaterial(
    { color: 0x0000ff , wireframe: false});
  var mesh = new THREE.Mesh( geometry, material );
  group.add(mesh);

  // Tell the framework about our object
  this.setObject3D(group);
  this.mesh = mesh;

  // Move to a side of the table
  mesh.position.x = 2;
  // Level with the floor
  mesh.position.z = 1;
}

BlueBlock.prototype.handleMouseOver = function(x, y)
{
  this.mesh.material.ambient.setRGB(.2,.2,.2);
}

BlueBlock.prototype.handleMouseOut = function(x, y)
{
  this.mesh.material.ambient.setRGB(0, 0, 0);
}


//
// A fixed grid floor
//

Floor = function ()
{
  return Sim.Object.call(this);
}
Floor.prototype = new Sim.Object();

Floor.prototype.init = function (params)
{
  var group = new THREE.Object3D
    , geometry = new THREE.PlaneGeometry(10, 10, 10, 10)
    , material = new THREE.MeshBasicMaterial({
        color: 0x010101,
        opacity: .2,
        transparent: true,
        wireframe: true,
        wireframeLinewidth: 2
    })
    , floor = new THREE.Mesh(geometry, material);
  group.add(floor);
  this.setObject3D(group);
}


//
// A fixed table at the center on the floor
//

Table = function ()
{
  return Sim.Object.call(this);
}
Table.prototype = new Sim.Object();

Table.prototype.init = function (params)
{
  var group = new THREE.Object3D
    , geometry = new THREE.CubeGeometry(2, 2, 1, 32, 32, 32)
    , material = new THREE.MeshPhongMaterial({ color: 0x101510 , wireframe: false})
    , table = new THREE.Mesh(geometry, material);
  group.add(table);

  group.position.z = .5;

  this.setObject3D(group);
}
