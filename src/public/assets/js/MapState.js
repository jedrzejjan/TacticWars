"use strict";

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getManDistance(position) {
    return Math.abs(position.x - this.x) + Math.abs(position.y - this.y);
  }

  equals(position) {
    if(position.x == this.x && position.y == this.y) {
      return true;
    }
    return false;
  }
}

class MapState {
  constructor(tileMap, game, players, moneyPerBuilding) {
    this.game = game;
    this.tilemap = tileMap;
    this.map = [];
    this.troops = [];
    this.players = players;
    this.battleEngine = new BattleEngine(this.game.cache.getJSON('damageTable'));
    this.priceInfo = this.game.cache.getJSON('priceInfo');
    this.buildingindex = this.game.cache.getJSON('buildingindex');
    this.moneyPerBuilding = moneyPerBuilding;
    this.nTurns = -1;
    for(let x=0; x<tileMap.width; x++) {
      this.map.push([]);
      this.troops.push([]);
      for(let y=0; y<tileMap.height; y++) {
        this.troops[x].push(null);
        let tile = tileMap.getTile(x, y);
        switch(tile.properties['type']) {
          //TODO Turn this into a dictionary.
          case 'Forest':
            this.map[x].push(new Forest());
            break;
          case 'Mountain':
            this.map[x].push(new Mountain());
            break;
          case 'Grass':
            this.map[x].push(new Grass());
            break;
          case 'Field':
            this.map[x].push(new Grass());
            break;
          case 'Road':
            this.map[x].push(new Road());
            break;
          case 'Bridge':
            this.map[x].push(new Road());
            break;
          case 'Water':
            this.map[x].push(new Water());
            break;
          case 'River':
            this.map[x].push(new Water());
            break;
          case 'HQ':
            this.map[x].push(new HQ(this.colorToPlayer(tile.properties['belongs'])));
            break;
          case 'Factory':
            this.map[x].push(new Factory(this.colorToPlayer(tile.properties['belongs'])));
            break;
          case 'City':
            this.map[x].push(new City(this.colorToPlayer(tile.properties['belongs'])));
            break;
          default:
            break;
        }
      }
    }
  }

  //Factory Pos, TroopType in String
  buyTroop(pos, troopType, emit) {
    let player = this.getCurrentPlayer();
    let price = this.priceInfo[troopType];
    if(emit){
      if(!this.getTerrain(pos).isBuilding() || !this.getTerrain(pos).owner.equals(player)) {
        return;
      }
    }
    if(price == null || price > player.money) {
      return;
    }
    player.money -= price;
    this.addTroop(pos.x, pos.y, troopType, player, true);
    this.specialEffect('coinflip', pos);
    this.game.add.audio('coinSound').play();
    // this.game.add.audio('shotSound').play();
  }
  // x and y are NOT absolute here
  addTroop(x, y, troopType, player, fromFactory = false){
    //TODO CHANGE PLAYER TYPE
    let color = player.color;
    let sprite = this.game.add.sprite(x*this.tilemap.tileWidth, ((fromFactory) ? -64 : y*this.tilemap.tileHeight), troopType.toLowerCase() + '_'+color);
    if(troopType == "AAir") {
      this.troops[x][y] = new AntiAir(sprite, player);
    }
    else if(troopType == "APC") {
      this.troops[x][y] = new APC(sprite, player);
    }
    else if(troopType == "Artry") {
      this.troops[x][y] = new Artry(sprite, player);
    }
    else if(troopType == "Bcopter") {
      this.troops[x][y] = new Bcopter(sprite, player);
    }
    else if(troopType == "Bomber") {
      this.troops[x][y] = new Bomber(sprite, player);
    }
    else if(troopType == "Infantry") {
      this.troops[x][y] = new LightInfantry(sprite, player);
    }
    else if(troopType == "MdTank") {
      this.troops[x][y] = new MdTank(sprite, player);
    }
    else if(troopType == "Mech") {
      this.troops[x][y] = new Mech(sprite, player);
    }
    else if(troopType == "Missile") {
      this.troops[x][y] = new Missile(sprite, player);
    }
    else if(troopType == "NeoTank") {
      this.troops[x][y] = new NeoTank(sprite, player);
    }
    else if(troopType == "Recon") {
      this.troops[x][y] = new Recon(sprite, player);
    }
    else if(troopType == "Rockets") {
      this.troops[x][y] = new Rocket(sprite, player);
    }
    else if(troopType == "Tank") {
      this.troops[x][y] = new Tank(sprite, player);
    }
    else if(troopType == "Tcopter") {
      this.troops[x][y] = new Tcopter(sprite, player);
    }
    this.specialTween(sprite, y);
  }

  action(actionName, posBeg, options, emit = true) {
    let t = this.getTroop(posBeg);
    if(emit){
      if(t == null || !this.canPlayTroop(t)) {
        return false;
      }
    }
    if(actionName == "mv") {
      this.moveTroop(posBeg, options.path);
      if(socket != null){
        if(emit){
          let actionName = "mv";
          socket.emit('mvTroop',actionName, posBeg, options);
        }
      }
    }
    else if(actionName == "ma") {
      this.moveTroopAndAttack(posBeg, options.path, options.attackPos);
      if(socket != null){
        if(emit){
          let actionName = "ma";
          socket.emit('maTroop', actionName, posBeg, options);
        }
      }
    }
    else if(actionName == "mc") {
      this.moveTroopAndCapitalize(t, posBeg, options.path);
      if(socket != null){
        if(emit){
          let actionName = "ma";
          socket.emit('maTroop', actionName, posBeg, options);
        }
      }
    }
    t.setToUsed();
  }

  moveTroop(posBeg, path){
    if(path.length == 0) {
      return;
    }
    //Verify if end of path is not above other troop (It can be above the same troop though)
    //Verify if the cost of the path is not above the troop's limitation.
    let posEnd = path[path.length-1];
    let troop = this.troops[posBeg.x][posBeg.y];
    this.troops[posBeg.x][posBeg.y] = null;
    this.troops[posEnd.x][posEnd.y] = troop;
    let absolutePath = path.map(pos => this.getAbsolutePosition(pos));
    troop.move(path.map(x => this.getTerrain(x)));
    troop.moveSprite(absolutePath); //RETIREI ISTO DE COMENTARIO E SO ASSIM E QUE A TROPA DO OUTRO CLIENTE SE MOVEU
  }

  moveTroopAndAttack(posBeg, path, attackPos) {
    let defendPos = (path.length == 0) ? posBeg : path[path.length-1];
    let troop = this.troops[posBeg.x][posBeg.y];
    let defendingTroop = this.getTroop(attackPos);
    this.moveTroop(posBeg, path);
    //If troop is ranged it can only attack if it doesnt move
    if(troop.isRanged() && path.length > 0) {
      return;
    }
    troop.attacks(defendingTroop, this.getTerrain(attackPos), this.battleEngine);
    // Battle Animations
    let currentSprite;
    if(defendingTroop.isDead) {
      this.troops[attackPos.x][attackPos.y] = null;
      this.specialEffect('explosion', attackPos);
      this.game.add.audio('bombSound').play();
      return;
    }
    else if(troop.isRanged()) {
      this.specialEffect('explosion', attackPos);
      this.game.add.audio('bombSound').play();
      return;
    }
    else {
      currentSprite = this.battleEffect(attackPos, defendPos);
    }
    //COUNTERRR ATACKKK when first animation is completed
    if (!defendingTroop.isRanged()) {
      currentSprite.animations.currentAnim.onComplete.add(
        function(){
          defendingTroop.attacks(troop, this.getTerrain(posBeg), this.battleEngine);
          if(troop.isDead) {
            this.specialEffect('explosion', defendPos);
            this.game.add.audio('bombSound').play();
            this.troops[posBeg.x][posBeg.y] = null;
          }else {
            this.battleEffect(defendPos, attackPos);
          }
        }, this);
      }
  }

  moveTroopAndCapitalize(troop, posBeg, path){
    let capitalizePos;
    this.moveTroop(posBeg, path);
    if(path.length == 0) {
      capitalizePos = posBeg;
    }
    else {
      let posEnd = path[path.length-1];
      capitalizePos = posEnd;
    }
    this.getTerrain(capitalizePos).capitalize(this.getTroop(capitalizePos), this.tilemap, capitalizePos, this.buildingindex);
    this.specialEffect('flag', capitalizePos, 7);
  }

  //Get positions in movement range of the troop in pos
  getSquaresInRange(pos) {
    let res = []; //Array of positions
    let troop = this.troops[pos.x][pos.y];
    if(troop == null) {
      return [];
    }
    let range = troop.movementRange;

    //Uniform Cost Search until out of range or out of map
    let pq = new PriorityQueue({comparator: function(a, b) {
      return b.energyLeft - a.energyLeft;
    }});
    let visited = [];
    this.initializeMapLikeMatrix(visited, false);
    let initial_state = {pos:new Position(pos.x, pos.y), energyLeft: Math.min(troop.fuel, troop.movementRange)};
    pq.queue(initial_state);
    while(pq.length > 0) {
      let curState = pq.dequeue();
      if(visited[curState.pos.x][curState.pos.y]) {
        continue;
      }
      visited[curState.pos.x][curState.pos.y] = true;
      res.push(curState.pos);
      let children = this.getAdjPos(curState.pos);
      for(let child of children) {
        let energyCost = this.getPosEnergyCost(troop, child);
        let energyLeft = curState.energyLeft - energyCost;
        if(!visited[child.x][child.y] && energyLeft >= 0) {
          pq.queue({pos:child, energyLeft:energyLeft});
        }
      }
    }
    return res;
  }

  getTroop(pos) {
    return this.troops[pos.x][pos.y];
  }

  getTerrain(pos) {
    return this.map[pos.x][pos.y];
  }

  initializeMapLikeMatrix(list, value) {
    for(let x=0; x<this.map.length; x++) {
      list.push([]);
      for(let y=0; y<this.map[0].length; y++) {
        list[x].push(value);
      }
    }
  }

  //Checks if a list of positions contains a position
  listContainsPosition(list, pos) {
    for(let p of list) {
      if(p.x == pos.x && p.y == pos.y) {
        return true;
      }
    }
    return false;
  }

  //Checks if pos is inside the map
  isInsideMap(pos) {
    if(pos.x < this.map.length && pos.x >= 0 && pos.y < this.map[0].length && pos.y >= 0) {
      return true;
    }
    return false;
  }

  //Get adjacent positions inside map
  getAdjPos(pos) {
    let children = [new Position(pos.x+1, pos.y),
      new Position(pos.x-1, pos.y),
      new Position(pos.x, pos.y+1),
      new Position(pos.x, pos.y-1)];
    for(let i = children.length-1; i >= 0; i--) {
      if(!this.isInsideMap(children[i])) {
        children.splice(i, 1);
      }
    }
    return children;
  }

  //Gets positions inside map that have a Manhattan Distance to center between minRange and maxRange
  getBetweenRangesPos(center, minRange, maxRange) {
    let res = [];
    for(let x = center.x - maxRange; x <= center.x + maxRange; x++) {
      let remainingDistance = maxRange - Math.abs(x-center.x);
      for(let y = center.y-remainingDistance; y <= center.y + remainingDistance; y++) {
        let pos = new Position(x, y);
        if(this.isInsideMap(pos) && center.getManDistance(pos) >= minRange) {
          res.push(pos);
        }
      }
    }
    return res;
  }

  //Gets the Positions of the troops that can be attacked immediatly by the troop in attackerTroopPos
  getAttackableTroopsPos(attackerTroopPos, troop) {
    let res = [];
    if(troop == null) {
      return [];
    }
    let relevantPositions;
    //APCs cant attack and troops without secondary weapon that have no ammo
    if(!troop.canAttack()) {
      return [];
    }
    if(troop.isRanged()) {
      relevantPositions = this.getBetweenRangesPos(attackerTroopPos, troop.minRange, troop.maxRange);
    }
    else {
      relevantPositions = this.getAdjPos(attackerTroopPos);
    }
    for(let pos of relevantPositions) {
      let attackableTroop = this.getTroop(pos);
      if(attackableTroop != null && !attackableTroop.player.isSameTeam(troop.player)) {
        res.push(pos);
      }
    }
    return res;
  }

  //Get all the troops that can be attacked by the troop in attackerTroopPos in the same turn
  getTroopsPosInRange(attackerTroopPos) {
    let res = [];
    let troop = this.getTroop(attackerTroopPos);
    if(troop == null) {
      return;
    }
    if(troop.isRanged()) {
      let relevantPositions = this.getBetweenRangesPos(attackerTroopPos, troop.minRange, troop.maxRange);
    }
    else {
      let posAdded = [];
      this.initializeMapLikeMatrix(posAdded, false);
      let movementRange = this.getSquaresInRange(attackerTroopPos);
      for(let p of movementRange) {
        let attackableTroopsPositions = this.getAttackableTroopsPos(p, troop);
        //Add the positions to res. We must check if the positions have not been yet added to the result
        for(let attackablePos of attackableTroopsPositions) {
          if(!posAdded[attackablePos.x][attackablePos.y]) {
            res.push(attackablePos);
            posAdded[attackablePos.x][attackablePos.y] = true;
          }
        }
      }
    }
    return res;
  }

  getPlayers() {
    return this.players;
  }

  getAbsolutePosition(pos) {
    return new Position(pos.x*this.tilemap.tileWidth, pos.y*this.tilemap.tileHeight);
  }

  getPosEnergyCost(troop, pos) {
    let energyCost;
    if(this.getTroop(pos) != null && !this.getTroop(pos).player.isSameTeam(troop.player)) {
      energyCost = Infinity;
    }
    else {
      energyCost = this.map[pos.x][pos.y].getMoveCost(troop);
    }
    return energyCost;
  }

  getCurrentPlayer() {
    return this.players[this.nTurns % this.players.length];
  }

  canCapitalize(troop, terrain) {
    if(terrain.isBuilding()
        && (terrain.owner == null || !terrain.owner.equals(this.getCurrentPlayer()))
        && troop.canCapitalize()) {
      return true;
    }
    return false;
  }

  canPlayTroop(troop) {
    return troop.player.equals(this.getCurrentPlayer()) && troop.canMove;
  }

  endTurn() {
    this.nTurns++;
    let newPlayer = this.getCurrentPlayer();
    for(let x = 0; x < this.troops.length; x++) {
      for(let y = 0; y < this.troops[x].length; y++) {
        let troop = this.troops[x][y];
        let terrain = this.map[x][y];
        if(troop != null) {
          troop.endTurn();
          if(!troop.player.equals(newPlayer)) {
            troop.setToUsed();
          }
        }
        if(terrain.isBuilding() && newPlayer.equals(terrain.owner)) {
          newPlayer.money += this.moneyPerBuilding;
        }
      }
    }
  }

  colorToPlayer(color) {
    for(let p of this.players) {
      if(p.color == color) {
        return p;
      }
    }
    return null;
  }

  specialEffect(effectName, position, speed = 15) {
    let absPos = this.getAbsolutePosition(position);
    let spriteBoom = this.game.add.sprite(absPos.x, absPos.y, effectName);
    spriteBoom.animations.add('effect');
    spriteBoom.animations.play('effect', speed, false, true);
    return spriteBoom;
  }

  battleEffect(attackPos, defendPos) {
    let absPos = this.getAbsolutePosition(attackPos);
    let spriteShot;
    let shot = 'shot_';
    let direction;
    if (attackPos.x == defendPos.x) {
      direction = attackPos.y < defendPos.y ? 'up' : 'down';
    }
    if (attackPos.y == defendPos.y) {
      direction = attackPos.x < defendPos.x ? 'left' : 'right';
    }
    spriteShot = this.game.add.sprite(absPos.x, absPos.y, 'shot_'+direction);
    if (direction == 'up' || direction == 'left') {
      spriteShot.animations.add('effect', [7,6,5,4,3,2,1]);
    }
    else {
      spriteShot.animations.add('effect');
    }
    spriteShot.animations.play('effect', 7, false, true);
    this.game.add.audio('shotSound').play();
    return spriteShot;
  }

  specialTween(sprite, y, speed = 2000) {
    game.add.tween(sprite).to( { y: y*64}, speed, Phaser.Easing.Bounce.Out, true);
  }

  // specialSound(soundName) {
  //   let absPos = this.getAbsolutePosition(position);
  //   let spriteBoom = this.game.add.sprite(absPos.x, absPos.y, effectName);
  //   spriteBoom.animations.add('effect');
  //   spriteBoom.animations.play('effect', speed, false, true);
  //   return spriteBoom;
  // }
}
