


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

	};	
	function randomInt(min, max) {
		return parseInt(Math.random() * (max - min + 1)) + min;
	}
	
   
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
		   		/*console.log(_this.spendTimer)
		   		if (_this.spendTimer) {
		   			
		   			cancelAnimationFrame(_this.spendTimer);
		   			_this.spendTimer = null;
		   		}else{
		   			_this.spendTimer = requestAnimationFrame(runSpend)
		   		}*/
		   	};
		   	_this.spendTimer = requestAnimationFrame(runSpend)
		   	function runSpend(){
		   		_this.spendTimer = requestAnimationFrame(runSpend)
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
		   	}
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
		
			runCloud();
			function runCloud(){
				requestAnimationFrame(runCloud);
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
			}
       	},
       	creatTreeContainer:function(val,selfId){
       		
			var _this = this;
			var app = _this.appCanves;
				//土地盒子
				landContainer = _this.landContainer;
				
				 //为纹理图集框架ID创建别名
				id = _this.imgs;
			console.log("土地")
			console.log(_this.land)	
			if (_this.land) {
				console.log("销毁土地")
				_this.land.destroy();
				_this.land = null
			}
			if (_this.message) {
				try{
					_this.message.destroy(true);
					_this.message = null
				}catch(e){
					console.log("销毁——message chucuo")
				}
			}
			if (_this.textContainer) {
				_this.textContainer.destroy();
				_this.textContainer = null
			};
			_this.clearGrass();
			_this.clearWorm();
			_this.clearPick();
			_this.clearWater();
			
			console.log(val && val.id)
			if (val && val.id) {
				//作物图片链接
				var fruitLoge =  '../img/farmImg/crop_0'+val.curGrowthCycleIndex+'.png';
				
				var hasRipe = val.hasRipe,
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
				console.log(__width)
				blue.drawRoundedRect(2,2,__width,20,10);
				blue.endFill();
				if (__width <20) {
					
				}else{
					textContainer.addChild(blue);
					
				}
				//textContainer.addChild(blue);
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
				console.log(val.pageType)
				if (val.pageType == 1) {
					var hasWeed = val.hasWeed;
					if (hasWeed) {
						_this.creatGrass({
							type:'grass',
							id:val.id,
							click:val.weed
						})
					}
					var hasWorm = val.hasWorm;
					if (hasWorm) {
						_this.creatWorm({
							type:'worm',
							id:val.id,
							click:val.worm
						})
					};
					var hasRipe = val.hasRipe;
					if (hasRipe) {
						_this.creatPick({
							type:'pick',
							id:val.farmLandId,
							click:val.pick
						})
					};
				}else{
					var hasRipe = val.hasRipe;
					var stealNum = val.stealNum;
					var isSteal = val.friendIds.filter(function(item,i){
							return item == selfId;
						});
					console.log("是否成熟"+hasRipe);
					console.log("可偷数量"+stealNum);
					console.log("之前是否偷取过"+isSteal);
					
					if (hasRipe && stealNum > 0 && isSteal.length == 0) {
						_this.creatPick({
							type:'steal',
							id:val.id,
							click:val.steal
						})
					};
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
       	//草
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
					_callBack.init(options.id,function(){
						Grass.state = 'none';
					})
				},
				filerO:function(){
					return new PIXI.filters.AlphaFilter(Grass.opcity);
				}
			};
			
			
			var grass = Grass.newGrass();
				grass.on('tap',Grass.click);
			_this.grass = grass;	
			landContainer.addChild(grass);
				//grass.filters = [grass.filerO];
			_this.grassTimer = requestAnimationFrame(runGrass)
			function runGrass(){
				_this.grassTimer = requestAnimationFrame(runGrass)
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
			}
       	},
       	clearGrass:function(){
       		var _this = this;
       		if (_this.grass){
		   		_this.grass.destroy()
		   		_this.grass = null;
		   	}
       		if (_this.grassTimer) {
				cancelAnimationFrame(_this.grassTimer);
				_this.grassTimer = null;
			}
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
				console.log(_id)
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
					_callBack.init(options.id,function(){
						Grass.state = 'none';
					})
					
				},
				filerO:function(){
					return new PIXI.filters.AlphaFilter(Grass.opcity);
				}
			};
			var worm = Grass.newGrass();
				worm.on('tap',function(){
					console.log(options.id)
					_callBack.init(options.id,function(){
						Grass.state = 'none';
					})
				});
			_this.worm = worm;
			landContainer.addChild(worm);
				//grass.filters = [grass.filerO];
			_this.wormTimer = requestAnimationFrame(runWorm)
			function runWorm(){
				_this.wormTimer = requestAnimationFrame(runWorm)
				worm.scale.x = 1 + Math.sin(Grass.count) * 0.04; //动态气泡
	   			worm.scale.y = 1 + Math.cos(Grass.count) * 0.04;
	   			Grass.count += 0.1;
				if (Grass.state == 'none'){
					if (Grass.opcity <= 1) {
						Grass.opcity  -= 0.01;
						worm.filters = [new PIXI.filters.AlphaFilter(Grass.opcity)];
					}else{
						//Grass.state = "play";
					}
				}
			}
       	},
        clearWorm:function(){
        	var _this = this;
       		if (_this.worm){
		   		_this.worm.destroy()
		   		_this.worm = null;
		   	}
       		if (_this.wormTimer) {
				cancelAnimationFrame(_this.wormTimer);
				_this.wormTimer = null;
			}
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
					if (_type == 'pick') {
						var Sprite = new PIXI.Sprite.fromImage('../img/farmImg/icon_pick.png');
					}else{
						var Sprite = new PIXI.Sprite.fromImage('../img/farmImg/icon_steal.png');
						
					}
					
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
					_callBack.init(options.id,function(){
						Grass.state = 'none';
					})
					
				},
				filerO:function(){
					return new PIXI.filters.AlphaFilter(Grass.opcity);
				}
			};
			
			var pick = Grass.newGrass();
				pick.on('tap',Grass.click);
			_this.pick = pick;
			landContainer.addChild(pick);
			
			_this.pickTimer = requestAnimationFrame(runPick);
			function runPick(){
				_this.pickTimer = requestAnimationFrame(runPick);
				_this.pick.scale.x = 1 + Math.sin(Grass.count) * 0.04; //动态气泡
	   			_this.pick.scale.y = 1 + Math.cos(Grass.count) * 0.04;
	   			Grass.count += 0.1;
				if (Grass.state == 'none'){
					if (Grass.opcity <= 1) {
						Grass.opcity  -= 0.01;
						_this.pick.filters = [new PIXI.filters.AlphaFilter(Grass.opcity)];
					}else{
						Grass.state = "play";
					}
				}
			}
       },
       clearPick:function(){
       		var _this = this;
       		if (_this.pick){
		   		_this.pick.destroy()
		   		_this.pick = null;
		   	}
       		if (_this.pickTimer) {
				cancelAnimationFrame(_this.pickTimer);
				_this.pickTimer = null;
			}
       },
       creatWater:function(options){
	       	var _this = this;
			var app = _this.appCanves;
				//土地盒子
				landContainer = _this.landContainer;
				 //为纹理图集框架ID创建别名
				id = _this.imgs;
		
		   	if (_this.water){
		   		_this.water.destroy()
		   		_this.water = null;
		   	}
			// 水壶
			let Grass = {
				MaxRotation:13.3690,
				minRotation:0.1013,
				newGrass :function(){
					var Sprite = new PIXI.Sprite.fromImage('../img/farmImg/js2x.png');
					//Sprite.interactive = true;
					Sprite.buttonMode = true;
					Sprite.anchor.set(0.5,0.5);
					//42  ----- 1
					Sprite.rotation = Grass.MaxRotation;
					Sprite.x = w/2+120;
					Sprite.y = h-550;
					return Sprite;
				},
				state :"play",
				opcity:'1',
				count:0,
				filerO:function(){
					return new PIXI.filters.AlphaFilter(Grass.opcity);
				}
			};
			let water = Grass.newGrass();
				
			landContainer.addChild(water);
			
			_this.water = water;
			
			var Status = 1 ; //0是默认值  1是向下 2是向上
			var Count = 0;
			console.log(new Date())
			_this.waterTimer = requestAnimationFrame(runWater);
			function runWater(){
				_this.waterTimer = requestAnimationFrame(runWater);
				if (water.rotation > 13.3690) {
					water.rotation = 13.3690;
					Status = 1;
					Count += 1;
					if (Count == 2) {
						Status = 0;
						//Grass.state = 'none';
					}
				}else if (water.rotation >= 12.5000 && water.rotation <= 13.3690) {
					if (Status == 1) {
						water.rotation -= 0.01;
					}else if (Status == 2){
						water.rotation += 0.02;
					}else{
						
					}
				}else if(water.rotation < 12.5000){
					water.rotation = 12.5000;
					Status = 2
				}
				if (Grass.state == 'none'){
					if (Grass.opcity <= 1) {
						Grass.opcity  -= 0.05;
						water.filters = [new PIXI.filters.AlphaFilter(Grass.opcity)];
						console.log()
						if (Grass.opcity < 0) {
							console.log(new Date())
							Grass.state = 'null'
						}
					}else if (Grass.opcity == 0){
						//Grass.state = "play";
						console.log(new Date())
					}
				}
			}
       },
       clearWater:function(){
       		var _this = this;
       		if (_this.water){
		   		_this.water.destroy()
		   		_this.water = null;
		   	}
       		if (_this.waterTimer) {
				cancelAnimationFrame(_this.waterTimer);
				_this.waterTimer = null;
			}
       },
    }
	var maskView = function(){
		
	};
	maskView.prototype = {
		init:function(options){
			var _this = this;
				_this.className = options.className;
	    		_this.Dom = document.getElementsByClassName(options.className)[0];
	    		_this.dataModule = options.dataModule.data;
				_this.inTime = options.dataModule.inTime;
				_this.outTime = options.dataModule.outTime;
				
            let mask = new Application({ 
				    width: w, 
				    height: h, 
					//backgroundColor : 0x000000,
				    antialiasing: true, //抗锯齿
				    transparent: true,  //透明度
				    resolution: 1		//分辨率	
				});
			_this.Dom.appendChild(mask.view);
			let content = new Container();
			mask.stage.addChild(content);
			let clouds = {
				 newClouds:function(obj){
					 	let sprite = PIXI.Sprite.fromImage("../img/farmImg/yun.png");
					 	sprite.x= obj.x;
					 	sprite.y = obj.y;
					 	sprite.interactive = true;
					 	sprite.alpha = 1;
					 	return sprite;
				 }
			}
			/*if (_this.dataModule.length != 0) {
				for (var i in _this.dataModule) {
					_this[_this.dataModule[i].name] = clouds.newClouds(_this.dataModule[i].star);
					content.addChild(_this[_this.dataModule[i].name]);
					
				}
			}*/
			
			let cloud1 = clouds.newClouds(_this.dataModule[0].star); //右上
			content.addChild(cloud1);
			let cloud2 = clouds.newClouds(_this.dataModule[1].star); //右中
			content.addChild(cloud2);
			let cloud3 = clouds.newClouds(_this.dataModule[2].star);//右下
			content.addChild(cloud3);
			let cloud4 = clouds.newClouds(_this.dataModule[3].star); //左上
			content.addChild(cloud4);
			let cloud5 = clouds.newClouds(_this.dataModule[4].star);//左中
			content.addChild(cloud5);
			let cloud6 = clouds.newClouds(_this.dataModule[5].star); //下
			content.addChild(cloud6);
			let cloud7 = clouds.newClouds(_this.dataModule[6].star);//上
			content.addChild(cloud7);
			
			//$(_this.Dom).fadeIn(100,_this.showMove())
			
			
			_this.maskMove = click;
			function click(){
				$(_this.Dom).fadeIn(100,function(){
					Move(cloud1,_this.dataModule[0].end,_this.inTime,function(){
						Move(cloud1,_this.dataModule[0].star,_this.outTime)
					})
					Move(cloud2,_this.dataModule[1].end,_this.inTime,function(){
						Move(cloud2,_this.dataModule[1].star,_this.outTime)
					})
					Move(cloud3,_this.dataModule[2].end,_this.inTime,function(){
						Move(cloud3,_this.dataModule[2].star,_this.outTime)
					})
					Move(cloud4,_this.dataModule[3].end,_this.inTime,function(){
						Move(cloud4,_this.dataModule[3].star,_this.outTime)
					})
					Move(cloud5,_this.dataModule[4].end,_this.inTime,function(){
						Move(cloud5,_this.dataModule[4].star,_this.outTime)
					})
					Move(cloud6,_this.dataModule[5].end,_this.inTime,function(){
						Move(cloud6,_this.dataModule[5].star,_this.outTime)
					})
					Move(cloud7,_this.dataModule[6].end,_this.inTime,function(){
						Move(cloud7,_this.dataModule[6].star,_this.outTime,function(){
							$(_this.Dom).hide();
						})
					})
				});
				
				
			}
			function Move(obj,json,time,callback){
				
				clearInterval(obj.timer);
				var data = {"x":obj.x,
							"y":obj.y };
				var curr = {}
				var end = {};
					for( var attr in json){
						end[attr] = json[attr]
						curr[attr] = data[attr]
					}
					
				var sTime = new Date();//开始时间T0
				//开始变换了
				obj.timer = setInterval(function(){
				    var nTime = new Date();//当前时间Tt
				    //St = (Tt-T0)/Time*(S-S0)+S0
				    //(nTime-sTime)/time 比例最多为1
				    var prop = (nTime-sTime)/time; 
				    if(prop >=1){
				      prop = 1;
				      clearInterval(obj.timer);
				      callback && callback.call(obj);
				    }
				    for(var attr in json){
				      var s = prop*(end[attr]-curr[attr])+curr[attr];
				      obj[attr] = s;
			   		}
				},13)
			}
		},
		showMove:function(){
			var _this = this;
			console.log(_this)
			var obj = _this['clold1'];
			var objEnd = _this.dataModule[0].end;
			var objStar = _this.dataModule[0].star;
			var objInTime = _this.inTime;
			console.log(obj);
			console.log(objEnd);
			console.log(objInTime);
			$(_this.Dom).fadeIn(200,function(){
				/*if (_this.dataModule.length != 0) {
					for (var i in _this.dataModule) {
						
						
					}
				}*/
				Move(obj,objEnd,objInTime,function(){
					obj,objStar,objInTime
				})
			})
			
			
			
			//$(".canver_change_scene").fadeIn(100);
			/*Move(cloud1,{
				"x":90,
				"y":10
			},1500,function(){
				Move(cloud1,{
					"x":720,
					"y":-300
				},1000)
			})
			Move(cloud2,{
				"x":50,
				"y":160
			},1500,function(){
				Move(cloud2,{
					"x":720,
					"y":100
				},1000)
			})
			Move(cloud3,{
				"x":100,
				"y":360
			},1500,function(){
				Move(cloud3,{
					"x":600,
					"y":600
				},1000)
			})
			Move(cloud4,{
				"x":-700,
				"y":100
			},1500,function(){
				Move(cloud4,{
					"x":-900,
					"y":-100
				},1000)
			})
			Move(cloud5,{
				"x":-700,
				"y":400
			},1500,function(){
				Move(cloud5,{
					"x":-950,
					"y":400
				},1000)
			})
			Move(cloud6,{
				"x":-100,
				"y":690
			},1500,function(){
				Move(cloud6,{
					"x":-1100,
					"y":1100
				},1000)
			})
			Move(cloud7,{
				"x":-250,
				"y":-350
			},1500,function(){
				Move(cloud7,{
					"x":0,
					"y":-1000
				},1000)
			})*/
			function Move(obj,json,time,callback){
				clearInterval(obj.timer);
				var data = {"x":obj.x,
							"y":obj.y };
				var curr = {}
				var end = {};
					for( var attr in json){
						end[attr] = json[attr]
						curr[attr] = data[attr]
					}
					
				var sTime = new Date();//开始时间T0
				//开始变换了
				obj.timer = setInterval(function(){
				    var nTime = new Date();//当前时间Tt
				    //St = (Tt-T0)/Time*(S-S0)+S0
				    //(nTime-sTime)/time 比例最多为1
				    var prop = (nTime-sTime)/time; 
				    if(prop >=1){
				      prop = 1;
				      clearInterval(obj.timer);
				      callback && callback.call(obj);
				    }
				    for(var attr in json){
				      var s = prop*(end[attr]-curr[attr])+curr[attr];
				      obj[attr] = s;
			   		}
				},13)
			}
		},
		move:function(obj,json,time,callback){
			console.log(obj)
			clearInterval(obj.timer);
			var data = {"x":obj.x,
						"y":obj.y };
			var curr = {}
			var end = {};
				for( var attr in json){
					end[attr] = json[attr]
					curr[attr] = data[attr]
				}
				
			var sTime = new Date();//开始时间T0
			//开始变换了
			obj.timer = setInterval(function(){
			    var nTime = new Date();//当前时间Tt
			    //St = (Tt-T0)/Time*(S-S0)+S0
			    //(nTime-sTime)/time 比例最多为1
			    var prop = (nTime-sTime)/time; 
			    if(prop >=1){
			      prop = 1;
			      clearInterval(obj.timer);
			      callback && callback.call(obj);
			    }
			    for(var attr in json){
			      var s = prop*(end[attr]-curr[attr])+curr[attr];
			      obj[attr] = s;
		   		}
			},13)
		}
	}
	// 命名空间
   	var farmCanves = {
   		mainView:new mainView(),
   		maskView:new maskView(),
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