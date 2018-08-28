


define('farmCanves',['pixi'],function(require, exports, module){



	/********************************** PIXiJS 模块 ******************************* */
	require('pixi');
   
    /*
     * JavaScript设计模式之一Interface接口
     */
    var Interface = function (name, methods) {
        if (arguments.length != 2) {
            throw new Error("the interface length is bigger than 2");
        }
        this.Name = name;
        this.Method = [];
        for (var i = 0; i < methods.length; i++) {
        if(typeof methods[i]!== 'string') {
        throw new Error("the method name is not string");
        }
        this.Method.push(methods[i]);
        }
    }
    /*static method in interface*/
    Interface.ensureImplement = function (object) {
        if (arguments.length < 2) {
            throw new Error("there is not Interface or the instance");
        }

        for (var i = 1; i < arguments.length; i++) {
            var interface1 = arguments[i];
            if (interface1.constructor !== Interface) {
                throw new Error("the argument is not interface");
            }
            for (var j = 0; j < interface1.Method.length; j++) {
                var method = interface1.Method[j];
                if (!object[method] || typeof object[method] !== 'function') {
                    throw new Error("you instance doesn't implement the interface");
                   
                }
            }
        }
    };
    
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
		gameScene = new Container();
		app.stage.addChild(gameScene);
		 //制作精灵并将它们添加到`gameScene`中
	 	 //为纹理图集框架ID创建别名
	 	console.log(resources["../img/farmImg/farm.json"].textures)
		//id = resources["../img/farmImg/farm.json"].textures;
		
		//背景
	  	background = new Sprite(id["bg2x.png"]);
		background.width =  w;
		background.height = h;
	  	gameScene.addChild(background);
/*
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
		})*!/*/
	};	
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
   
   //对象
    var mainView =  function(){
        this.Dom;//绑定的dom
        this.imgs;//
        this.appCanves;//canves对象
        this.canvesBg;//canvesBg
        this.landContainer;
        this.land;//土地对象
        this.status;//状态
        this.Sprite;
        this.water;
        this.message;
    };
    mainView.prototype = {
    	init: function(params) {
    		var _this = this;
	    		_this.Dom = document.getElementsByClassName("canves_bg")[0];
	    		_this.imgs = null;
			    _this.appCanves;//canves对象
		        _this.canvesBg;//canvesBg
		        _this.landContainer;
		        _this.land;//土地对象
	        	_this.status = 0;
	        	_this.Sprite = Sprite;
            app = new Application({ 
			    width: w, 
			    height: h,                       
			    antialiasing: true, //抗锯齿
			    transparent: true,  //透明度
			    resolution: 1		//分辨率	
			});
			//将Pixi自动为您创建的画布添加到HTML文档中
			//document.body.appendChild(app.view);
			document.getElementsByClassName("canves_bg")[0].appendChild(app.view);
			this.appCanves = app;
			//背景盒子
			var gameScene = new Container();
			_this.canvesBg = gameScene;
			app.stage.addChild(gameScene);
			//土地盒子
			var landContainer = new Container();
			_this.landContainer = landContainer;
			app.stage.addChild(landContainer);
			
			//土地对象
			var land =new _this.Sprite.fromImage('../img/farmImg/emptyLand.png');
				land.interactive = true;
				land.buttonMode = true;
				land.anchor.set(0.5,1);	
				land.x = w / 2 ;
				land.y = h - 280;
			_this.land = land;
			landContainer.addChild(land);
			
			//文字对象
			message = new PIXI.Text();
			_this.message = message;
			landContainer.addChild(message);
			//进度条对象
			textContainer = new Container()
			_this.textContainer = textContainer;
			landContainer.addChild(textContainer);
			/*
			* 水对象
			* */
            //土地对象
            var water =new _this.Sprite.fromImage('../img/farmImg/js2x.png');
			_this.water = water;
			//landContainer.addChild(water);

			loader
			  .add("../img/farmImg/farm.json")
			  .load(function(loader,red){
			  	_this.imgs = resources["../img/farmImg/farm.json"].textures;
			  	_this.status = 1;
			  	_this.setup1(loader,resources)
			  });
			
       	},
       	setup1:function(){
       		var _this = this;
       		
       		var app = _this.appCanves;
       		
			var gameScene = _this.canvesBg;
			
			_this.canvesBg = gameScene;
			 //制作精灵并将它们添加到`gameScene`中
		 	 //为纹理图集框架ID创建别名
			id = _this.imgs;
			console.log(id)
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
			});
       	},
       	creatTreeContainer:function(val){
       		
			var _this = this;
			var app = _this.appCanves;
				//土地盒子
				landContainer = _this.landContainer;
				
				 //为纹理图集框架ID创建别名
				id = _this.imgs;
			console.log(_this.app)	
			if (_this.land) {
				_this.land.destroy();
			}
			if (_this.message) {
				try{
					_this.message.destroy(true);
				}catch(e){
					console.log("销毁——message chucuo")
				}
			}
			if (_this.textContainer) {
				_this.textContainer.destroy();
			}
			
			if (val) {
				//作物图片链接
				var fruitLoge = val.curGrowthCycle.logo = '../img/farmImg/tree2x.png' ,
					hasRipe = val.hasRipe,
					/*
					 是否有虫  
					 草
					 * */
					hasWeed = val.hasWeed,
					hasWorm = val.hasWorm,
					upHours = val.upHours;
				//土地对象
				var newLand = new PIXI.Sprite.fromImage(fruitLoge);
				
					newLand.interactive = true;
					newLand.buttonMode = true;
					newLand.anchor.set(0.5,1);	
					newLand.x = w / 2 ;
					newLand.y = h - 280;
				_this.land = newLand;	
				landContainer.addChild(newLand);
				
				
				
				//进度条
				textContainer = new Container();
				blue= new Graphics();
				black = new Graphics();
					_width = 400; //常量
					
				var houreObj = getNowHouse(val);
				var __width = (houreObj.nowValue * (_width-4))/ houreObj.diffValue ;
				
				landContainer.addChild(textContainer);
				
				textContainer.interactive = true; //选择互动
				
				black.beginFill(0xffffff);
				black.alpha = 0.5 ;
				black.drawRoundedRect(0, 0,_width,24,12);
				black.endFill();
				textContainer.addChild(black);
				
		
				blue.beginFill(0xFF3300);
				blue.drawRoundedRect(2,2,__width,20,10);
				blue.endFill();
				textContainer.addChild(blue);
				
				textContainer.outer = blue;//蓝色 
				
				textContainer.x = w / 2 - _width/2;
				textContainer.y = h - 270;
				
				_this.textContainer = textContainer;
				/*
				 计算当前的小时数
				 * */
				function getNowHouse(val){
					var hours = val.upHours;
					var list = val.gcs;
					var nowStage = val.curGrowthCycleIndex;
					
					var differenceValue = list[nowStage].end - list[nowStage].start
					return {
						diffValue:differenceValue,
						nowValue:differenceValue - hours
					}
					
				}
				
				 //文字
				let style = new TextStyle({
					    fontFamily: "Futura",
					    fontSize: 20,
					    fill: "white"
				});
				message = new Text(describeText(val), style);
				message.anchor.set(0.5,1)
				message.x = w/2;
				message.y =h - 200 ;
				
				_this.message = message;
				
				landContainer.addChild(message);
				/*
				 获取并且拼接文字的描述
				*/
				function describeText(val){
					var name = val.curGrowthCycle.name;
					var hours = val.upHours;
					var hasRipe = val.hasRipe;
					var list = val.gcs;
					var nowStage = val.curGrowthCycleIndex;
					
					
					if (hasRipe) {
						return name + "(已完成)";
					}else{
						if (parseInt(hours) <= 24) {
							return name + "(还需"+hours+"小时"+getStage(list,nowStage)+")";
						} else{
							return name + "(还需"+(parseInt(hours/24))+"天"+(parseInt(hours)%24)+"小时"+getStage(list,nowStage)+")";
						}
					};
					
					//获取下一个阶段
					function getStage(list,nowStage){
						if (list[nowStage+1]) {
							return list[nowStage+1].name;
						}else{
							return "结果"
						}
					}
				}
			}else{
				//土地对象
				var newLand = new PIXI.Sprite.fromImage('../img/farmImg/emptyLand.png');
					newLand.interactive = true;
					newLand.buttonMode = true;
					newLand.anchor.set(0.5,1);	
					newLand.x = w / 2 ;
					newLand.y = h - 280;
				_this.land = newLand;
				
				landContainer.addChild(newLand);
			}
			
			
			/*console.log(Sprite())*/
       	},
       	creatGrass:function(options){
       		
			var _this = this;
			var app = _this.appCanves;
				//土地盒子
				landContainer = _this.landContainer;
				
				 //为纹理图集框架ID创建别名
				id = _this.imgs;
			var _callBack = options.click;
				_id = options.id;
				_type = options.type;
			// 除草
			let Grass = {
				newGrass :function(){
					var Sprite = new _this.Sprite(id["cc2x.png"]);
					
					Sprite.interactive = true;
					Sprite.buttonMode = true;
					Sprite.anchor.set(0.5,1);
					Sprite.x = w/2-80;
					Sprite.y = h-500;
					return Sprite;
				},
				state :"play",
				opcity:'1',
				count:0,
				click:function(){
					_callBack.init(_id,function(){
						Grass.state = 'none';
					})
				},
				filerO:function(){
					return new PIXI.filters.AlphaFilter(Grass.opcity);
				}
			};
			
			
			
			let grass = Grass.newGrass();
				grass.on('tap',Grass.click);
				
			landContainer.addChild(grass);
				//grass.filters = [grass.filerO];
			app.ticker.add(function(delta){
				grass.scale.x = 1 + Math.sin(Grass.count) * 0.04; //动态气泡
	   			grass.scale.y = 1 + Math.cos(Grass.count) * 0.04;
	   			Grass.count += 0.1;
				if (Grass.state == 'none'){
					if (Grass.opcity <= 1) {
						Grass.opcity  -= 0.01;
						grass.filters = [new PIXI.filters.AlphaFilter(Grass.opcity)];
					}else{
						Grass.state = "play";
					}
				}
			});
       	},
       	creatWorm:function(options){
       		
			var _this = this;
			var app = _this.appCanves;
				//土地盒子
				landContainer = _this.landContainer;
				
				 //为纹理图集框架ID创建别名
				id = _this.imgs;
			var _callBack = options.click;
				_id = options.id;
				_type = options.type;
			console.log(landContainer)
			// 除草
			let Grass = {
				newGrass :function(){
					var Sprite = new _this.Sprite(id["cchongx.png"]);
					Sprite.interactive = true;
					Sprite.buttonMode = true;
					Sprite.anchor.set(0.5,1);
					Sprite.x = w/2+80;
					Sprite.y = h-500;
					return Sprite;
				},
				state :"play",
				opcity:'1',
				count:0,
				click:function(){
					_callBack.init(_id,function(){
						Grass.state = 'none';
					})
					
				},
				filerO:function(){
					return new PIXI.filters.AlphaFilter(Grass.opcity);
				}
			};
			let grass = Grass.newGrass();
				grass.on('tap',Grass.click);
			landContainer.addChild(grass);
				//grass.filters = [grass.filerO];
			app.ticker.add(function(delta){
				grass.scale.x = 1 + Math.sin(Grass.count) * 0.04; //动态气泡
	   			grass.scale.y = 1 + Math.cos(Grass.count) * 0.04;
	   			Grass.count += 0.1;
				if (Grass.state == 'none'){
					if (Grass.opcity <= 1) {
						Grass.opcity  -= 0.01;
						grass.filters = [new PIXI.filters.AlphaFilter(Grass.opcity)];
					}else{
						Grass.state = "play";
					}
				}
			});
       },
       creatPick:function(options){
       		
			var _this = this;
			var app = _this.appCanves;
				//土地盒子
				landContainer = _this.landContainer;
				 //为纹理图集框架ID创建别名
				id = _this.imgs;
			var _callBack = options.click;
				_id = options.id;
				_type = options.type;
			
			// 采摘
			let Grass = {
				newGrass :function(){
					var Sprite = new PIXI.Sprite.fromImage('../img/farmImg/icon_pick.png');
					Sprite.interactive = true;
					Sprite.buttonMode = true;
					Sprite.anchor.set(0.5,1);
					Sprite.x = w/2+120;
					Sprite.y = h-550;
					return Sprite;
				},
				state :"play",
				opcity:'1',
				count:0,
				click:function(){
					_callBack.init(_id,function(){
						Grass.state = 'none';
					})
					
				},
				filerO:function(){
					return new PIXI.filters.AlphaFilter(Grass.opcity);
				}
			};
			let grass = Grass.newGrass();
				grass.on('tap',Grass.click);
			landContainer.addChild(grass);
				//grass.filters = [grass.filerO];
			app.ticker.add(function(delta){
				grass.scale.x = 1 + Math.sin(Grass.count) * 0.04; //动态气泡
	   			grass.scale.y = 1 + Math.cos(Grass.count) * 0.04;
	   			Grass.count += 0.1;
				if (Grass.state == 'none'){
					if (Grass.opcity <= 1) {
						Grass.opcity  -= 0.01;
						grass.filters = [new PIXI.filters.AlphaFilter(Grass.opcity)];
					}else{
						Grass.state = "play";
					}
				}
			});
       },
       creatWater:function(options){
	       	var _this = this;
			var app = _this.appCanves;
				//土地盒子
				landContainer = _this.landContainer;
				 //为纹理图集框架ID创建别名
				id = _this.imgs;
			var _callBack = options.click;
				_id = options.id;
				_type = options.type;
			console.log()
		   if (_this.water){
		   		_this.water.destroy()
		   }
			// 水壶
			let Grass = {
				newGrass :function(){
					var Sprite = new PIXI.Sprite.fromImage('../img/farmImg/js2x.png');
					//Sprite.interactive = true;
					Sprite.buttonMode = true;
					Sprite.anchor.set(0.5,0.5);
					Sprite.x = w/2+120;
					Sprite.y = h-550;
					return Sprite;
				},
				state :"play",
				opcity:'1',
				count:0,
				click:function(){
					_callBack.init(_id,function(){
						Grass.state = 'none';
					})
					
				},
				filerO:function(){
					return new PIXI.filters.AlphaFilter(Grass.opcity);
				}
			};
			let water = Grass.newGrass();
				//grass.on('tap',Grass.click);
			landContainer.addChild(water);
				//grass.filters = [grass.filerO];
			/*app.ticker.add(function(delta){
				grass.scale.x = 1 + Math.sin(Grass.count) * 0.04; //动态气泡
	   			grass.scale.y = 1 + Math.cos(Grass.count) * 0.04;
	   			Grass.count += 0.1;
				if (Grass.state == 'none'){
					if (Grass.opcity <= 1) {
						Grass.opcity  -= 0.01;
						grass.filters = [new PIXI.filters.AlphaFilter(Grass.opcity)];
					}else{
						Grass.state = "play";
					}
				}
			});*/
       }
    }
	 // 命名空间
   	var farmCanves = {
   		mainView:new mainView(),
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
			console.log(loader)
			loader
			  .add("../img/farmImg/farm.json")
			  .load(function(loader,resp){
			  	console.log(resp)
			  });
			console.log(this)
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