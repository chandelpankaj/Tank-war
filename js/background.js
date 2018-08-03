var background_image = new Image();
var snow_counter=0.0;
var snow_direction = -1;
background_image.src = "images/background.jpg";

	var cnv = document.getElementById('background_canvas').getContext('2d');
window.onResize = function(){

	cnv.canvas.width = window.innerWidth-5;
	cnv.canvas.height = window.innerHeight-5;
}
function start(){
	cnv.canvas.width = window.innerWidth-5;
	cnv.canvas.height = window.innerHeight-5;
	var snow = [];
	var x_vel_snow = -1;
	var canvas_h = cnv.canvas.height;
	var canvas_w = cnv.canvas.width;
	function addSnow(){
		var s_x = Math.floor(Math.random()*canvas_w*2-canvas_w/2)+1;//because we don't need zero
		var s_y = 0;
		var s_size = Math.floor(Math.random() * 5)+1;
		snow.push({"x":s_x,"y":s_y,"size":s_size});
	}
	function snowFall(){
		addSnow();
		for(var s in snow){
			cnv.fillStyle = 'rgba(255,255,255,0.8)';
			cnv.beginPath();
			cnv.arc(snow[s].x,snow[s].y,snow[s].size/2,0,2*Math.PI,false);
			cnv.fill();
			snow[s].y+=snow[s].size/2;
			snow[s].x += snow[s].size/2*x_vel_snow;
			if(snow[s].y>canvas_h)
				delete(snow[s]);
		}
		if(snow_counter % 10==0){
			if(snow_direction==-1){
				x_vel_snow+=0.005;
				if(x_vel_snow>1){
					snow_direction=1;
				}
			}
			else if(snow_direction ==1){
				x_vel_snow -=0.005;
				if(x_vel_snow<-1){
					snow_direction = -1;
				}
			}
		}
	}
	function animate(){
		cnv.save();
		snow_counter++;
		cnv.clearRect(0,0,canvas_w,canvas_h);
		cnv.drawImage(background_image,0,0,canvas_w,canvas_h);
		snowFall();
	}
	var snowFallInterval = setInterval(animate,30);
}
window.addEventListener('load',function(event){
	start();
});
window.addEventListener('resize',function(event){
	cnv.canvas.width = window.innerWidth-30;
	cnv.canvas.height = window.innerHeight-30;
	console.log('resized');
});