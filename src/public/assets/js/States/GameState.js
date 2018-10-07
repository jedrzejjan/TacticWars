var STATE = {
  PLAY: 0,
  MOVETROOP: 1,
  SHOWATTACKRANGE: 2,
  SELECTACTION: 3,
  FACTORYCHOICE: 4,
  ANIMATION: 5,
  VICTORY: 6,
  TROOPINFO: 7
};

class GameState extends Phaser.State {

  init(moneyPerBuilding = 800, mapNumber = 0, players_ids = null) {
    this.mapKey = 'map_' + mapNumber.toString();
    this.moneyPerBuilding = moneyPerBuilding;
    this.players_ids = players_ids;
  }

  preload() {

  }

  create() {
    if(socket != null){
      socket.emit('gameStateInit');
    }
    //Blocks right click
    this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
    //Renders the tilemap
    this.map = this.game.add.tilemap(this.mapKey);
    this.map.addTilesetImage('Terrains');
    this.layer = this.map.createLayer(0);
    this.layer.resizeWorld();
    //Adds the players
    this.players = [new Player(color.BLUE, 0, 0), new Player(color.RED, 1, 0)];
    //Creates a mapState
    this.mapState = new MapState(this.map, this.game, this.players, this.moneyPerBuilding);
    //Creates cursors to interact with keyboard
    this.cursors = game.input.keyboard.createCursorKeys();
    this.fixedCoords = game.cache.getJSON('fixedCoordinates');
    this.state = STATE.PLAY;
    //BEGINS GRAPHICS
    //mouse marker
    this.marker = game.add.graphics();
    this.marker.lineStyle(2, 'blue', 1);
    this.game.input.addMoveCallback(this.updateMouse, this);
    this.marker.drawRect(0,0, this.map.tileWidth, this.map.tileWidth);
    this.lastMarkerPos = null;
    //For attack range information
    this.attackRangeGraphics = this.game.add.graphics();
    this.game.input.onHold.add(this.setToTroopInfo, this);
    //Selecting troop that we want to attack
    this.attackableTroopsPos = [];
    this.attackableTroopsGraphics = this.game.add.graphics();
    //For selecting troop and drawing the movement path
    this.game.input.onTap.add(this.selectTile, this);
    this.squaresInPath = null;
    this.squaresInPathGraphics = this.game.add.graphics();
    this.selectedTroopPos = null;
    this.squaresInRangeGraphics = this.game.add.graphics();
    //Options buttons
    this.endTurnButton = this.game.add.button(920, 30, 'endTurnButton', this.endTurn, this);
    this.endTurnButton.fixedToCamera = true;
    //Factory selection
    this.factoryMenu = new FactoryMenu(this.game, this);
    this.factoryPos = null;
    //Info
    this.terrainInfoFrame = this.game.add.group();
    this.troopInfoFrame = this.game.add.group();
    this.troopInfoFrame.add(this.game.add.sprite(630 ,400, 'troopInfoFrame'));
    this.troopInfoFrame.visible = false;
    this.troopInfoFrame.fixedToCamera = true;
    let thisObject = this;
    if(socket != null) {
      socket.on('buyTroopBroadcast', function(pos, troopType, player){
        thisObject.factoryPos = pos;
        thisObject.createTroop(troopType, false);
      });
      socket.on('maTroopBroadcast', function(actionName, posBeg, options){
        thisObject.mapState.action(actionName, posBeg, options, false);
      });
      socket.on('mcTroopBroadcast', function(actionName, posBeg, options){
        thisObject.mapState.action(actionName, posBeg, options, false);
      });
      socket.on('mvTroopBroadcast', function(actionName, posBeg, options){
        thisObject.mapState.action(actionName, posBeg, options, false);
      });
      socket.on('endTurnBroadcast', function(){
        thisObject.endTurn(false);
      });
    }

    this.game.world.bringToTop(this.terrainInfoFrame);
    this.game.world.bringToTop(this.troopInfoFrame);

    this.playerMoneyText = this.game.add.text(950, 100);
    this.playerMoneyText.fixedToCamera = true;
    this.endTurn(false);
  }

  update() {
    if (this.cursors.up.isDown) {
      this.game.camera.y -= 4;
    }
    else if (this.cursors.down.isDown) {
      this.game.camera.y += 4;
    }
    if (this.cursors.left.isDown) {
      this.game.camera.x -= 4;
    }
    else if (this.cursors.right.isDown) {
      this.game.camera.x += 4;
    }
    this.updateMouse();
  }

  updateMouse(){
    let squarePos = new Position(this.layer.getTileX(this.game.input.activePointer.worldX),
      this.layer.getTileY(this.game.input.activePointer.worldY));
    //Only update stuff if things have changed
    if(this.lastMarkerPos != null && this.lastMarkerPos.equals(squarePos)) {
      return;
    }
    this.lastMarkerPos = squarePos;
    this.marker.x = squarePos.x*this.map.tileWidth;
    this.marker.y = squarePos.y*this.map.tileWidth;

    if(this.state == STATE.PLAY) {
      this.terrainInfoFrame.visible = true;
      this.updateMousePlay(squarePos);
    }
    else if(this.state == STATE.MOVETROOP) {
      this.terrainInfoFrame.visible = false;
      this.updateMouseMoveTroop(squarePos);
    }
  }

  updateMousePlay(squarePos) {
    if (squarePos.x >= 0) { // without this condidion there is a problem at the beggining (x = -1 -> black screen)
      this.updateTerrainInfoFrame(squarePos);
      this.updateTroopInfoFrame(squarePos);
    }
  }

  updateTerrainInfoFrame(squarePos){
    // destroy and creat new
    this.terrainInfoFrame.destroy();
    this.terrainInfoFrame = this.game.add.group();
    this.terrainInfoFrame.add(this.game.add.sprite(this.fixedCoords['X_terrainInfoFrame'] ,this.fixedCoords['Y_terrainInfoFrame'], 'terrainInfoFrame'));
    this.terrainInfoFrame.visible = true;
    this.terrainInfoFrame.fixedToCamera = true;
    // -----
    let currentTail = this.mapState.getTerrain(squarePos);
    let terrainName = currentTail.constructor.name.toLowerCase();
    this.terrainInfoFrame.add(this.game.add.sprite(this.fixedCoords['X_terrainName'], this.fixedCoords['Y_terrainName'], 'terrainNames', terrainName + '.PNG'));
    // display defence factor and capitalizationLevel
    this.displayNumber(this.terrainInfoFrame, currentTail.defense, this.fixedCoords['X_defence'] ,this.fixedCoords['Y_defence']);
    if (currentTail.capitalizationLevel != null) {
      this.terrainInfoFrame.add(this.game.add.sprite(this.fixedCoords['X_captPicture'] ,this.fixedCoords['Y_captPicture'], 'captPicture'));
      this.displayNumber(this.terrainInfoFrame, currentTail.capitalizationLevel, this.fixedCoords['X_captNumber'] ,this.fixedCoords['Y_captNumber']);
    }
  }

  updateTroopInfoFrame(squarePos){
    // destroy and create new frame
    this.troopInfoFrame.destroy();
    this.troopInfoFrame = this.game.add.group();
    this.troopInfoFrame.add(this.game.add.sprite(this.fixedCoords['X_troopInfoFrame'] ,this.fixedCoords['Y_troopInfoFrame'], 'troopInfoFrame'));
    this.troopInfoFrame.visible = false;
    this.troopInfoFrame.fixedToCamera = true;
    // ------
    let hoveredTroop = this.mapState.getTroop(squarePos);
    if (hoveredTroop != null) {
      this.troopInfoFrame.visible = true;
      let troopName = hoveredTroop.getName().toLowerCase();
      this.troopInfoFrame.add(this.game.add.sprite(this.fixedCoords['X_troopName'], this.fixedCoords['Y_troopName'], 'troopNames', troopName + '.PNG'));

      this.displayNumber(this.troopInfoFrame, hoveredTroop.life, this.fixedCoords['X_life'], this.fixedCoords['Y_life']);
      this.displayNumber(this.troopInfoFrame, hoveredTroop.fuel, this.fixedCoords['X_fuel'], this.fixedCoords['Y_fuel']);
      this.displayNumber(this.troopInfoFrame, hoveredTroop.ammo, this.fixedCoords['X_ammo'], this.fixedCoords['Y_ammo']);
    }
    else {
      this.troopInfoFrame.visible = false;
    }
  }

  displayNumber(frame, number, x, y){
    let num = number.toString();
    let numGroup = this.game.add.group();
    for (var i = 0; i < num.length; i++) {
      // if life is for instance 87.34242 it will display 87
      if (num[i] == '.') {
        break;
      }
      numGroup.add(this.game.add.sprite(x+(i*7), y, 'digits', 'info_' + num[i] + '.png'));
    }
    frame.add(numGroup);
  }


  updateMouseMoveTroop(squarePos) {
    let selectedTroop = this.mapState.getTroop(this.selectedTroopPos);
    let pos = this.listContainsPosition(this.squaresInPath, squarePos);
    if(squarePos.equals(this.selectedTroopPos)) {
      //If it's equal to the beggining remove everything.
      this.squaresInPath = [];
      this.energyLeft = Math.min(selectedTroop.fuel, selectedTroop.movementRange);
    }
    else if(this.mapState.getTroop(squarePos) != null) {
      return;
    }
    else if(pos != -1) {
      //If we select a square that was previously selected we remove all squares that came after it.
      for(let i=this.squaresInPath.length-1; i > pos; i--) {
        let cost = this.mapState.getPosEnergyCost(selectedTroop, this.squaresInPath[i]);
        this.energyLeft += cost;
        this.squaresInPath.pop();
      }
    }
    else if(this.squaresInPath.length != 0 && squarePos.getManDistance(this.squaresInPath[this.squaresInPath.length-1]) == 1
        && this.mapState.getPosEnergyCost(selectedTroop, squarePos) <= this.energyLeft) {
      //If the distance to the last object of the path is 1 and we can go there then add it.
      this.squaresInPath.push(squarePos);
      this.energyLeft -= this.mapState.getPosEnergyCost(selectedTroop, squarePos);
    }
    else{
      //If the path is empty (Sometimes the first square chosen is not an elligible square)
      // or if the new position is not next to the last.
      let initialPosition = this.selectedTroopPos;
      if(this.squaresInPath != 0) {
        initialPosition = this.squaresInPath[this.squaresInPath.length-1];
      }
      let shortestPath = this.findShortestPath(initialPosition, selectedTroop,
        this.energyLeft, squarePos);
      shortestPath.shift();
      if(shortestPath.length == 0) {
        //If there's no way to reach destination we try again but from the initialPosition
        shortestPath = this.findShortestPath(this.selectedTroopPos, selectedTroop,
          selectedTroop.getCurrentRange(), squarePos);
          shortestPath.shift();
          if(shortestPath.length != 0) {
            //erase the last path and start again.
            this.resetMoveTroopState();
          }
      }
      for(let posAux of shortestPath) {
          let cost = this.mapState.getPosEnergyCost(selectedTroop, posAux);
          this.squaresInPath.push(posAux);
          this.energyLeft -= cost;
      }
    }
    this.drawPath();
  }

  selectTile(){
    let mapX = this.layer.getTileX(this.game.input.activePointer.worldX);
    let mapY = this.layer.getTileY(this.game.input.activePointer.worldY);
    let squarePos = new Position(mapX, mapY);
    if (this.state == STATE.PLAY) {
      this.selectTilePlay(squarePos);
    }
    else if (this.state == STATE.MOVETROOP) {
      this.selectTileMoveTroop(squarePos);
    }
    else if(this.state == STATE.SELECTACTION) {
      this.selectTileSelectAction(squarePos);
    }
    else if(this.state == STATE.FACTORYCHOICE) {
      let truePos = new Position(this.game.input.activePointer.x, this.game.input.activePointer.y);
      this.selectTileFactoryChoice(truePos);
    }
    else if(this.state == STATE.VICTORY) {
      let truePos = new Position(this.game.input.activePointer.x, this.game.input.activePointer.y);
      this.selectTileVictory(truePos);
    }
    else if(this.state == STATE.TROOPINFO) {
      let truePos = new Position(this.game.input.activePointer.x, this.game.input.activePointer.y);
      this.selectTileTroopInfo(truePos);
    }
  }

  selectTileTroopInfo(truePos) {

  }

  selectTileVictory(mousePos) {
    this.game.state.start('MenuState');
  }

  selectTileFactoryChoice(mousePos) {
    if(this.factoryMenu.isInside(mousePos)) {
      this.factoryMenu.click(mousePos);
    }
    this.setToPlay();
  }

  selectTilePlay(squarePos) {
    let selectedTroop = this.mapState.getTroop(squarePos);
    let selectedTerrain = this.mapState.getTerrain(squarePos);
    if (selectedTroop != null && this.mapState.canPlayTroop(selectedTroop)) {
      this.setToMoveTroop(squarePos);
    }
    else if(selectedTroop == null && selectedTerrain.isFactory()
        && selectedTerrain.owner != null
        && selectedTerrain.owner.equals(this.mapState.getCurrentPlayer())) {
      this.setToFactoryChoice(squarePos);
    }
  }

  selectTileMoveTroop(squarePos) {
    let lastPos = this.squaresInPath[this.squaresInPath.length-1];
    //if it's a valid option (the selectedTroopPos is not part of the path)
    if(squarePos.equals(this.selectedTroopPos) || squarePos.equals(lastPos)) {
      let absolutePath = this.squaresInPath.map(pos => this.getAbsolutePosition(pos));
      let troopTween = this.mapState.getTroop(this.selectedTroopPos).moveSprite(absolutePath);
      let absolutePosition = this.getAbsolutePosition(squarePos);
      let troop = this.mapState.getTroop(this.selectedTroopPos);
      this.attackableTroopsPos = this.mapState.getAttackableTroopsPos(squarePos, troop);
      let isCapitalizable = this.mapState.canCapitalize(troop, this.mapState.getTerrain(squarePos));
      if((((troop.isRanged() && this.squaresInPath == 0) || !troop.isRanged()) //If the troop is ranged it can only do something if it doesnt move
          && this.attackableTroopsPos.length != 0) || isCapitalizable) {
        //change state when troop tween ends. If there's no tween just  change it. There's no tween when the troop doesnt move
        if(troopTween != null) {
          this.setToAnimation();
          this.removeMoveTroopState(); //Removes graphics related to moveTroopState
          troopTween.onComplete.add(this.setToSelectAction, this);
        }
        else {
          this.setToSelectAction();
        }
      }
      else {
        this.mapState.action("mv", this.selectedTroopPos, {"path":this.squaresInPath});
        //this.mapState.moveTroop(this.selectedTroopPos, this.squaresInPath);
        if(troopTween != null) {
          this.setToAnimation();
          this.removeMoveTroopState(); //Removes graphics related to moveTroopState
          troopTween.onComplete.add(this.setToPlay, this);
        }
        else {
          this.setToPlay();
        }
      }
    }
    else {
      this.setToPlay();
    }
  }

  //When you select a tile while selecting an action
  selectTileSelectAction(squarePos) {
    if(this.listContainsPosition(this.attackableTroopsPos, squarePos) != -1) {
      this.mapState.action("ma", this.selectedTroopPos, {"path":this.squaresInPath, "attackPos":squarePos});
      //this.mapState.moveTroopAndAttack(this.selectedTroopPos, this.squaresInPath, squarePos);
    }
    else if(this.isLastPathPosition(squarePos)
        && this.mapState.canCapitalize(this.mapState.getTroop(this.selectedTroopPos), this.mapState.getTerrain(squarePos))) {
      this.mapState.action("mc", this.selectedTroopPos, {"path":this.squaresInPath});
      if(this.mapState.getTerrain(squarePos).isBuilding()
          && this.mapState.getTerrain(squarePos).isHQ()
          && this.mapState.getTerrain(squarePos).capitalizationLevel <= 0) {
        this.setToVictory();
        return;
      }
      //this.mapState.moveTroopAndCapitalize(this.selectedTroopPos, this.squaresInPath);
    }
    else {
      this.mapState.action("mv", this.selectedTroopPos, {"path":this.squaresInPath});
      //this.mapState.moveTroop(this.selectedTroopPos, this.squaresInPath);
    }
    this.setToPlay();
  }

  removeMoveRange() {
    //Clears the range graphics and the style!
    this.squaresInRangeGraphics.clear();
  }

  drawMoveRange() {
    this.squaresInRange = this.mapState.getSquaresInRange(this.selectedTroopPos);
    this.squaresInRangeGraphics.lineStyle(2, 'blue', 1);
    for(let pos of this.squaresInRange) {
      this.squaresInRangeGraphics.drawRect(pos.x*this.map.tileWidth, pos.y*this.map.tileWidth, this.map.tileWidth, this.map.tileWidth);
    }
  }

  listContainsPosition(list, pos) {
    for(let i=0; i<list.length; i++) {
      if(list[i].equals(pos)) {
        return i;
      }
    }
    return -1;
  }

  resetMoveTroopState() {
    let selectedTroop = this.mapState.getTroop(this.selectedTroopPos);
    this.energyLeft = Math.min(selectedTroop.fuel, selectedTroop.movementRange);
    this.squaresInPath = [];
    this.squaresInPathGraphics.clear();
    this.squaresInPathGraphics.lineStyle(2, 'red', 1);
  }

  drawPath() {
    this.squaresInPathGraphics.clear();
    for(let pos of this.squaresInPath) {
      this.squaresInPathGraphics.beginFill(0xFF0000, 0.8);
      this.squaresInPathGraphics.drawRect(pos.x*this.map.tileWidth, pos.y*this.map.tileWidth, this.map.tileWidth, this.map.tileWidth);
      this.squaresInPathGraphics.endFill();
    }
  }

  findShortestPath(initialPos, troop, energyLeft, destPos) {
    let res = [];
    let iState = {pos:initialPos, cost:0, heuristic:initialPos.getManDistance(destPos), parent: null};
    let visited = [];
    this.mapState.initializeMapLikeMatrix(visited, false);

    let pq = new PriorityQueue({comparator: function(a,b) {
      return (a.cost+a.heuristic) - (b.cost+b.heuristic);
    }});
    pq.queue(iState);
    visited[initialPos.x][initialPos.y] = true;

    let curState = null;
    let completed = false;
    while(pq.length > 0) {
      curState = pq.dequeue();
      if(curState.pos.equals(destPos)) {
        completed = true;
        break;
      }
      let children = [new Position(curState.pos.x+1, curState.pos.y),
        new Position(curState.pos.x-1, curState.pos.y),
        new Position(curState.pos.x, curState.pos.y+1),
        new Position(curState.pos.x, curState.pos.y-1)];
      for(let child of children) {
        if(!this.mapState.isInsideMap(child)) {
          continue;
        }
        let newCost = this.mapState.getPosEnergyCost(troop, child) + curState.cost;
        if(!visited[child.x][child.y] && newCost <= energyLeft) {
          pq.queue({
            pos:child,
            cost: newCost,
            heuristic: child.getManDistance(destPos),
            parent: curState
          });
        }
      }
    }
    if(!completed) {
      return [];
    }
    while(curState != null) {
      res.push(curState.pos);
      curState = curState.parent;
    }
    res.reverse();
    return res;
  }

  setToMoveTroop(selectedTroopPos) {
    if(this.isMyTurnOnline()) {
      this.input.enabled = true;
    }
    let selectedTroop = this.mapState.getTroop(selectedTroopPos);
    if (selectedTroop != null) {
      this.selectedTroopPos = selectedTroopPos;
      this.drawMoveRange();
      this.resetMoveTroopState();
      this.state = STATE.MOVETROOP;
    }
  }

  removeMoveTroopState() {
    this.removeMoveRange();
    this.squaresInPathGraphics.clear();
  }

  setToPlay() {
    if(this.isMyTurnOnline()) {
      this.input.enabled = true;
    }
    this.squaresInPath = [];
    this.squaresInPathGraphics.clear();
    this.attackableTroopsGraphics.clear();
    this.removeMoveRange();
    this.factoryMenu.disable();
    this.state = STATE.PLAY;
  }

  setToSelectAction() {
    if(this.isMyTurnOnline()) {
      this.input.enabled = true;
    }
    this.attackableTroopsGraphics.clear();
    for(let pos of this.attackableTroopsPos) {
      this.attackableTroopsGraphics.beginFill(0x00FF00, 0.8);
      this.attackableTroopsGraphics.drawRect(pos.x*this.map.tileWidth, pos.y*this.map.tileWidth, this.map.tileWidth, this.map.tileWidth);
      this.attackableTroopsGraphics.endFill();
    }
    this.squaresInPathGraphics.clear();
    this.removeMoveRange();
    this.state = STATE.SELECTACTION;
  }

  setToFactoryChoice(factoryPos) {
    if(this.isMyTurnOnline()) {
      this.input.enabled = true;
    }
    this.factoryPos = factoryPos;
    this.factoryMenu.enable();
    this.state = STATE.FACTORYCHOICE;
  }

  getAttackRangeTile() {
    //FOR THE ATTACK RANGE!
  }

  getAbsolutePosition(pos) {
    return new Position(pos.x*this.map.tileWidth, pos.y*this.map.tileHeight);
  }

  getMapStateMap(){
    return this.mapState.map
  }

  isLastPathPosition(squareClicked) {
    if(this.squaresInPath.length == 0) {
      return squareClicked.equals(this.selectedTroopPos);
    }
    else {
      return squareClicked.equals(this.squaresInPath[this.squaresInPath.length-1]);
    }
  }

  endTurn(emit = true) {
    this.mapState.endTurn();
    this.playerMoneyText.text = this.mapState.getCurrentPlayer().money.toString();
    if(socket != null){
      if(emit){
        socket.emit('endTurn');
      }
      if(this.isMyTurnOnline()) {
        this.input.enabled = true;
        this.endTurnButton.visible = true;
      }
      else {
        this.input.enabled = false;
        this.endTurnButton.visible = false;
      }
    }
  }

  isMyTurnOnline() {
    if(socket != null) {
        if(socket.id != this.players_ids[this.mapState.nTurns % this.mapState.players.length]) {
          return false;
        }
        else {
          return true;
        }
    }
    else {
      return true;
    }
  }

  createTroop(troopString, emit = true) {
    this.mapState.buyTroop(this.factoryPos, troopString, emit);
    this.playerMoneyText.text = this.mapState.getCurrentPlayer().money.toString();
    if(socket != null){
      if(emit){
        socket.emit('buyTroop',this.factoryPos , troopString, this.mapState.getCurrentPlayer());
      }
    }
  }

  updateFrameDisplay(frame){
    frame.visible = !frame.visible;
  }


  setToAnimation() {
    this.state = STATE.ANIMATION;
    this.input.enabled = false;
  }

  setToVictory() {
    this.state = STATE.VICTORY;
    let vMenu = new VictoryMenu(this.game, this, this.mapState.getCurrentPlayer);
  }

  setToTroopInfo() {
    this.state = STATE.TROOPINFO;

  }
}
