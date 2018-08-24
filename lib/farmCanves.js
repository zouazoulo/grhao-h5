


define('farmCanves',['pixi'],function(require, exports, module){



	/********************************** PIXiJS 模块 ******************************* */
	require('pixi');
   
    
    
    
	//别名
	let Application = PIXI.Application,
	    Container = PIXI.Container,
	    loader = PIXI.loader,
	    resources = PIXI.loader.resources,
	    Graphics = PIXI.Graphics,
	    TextureCache = PIXI.utils.TextureCache,
	    Sprite = PIXI.Sprite,
	    Text = PIXI.Text,
	    TextStyle = PIXI.TextStyle,
	    w = $(window).width(),
	    h = $(window).height();
	
	let app
	
	
	
	//定义可能使用的变量
	let background,
		windmill,
		vane,
		Cloud,
		tree,
		container,
		blue,
		black,
		width,
		step,
		gameScene,
		u = 0,
		i = 0;
	
	function setup(){
		console.log(1)
		gameScene = new Container();
		app.stage.addChild(gameScene);
		 //制作精灵并将它们添加到`gameScene`中
	 	 //为纹理图集框架ID创建别名
		id = resources["../img/farmImg/farm.json"].textures;
		
		//背景
	  	background = new Sprite(id["bg2x.png"]);
		background.width =  w;
		background.height = h;
	  	gameScene.addChild(background);
		
		//风车
		windmill = new Sprite(id['fz2x.png']);
		windmill.x = w - windmill.width / 2 - 100;
		windmill.y = h / 2 - windmill.height/2 + 270;
		gameScene.addChild(windmill);
		//叶扇
		let spend = 1,isSpend=false;
		vane = new Sprite(id['fc2x.png']);
		vane.anchor.set(0.5);	
		vane.x = w - vane.width / 2 - 30;
		vane.y = h / 2 - vane.height/2 + 300;
		vane.interactive = true; 		   //选择互动
		vane.buttonMode = true;		   		//选择鼠标形状
	    vane.on('pointerdown',onClick);
	 	function onClick(){
	   		isSpend = true;
	   		spend = 10;
	   	};
	   	app.ticker.add(function(){
			if (isSpend) {
				spend -= 0.05;
				if (spend < 1) {
					spend = 1;
				}
				vane.rotation += 0.01 * spend;
			}else{
				vane.rotation += 0.01;
			}
			isSpend = !isSpend;
		})
		gameScene.addChild(vane);  
	
			//云
			var Cloud = {
				newCloud : function(s,a,b){
					var Sprite = PIXI.Sprite.fromImage(s);
					Sprite.interactive = true;
					Sprite.buttonMode = true;
					Sprite.x = a;
					Sprite.y = b;
					return Sprite;
				},
				state:'play',
				opcity:'1',
				onClickTrue:function(){
					Cloud.state = 'none';
				}
			}
			Cloud = $.extend({},Cloud, {
				filerO : new PIXI.filters.AlphaFilter(Cloud.opcity)
			});
			var cloudSprite =Cloud.newCloud('./../img/farmImg/cloud1.png',-200,randomInt(300, 600));
			cloudSprite.on('pointerdown',Cloud.onClickTrue);
			gameScene.addChild(cloudSprite);
			cloudSprite.filters = [Cloud.filerO];
			
			var cloudSprite1 = Cloud.newCloud('./../img/farmImg/cloud2.png',760,randomInt(300, 600));
			cloudSprite1.on('pointerdown', Cloud.onClickTrue);
			gameScene.addChild(cloudSprite1);
			cloudSprite1.filters = [Cloud.filerO];
			
			var cloudSprite2 = Cloud.newCloud('./../img/farmImg/cloud3.png',-200,randomInt(300, 600));
			cloudSprite2.on('pointerdown', Cloud.onClickTrue);
			gameScene.addChild(cloudSprite2);
			cloudSprite2.filters = [Cloud.filerO];
	
			app.ticker.add(function(delta){
				if (Cloud.state == 'play') {
					if (cloudSprite.x < w) {
						cloudSprite.x +=0.4;
					}else{
						cloudSprite.x = -200
					};
					if (cloudSprite2.x < w) {
						cloudSprite2.x +=0.6;
					}else{
						cloudSprite2.x = -200
					};
					if (cloudSprite1.x > -200) {
						cloudSprite1.x -=0.8;
					}else{
						cloudSprite1.x = 760;
					}
					
				}else if (Cloud.state == 'none'){
					if (Cloud.opcity <= 0) {
						Cloud.state = 'play';
						cloudSprite.x = -200;
						cloudSprite1.x = 760;
						cloudSprite2.x = -200;
						Cloud.opcity = 1;
						cloudSprite.filters = [new PIXI.filters.AlphaFilter(Cloud.opcity)];
						cloudSprite1.filters = [new PIXI.filters.AlphaFilter(Cloud.opcity)];
						cloudSprite2.filters = [new PIXI.filters.AlphaFilter(Cloud.opcity)];
					}else{
						Cloud.opcity = + Cloud.opcity;
						Cloud.opcity =Cloud.opcity.toFixed(2)
						Cloud.opcity -= 0.01;
						cloudSprite.filters = [new PIXI.filters.AlphaFilter(Cloud.opcity)];
						cloudSprite1.filters = [new PIXI.filters.AlphaFilter(Cloud.opcity)];
						cloudSprite2.filters = [new PIXI.filters.AlphaFilter(Cloud.opcity)];
					};
				}else{
					console.log('else');
				}
			})
			//树
			tree =new Sprite(id["tree.png"]);
			tree.anchor.set(1);	
			tree.x = w / 2 + tree.width/2;
			tree.y = h / 2  +360;
			gameScene.addChild(tree);
			
			//进度条
			blue= new Graphics();
			black = new Graphics();
			width = 450; //变量
			step = 30;//增加的经验	
			
			container = new Container();
			gameScene.addChild(container);
			
			container.interactive = true; //选择互动
			
			black.beginFill(0xffffff);
			black.alpha = 0.5 ;
			black.drawRoundedRect(0, 0,width,24,16);
			black.endFill();
			container.addChild(black);
			
	
			blue.beginFill(0xFF3300);
			blue.drawRoundedRect(0,0,width,24,16);
			blue.endFill();
			container.addChild(blue);
			
			container.outer = blue;//蓝色 
			
			container.x = w / 2 - width/2;
			container.y = tree.y+20;
			
			container.outer.width = i;
			
			$(".btn").on("click",function(){
				u  +=  parseInt(step);	
				add();
			})
			function add(){
				container.outer.width = i;
				i += 1;
				if(i <= u ){ 
					window.requestAnimationFrame(add)
				}
				
				if( u > width ){
					container.outer.width = 0;
					u = 0;
					i = 0;
				}
			}
	
			// 文字
			 let style = new TextStyle({
				    fontFamily: "Futura",
				    fontSize: 20,
				    fill: "white"
			 });
			 message = new Text("结果（已完成）", style);
			 message.x = 320;
			 message.y =container.y+30 ;
			 gameScene.addChild(message);
			// 除草
			
			let Grass = {
				newGrass :function(){
				var Sprite = PIXI.Sprite.fromImage('./../img/farmImg/cc2x.png');
					Sprite.interactive = true;
					Sprite.buttonMode = true;
					Sprite.x = randomInt(tree.x-300,tree.x);
					Sprite.y =randomInt(tree.y-300,tree.y-350);
					return Sprite;
				},
				state :"play",
				opcity:'1',
				click:function(){
					Grass.state = 'none';
				}
			}
			Grass = $.extend({},Grass, {
				filerO : new PIXI.filters.AlphaFilter(Grass.opcity)
			});
			var count = 0;
			let grass = Grass.newGrass();
			grass.on('pointerdown',Grass.click);
			grass.anchor.set(0.5);
			gameScene.addChild(grass);
			grass.filters = [Grass.filerO];
			app.ticker.add(function(delta){
				
				grass.scale.x = 1 + Math.sin(count) * 0.04; //动态气泡
	   			grass.scale.y = 1 + Math.cos(count) * 0.04;
	   			count += 0.1;
				 if (Grass.state == 'none'){
					if (Grass.opcity <= 1) {
						Grass.opcity  -= 0.01;
						grass.filters = [new PIXI.filters.AlphaFilter(Grass.opcity)];
					}else{
						Grass.state = "play";
					}
				}
			})
			
			 window.Watering = {
			    newWatering :function(){
			     let sprite = PIXI.Sprite.fromImage("./../img/farmImg/js2x.png");
				 	sprite.x= tree.x;
				 	sprite.y =tree.y-tree.height-80;
				 	return sprite;
			    },
			    state : "none",
			    opcity:'0'
			}
			
			window.Watering = $.extend({},window.Watering, {
				filerO : new PIXI.filters.AlphaFilter(window.Watering.opcity)
			});
			let watering = window.Watering.newWatering();
			watering.anchor.set(0.5);
			
			gameScene.addChild(watering);
			watering.filters = [window.Watering.filerO];
			app.ticker.add(function(delta){
				
				 if (window.Watering.state == 'play'){
					window.Watering = +window.Watering;
					 window.Watering = window.Watering.toFixed(2)
				 	 window.Watering.opcity += 0.01 ;
				 	 watering.filters = [new PIXI.filters.AlphaFilter(window.Watering.opcity)];
				}
			})
			
	}
	
	function randomInt(min, max) {
		return parseInt(Math.random() * (max - min + 1)) + min;
	}
	
	
    
    /*
    
    // 模块初始化
    pub.init = function(){
    	pub.canves = creatCanves();
	    
	    pub.mask = creatMask();
    	console.log('canvesInit')
    };*/
	 // 命名空间
   	var farmCanves = {
   		creatCanves : function (){
			//创建一个pixi 
			app = new Application({ 
			    width: w, 
			    height: h,                       
			    antialiasing: true, //抗锯齿
			    transparent: true,  //透明度
			    resolution: 1		//分辨率	
			});
			
			//将Pixi自动为您创建的画布添加到HTML文档中
			//document.body.appendChild(app.view);
			document.getElementsByClassName("canves_bg")[0].appendChild(app.view)
			loader
			  .add("../img/farmImg/farm.json")
			  .load(setup);
		},
   		creatMask : function(){
			let mask = new Application({ 
			    width: w, 
			    height: h,                       
			    antialiasing: true, //抗锯齿
			    transparent: false,  //透明度
			    resolution: 1		//分辨率	
			});
			document.getElementsByClassName("canves_bg")[0].appendChild(mask.view);
			let content = new Container();
			mask.stage.addChild(content);
			let clouds = {
					 newClouds:function(x,y){
						 	let sprite = PIXI.Sprite.fromImage("./../img/farmImg/yun.png");
						 	sprite.x= x;
						 	sprite.y = y;
						 	return sprite;
					 },
					state :"play",
					opacity:'1'
			}
			let cloud1 = clouds.newClouds(500,-300); //右上
			content.addChild(cloud1);
			let cloud2 = clouds.newClouds(400,200); //右中
			content.addChild(cloud2);
			let cloud3 = clouds.newClouds(600,600);//右下
			content.addChild(cloud3);
			let cloud4 = clouds.newClouds(-900,-100); //左上
			content.addChild(cloud4);
			let cloud5 = clouds.newClouds(-950,400);//左中
			content.addChild(cloud5);
			let cloud6 = clouds.newClouds(-500,1100); //下
			content.addChild(cloud6);
			let cloud7 = clouds.newClouds(0,-600);
			content.addChild(cloud7);
		}
   	}
	module.exports = farmCanves;
})