//TODO
//PARSE INFO FROM FILE INSTEAD OF FROM CONSTRUCTOR
//PUT STATIC TOO POSSIBLY OR MAYBE REARRANGE THE WAY
//THIS WORKS. THERE'S A LOT OF REDUNDANCY IN SPACE HERE
class Terrain {
  constructor(defense, walkingCost, tireCost, caterCost) {
    this.defense = defense;
    this.walkingCost = walkingCost;
    this.tireCost = tireCost;
    this.caterCost = caterCost;
  }

	getMoveCost(troop) {
		if(troop.getMoveType() == MOVETYPE.FOOT) {
			return this.walkingCost;
		}
		else if(troop.getMoveType() == MOVETYPE.TIRES) {
			return this.tireCost;
		}
		if(troop.getMoveType() == MOVETYPE.CATER) {
			return this.caterCost;
		}
	}

  isBuilding() {
    return false;
  }

  isFactory() {
    return false;
  }
}

class Forest extends Terrain {
  constructor() {
    super(2, 2, 2, 3);
  }
}

class Mountain extends Terrain {
  constructor() {
    super(4, 3, Infinity, Infinity);
  }
}

class Grass extends Terrain {
  constructor() {
    super(1, 1, 2, 2);
  }
}

class Road extends Terrain {
  constructor() {
    super(0, 1, 1, 1);
  }
}

class Water extends Terrain {
  constructor() {
    super(0, Infinity, Infinity, Infinity);
  }
}

class Building extends Terrain {
  constructor(owner) {
    super(3, 1, 1, 1);
    this.capitalizationLevel = 200;
    this.owner = owner;
  }

  resetCapitalization() {
    this.capitalizationLevel = 200;
  }

  capitalize(capitalizerTroop, tilemap, pos, buildingindex) {
    if(!capitalizerTroop.canCapitalize()) {
      return;
    }
    this.capitalizationLevel -= capitalizerTroop.life;
    if(this.capitalizationLevel <= 0) {
      let x = pos.x;
      let y = pos.y;
      let troopColor = capitalizerTroop.player.color;
      let tileClass = this.constructor.name;
      let buildingToPut = buildingindex[tileClass+"_"+troopColor];
      tilemap.removeTile(x,y);
      tilemap.putTile(buildingToPut, x, y);
      this.owner = capitalizerTroop.player;
      this.capitalizationLevel = 200;
    }
  }

  isBuilding() {
    return true;
  }

  isHQ() {
    return false;
  }

  isFactory() {
    return false;
  }
}

class Factory extends Building {
  isFactory() {
    return true;
  }
}

class City extends Building {
}

class HQ extends Building {
  isHQ() {
    return true;
  }

  capitalize(capitalizerTroop, tilemap, pos, buildingindex) {
    if(!capitalizerTroop.canCapitalize()) {
      return;
    }
    this.capitalizationLevel -= capitalizerTroop.life;
  }

}
