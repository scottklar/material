   function formatVertex(x,y){return columns[x]+(19-y).toString()}
   function pairVertexToBoardVertex(y,x){return columns[x]+(y+1).toString()}
   function boardVertexToPairVertex(v){return{y:parseInt(v.substr(1),10)-1,x:columns.indexOf(v[0].toLowerCase())}}
   function inverseRotationSequence(index){return{"-1":[-1],0:[0],1:[1],2:[2],3:[3],4:[2,6],5:[6],6:[5],7:[7]}[index]}
   function applyTransforms(v,transforms){for(var i=0;i<transforms.length;i++)v=applyTransform(v,transforms[i]);return v}
   function applyTransform(v,index){if(-1===index||3===index)return v;var transform=[[-1,0,18,0,-1,18],[-1,0,18,0,1,0],[1,0,0,0,-1,18],[1,0,0,0,1,0],[0,-1,18,-1,0,18],[0,-1,18,1,0,0],[0,1,0,-1,0,18],[0,1,0,1,0,0]][index],point=boardVertexToPairVertex(v);return pairVertexToBoardVertex(transform[0]*point.y+transform[1]*point.x+transform[2],transform[3]*point.y+transform[4]*point.x+transform[5])}



   function parseComment(comment)
   {
       var vals=comment.split("\n"),
       dict={deputy:"",value:0,ag_moves:""};
       return dict.value=parseFloat(vals[0]),
       vals[1].length>1&&"d "===vals[1].slice(0,2)?(dict.transform=parseInt(vals[1].slice(2,4),10),
       dict.deputy=vals[1].slice(4).trim()):dict.ag_moves=vals[1].trim(),
       dict
    }



   function moveFromNode(kifuNode){return kifuNode.move?{color:bwColor(kifuNode.move.c),move:moveString(kifuNode.move)}:{color:"b",move:"pass"}}
   function moveString(move){return formatVertex(move.x,move.y)}
   function moveXY(moveString){var cChar=moveString.substring(0,1),cCharCode=parseInt(cChar.charCodeAt(0),10);return{x:cCharCode-97+(cCharCode-104<=0?0:-1),y:19-parseInt(moveString.substring(1),10)}}
   function canonicalColor(color){if(["b","black","#000","1",1].indexOf(color)>=0)return{name:"b",numeric:1,css:"#000",font:"#ddd",opp:"w"};if(["w","white","#fff","-1",-1].indexOf(color)>=0)return{name:"w",numeric:-1,css:"#fff",font:"#222",opp:"b"};throw"Unexpected color as input: "+color}
   function opponentColor(bw){return canonicalColor(bw).opp}
   function bwColor(bw){return canonicalColor(bw).name}
   function numericColor(bw){return canonicalColor(bw).numeric}
   function cssColor(bw){return canonicalColor(bw).css}
   function fontColor(bw){return canonicalColor(bw).font}
   function kifuChildIndex(node,x,y,pass){return pass=void 0!==pass&&pass,node.children.findIndex(function(c){return void 0!==c.move&&(c.move.x==x&&c.move.y==y||pass&&c.move.pass)})}
   function treeChildIndex(node,move){return node.getChildren().findIndex(function(c){return c.getValue()===move})}


   function StateKeeper(player,kifuManager,searchTreeManager)
   {
       this.player=player,
       this.kifuManager=kifuManager,
       kifuManager.setStateKeeper(this),
       this.searchTreeManager=searchTreeManager,
       searchTreeManager.setStateKeeper(this),
       this.changed=!1,
       this.currentBranch=[],
       this.currentKifuNode=null,
       this.currentMoveNumber=null,
       this.currentRequestId=0,
       this.valueChart=null,
       this.root=new TreeNode("•"),
       this.currentTreeNode=this.root,
       this.root.color="#cbf",
       this.root.setIndex([0,0]),
       this.root.upperLeft="mix",
       this.root.upperRight="rollout",
       this.root.lowerRight="vnet"
    }


   function TreeNode(value){this.value=value,this.parent=null,this.children=[],this.index=null}


   function SearchTreeManager(){}


   function KifuManager(){this.lastX=null,this.lastY=null,this.lastMark=null,this.marks=[],this.overlayMarks=[],this.stateKeeper=null}


   function makeStateKeeper(sgf,kifuManager,searchTreeManager){var player=createNewPlayer(sgf),keeper=new StateKeeper(player,kifuManager,searchTreeManager);return player.addEventListener("update",kifuManager.updateFromBoard),player.setCoordinates(!0),addSvgIcons(),keeper}
   
   function addSvgIcons(){var button=document.querySelector(".wgo-button-first");button.innerHTML=getSvgIcon("last"),(button=document.querySelector(".wgo-button-last")).innerHTML=getSvgIcon("last"),(button=document.querySelector(".wgo-button-multiprev")).innerHTML=getSvgIcon("skip"),(button=document.querySelector(".wgo-button-multinext")).innerHTML=getSvgIcon("skip"),(button=document.querySelector(".wgo-button-previous")).innerHTML=getSvgIcon("next"),(button=document.querySelector(".wgo-button-next")).innerHTML=getSvgIcon("next")}
   function getSvgIcon(id){return'<span class="o-icon"><svg><use xlink:href="#'+id+'"></use></svg></span>'}
   function kifuLoaded(){stateKeeper.init();var moveNumbers=document.querySelector(".js-move-numbers");moveNumbers.addEventListener("click",function(e){moveNumbers.classList.contains("is-active")?(stateKeeper.getKifuManager().removeMoveNumbers(),moveNumbers.classList.remove("is-active")):(stateKeeper.getKifuManager().addMoveNumbers(),moveNumbers.classList.add("is-active"))}),stateKeeper.getPlayer().addEventListener("update",function(e){moveNumbers.classList.contains("is-active")&&moveNumbers.classList.remove("is-active")}),initPermalink();document.querySelector(".js-player").classList.add("is-loaded")}
   
   function createNewPlayer(sgf)
    {var elem=document.getElementById("player");
    return initBoard(),
        new WGo.BasicPlayer(elem,{sgfFile:sgf,kifuLoaded:kifuLoaded,enableWheel:!1,layout:{bottom:["Control"]},board:{font:"'Arial', 'Helvetica', 'calibri'",background:"dist/img/board-background.jpg",whiteStoneGraphic:[],blackStoneGraphic:[],stoneHandler:WGo.Board.drawHandlers.GLOW,theme:{shadowColor:"rgba(0, 0, 0, 0.35)",shadowTransparentColor:"rgba(27, 27, 27, 0.1)",shadowBlur:function(board){return.1*board.stoneRadius},shadowSize:1,markupBlackColor:"#fff",markupWhiteColor:"#1b1b1b",markupNoneColor:"rgba(0,0,0,0.7)",markupLinesWidth:function(board){return board.stoneRadius/6},gridLinesWidth:function(board){return board.stoneRadius/15},gridLinesColor:"rgba(27, 27, 27, 0.6)",gridLinesInnerColor:"rgba(27, 27, 27, 0.4)",starColor:"#1b1b1b",starSize:function(board){return board.stoneRadius/10+.75},stoneSize:function(board){return Math.min(board.fieldWidth,board.fieldHeight)/2},coordinatesColor:"#1b1b1b",variationColor:"rgba(0,32,128,0.8)",font:"'Arial', 'Helvetica', 'calibri'",linesShift:.25}}})
    }

   function initBoard()
    {var theme_variable=function(key,board){return"function"==typeof board.theme[key]?board.theme[key](board):board.theme[key]},get_markup_color=function(board,x,y){return board.obj_arr[x][y][0].c==WGo.B?theme_variable("markupBlackColor",board):board.obj_arr[x][y][0].c==WGo.W?theme_variable("markupWhiteColor",board):theme_variable("markupNoneColor",board)};
    
    WGo.Board.drawHandlers.LB.stone.draw=function(args,board){var xr=board.getX(args.x),yr=board.getY(args.y),sr=board.stoneRadius,font=args.font||"arial narrow";this.fillStyle=args.c||get_markup_color(board,args.x,args.y),args.smallText?args.text.length<4?this.font=Math.round(sr)+"px "+font:4===args.text.length?this.font=Math.round(.8*sr)+"px "+font:this.font=Math.round(.7*sr)+"px "+this.font:1===args.text.length?this.font=Math.round(1.2*sr)+"px "+font:2===args.text.length?this.font=Math.round(1.2*sr)+"px "+font:this.font=Math.round(sr)+"px "+font,this.font="bold "+this.font,this.beginPath(),this.textBaseline="middle",this.textAlign="center",this.fillText(args.text,xr,yr,2*sr)},
    
    WGo.Board.drawHandlers.GLOW.stone.draw=function(args,board){var xr=board.getX(args.x),yr=board.getY(args.y),sr=board.stoneRadius,lw=theme_variable("markupLinesWidth",board)||1,radgrad=this.createLinearGradient(xr,yr,xr,yr+sr);args.c==WGo.W?(radgrad.addColorStop(0,"#fff"),radgrad.addColorStop(1,"#ddd")):(radgrad.addColorStop(0,"#3d3d3d"),radgrad.addColorStop(1,"#1b1b1b")),this.beginPath(),this.fillStyle=radgrad,this.arc(xr-board.ls,yr-board.ls,Math.max(0,sr-lw),0,2*Math.PI,!0),this.fill(),this.lineWidth=lw,this.strokeStyle="#1b1b1b",this.stroke()},
    
    WGo.Board.drawHandlers.GLOW.shadow.draw=function(args,board){var xr=board.getX(args.x),yr=board.getY(args.y),sr=board.stoneRadius,lw=theme_variable("markupLinesWidth",board)||1;this.beginPath();var blur=theme_variable("shadowBlur",board),radius=Math.max(0,sr),gradient=this.createRadialGradient(xr,yr,0,xr,yr,radius+blur);gradient.addColorStop(0,theme_variable("shadowColor",board)),gradient.addColorStop(1,theme_variable("shadowTransparentColor",board)),this.fillStyle=gradient,this.arc(xr-board.ls-lw+1,yr-board.ls+lw/2,radius,0,2*Math.PI,!0),this.fill()},
    
    WGo.Board.drawHandlers.CR.stone.draw=function(args,board){var xr=board.getX(args.x),yr=board.getY(args.y),sr=board.stoneRadius;this.strokeStyle=args.c||get_markup_color(board,args.x,args.y),this.lineWidth=args.lineWidth||theme_variable("markupLinesWidth",board)||1,this.beginPath(),this.arc(xr-board.ls,yr-board.ls,sr/3,0,2*Math.PI,!0),this.stroke()},
    
    WGo.Board.GridLayer.prototype.draw=function(board){var tmp;this.context.beginPath(),this.context.lineWidth=theme_variable("gridLinesWidth",board),this.context.strokeStyle=theme_variable("gridLinesColor",board);var tx=Math.round(board.left),ty=Math.round(board.top),bw=Math.round(board.fieldWidth*(board.size-1)),bh=Math.round(board.fieldHeight*(board.size-1));this.context.strokeRect(tx-board.ls,ty-board.ls,bw,bh),this.context.strokeStyle=theme_variable("gridLinesInnerColor",board);for(var i=1;i<board.size-1;i++)tmp=Math.round(board.getX(i))-board.ls,this.context.moveTo(tmp,ty),this.context.lineTo(tmp,ty+bh),tmp=Math.round(board.getY(i))-board.ls,this.context.moveTo(tx,tmp),this.context.lineTo(tx+bw,tmp);if(this.context.stroke(),this.context.fillStyle=theme_variable("starColor",board),board.starPoints[board.size])for(var key in board.starPoints[board.size])this.context.beginPath(),this.context.arc(board.getX(board.starPoints[board.size][key].x)-board.ls,board.getY(board.starPoints[board.size][key].y)-board.ls,theme_variable("starSize",board),0,2*Math.PI,!0),this.context.fill()},
    
    WGo.Board.coordinates.grid.draw=function(args,board){var ch,t,xright,xleft,ytop,ybottom;this.fillStyle=theme_variable("coordinatesColor",board),this.textBaseline="middle",this.textAlign="center",window.devicePixelRatio&&window.devicePixelRatio>1?this.font="bold 28px "+(board.font||""):this.font="bold 20px "+(board.font||""),xright=board.getX(-.65),xleft=board.getX(board.size-.35),ytop=board.getY(-.65),ybottom=board.getY(board.size-.35);for(var i=0;i<board.size;i++)(ch=i+"A".charCodeAt(0))>="I".charCodeAt(0)&&ch++,t=board.getY(i),this.fillText(board.size-i,xright,t),this.fillText(board.size-i,xleft,t),t=board.getX(i),this.fillText(String.fromCharCode(ch),t,ytop),this.fillText(String.fromCharCode(ch),t,ybottom);this.fillStyle="#1b1b1b"}}

   
   function initPermalink(){var permalink={active:!0,query:{}},handleHash=function(){if(""!==window.location.hash&&permalink.active)try{permalink.query=JSON.parse('{"'+window.location.hash.substr(1).replace("=",'":')+"}"),goTo()}catch(e){permalink.query={}}},goTo=function(){void 0!==permalink.query.player&&void 0!==permalink.query.player.goto&&(stateKeeper.getPlayer().kifuReader.goTo(permalink.query.player.goto),stateKeeper.getPlayer().update())};window.addEventListener("hashchange",function(){handleHash()}),handleHash()}


   
   function makeTeacher(sgf)
   {var kifuManager=new KifuManager,searchTreeManager=new SearchTreeManager;
    stateKeeper=makeStateKeeper(sgf,kifuManager,searchTreeManager)}

   Array.prototype.find||Object.defineProperty(Array.prototype,"find",{value:function(predicate){if(null==this)throw new TypeError('"this" is null or not defined');
   var o=Object(this),len=o.length>>>0;
   if("function"!=typeof predicate)throw new TypeError("predicate must be a function");
   for(var thisArg=arguments[1],k=0;k<len;)
   {var kValue=o[k];if(predicate.call(thisArg,kValue,k,o))return kValue;k++}}}),
   
   Array.prototype.findIndex||Object.defineProperty(Array.prototype,"findIndex",{value:function(predicate){if(null==this)throw new TypeError('"this" is null or not defined');
   var o=Object(this),len=o.length>>>0;
   if("function"!=typeof predicate)
   throw new TypeError("predicate must be a function");
   for(var thisArg=arguments[1],k=0;k<len;)
   {var kValue=o[k];if(predicate.call(thisArg,kValue,k,o))return k;k++}return-1}});

   var columns="abcdefghjklmnopqrst",syncing=!1;

   StateKeeper.prototype.init=function(){this.buildTreeFromKifu(),this.player.last(),this.setToKifuNode(this.player.kifuReader.node),this.updateCurrentBranch(),stateKeeper.setToTreeNode(stateKeeper.getRoot()),this.refresh()},
   StateKeeper.prototype.getPlayer=function(){return this.player},
   StateKeeper.prototype.getKifuManager=function(){return this.kifuManager},
   StateKeeper.prototype.getSearchTreeManager=function(){return this.searchTreeManager},
   StateKeeper.prototype.getRoot=function(){return this.root},
   StateKeeper.prototype.getCurrentBranch=function(){return this.currentBranch},
   StateKeeper.prototype.getCurrentTreeNode=function(){return this.currentTreeNode},
   StateKeeper.prototype.triggerChange=function(){this.changed=!0},
   StateKeeper.prototype.setToKifuNode=function(kifuNode){if(null===kifuNode)throw"Cannot set kifuNode to null";this.currentKifuNode=kifuNode,this.syncToKifu(!0)},
   StateKeeper.prototype.setToTreeNode=function(treeNode,replace,updateBranch){if(replace=void 0===replace||replace,updateBranch=void 0===updateBranch||updateBranch,!syncing){if(null===treeNode)throw"Cannot set treeNode to null";this.currentTreeNode=treeNode,this.syncToTree(replace,updateBranch)}},

   StateKeeper.prototype.setToMoveNumber=function(moveNumber){moveNumber<0||moveNumber>=this.currentBranch.length||(this.currentMoveNumber=moveNumber,this.syncToSlider())},

   StateKeeper.prototype.kifuMovesFromTreeNode=function(treeNode){if(null===treeNode)return[];for(var moves=[];treeNode.hasParent();)moves.unshift({move:treeNode.getValue(),color:treeNode.color}),treeNode=treeNode.getParent()||this.root;return moves},

   StateKeeper.prototype.kifuNodeFromTreeNode=function(treeNode){var moves=this.kifuMovesFromTreeNode(treeNode);if(null===moves)return null;for(var kifuNode=this.player.kifu.root;moves.length>0;){var move=moves.shift(),xy=moveXY(move.move),childIndex=kifuChildIndex(kifuNode,xy.x,xy.y,"pass"===move.move);if(childIndex<0)return null;kifuNode=kifuNode.children[childIndex]}return kifuNode},

   StateKeeper.prototype.treeNodeFromKifuNode=function(kifuNode){if(null===kifuNode)throw"kifuNode is null";
    for(var moves=[];null!=kifuNode.parent;)moves.unshift(kifuNode.move),kifuNode=kifuNode.parent;
    for(var treeNode=this.root;moves.length>0;){var move=moves.shift();
    if(null!=move){var value=move.pass?"pass":moveString(move),color=bwColor(move.c),child=treeNode.getChildren().find(function(c){return value===c.getValue()&&color===bwColor(c.color)});
    if(void 0===child)return null;treeNode=child}}return treeNode},
            
    StateKeeper.prototype.refresh=function(options){(options=void 0===options||null===options?{replace:!1,force:!1,refreshOverlay:!1}:options).force&&(syncing=!0,options.replace&&this.update(),options.refreshOverlay&&this.refreshOverlay(),this.syncToTree(!1,!1),syncing=!1)},

    StateKeeper.prototype.refreshIfChanged=function(){},
    
    StateKeeper.prototype.refreshOverlay=function(){var value=document.querySelector("[name=overlay-opt]:checked");value=value?value.getAttribute("value"):"",this.kifuManager.clearOverlayMarks(),null!==value&&value.length>0&&"none"!==value&&this.kifuManager.addOverlayMarksForChildren(this.currentTreeNode,value)},
    
    StateKeeper.prototype.lastNode=function(){if(null===this.currentBranch)return null;
    var branch=this.currentBranch;
    return branch[branch.length-1]},
                
    StateKeeper.prototype.updateSlider=function(replace){},
    
    StateKeeper.prototype.updateCurrentBranch=function(){this.currentBranch=this.searchTreeManager.getMainBranch(this.currentTreeNode).branch},
    
    StateKeeper.prototype.update=function(){},
    
    StateKeeper.prototype.sync=function(){syncing=!0,this.refreshOverlay(),this.update(),syncing=!1},
    
    StateKeeper.prototype.syncToSlider=function(){this.setToTreeNode(this.currentBranch[this.currentMoveNumber],!1,!1)},
    
    StateKeeper.prototype.addDeputyChildrenIfPresent=function(treeNode,kifuNode){var lastDeputy="",transforms=[],extension=[],trackingNode=treeNode;
    if(!(treeNode.children.length>0)){for(;null!=trackingNode.getParent();)void 0!=trackingNode.properties&&""!==trackingNode.properties.deputy&&(""===lastDeputy&&(lastDeputy=trackingNode.properties.deputy),transforms.unshift(trackingNode.properties.transform)),""===lastDeputy&&extension.unshift(trackingNode.value),trackingNode=trackingNode.getParent();
    if(""!==lastDeputy){var move,i,j,deputyNode=this.root,moves=lastDeputy.split(" ");
    for(i=0;i<extension.length;i++)move=extension[i],moves.push(applyTransforms(move,transforms));
    for(i=0;i<moves.length;i++){var child,success=!1;
    for(move=moves[i],j=0;j<deputyNode.getChildren().length;j++)if((child=deputyNode.getChildren()[j]).value==move){deputyNode=child,success=!0;break}if(!success)return}
    for(transforms.reverse(),i=0;i<deputyNode.getChildren().length;i++){var transform,inversion,k,inverseTransforms=[];for(child=deputyNode.getChildren()[i],j=0;j<transforms.length;j++){var inversions=inverseRotationSequence((transform=transforms[j]).toString());for(k=0;k<inversions.length;k++)inversion=inversions[k],inverseTransforms.push(inversion)}var invertedMove={move:applyTransforms(child.value,inverseTransforms),color:bwColor(child.color)},dep=this.searchTreeManager.ensureMoveInTree(treeNode,invertedMove);dep.properties=child.properties,child.isAGMove&&(dep.isAGMove=!0),this.searchTreeManager.ensureMoveInKifu(kifuNode,invertedMove)}}}},
                
    StateKeeper.prototype.syncToKifu=function(){if(null===this.currentKifuNode)this.currentKifuNode=this.player.kifuReader.node;else{var treeNode=this.treeNodeFromKifuNode(this.currentKifuNode);null===treeNode||(0===treeNode.children.length&&this.addDeputyChildrenIfPresent(treeNode,this.currentKifuNode),this.setToTreeNode(treeNode,!0,!0))}},
                
    StateKeeper.prototype.syncToTree=function(replace,updateBranch){replace=void 0!==replace&&replace,updateBranch=void 0!==updateBranch&&updateBranch,syncing=!0;
    var moves=this.kifuMovesFromTreeNode(this.currentTreeNode),needsUpdate=!0;
    if(this.currentTreeNode!=this.root&&null!=this.currentTreeNode.getValue()){var currentXY=moveXY(this.currentTreeNode.getValue());
    null!=this.player.kifuReader.node&&null!=this.player.kifuReader.node.move&&currentXY.x===this.player.kifuReader.node.move.x&&currentXY.y===this.player.kifuReader.node.move.y&&(needsUpdate=!1)}if(needsUpdate){var move,i,kifuNode=this.player.kifu.root;
    for(this.player.goTo(0),i=0;i<moves.length;i++){var xy=moveXY((move=moves[i]).move),childIndex=kifuChildIndex(kifuNode,xy.x,xy.y,"pass"===move.move);
    kifuNode=kifuNode.children[childIndex],this.player.next(childIndex)}this.currentKifuNode=this.player.kifuReader.node}updateBranch&&this.updateCurrentBranch(),this.sync(replace),syncing=!1},
                            
    StateKeeper.prototype.buildTreeFromKifu=function()
    {
        var moveTreeMinusRoot=this.player.kifu.toJGO().game.slice(1);
        this.addNodes(this.root,this.player.kifu.root,moveTreeMinusRoot),
        this.addAGNodes(this.root,this.player.kifu.root),
        this.addRanks(this.root),this.setToKifuNode(this.player.kifuReader.node),
        this.refresh()
    },
                            


    StateKeeper.prototype.addRanks = function(treeNode) {
        var child, i, values = [];
        for (i = 0; i < treeNode.getChildren().length; i++)(child = treeNode.getChildren()[i]).isAGMove || values.push(child.properties.value);
        for (values.sort(), "#000" !== treeNode.color && values.reverse(), i = 0; i < treeNode.getChildren().length; i++)(child = treeNode.getChildren()[i])
            .isAGMove ? child.properties.rank = 1 : child.properties.rank = values.indexOf(child.properties.value) + 2;
        for (i = 0; i < treeNode.getChildren().length; i++) child = treeNode.getChildren()[i], this.addRanks(child)
    },

                            
    StateKeeper.prototype.addAGNodes=function(treeNode,kifuNode)
    {var i,m,child;
    if(null!=treeNode.properties&&"ag_moves"in treeNode.properties&&treeNode.properties.ag_moves.length>0)
        {var moves=treeNode.properties.ag_moves.split(" "),c=treeNode===this.root?"b":opponentColor(treeNode.color);
        for(i=0;i<moves.length;i++)
        {var move={move:m=moves[i],color:c};this.searchTreeManager.ensureMoveInTree(treeNode,move).isAGMove=!0,this.searchTreeManager.ensureMoveInKifu(kifuNode,move).isAGMove=!0}}
        for(i=0;i<treeNode.getChildren().length;i++)
        {var xy=moveXY((child=treeNode.getChildren()[i]).value);this.addAGNodes(child,kifuNode.children[kifuChildIndex(kifuNode,xy.x,xy.y)])}
    },
 
 
    
    StateKeeper.prototype.addNodes=function(treeNode,kifuNode,moveTree)
    {null==treeNode.properties&&(treeNode.properties=kifuNode.properties=parseComment(kifuNode.comment));
        for(var allNodes=[],i=0;i<moveTree.length;i++)
        {var m=moveTree[i];
            if(m instanceof Array)
            {for(var j=0;j<m.length;j++)this.addNodes(treeNode,kifuNode,m[j]);return}
            var move=moveFromNode(m);
            treeNode=this.searchTreeManager.ensureMoveInTree(treeNode,move),
            kifuNode=this.searchTreeManager.ensureMoveInKifu(kifuNode,move),
            treeNode.properties=kifuNode.properties=parseComment(kifuNode.comment),
            allNodes.push(treeNode)}},

    
    TreeNode.prototype.getValue=function(){return this.value},
    TreeNode.prototype.setValue=function(value){this.value=value},
    TreeNode.prototype.isRoot=function(){return null===this.getParent()},
    TreeNode.prototype.isLeaf=function(){return 0===this.nChildren()},
    TreeNode.prototype.getIndex=function(){return this.index||[0,0]},
    TreeNode.prototype.setIndex=function(index){if(!(index instanceof Array))throw"Index must be an array";this.index=index},
    TreeNode.prototype.setParent=function(parent){if(this.hasParent())for(var children=this.getParent().getChildren(),i=0;i<children.length;i++)children[i]===this&&this.getParent().removeChild(i);this.parent=parent},
    TreeNode.prototype.hasParent=function(){return null!==this.parent},
    TreeNode.prototype.getParent=function(){return this.parent},
    TreeNode.prototype.nChildren=function(){return this.children.length},
    TreeNode.prototype.getChild=function(index){if(index<0||index>this.nChildren())throw"getChild index out of bounds.";return this.children[index]},
    TreeNode.prototype.getChildren=function(){return this.children},
    TreeNode.prototype.setChild=function(index,node){if(index<0||index>this.children.length)throw"setChild index out of bounds.";index<this.nChildren()&&this.removeChild(index),this.addChild(index,node)},
    TreeNode.prototype.addChild=function(index,node){if(this===node)throw"Cannot set a node as its own child.";if(index<0||index>this.nChildren())throw"addChild index out of bounds.";node.setParent(this),this.children.splice(index,0,node)},
    TreeNode.prototype.removeChild=function(index){if(index<0||index>=this.nChildren())throw"removeChild index out of bounds.";this.children[index].parent=null,this.children.splice(index,1)},TreeNode.prototype.removeChildEqualTo=function(node){for(var index=0;index<this.nChildren();index++)this.children[index]===node&&this.removeChild(index)},
    TreeNode.prototype.removeChildren=function(){for(var i=this.nChildren()-1;i>=0;i--)this.removeChild(i)},

                            
    SearchTreeManager.prototype.setStateKeeper=function(stateKeeper){this.stateKeeper=stateKeeper},SearchTreeManager.prototype.getMainBranch=function(treeNode){if(null===treeNode)return[];for(var branch=[],current=treeNode;current.hasParent();)current=current.getParent(),branch.unshift(current);var depth=branch.length;for(branch.push(treeNode);treeNode.nChildren()>0;)treeNode=treeNode.getChild(0),branch.push(treeNode);return{branch:branch,depth:depth}},
    SearchTreeManager.prototype.ensureMoveInTree=function(treeNode,move){var existingChildIndex=treeChildIndex(treeNode,move.move);if(-1!==existingChildIndex)return treeNode.getChild(existingChildIndex);var next=new TreeNode(move.move);return next.color=cssColor(move.color),next.fontColor=fontColor(move.color),treeNode.addChild(treeNode.nChildren(),next),next.setIndex([treeNode.getIndex()[0]+treeNode.nChildren()-1,100+treeNode.getIndex()[1]]),next},
    SearchTreeManager.prototype.ensureMoveInKifu=function(kifuNode,move){var xy=moveXY(move.move),childIndex=kifuChildIndex(kifuNode,xy.x,xy.y,"pass"===move.move);if(-1===childIndex){var moveObj="pass"===move.move?{pass:!0,c:numericColor(move.color)}:{x:xy.x,y:xy.y,c:numericColor(move.color)};kifuNode.appendChild(new WGo.KNode({move:moveObj,_edited:!0})),childIndex=kifuChildIndex(kifuNode,xy.x,xy.y,"pass"===move.move)}return kifuNode.children[childIndex]},



    KifuManager.prototype.setStateKeeper=function(stateKeeper){this.stateKeeper=stateKeeper},KifuManager.prototype.addMark=function(vertex,color,isOverlay,isAGMove){isOverlay=void 0!==isOverlay&&isOverlay;var mark={type:this.makeDrawHandler(color),x:vertex.x,y:vertex.y,agMove:isAGMove};isOverlay?this.overlayMarks.push(mark):this.marks.push(mark),this.stateKeeper.getPlayer().board.addObject(mark)},
    
    KifuManager.prototype.addMoveNumbers=function(){for(var seq=[],node=stateKeeper.currentKifuNode.parent;null!==node&&null!==node.parent;)seq.push(node.move),node=node.parent;if(0!==seq.length){seq.reverse();var j,move,i=1;for(j=0;j<seq.length;j++)move=seq[j],this.addLabel(move,""+i++,cssColor(opponentColor(move.c)))}},

    KifuManager.prototype.addLabel=function(vertex,text,color,isOverlay){color=void 0!==color?color:"black",isOverlay=void 0!==isOverlay&&isOverlay;var board=this.stateKeeper.getPlayer().board,mark={type:"LB",x:vertex.x,y:vertex.y,text:text,c:color};isOverlay?(mark.smallText=!0,this.overlayMarks.push(mark)):this.marks.push(mark),board.addObject(mark)},

    KifuManager.prototype.removeMoveNumbers=function(){this.clearMarks()},

    KifuManager.prototype.formatValue=function(value,scale){return Math.abs(value*scale)<.01?"0":(value*=scale)>1e4?(value/1e3).toFixed(0)+"k":value>1e3?(value/1e3).toFixed(1)+"k":value<1?(100*value).toFixed(1).toString():value.toFixed(1).toString()},

    KifuManager.prototype.makeDrawHandler=function(color){return{stone:{draw:function(args,board){var xr=board.getX(args.x),yr=board.getY(args.y),isAGMove=void 0!==args.agMove&&args.agMove,sr=board.stoneRadius;if("#"===color[0]){var r=parseInt(color.substr(1,2),16),g=parseInt(color.substr(3,2),16),b=parseInt(color.substr(5,2),16);color=r>0?"rgba(255,0,0,"+r/255+")":g>0?"rgba(0,255,0,"+g/255+")":"rgba(0,0,255,"+b/255+")"}this.strokeStyle=color,this.lineWidth=args.lineWidth||board.theme.markupLinesWidth(board)||1,isAGMove&&this.setLineDash([6,2]),this.beginPath(),this.arc(xr-board.ls,yr-board.ls,.9*sr,0,2*Math.PI,!0),this.stroke(),this.setLineDash([])}}}},
                            
    KifuManager.prototype.addOverlayMark=function(node,stat,scale,maxValue,threshold){var vertex=moveXY(node.getValue());if(null!=node.properties&&null!=node.properties[stat]){var value=node.properties[stat],color="rgba(108, 91, 197,"+value/maxValue+")",isAGMove=void 0!=node.isAGMove&&node.isAGMove;isAGMove&&(color="rgba(0, 167, 173,"+value/maxValue+")");var fmtValue="rank"===stat?""+value:this.formatValue(value,scale);this.addMark(vertex,color,!0,isAGMove),this.addLabel(vertex,fmtValue,"black",!0)}},
    
    
    KifuManager.prototype.addOverlayMarksForChildren=function(node,stat){var i,child,maxValue=1;
        if("occurrences"===stat)for(i=0;i<node.getChildren().length;i++)void 0!=(child=node.getChildren()[i]).properties&&void 0!=child.properties[stat]&&(maxValue=Math.max(maxValue,parseFloat(child.properties[stat])));
        for(this.clearMarks(),this.clearOverlayMarks(),i=0;i<node.getChildren().length;i++)child=node.getChildren()[i],this.addOverlayMark(child,stat,1,maxValue,0);
        this.stateKeeper.getPlayer().board.redraw()},
        
    KifuManager.prototype.clearOverlayMarks=function(){var i,mark,stateKeeper=this.stateKeeper,overlayMarks=this.overlayMarks;
            for(i=0;i<overlayMarks.length;i++)mark=overlayMarks[i],stateKeeper.getPlayer().board.removeObject(mark);
            this.overlayMarks=[]},
            
    KifuManager.prototype.clearMarks=function(){var i,mark,stateKeeper=this.stateKeeper,marks=this.marks;
                for(i=0;i<marks.length;i++)mark=marks[i],stateKeeper.getPlayer().board.removeObject(mark);
                this.marks=[]},
                
    KifuManager.prototype.updateFromBoard=function(){if(!syncing){var this_obj=stateKeeper.getKifuManager();this_obj.clearMarks(),this_obj.clearOverlayMarks(),this_obj.stateKeeper.setToKifuNode(this_obj.stateKeeper.getPlayer().kifuReader.node)}},
    
    KifuManager.prototype.formatMove=function(move){return formatVertex(move.x,move.y)};var stateKeeper=null;
 
    
   !function()
   {
    var $html=document.body.parentNode;
    !function(fn)
    {if("function"==typeof fn)"complete"===document.readyState?fn():document.addEventListener("DOMContentLoaded",fn,!1)}
        (function()
            {for(var options=document.querySelectorAll("input[name=overlay-opt]"),i=0;i<options.length;i++)
            options[i].onchange=function(e)
            {var target=e.target;"none"===target.value?(stateKeeper.getKifuManager().clearOverlayMarks(),stateKeeper.refresh({force:!0})):null!==stateKeeper.getCurrentTreeNode()&&(stateKeeper.getKifuManager().addOverlayMarksForChildren(stateKeeper.getCurrentTreeNode(),target.value),stateKeeper.refresh({force:!0}))};

   var $banner=document.querySelector(".js-banner");
   $banner.querySelector(".js-banner-toggle").addEventListener("click",function(e){return $banner.classList.contains("is-open")?$banner.classList.remove("is-open"):$banner.classList.add("is-open")});
   var $nav=document.querySelector(".js-nav");
   $nav.querySelector(".js-nav-burger").addEventListener("click",function(e){$nav.classList.contains("is-open")?($html.classList.remove("u-no-scroll"),$nav.classList.remove("is-open")):($html.classList.add("u-no-scroll"),$nav.classList.add("is-open"))}),window.addEventListener("mousewheel DOMMouseScroll",function(e){e.ctrlKey&&e.preventDefault()}),
   makeTeacher("AlphaGo%20Teach%20%20Discover%20new%20and%20creative%20ways%20of%20playing%20Go_files/book.sgf")})}();