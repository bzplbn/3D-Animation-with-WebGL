// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// very little in it - you will fill it in with all your shape drawing calls and any extra key / mouse controls.  

// Now go down to display() to see where the sample shapes are drawn, and to see where to fill in your own code.

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), 	looking = false, prev_time = 0, animate = false, animation_time = 0;
		var gouraud = false, color_normals = false, solid = false;

		
// *******************************************************	
// When the web page's window loads it creates an Animation object, which registers itself as a displayable object to our other class GL_Context -- which OpenGL is told to call upon every time a
// draw / keyboard / mouse event happens.
var direction;
var rot;
function make_body()		// Randomly generate a rigid body, namely its matrix and rate of change
{
	var result = {};
	result.model_transform = mat4();							// Start as identity matrix
	
	for( var j = 0; j < 3; j++ )
		result.model_transform[j][3] += 5 * Math.random();		// Random initial translation (0,1)
	

	//result.scale = vec3( 2 * Math.random(), 2 * Math.random(), 2 * Math.random() );	// Random initial scale
	result.scale = vec3( 1, 1, 1 );
	result.linear_velocity = vec3();
	for( var j = 0; j < 3; j++ )
	result.linear_velocity[j] =  Math.random() - .5;		// Random velocity direction, which we then normalize
	//result.linear_velocity[j] =  .5;
	//result.linear_velocity = mult_vec(rotate( rot, 0, 1, 0), result.linear_velocity);
	
	result.linear_velocity = scale_vec( .03/length( result.linear_velocity ), result.linear_velocity );			
	result.angular_velocity = 0 * Math.random();		// Random angular speed & axis
 
    var normal = vec3();
    var cos_angle;
    var angle;
    normal = cross(vec3(1, 0, 0), result.linear_velocity);
    //console.log(normal);
    cos_angle = dot(vec3(1, 0, 0) , result.linear_velocity)/( length(vec3(1, 0, 0)) * length (result.linear_velocity));
    angle = Math.acos(cos_angle)*180/Math.PI;
    //console.log(cos_angle);
	result.model_transform = mult( rotate( angle, normal[0], normal[1], normal[2]), result.model_transform );	// Rotation

			
	result.spin_axis = vec3();
	// for( var j = 0; j < 3; j++ )
	// 	result.spin_axis[j] = Math.random();
		//result.spin_axis[j] = 1;
				
	return result;
}		

window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self) 
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );
		
		gl.clearColor( 0, 0, 0, 1 );			// Background color

		self.m_cube = new cube(mat4());
		self.m_obj = new shape_from_file( "teapot.obj" )
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 6 );	
		self.m_fan = new triangle_fan_full( 20, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_windmill = new windmill(mat4());
		self.m_cylinder = new cylindrical_strip(20, mat4());
		self.m_fwing = new fwing(mat4()); 
		self.m_circle = new circle( 20, mat4());
		self.m_f_umbrella = new f_umbrella(mat4());
	    self.m_s_umbrella = new s_umbrella(mat4());
		
		//self.camera_transform = translate(0, 0,-50);
		self.camera_transform = translate(0, 0, -60);
		self.projection_transform = perspective(45, canvas.width/canvas.height, .1, 100);		// The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		
		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);
		
		self.num_bodies = 400;
		self.bodies = [];		
		for( var i = 0; i < self.num_bodies; i++ )			// Generate moving bodies
			self.bodies[i] = make_body();
		
		self.bodies[0].scale = vec3(1,1,1);				// Make the first sphere special (for collisions) - and large
		self.bodies[0].model_transform = mult ( translate( 5, 0, 0 ), self.bodies[0].model_transform );		// Move it off to the side, independent of its rotation		
		self.inverse_body0 = inverse( mult( self.bodies[0].model_transform, scale( self.bodies[0].scale  ) ) );			// Store its (permanent) matrix's inverse for later
		
        self.num_bodies1 = 100;
		self.bodies1 = [];		
		for( var i = 0; i < self.num_bodies1; i++ )			// Generate moving bodies
		self.bodies1[i] = make_body();
		
		self.bodies1[0].scale = vec3(1,1,1);				// Make the first sphere special (for collisions) - and large
		self.bodies1[0].model_transform = mult ( translate( 5, 0, 0 ), self.bodies1[0].model_transform );		// Move it off to the side, independent of its rotation		
		self.inverse_body01 = inverse( mult( self.bodies1[0].model_transform, scale( self.bodies1[0].scale  ) ) );			// Store its (permanent) matrix's inverse for later
		

		self.num_bodies2 = 100;
		self.bodies2 = [];		
		for( var i = 0; i < self.num_bodies2; i++ )			// Generate moving bodies
		self.bodies2[i] = make_body();
		
		self.bodies2[0].scale = vec3(1,1,1);				// Make the first sphere special (for collisions) - and large
		self.bodies2[0].model_transform = mult ( translate( 5, 0, 0 ), self.bodies2[0].model_transform );		// Move it off to the side, independent of its rotation		
		self.inverse_body02 = inverse( mult( self.bodies2[0].model_transform, scale( self.bodies2[0].scale  ) ) );		

		self.num_bodies3 = 100;
		self.bodies3 = [];		
		for( var i = 0; i < self.num_bodies3; i++ )			// Generate moving bodies
		self.bodies3[i] = make_body();
		
		self.bodies3[0].scale = vec3(1,1,1);				// Make the first sphere special (for collisions) - and large
		self.bodies3[0].model_transform = mult ( translate( 5, 0, 0 ), self.bodies3[0].model_transform );		// Move it off to the side, independent of its rotation		
		self.inverse_body03 = inverse( mult( self.bodies3[0].model_transform, scale( self.bodies3[0].scale  ) ) );		

		self.num_bodies4 = 100;
		self.bodies4 = [];		
		for( var i = 0; i < self.num_bodies4; i++ )			// Generate moving bodies
		self.bodies4[i] = make_body();
		
		self.bodies4[0].scale = vec3(1,1,1);				// Make the first sphere special (for collisions) - and large
		self.bodies4[0].model_transform = mult ( translate( 5, 0, 0 ), self.bodies4[0].model_transform );		// Move it off to the side, independent of its rotation		
		self.inverse_body04 = inverse( mult( self.bodies4[0].model_transform, scale( self.bodies4[0].scale  ) ) );		

		self.num_bodies5 = 100;
		self.bodies5 = [];		
		for( var i = 0; i < self.num_bodies5; i++ )			// Generate moving bodies
		self.bodies5[i] = make_body();
		
		self.bodies5[0].scale = vec3(1,1,1);				// Make the first sphere special (for collisions) - and large
		self.bodies5[0].model_transform = mult ( translate( 5, 0, 0 ), self.bodies5[0].model_transform );		// Move it off to the side, independent of its rotation		
		self.inverse_body05 = inverse( mult( self.bodies5[0].model_transform, scale( self.bodies5[0].scale  ) ) );		

		self.animation_time = 0
		self.context.render();	
	} ) ( this );	
	
	canvas.addEventListener('mousemove', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});
}

// *******************************************************	
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	// shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	// shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	// shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	// shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	// shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	// shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	// shortcut.add( "f",     function() { looking = !looking; } );
	// shortcut.add( ",",     ( function(self) { return function() { self.camera_transform = mult( rotate( 3, 0, 0,  1 ), self.camera_transform ); }; } ) (this) ) ;
	// shortcut.add( ".",     ( function(self) { return function() { self.camera_transform = mult( rotate( 3, 0, 0, -1 ), self.camera_transform ); }; } ) (this) ) ;

	// shortcut.add( "r",     ( function(self) { return function() { self.camera_transform = mat4(); }; } ) (this) );
	// shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);	
	// 																	gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	// shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	// shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	shortcut.add( "ALT+a", function() { animate = !animate; } );
	
	// shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
	// shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );	
}



function update_camera( self, animation_delta_time )
	{
		var leeway = 70, border = 50;
		var degrees_per_frame = .0005 * animation_delta_time;
		var meters_per_frame  = .03 * animation_delta_time;
																					// Determine camera rotation movement first
		var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
		var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
		var outside_border = false;
		
		for( var i = 0; i < 2; i++ )
			if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

		for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.camera_transform = mult( rotate( velocity, i, 1-i, 0 ), self.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.camera_transform = mult( translate( scale_vec( meters_per_frame, thrust ) ), self.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

// *******************************************************	
// display(): called once per frame, whenever OpenGL decides it's time to redraw.



Animation.prototype.DrawCylinder = function(num, model_transform, camera_transform, projection_transform){
	    self.m_cylinder = new cylindrical_strip( num, scale(1,1,2) );
		self.m_circle = new circle( num, mat4());
		model_transform = mult(model_transform, rotate(90,1,0,0));
	    self.m_cylinder.draw( model_transform, this.camera_transform, this.projection_transform );				// Tube
		self.m_circle.draw (mult(model_transform,translate(0,0,-1)), this.camera_transform, this.projection_transform);
		self.m_circle.draw (mult(model_transform,translate(0,0,1)), this.camera_transform, this.projection_transform);
}
Animation.prototype.DrawFunbrella = function( model_transform, camera_transform, projection_transform){
	    self.m_f_umbrella = new f_umbrella(mat4());
	    self.m_cube = new cube(mat4());
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 1, 0.5, 0.5, 1 ) );
        self.m_f_umbrella.draw(model_transform, this.camera_transform, this.projection_transform );
		model_transform = mult(model_transform, translate(0,-1,0));
		gl.uniform4fv( g_addrs.color_loc, 			vec4( .2,.2,.2,1 ) );
		model_transform = mult(model_transform, scale(0.2, 4.2, 0.2));
		self.m_cube.draw(model_transform, this.camera_transform, this.projection_transform );
	    
}
Animation.prototype.DrawSunbrella = function( model_transform, camera_transform, projection_transform){
	    self.m_s_umbrella = new s_umbrella(mat4());
	    self.m_cube = new cube(mat4());
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 1, 0.5, 0.5, 1 ) );
        self.m_s_umbrella.draw(model_transform, this.camera_transform, this.projection_transform );
		model_transform = mult(model_transform, translate(0,-1,0));
		gl.uniform4fv( g_addrs.color_loc, 			vec4( .2,.2,.2,1 ) );
		model_transform = mult(model_transform, scale(0.2, 4.2, 0.2));
		self.m_cube.draw(model_transform, this.camera_transform, this.projection_transform );
	    
}

Animation.prototype.DrawCloud = function( model_transform, camera_transform, projection_transform){
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.4, 0.4, 0.4, 1 ) );
	    self.m_sphere = new sphere( mat4(), 6 );
	    var tmp = model_transform;
	    model_transform = mult(model_transform, translate(0,0.5,0));
		model_transform = mult(model_transform, scale(3, 2, 2));
		self.m_sphere.draw(model_transform, this.camera_transform, this.projection_transform );
	
		model_transform = tmp;
		model_transform = mult(model_transform, translate(2.4,0,0));
		model_transform = mult(model_transform, scale(3, 1.6, 1.6));
		self.m_sphere.draw(model_transform, this.camera_transform, this.projection_transform );
        model_transform = tmp;

        model_transform = mult(model_transform, translate(-2.4,0,0));
		model_transform = mult(model_transform, scale(3, 1.6, 1.6));
		self.m_sphere.draw(model_transform, this.camera_transform, this.projection_transform );
		gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9, 0.9, 0.9, 1 ) );

		
}

Animation.prototype.DrawRaindrop = function( model_transform, camera_transform, projection_transform){
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0, 0, 0.8, 0.7 ) );
	    self.m_sphere = new sphere( mat4(), 6 );
	    self.m_fan = new triangle_fan_full( 20, mat4() );
	    var tmp = model_transform;
	    //model_transform = mult(model_transform, rotate(-270, 1, 0, 0));
	    self.m_sphere.draw(model_transform, this.camera_transform, this.projection_transform);
	    model_transform = tmp;
	    model_transform = mult(model_transform, translate(0, 0, -2, 0));
	     self.m_fan.draw(model_transform, this.camera_transform, this.projection_transform);
	     gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9, 0.9, 0.9, 1) );
}


Animation.prototype.butterfly = function(time, model_transform, camera_transform, projection_transform, texture_name){


	    model_transform = mult(model_transform, rotate(-90, 0, 0, 1));
	    var tmp= model_transform;
        gl.uniform4fv( g_addrs.color_loc, 			vec4( .2,.2,.2,1 ) );	// Color: Gray
	    model_transform = mult(model_transform, scale(0.3, 0.3, 0.3));
		this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
		model_transform = tmp;
		model_transform = mult( model_transform, translate( 0, -1.5, 0 ));
		this.m_sphere.draw (mult(model_transform, scale(0.3, 1.7, 0.3)), this.camera_transform, this.projection_transform);
		model_transform = tmp;
		model_transform = mult( model_transform, translate( 0, -0.5, 0 ));
		//model_transform = mult(model_transform, rotate(90, 0, 1, 0));
		 gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9,0.9,0.9,1 ) );	
		var tmp1 = model_transform;
		model_transform = mult (model_transform, rotate(60 * Math.abs(Math.sin(time/300)),0,1,0));
		if (texture_name == null) texture_name = "butterfly.jpg";
		this.m_fwing.draw (model_transform, this.camera_transform, this.projection_transform,texture_name);
		//model_transform = mult( model_transform, rotate( 180, 0, 1, 0 ));
		model_transform = tmp1;
		model_transform = mult (model_transform, rotate(-60 * Math.abs(Math.sin(time/300)),0,1,0));
		this.m_fwing.draw (model_transform, this.camera_transform, this.projection_transform,texture_name);
}

Animation.prototype.display = function(time)
	{
		if(!time) time = 0;
		var animation_delta_time = time - prev_time;
		if(animate) this.animation_time += animation_delta_time;
		prev_time = time;

        var ang = 0;
        var face = false;
        var endtime = 0;
        ang = this.animation_time * 0.02;
        if (ang <= 90)
        {
        this.camera_transform = mult(lookAt(vec3(0, 20 + ang/4.5, 0), vec3(0, 0, 0), vec3(0, 0, -1)),rotate(-ang, 1, 0, 0) );
        endtime = this.animation_time; }
        else{
        ang = 90;
        this.camera_transform = mult(lookAt(vec3(0, 40, 0), vec3(0, 0, 0), vec3(0, 0, -1)),rotate(-ang, 1, 0, 0));
	    //this.camera_transform = mult(this.camera_transform,rotate(-ang, 1, 0, 0) );
	    face = true;

	    }  
	    //if (face == false) 
		//console.log(this.camera_transform);

		var basis_id = 0;
		
		var model_transform = mat4();
		var MatrixStackTemp = new Array();
	    MatrixStackTemp[0] = model_transform;
	    model_transform = MatrixStackTemp[0];
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 1,1,1,1 ) );	// Color: Gray
       
        // model_transform = mult(model_transform,translate(10,10,10));
        // model_transform = mult(model_transform,rotate(this.animation_time/100, 0, 1,0));
        // gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.2,0.2,0.2,1 ) );	// Color: Gray
        // this.m_f_umbrella.draw(model_transform, this.camera_transform, this.projection_transform);
        //   model_transform = MatrixStackTemp[0];      
        // model_transform = mult(model_transform,translate(5,10,10));
        // model_transform = mult(model_transform,rotate(this.animation_time/100, 0, 1,0));
        // gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.2,0.2,0.2,1 ) );	// Color: Gray
        // this.m_s_umbrella.draw(model_transform, this.camera_transform, this.projection_transform);
        //     model_transform = mult(model_transform,translate(5,10,10));
        // model_transform = mult(model_transform,rotate(this.animation_time/100, 0, 1,0));
        // this.DrawFunbrella(model_transform, this.camera_transform, this.projection_transform);

        //  model_transform = MatrixStackTemp[0];      
        // model_transform = mult(model_transform,translate(-5,10,10));
        // model_transform = mult(model_transform,rotate(this.animation_time/100, 0, 1,0));
        // gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.2,0.2,0.2,1 ) );	// Color: Gray
        // this.DrawSunbrella(model_transform, this.camera_transform, this.projection_transform);
		/**********************************
		Start coding here!!!!
		**********************************/

    var time_scene1 = this.animation_time - 0; 
    if( time_scene1 > 9000 )
    time_scene1 = -1;
    var time_scene2 = this.animation_time - 9000; 
    if( time_scene2 > 21000 )
    time_scene2 = -1;
    var time_scene3 = this.animation_time - 30000; 
     if( time_scene3 > 25000 )
     time_scene3 = -1;
    var time_scene4 = this.animation_time - 55000; 
    if( time_scene4 > 15000 )
    time_scene4 = -1;
    var time_scene5 = this.animation_time - 70000; 
      if( time_scene5 > 45000 )
    time_scene5 = -1;
  var time_scene6 = this.animation_time - 115000; 
	
    // if( time_scene2 > 20000 )
    // time_scene2 = -1;
    // var time_scene3 = time - 30000; 
    //  if( time_scene3 > 5000 )
    //  time_scene3 = -1;
    // var time_scene4 = time - 35000; 
 //   model_transform = mult(model_transform, translate(10,0,0));
 // this.DrawRaindrop(model_transform, this.camera_transform, this.projection_transform);
/************************************ Scene1 ********************************************************/
		/**********************************
		Baymax START
		***********************************/

        // model_transform= mult(model_transform, translate(5,10,0));
        // this.DrawCloud( model_transform, this.camera_transform, this.projection_transform);
		if (time_scene1>0){

	   model_transform = MatrixStackTemp[0];
	   model_transform = mult(model_transform, translate(2,2,2));
	   this.butterfly(model_transform, this.camera_transform, this.projection_transform);
	   model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(0, 18, 0));
	   model_transform = mult( model_transform, scale(80, 80, 80));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "night2.jpg");

	   model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(0, -67, 0));
	   model_transform = mult( model_transform, rotate(90, 1, 0, 0));
	   model_transform = mult( model_transform, scale(120, 120, 120));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "grass2.jpg");

	   model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate( -1.5, 12.1, 0 ));
	   model_transform = mult( model_transform, rotate( 180, 0, 1, 0 ));
	   model_transform = mult( model_transform, scale(0.5, 0.5, 0.5)); 
	   if (face == false){
	    this.butterfly(time, model_transform, this.camera_transform, this.projection_transform);
        endtime = this.animation_time;
	   } 
	   else{

        var delta_time = this.animation_time - endtime - 4504;
        //console.log(delta_time);
        var vel = [];
        vel[0] = 0.0053;
        vel[1] = -0.002;
        if (vel[0] * delta_time > 8)
        {
        vel[1] = -0.0024;
        model_transform = mult(model_transform, rotate(-15, 0, 0, 1));
        }
        vel[2] = 0;
        //if (delta_time * vel[0] < 10 && delta_time * vel[1]<10)
        var tmp;
        // if(time < 8000) {
	   	model_transform = mult(model_transform,  translate(vel[0] * delta_time, vel[1]*delta_time + Math.abs(Math.sin(delta_time/250)), vel[2] * delta_time));
	    tmp = model_transform;
	    //console.log(tmp); 
	    this.butterfly(time, model_transform, this.camera_transform, this.projection_transform);}
	

		//Head
		model_transform = MatrixStackTemp[0];
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9,0.9,0.9,1 ) );	
	    model_transform = mult( model_transform, translate( 0, 10, 0 ));
	    model_transform = mult( model_transform, rotate( -20, 0, 1, 0 ) );
	    //model_transform = mult( model_transform, rotate( this.animation_time/10, 0, 1, 0 ) );
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult( model_transform, scale(3.8, 2, 2));
	    this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
	    
	    //Left Eye
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0,0,0,1 ) );
	    model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(-1.5,0,2));
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Eye
        model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(1.5,0,2));
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);

        //Mouth 
        model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(0,0,2));
	    model_transform = mult( model_transform, scale(3, 0.2, 0.2));
        this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Neck 
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9,0.9,0.9,1 ) );
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult (model_transform, translate(0,0,-2));
        model_transform = mult( model_transform, scale(6, 4, 3));
        this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Body
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[1] for head position
        MatrixStackTemp.push(model_transform); 
        model_transform = mult (model_transform, translate(0,-10,0))
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[2] for body position
        model_transform = mult( model_transform, scale(8, 8, 6.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[2] for body position
        MatrixStackTemp.push(model_transform);
        model_transform = mult (model_transform, translate(0,-5, 4.8));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[3] for leg position
        model_transform = mult (model_transform, translate(2,0,0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        model_transform = mult (model_transform, rotate(90 ,1 ,0, 0));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,0,2));
        model_transform = mult (model_transform, rotate(90 ,1 ,0, 0));
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Left Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[3] for leg position
        MatrixStackTemp.push(model_transform);
        model_transform = mult (model_transform, translate(-2,0,0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        model_transform = mult (model_transform, rotate(90 ,1 ,0, 0));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,0,2));
        model_transform = mult (model_transform, rotate(90 ,1 ,0, 0));
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
      
       ///////////////////////Left & Right Arms///////////////////////////////////////////
       var j = 1;
       for(var i = 0; i < 2; i++){
        model_transform = MatrixStackTemp[1]; //MatrixStackTemp[1] head position
        model_transform = mult (model_transform, translate(0,-4,0));
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[4] --for arm position
        model_transform = mult (model_transform, translate(-3.5*j,0,0));
        //model_transform = mult (model_transform, rotate(j*5*Math.sin(time/500),0,0,1))
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        //model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult( model_transform, rotate( -75*j, 0, 0, 1 ) );
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        //this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        model_transform = mult(model_transform, translate(-2.7*j, -0.85, 0));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult(model_transform, rotate(-70*j, 0, 0, 1));
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[7]---for left arm 3rd part
        model_transform = mult(model_transform, translate(-2.7*j, -1.25, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-60*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, translate(-2.7*j, -1.85, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-50*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);

        
        model_transform = MatrixStackTemp.pop();
        model_transform = mult(model_transform, translate(-1.2*j, -1, 0));
        model_transform = mult(model_transform, scale(1.8,1.8,1));
        this.m_sphere.draw(model_transform,this.camera_transform, this.projection_transform);

        j=-j;
       }
   }
     /***********************************************
     Baymax END
     ************************************************/



     /************************************ Scene2 ********************************************************/
  /**********************************
		Baymax START
		***********************************/
		if (time_scene2>0){

       var ang = time_scene2/200;
        if (ang >= 20){ 
        this.camera_transform = mult(lookAt(vec3(0, 0, 40), vec3(0, 0, 0), vec3(0, 1, 0)),rotate(this.animation_time/20, 0, 1, 0) );

	    }

	   model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(0, 18, 0));
	   model_transform = mult( model_transform, scale(80, 80, 80));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "night2.jpg");

	   model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(0, -67, 0));
	   model_transform = mult( model_transform, rotate(90, 1, 0, 0));
	   model_transform = mult( model_transform, scale(120, 120, 120));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "grass2.jpg");


	    //console.log(this.animation_time);

	 
		//Head

		model_transform = MatrixStackTemp[0]; 
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9,0.9,0.9,1 ) );	
	    model_transform = mult( model_transform, translate( 0, 10, 0 ));
	    model_transform = mult( model_transform, rotate( -20, 0, 1, 0 ) );
        MatrixStackTemp.push(model_transform); 
     
	    
	     var ang = (this.animation_time-8600)/200;
        if (ang <= 20){
	    model_transform = mult (model_transform, rotate(ang,1,-1,0));
	    }
	    else {
	    model_transform = mult (model_transform, rotate(20,1,-1,0));
        this.camera_transform = mult(lookAt(vec3(0, 0, 40), vec3(0, 0, 0), vec3(0, 1, 0)),rotate(this.animation_time/20, 0, 1, 0) );

	    }
	    tmp = model_transform;
	    model_transform = mult( model_transform, scale(3.8, 2, 2));
	    this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
	    
	    //Left Eye
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0,0,0,1 ) );
	    // model_transform = MatrixStackTemp.pop();
	    // MatrixStackTemp.push(model_transform);
	    model_transform = tmp;
	    model_transform = mult(model_transform, translate(-1.5,0,2));
	    //model_transform = mult (model_transform, rotate(-15*Math.sin(time/500),0,1,0));
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Eye
     //    model_transform = MatrixStackTemp.pop();
	    // MatrixStackTemp.push(model_transform);
	    model_transform = tmp;
	    model_transform = mult(model_transform, translate(1.5,0,2));
	    //model_transform = mult (model_transform, rotate(-15*Math.sin(time/500),0,1,0));
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);

        //Mouth 
     //    model_transform = MatrixStackTemp.pop();
	    // MatrixStackTemp.push(model_transform);
	     model_transform = tmp;
	    model_transform = mult(model_transform, translate(0,0,2));
	    model_transform = mult( model_transform, scale(3, 0.2, 0.2));
        this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Neck 
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9,0.9,0.9,1 ) );
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult (model_transform, translate(0,0,-2));
        model_transform = mult( model_transform, scale(6, 4, 3));
        this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Body
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[1] for head position
        MatrixStackTemp.push(model_transform); 
        model_transform = mult (model_transform, translate(0,-10,0))
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[2] for body position
        model_transform = mult( model_transform, scale(8, 8, 6.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[2] for body position
        MatrixStackTemp.push(model_transform);
        model_transform = mult (model_transform, translate(0,-5, 4.8));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[3] for leg position
        model_transform = mult (model_transform, translate(2,0,0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        model_transform = mult (model_transform, rotate(90 ,1 ,0, 0));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,0,2));
        model_transform = mult (model_transform, rotate(90 ,1 ,0, 0));
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Left Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[3] for leg position
        MatrixStackTemp.push(model_transform);
        model_transform = mult (model_transform, translate(-2,0,0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        model_transform = mult (model_transform, rotate(90 ,1 ,0, 0));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,0,2));
        model_transform = mult (model_transform, rotate(90 ,1 ,0, 0));
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
       ///////////////////////Left & Right Arms///////////////////////////////////////////
       var j = 1;
       for(var i = 0; i < 2; i++){
        model_transform = MatrixStackTemp[1]; //MatrixStackTemp[1] head position
        model_transform = mult (model_transform, translate(0,-4,0));
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[4] --for arm position
        model_transform = mult (model_transform, translate(-3.5*j,0,0));
        if (j==1){
        model_transform = mult (model_transform, rotate(j*15*Math.sin(time/500),1,0,0))
        } 
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        //model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult( model_transform, rotate( -75*j, 0, 0, 1 ) );
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        //this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        model_transform = mult(model_transform, translate(-2.7*j, -0.85, 0));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult(model_transform, rotate(-70*j, 0, 0, 1));
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[7]---for left arm 3rd part
        model_transform = mult(model_transform, translate(-2.7*j, -1.25, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-60*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, translate(-2.7*j, -1.85, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-50*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);

        model_transform = MatrixStackTemp.pop();
        model_transform = mult(model_transform, translate(-1.2*j, -1, 0));
        MatrixStackTemp.push();
        model_transform = mult(model_transform, scale(1.8,1.8,1));
        this.m_sphere.draw(model_transform,this.camera_transform, this.projection_transform);
        // this.butterfly(model_transform,this.camera_transform, this.projection_transform);
        if (j==1){
        model_transform = MatrixStackTemp.pop();
        model_transform = mult(model_transform, translate(-3.5, 0.5, 0));
        model_transform = mult(model_transform, rotate(30, 0, 0, 1));
        model_transform = mult(model_transform, rotate(180, 0, 1, 0));
        // if((this.animation_time-time_scene2)/30<180){
        // model_transform = mult(model_transform, rotate((time-time_scene2)/30, 0, 1, 0));
        // }
        model_transform = mult(model_transform, scale(.6,.6,.5));
        this.butterfly(time, model_transform,this.camera_transform, this.projection_transform);
        }

        j=-j;
       }
   }
     /***********************************************
     Baymax END
     ************************************************/

/************************************ Scene3 ********************************************************/
  /**********************************
		Baymax START
		***********************************/
		if (time_scene3>0){

       var vel = 0.006; 

	     model_transform = MatrixStackTemp[0];
	     model_transform = mult(model_transform, translate(10,10,10));
	     model_transform = mult(model_transform, rotate(15,1,0,0))
        model_transform = mult( model_transform, scale(8, 4, 0.1));

        //gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.6,0.6,0.6,1 ) );
        if (time_scene3 > 20000 && time_scene3 < 25000) 
        this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform, "text1.png");


	

       gl.uniform4fv( g_addrs.color_loc, 			vec4( 1,1,1,1 ) );
       model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(vel * time_scene3-50, 30, -80));
	   model_transform = mult( model_transform, scale(300, 100, 100));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "sky.jpg");
       
       model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(vel * time_scene3-50, -80, 0));
	   model_transform = mult( model_transform, rotate(90, 1, 0, 0));
	   model_transform = mult( model_transform, scale(300, 120, 120));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "grass2.jpg");
	  
		//Head

		model_transform = MatrixStackTemp[0]; 
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9,0.9,0.9,1 ) );	
	    model_transform = mult( model_transform, translate( 0, 10, 0 ));
	    model_transform = mult( model_transform, rotate( -40, 0, 1, 0 ) );
	    //model_transform = mult( model_transform, rotate( this.animation_time/10, 0, 1, 0 ) );
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult( model_transform, scale(3.8, 2, 2));
	    this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
	    
	    //Left Eye
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0,0,0,1 ) );
	    model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(-1.5,0,2));
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Eye
        model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(1.5,0,2));
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);

        //Mouth 
        model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(0,0,2));
	    model_transform = mult( model_transform, scale(3, 0.2, 0.2));
        this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Neck 
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9,0.9,0.9,1 ) );
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult (model_transform, translate(0,0,-2));
        model_transform = mult( model_transform, scale(6, 4, 3));
        this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Body
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[1] for head position
        MatrixStackTemp.push(model_transform); 
        model_transform = mult (model_transform, translate(0,-10,0))
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[2] for body position
        model_transform = mult( model_transform, scale(8, 8, 6.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[2] for body position
        MatrixStackTemp.push(model_transform);
        
        model_transform = mult (model_transform, translate(0,-7.8,0));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[3] for leg position
        model_transform = mult (model_transform, rotate(30*Math.sin(this.animation_time/300), 1, 0, 0))
        model_transform = mult (model_transform, translate(2,0,0));
         
        // model_transform = mult (model_transform, translate(0, 0, 1.5));
        // model_transform = mult (model_transform, rotate(-90, 1, 0, 0));
        // model_transform = mult (model_transform, translate(0, 0,-1.5));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,-2,0));
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,-2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Left Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[3] for leg position
        model_transform = mult (model_transform, rotate(-30*Math.sin(this.animation_time/300), 1, 0, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult (model_transform, translate(-2,0,0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,-2,0));
        // model_transform = mult (model_transform, translate(0,-1,-1));
        // model_transform = model_transform(model_transform, rotate(90, 1, 0, 1));

        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,-2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
      
       ///////////////////////Left & Right Arms///////////////////////////////////////////
       var j = 1;
       var z = 1;
       //var i = 1;
       for(var i = 0; i < 2; i++){
       	gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9,0.9,0.9,1 ) );
        model_transform = MatrixStackTemp[1]; //MatrixStackTemp[1] head position
        model_transform = mult (model_transform, translate(0,-4,0));
        model_transform = mult (model_transform, rotate( z * j * 40*Math.sin(this.animation_time/300), 1, 0, 0))
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[4] --for arm position
        model_transform = mult (model_transform, translate(-3.5*j,0,0));
       // model_transform = mult (model_transform, rotate(j*5*Math.sin(time/500),0,0,1))
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        //model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult( model_transform, rotate( -75*j, 0, 0, 1 ) );
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        //this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        model_transform = mult(model_transform, translate(-2.7*j, -0.85, 0));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult(model_transform, rotate(-70*j, 0, 0, 1));
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[7]---for left arm 3rd part
        model_transform = mult(model_transform, translate(-2.7*j, -1.25, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-60*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, translate(-2.7*j, -1.85, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-50*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);

        model_transform = MatrixStackTemp.pop();
        model_transform = mult(model_transform, translate(-1.2*j, -1, 0));
        MatrixStackTemp.push();
        model_transform = mult(model_transform, scale(1.8,1.8,1));
        this.m_sphere.draw(model_transform,this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        if (time_scene3 > 5000 && time_scene3 < 18000 && j==-1){ 
        model_transform = mult(model_transform, translate(5, 4.5, 0.5));
        model_transform = mult(model_transform, rotate(15, 0, 1, 0));
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawFunbrella(model_transform, this.camera_transform, this.projection_transform);
    //    z=0.01;
        
   	
    }
       if (time_scene3 > 5000 && time_scene3 < 18000 && j==1){ 
        model_transform = mult(model_transform, translate(-4, 2, 0.5));
        model_transform = mult(model_transform, rotate(15, 0, 1, 0));
        model_transform = mult( model_transform, scale(1.5, 1.5, 1.5));
        this.DrawSunbrella(model_transform, this.camera_transform, this.projection_transform);	
     //   z=0.01;
   	
    }
      if (time_scene3 > 3000 && time_scene3 < 18000){ 
      	tmp = model_transform;
      	var vel = 0.002;
      	model_transform = mat4();
        model_transform = mult(model_transform, translate(15 - vel * (time_scene3-3000), 15 +  Math.sin(this.animation_time/1000) , -5));
        this.DrawCloud(model_transform, this.camera_transform, this.projection_transform);
        
        // for (var i = 0; i<50; i++){
        // gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.12,0.56,1,1 ) );
        // var tmp1 =  model_transform;
        // model_transform = mult(model_transform, translate(Math.random()*2, - vel * (time_scene3-3000) , -5));
        // model_transform = mult(model_transform, scale(0.1,1.5,0.1));
        // this.m_cube.draw(model_transform, this.camera_transform, this.projection_transform);
        // model_transform = tmp1;
        // }
        model_transform = tmp;
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.9,0.9,0.9,1 ) );
     //   z=0.01;
   	
    }
   
        // if (time_scene3 > 5000 && time_scene3 < 18000)
        // 	{
        // 		z=0.01;
        // 	}
        // this.butterfly(model_transform,this.camera_transform, this.projection_transform);
  
        

        j=-j;
       }

        model_transform = MatrixStackTemp[0];
        model_transform = mult(model_transform, translate(-5, 3, 0));
        var vel = [];
        var delta_time = time_scene3;
        //console.log(delta_time);
        vel[0] = -0.005;
        if (Math.abs(vel[0] * delta_time) <=10)
        {
        model_transform = mult(model_transform, translate(vel[0] * delta_time, Math.abs(Math.sin(delta_time/250)), 0));
        }
        else {
        model_transform = mult(model_transform, translate(-10, Math.abs(Math.sin(delta_time/250)), 0));
        }
        model_transform = mult(model_transform, rotate(180, 0, 1, 0));
        // if((this.animation_time-time_scene2)/30<180){
        // model_transform = mult(model_transform, rotate((time-time_scene2)/30, 0, 1, 0));
        // }
        model_transform = mult(model_transform, scale(.6,.6,.5));
        this.butterfly(time, model_transform,this.camera_transform, this.projection_transform);
        
   }
     /***********************************************
     Baymax END
     ************************************************/

/************************************ Scene4 ********************************************************/
  /**********************************
		Baymax START
		***********************************/
		if (time_scene4 > 0){

		 var vel = 0.006; 
	

	   // model_transform = MatrixStackTemp[0];
	   // model_transform = mult( model_transform, translate(0, 18, 0));
	   // model_transform = mult( model_transform, rotate(90, 1, 0, 0));
	   // model_transform = mult( model_transform, scale(40, 40, 80));
	   // this.m_cylinder.draw ( model_transform, this.camera_transform, this.projection_transform, "sky2.jpg");

       model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(0, 30, -100));
	   model_transform = mult( model_transform, scale(150, 100, 100));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "sky0.jpg");
       
       model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(vel * time_scene3-50, -80, 0));
	   model_transform = mult( model_transform, rotate(90, 1, 0, 0));
	   model_transform = mult( model_transform, scale(300, 120, 120));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "grass2.jpg");

	     model_transform = MatrixStackTemp[0];
	     model_transform = mult(model_transform, translate(10,10,10));
	     model_transform = mult(model_transform, rotate(15,1,0,0))
        model_transform = mult( model_transform, scale(8, 4, 0.1));

        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.6,0.6,0.6,1 ) );
       
        if (time_scene4 > 9000 && time_scene4 < 11000) {
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(10 * Math.sin(this.animation_time/50),0,0,1));
        this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform, "text3.png");
        model_transform = MatrixStackTemp.pop();
        }
        // if (time_scene4 > 11000)
        // this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform, "text2.png");
		//Head
  
		model_transform = MatrixStackTemp[0]; 
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.8,0.8,0.8,1 ) );	
	    model_transform = mult( model_transform, translate( 0, 10, 0 ));
	    var vel = [];
	    var delta_time = 0;
	    for(var i=0; i<5; i++){
	    vel[1] = 0.01; 
	    delta_time = time_scene4 - 1500 * i;

	    if (vel[1]* delta_time - 0.00001 *  (delta_time * delta_time ) >=0 ){
	    model_transform = mult( model_transform, translate( 0, vel[1]* delta_time - 0.00001 *  (delta_time * delta_time ), 0 ));
     	}
        }
        vel[1] = 0.1; 
        delta_time = time_scene4 - 1500 * 5 - 1000;

        if (vel[1]* delta_time - 0.00005 *  (delta_time * delta_time ) >0 ){
        model_transform = mult( model_transform, translate( 0, vel[1]* delta_time - 0.00005 *  (delta_time * delta_time ), 0 ));
        }
        // if(vel[1]* delta_time - 0.00005 *  (delta_time * delta_time ) == 0){
        if (time_scene4 >= 10500)
        {   for( var i = 0; i < 200; i++ )
       
		{   
            this.bodies[i].model_transform = mult (this.bodies[i].model_transform, translate(0,-10,0));
            this.bodies[i].model_transform = mult (this.bodies[i].model_transform, scale(0.8,0.8,0.8));
            var texture_name = [];
            texture_name[0] = "nice_stone_03.png";
            texture_name[1] = "nice_stone_04.png";
            texture_name[2] = "nice_stone_05.png";
            texture_name[3] = "nice_stone_06.png";
			this.m_sphere.draw(mult( this.bodies[i].model_transform, scale(this.bodies[i].scale) ), this.camera_transform, this.projection_transform, texture_name[Math.floor(Math.random()*3)] );			
			var delta = translate( scale_vec( animation_delta_time, this.bodies[i].linear_velocity ) );		// Make proportional to real time.
			this.bodies[i].model_transform = mult( delta, this.bodies[i].model_transform );					// Apply translation velocity - premultiply to keep together
			this.bodies[i].linear_velocity[1] = .5 * -this.bodies[i].linear_velocity[1]				// Reverse our Y velocity.			
		}
	    }
        // }
	    model_transform = mult( model_transform, rotate( -20, 0, 1, 0 ) );
	    //model_transform = mult( model_transform, rotate( this.animation_time/10, 0, 1, 0 ) );
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult( model_transform, scale(3.8, 2, 2));
	    this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
	    
	    //Left Eye
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0,0,0,1 ) );
	    model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(-1.5,0,2));
	    MatrixStackTemp.push(model_transform);
	     if(time_scene4 > 11000){
        model_transform = mult(model_transform, translate(0,-1,0));
        model_transform = mult( model_transform, scale(0.5, 1, 0.01));
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0, 0.62, 1, 0.8 ) ); 
        this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform);
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0,0,0,1 ) );
        }
        model_transform = MatrixStackTemp.pop();
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Eye
        model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(1.5,0,2));
	    MatrixStackTemp.push(model_transform);
	     if(time_scene4 > 11000){
        model_transform = mult(model_transform, translate(0,-1,0));
        model_transform = mult( model_transform, scale(0.5, 1, 0.01));
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0, 0.62, 1, 0.8 ) ); 
        this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult(model_transform, translate(0,-5,10));
        model_transform = mult( model_transform, scale(3, 3, 3));
    
       

        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0,0,0,1 ) );
        }
        model_transform = MatrixStackTemp.pop();
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);

        //Mouth 
        model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(0,0,2));
	    model_transform = mult( model_transform, scale(3, 0.2, 0.2));
        this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Neck 
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.8,0.8,0.8,1 ) );
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult (model_transform, translate(0,0,-2));
        model_transform = mult( model_transform, scale(6, 4, 3));
        this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Body
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[1] for head position
        MatrixStackTemp.push(model_transform); 
        model_transform = mult (model_transform, translate(0,-10,0))
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[2] for body position
        model_transform = mult( model_transform, scale(8, 8, 6.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[2] for body position
        MatrixStackTemp.push(model_transform);
        
        model_transform = mult (model_transform, translate(0,-9,0));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[3] for leg position
        model_transform = mult (model_transform, translate(2,0,0));
         
        // model_transform = mult (model_transform, translate(0, 0, 1.5));
        // model_transform = mult (model_transform, rotate(-90, 1, 0, 0));
        // model_transform = mult (model_transform, translate(0, 0,-1.5));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,-2,0));
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,-2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Left Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[3] for leg position
        MatrixStackTemp.push(model_transform);
        model_transform = mult (model_transform, translate(-2,0,0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,-2,0));
        // model_transform = mult (model_transform, translate(0,-1,-1));
        // model_transform = model_transform(model_transform, rotate(90, 1, 0, 1));

        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,-2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
      
       ///////////////////////Left & Right Arms///////////////////////////////////////////
       var j = 1;
       for(var i = 0; i < 2; i++){
        model_transform = MatrixStackTemp[1]; //MatrixStackTemp[1] head position
        model_transform = mult (model_transform, translate(0,-4,0));
        if(time_scene4 <= 1500 * 5 + 1000){
        model_transform = mult (model_transform, rotate(j*8*Math.sin(this.animation_time/50), 0, 0, 1));
        }
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[4] --for arm position
        model_transform = mult (model_transform, translate(-3.5*j,0,0));
       // model_transform = mult (model_transform, rotate(j*5*Math.sin(time/500),0,0,1))
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        //model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult( model_transform, rotate( -75*j, 0, 0, 1 ) );
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        //this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        model_transform = mult(model_transform, translate(-2.7*j, -0.85, 0));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult(model_transform, rotate(-70*j, 0, 0, 1));
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[7]---for left arm 3rd part
        model_transform = mult(model_transform, translate(-2.7*j, -1.25, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-60*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, translate(-2.7*j, -1.85, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-50*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);

        model_transform = MatrixStackTemp.pop();
        model_transform = mult(model_transform, translate(-1.2*j, -1, 0));
        MatrixStackTemp.push();
        model_transform = mult(model_transform, scale(1.8,1.8,1));
        this.m_sphere.draw(model_transform,this.camera_transform, this.projection_transform);
        // this.butterfly(model_transform,this.camera_transform, this.projection_transform);

        j=-j;
       }
        model_transform = MatrixStackTemp[0];
        model_transform = mult(model_transform, translate(-5, 5, 0));
        var vel = [];
        var delta_time = time_scene4;
        //console.log(delta_time);
        vel[0] = -0.005;
        model_transform = mult(model_transform, translate(-10, Math.abs(Math.sin(delta_time/250)), 0));
        model_transform = mult(model_transform, rotate(180, 0, 1, 0));
        model_transform = mult(model_transform, scale(.6,.6,.5));
        this.butterfly(time, model_transform,this.camera_transform, this.projection_transform);
   }
     /***********************************************
     Baymax END
     ************************************************/

   /************************************ Scene5 ********************************************************/
  /**********************************
		Baymax START
		***********************************/
		if (time_scene5>0){

	   var vel = 0;
       if (time_scene5 > 20000){
       	vel = 0.001;
        this.camera_transform = mult(this.camera_transform, translate(0, 0, -vel * (time_scene5-15000)))
       }
	   model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(0, 30 - vel * (time_scene5-15000), -80));
	   model_transform = mult( model_transform, scale(150, 100, 100));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "sky0.jpg");

	   model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(0, 130 - vel * (time_scene5-15000), -80));
	   model_transform = mult( model_transform, scale(150, 100, 100));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "sky0.jpg");
       
       model_transform = MatrixStackTemp[0];
	   model_transform = mult( model_transform, translate(0, -80 - vel * (time_scene5-15000), 0));
	   model_transform = mult( model_transform, rotate(90, 1, 0, 0));
	   model_transform = mult( model_transform, scale(300, 120, 120));
	   this.m_cube.draw ( model_transform, this.camera_transform, this.projection_transform, "grass2.jpg");


	   if (time_scene5>0){
		for( var i = 0; i < this.num_bodies1; i++ )
		{   //this.butterfly(mult( this.bodies[i].model_transform, scale(this.bodies[i].scale) ));
			this.bodies1[i].model_transform = mult( this.bodies1[i].model_transform, translate(10, 0 , 0)  );
			this.butterfly( time, mult( this.bodies1[i].model_transform, scale(this.bodies1[i].scale) ), this.camera_transform, this.projection_transform, "butterfly.jpg" );					
			var delta = translate( scale_vec( animation_delta_time, this.bodies1[i].linear_velocity ) );		// Make proportional to real time.
			this.bodies1[i].model_transform = mult( delta, this.bodies1[i].model_transform );					// Apply translation velocity - premultiply to keep together
				
		}
        
       
        var i ;
        var max_num = 10;
        for (i = 0 ; i < max_num; i ++){
         model_transform = mat4();
         
         model_transform = mult(model_transform, rotate(this.animation_time/20, 0, 1, 0));
         model_transform = mult(model_transform, rotate(i*360/max_num, 0, 1, 0));
         model_transform = mult(model_transform, translate(15, 0, 0 ));
         model_transform = mult(model_transform, rotate(90, 0, 1, 0));
         model_transform = mult(model_transform, scale(0.5, 0.5, 0.5));
         this.butterfly(time, model_transform, this.camera_transform, this.projection_transform);
        }
       

  }
       	   if (time_scene5>4000){
		for( var i = 0; i < this.num_bodies2; i++ )
		{   //this.butterfly(mult( this.bodies[i].model_transform, scale(this.bodies[i].scale) ));
			//this.bodies[i].model_transform = mult( rotate( rot, 0, 1, 0), this.bodies[i].model_transform  );
			this.bodies2[i].model_transform = mult( this.bodies2[i].model_transform, translate(10, 0 , 0)  );
			this.butterfly( time, mult( this.bodies2[i].model_transform, scale(this.bodies2[i].scale) ), this.camera_transform, this.projection_transform, "nice_stone_11.png" );					
			var delta = translate( scale_vec( animation_delta_time, this.bodies2[i].linear_velocity ) );		// Make proportional to real time.
			this.bodies2[i].model_transform = mult( delta, this.bodies2[i].model_transform );					// Apply translation velocity - premultiply to keep together
				
		}
        
       
        var i ;
        var max_num = 10;
        for (i = 0 ; i < max_num; i ++){
         model_transform = mat4();
         
         
         
         model_transform = mult(model_transform, rotate(this.animation_time/20, 0, 1, 0));
         model_transform = mult(model_transform, rotate(i*360/max_num, 0, 1, 0));
         model_transform = mult(model_transform, translate(13, -2.5, 0 ));
         model_transform = mult(model_transform, rotate(90, 0, 1, 0));
         model_transform = mult(model_transform, scale(0.5, 0.5, 0.5));
         this.butterfly(time, model_transform, this.camera_transform, this.projection_transform,"nice_stone_11.png");
        }
       
  }

       	   if (time_scene5>8000){
		for( var i = 0; i < this.num_bodies3; i++ )
		{   //this.butterfly(mult( this.bodies[i].model_transform, scale(this.bodies[i].scale) ));
			//this.bodies[i].model_transform = mult( rotate( rot, 0, 1, 0), this.bodies[i].model_transform  );
			this.bodies3[i].model_transform = mult( this.bodies3[i].model_transform, translate(10, 0 , 0)  );
			this.butterfly( time, mult( this.bodies3[i].model_transform, scale(this.bodies3[i].scale) ), this.camera_transform, this.projection_transform, "nice_stone_02.png" );					
			var delta = translate( scale_vec( animation_delta_time, this.bodies3[i].linear_velocity ) );		// Make proportional to real time.
			this.bodies3[i].model_transform = mult( delta, this.bodies3[i].model_transform );					// Apply translation velocity - premultiply to keep together
				
		}
        
       
        var i ;
        var max_num = 10;
        for (i = 0 ; i < max_num; i ++){
         model_transform = mat4();
         
         
         
         model_transform = mult(model_transform, rotate(this.animation_time/20, 0, 1, 0));
         model_transform = mult(model_transform, rotate(i*360/max_num, 0, 1, 0));
         model_transform = mult(model_transform, translate(11, -5, 0 ));
         model_transform = mult(model_transform, rotate(90, 0, 1, 0));
         model_transform = mult(model_transform, scale(0.5, 0.5, 0.5));
         this.butterfly(time, model_transform, this.camera_transform, this.projection_transform,"nice_stone_02.png");
        }
       
  }

       	   if (time_scene5>12000){
		for( var i = 0; i < this.num_bodies4; i++ )
		{   //this.butterfly(mult( this.bodies[i].model_transform, scale(this.bodies[i].scale) ));
			//this.bodies[i].model_transform = mult( rotate( rot, 0, 1, 0), this.bodies[i].model_transform  );
			this.bodies4[i].model_transform = mult( this.bodies4[i].model_transform, translate(10, 0 , 0)  );
			this.butterfly( time, mult( this.bodies4[i].model_transform, scale(this.bodies4[i].scale) ), this.camera_transform, this.projection_transform, "nice_stone_07.png" );					
			var delta = translate( scale_vec( animation_delta_time, this.bodies4[i].linear_velocity ) );		// Make proportional to real time.
			this.bodies4[i].model_transform = mult( delta, this.bodies4[i].model_transform );					// Apply translation velocity - premultiply to keep together
				
		}
        
       
        var i ;
        var max_num = 10;
        for (i = 0 ; i < max_num; i ++){
         model_transform = mat4();
         
         
         
         model_transform = mult(model_transform, rotate(this.animation_time/20, 0, 1, 0));
         model_transform = mult(model_transform, rotate(i*360/max_num, 0, 1, 0));
         model_transform = mult(model_transform, translate(9, -7.5, 0 ));
         model_transform = mult(model_transform, rotate(90, 0, 1, 0));
         model_transform = mult(model_transform, scale(0.5, 0.5, 0.5));
         this.butterfly(time, model_transform, this.camera_transform, this.projection_transform,"nice_stone_07.png");
        }
       
  }

     	   if (time_scene5>16000){
		for( var i = 0; i < this.num_bodies5; i++ )
		{   //this.butterfly(mult( this.bodies[i].model_transform, scale(this.bodies[i].scale) ));
			//this.bodies[i].model_transform = mult( rotate( rot, 0, 1, 0), this.bodies[i].model_transform  );
			this.bodies5[i].model_transform = mult( this.bodies5[i].model_transform, translate(10, 0 , 0)  );
			this.butterfly( time, mult( this.bodies5[i].model_transform, scale(this.bodies5[i].scale) ), this.camera_transform, this.projection_transform, "nice_stone_08.png" );					
			var delta = translate( scale_vec( animation_delta_time, this.bodies5[i].linear_velocity ) );		// Make proportional to real time.
			this.bodies5[i].model_transform = mult( delta, this.bodies5[i].model_transform );					// Apply translation velocity - premultiply to keep together
				
		}
        
       
        var i ;
        var max_num = 10;
        for (i = 0 ; i < max_num; i ++){
         model_transform = mat4();
         
         
         
         model_transform = mult(model_transform, rotate(this.animation_time/20, 0, 1, 0));
         model_transform = mult(model_transform, rotate(i*360/max_num, 0, 1, 0));
         model_transform = mult(model_transform, translate(7, -10, 0 ));
         model_transform = mult(model_transform, rotate(90, 0, 1, 0));
         model_transform = mult(model_transform, scale(0.5, 0.5, 0.5));
         this.butterfly(time, model_transform, this.camera_transform, this.projection_transform,"nice_stone_08.png");
        }
       
  }
		//Head

		model_transform = MatrixStackTemp[0]; 
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.8,0.8,0.8,1 ) );	
	    model_transform = mult( model_transform, translate( 0, 10, 0 ));
	    model_transform = mult( model_transform, rotate( -20, 0, 1, 0 ) );
	    //model_transform = mult( model_transform, rotate( this.animation_time/10, 0, 1, 0 ) );
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult( model_transform, scale(3.8, 2, 2));
	    this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
	    
	    //Left Eye
	    gl.uniform4fv( g_addrs.color_loc, 			vec4( 0,0,0,1 ) );
	    model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(-1.5,0,2));
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Eye
        model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(1.5,0,2));
	    model_transform = mult( model_transform, scale(0.5, 0.5, 0.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);

        //Mouth 
        model_transform = MatrixStackTemp.pop();
	    MatrixStackTemp.push(model_transform);
	    model_transform = mult(model_transform, translate(0,0,2));
	    model_transform = mult( model_transform, scale(3, 0.2, 0.2));
        this.m_cube.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Neck 
        gl.uniform4fv( g_addrs.color_loc, 			vec4( 0.8,0.8,0.8,1 ) );
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult (model_transform, translate(0,0,-2));
        model_transform = mult( model_transform, scale(6, 4, 3));
        this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Body
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[1] for head position
        MatrixStackTemp.push(model_transform); 
        model_transform = mult (model_transform, translate(0,-10,0))
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[2] for body position
        model_transform = mult( model_transform, scale(8, 8, 6.5));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Right Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[2] for body position
        MatrixStackTemp.push(model_transform);
        
        model_transform = mult (model_transform, translate(0,-9,0));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[3] for leg position
        model_transform = mult (model_transform, translate(2,0,0));
         
        // model_transform = mult (model_transform, translate(0, 0, 1.5));
        // model_transform = mult (model_transform, rotate(-90, 1, 0, 0));
        // model_transform = mult (model_transform, translate(0, 0,-1.5));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,-2,0));
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,-2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
        
        //Left Leg
        model_transform = MatrixStackTemp.pop();//MatrixStackTemp[3] for leg position
        MatrixStackTemp.push(model_transform);
        model_transform = mult (model_transform, translate(-2,0,0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        model_transform = mult (model_transform, translate(0,-2,0));
        // model_transform = mult (model_transform, translate(0,-1,-1));
        // model_transform = model_transform(model_transform, rotate(90, 1, 0, 1));

        model_transform = mult( model_transform, scale(2, 2, 2));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        model_transform = mult( model_transform, scale(1, 0.5, 1));
        model_transform = mult (model_transform, translate(0,-2,0));
        this.m_sphere.draw (model_transform, this.camera_transform, this.projection_transform);
      
       ///////////////////////Left & Right Arms///////////////////////////////////////////
       var j = 1;
       for(var i = 0; i < 2; i++){
       	

        model_transform = MatrixStackTemp[1]; //MatrixStackTemp[1] head position
        model_transform = mult (model_transform, translate(0,-4,0));
        MatrixStackTemp.push(model_transform); //MatrixStackTemp[4] --for arm position
        model_transform = mult (model_transform, translate(-3.5*j,0,0));
        if (time_scene5 > 30000 && j==-1){
       	model_transform = mult (model_transform, rotate(90,1,0,0));
        model_transform = mult (model_transform, rotate(j*25*Math.sin(time/100),1,0,0));
        } 
       // model_transform = mult (model_transform, rotate(j*5*Math.sin(time/500),0,0,1))
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        //model_transform = mult( model_transform, rotate( -90, 1, 0, 0 ) );
        model_transform = mult( model_transform, rotate( -75*j, 0, 0, 1 ) );
        model_transform = mult( model_transform, scale(1.8, 1.8, 1.8));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        //this.m_fan.draw (model_transform, this.camera_transform, this.projection_transform);
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[5]---for left arm
        model_transform = mult(model_transform, translate(-2.7*j, -0.85, 0));
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult(model_transform, rotate(-70*j, 0, 0, 1));
        model_transform = mult( model_transform, scale(1.8, 1.8, 1.8));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);//MatrixStackTemp[7]---for left arm 3rd part
        model_transform = mult(model_transform, translate(-2.7*j, -1.25, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-60*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1.8));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);
        
        model_transform = MatrixStackTemp.pop();
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, translate(-2.7*j, -1.85, 0));
        MatrixStackTemp.push(model_transform);
        model_transform = mult(model_transform, rotate(-50*j, 0, 0, 1));
        //MatrixStackTemp[6]---for left arm 2nd part
        model_transform = mult( model_transform, scale(1.8, 1.8, 1.8));
        this.DrawCylinder(20, model_transform, this.camera_transform, this.projection_transform);

        model_transform = MatrixStackTemp.pop();
        model_transform = mult(model_transform, translate(-1.2*j, -1, 0));
        MatrixStackTemp.push();
        model_transform = mult(model_transform, scale(1.8,1.8,1.8));
        this.m_sphere.draw(model_transform,this.camera_transform, this.projection_transform);
        // this.butterfly(model_transform,this.camera_transform, this.projection_transform);
        if (j==1){
        model_transform = MatrixStackTemp.pop();
        model_transform = mult(model_transform, translate(-3.5, 0.5, 0));
        model_transform = mult(model_transform, rotate(30, 0, 0, 1));
        model_transform = mult(model_transform, rotate(180, 0, 1, 0));
        // if((this.animation_time-time_scene2)/30<180){
        // model_transform = mult(model_transform, rotate((time-time_scene2)/30, 0, 1, 0));
        // }
        model_transform = mult(model_transform, scale(.6,.6,.5));
        this.butterfly(time, model_transform,this.camera_transform, this.projection_transform);
        }

        j=-j;
       }
   }
     /***********************************************
     Baymax END
     ************************************************/
if(time_scene6>0){
	model_transform = MatrixStackTemp[0];
	model_transform = mult(model_transform, rotate(10,0,1,0));
	model_transform = mult(model_transform, scale(8,8,8));
	this.m_cube.draw(model_transform, this.camera_transform, this.projection_transform,"text4.png");
	model_transform = MatrixStackTemp[0];
	model_transform = mult(model_transform, translate(-3,4,4));
	this.butterfly(time,model_transform, this.camera_transform, this.projection_transform);
}


      
		//this.m_axis.draw( basis_id++, model_transform, this.camera_transform, this.projection_transform );
		
	}	


Animation.prototype.update_strings = function( debug_screen_object )		// Strings this particular class contributes to the UI
{   
	//debug_screen_object.string_map["tick"] = "Frame: " + this.tick++;

	debug_screen_object.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	if(this.animation_time>0)
	{debug_screen_object.string_map["frame_rate"] = "Frame Rate: " + frame/(this.animation_time/1000) + "FPS";}
	debug_screen_object.string_map["time"] = "Time: " + this.animation_time/1000 + "s";
	debug_screen_object.string_map["tick"] = "Frame: " + frame;
	//frame = this.tick++;
	//debug_screen_object.string_map["thrust"] = "Thrust: " + thrust;
	//debug_screen_object.string_map["tick"] = "Frame: " + this.tick++;
}