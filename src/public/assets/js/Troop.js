var MOVETYPE = {
  FOOT: 0,
  TIRES: 1,
  CATER: 2
};


class Troop {
  constructor(sprite, movementRange, initialAmmo, initialFuel, movetype, player){
    this.sprite = sprite;
    this.movementRange = movementRange;
    this.ammo = initialAmmo;
    this.moveType = false;
    this.canMove = true;
    this.life = 100;
    this.player = player;
    this.fuel = initialFuel;
    this.initialFuel = initialFuel;
    this.isDead = false;
    this.animationTimePerSquare = 300; //In miliseconds
    this.setToUsed();
    // initialize animations for moves left, right, up, down
    // moveRight = this.sprite.animations.add('moveRight', [3], 10, true);
    // moveUp = this.sprite.animations.add('moveUp', [3], 10, true);
    // moveLeft = this.sprite.animations.add('moveLeft', [3], 10, true);
    // moveDown = this.sprite.animations.add('moveDown', [3], 10, true);

    // initialize animation while the unit stay and play it
    this.stay = this.sprite.animations.add('stay');
    this.stay.enableUpdate = true;
    this.stay.play(4, true);
  }

// block move when not enough fuel
  move(terrainsPath) {
    for(let t of terrainsPath) {
      this.fuel -= t.getMoveCost(this);
    }
    if(this.fuel < 0) {
      throw new Error("Fuel Became less than 0.");
    }
  }

  moveSprite(absolutePositionPath) {
    let tween;
    let xArray = [];
    let yArray = [];
    for (var i = 0; i < absolutePositionPath.length; i++) {
      xArray.push(absolutePositionPath[i].x);
      yArray.push(absolutePositionPath[i].y);
    }
    if(absolutePositionPath.length > 0) {
      tween = game.add.tween(this.sprite).to({ x: xArray, y: yArray }, this.animationTimePerSquare * absolutePositionPath.length);
      tween.start();
    }
    this.stay.play(4, true);
    return tween;
  }

  getMoveType() {
    return this.moveType;
  }

  getCurrentRange() {
    return Math.min(this.movementRange, this.fuel);
  }

  isRanged() {
    throw Error("Not Implemented");
  }

  getName() {
    throw Error("Not Implemented");
  }

  canAttack() {
    if(this.ammo > 0 || this.hasSecondaryWeapon()) {
      return true;
    }
    return false;
  }

  hasSecondaryWeapon() {
    throw Error("Not Implemented");
  }

  die() {
    this.sprite.destroy();
    this.isDead = true;
  }

  attacks(troop, terrain, battleEngine) {
    let damage = battleEngine.calculateDamage(this, troop, terrain);
    if(this.ammo > 0) {
      this.ammo--;
    }
    troop.beAttacked(damage);
  }

  beAttacked(damage) {
    this.life -= damage;
    if(this.life <= 0) {
      this.die();
    }
  }

  canCapitalize() {
    return false;
  }

  setToUsed() {
    this.canMove = false;
    this.sprite.tint = 0x909090;
  }

  endTurn() {
    this.canMove = true;
    this.sprite.tint = 0xFFFFFF;
  }

}

class Infantry extends Troop {
  constructor(sprite, movementRange, initialAmmo, initialFuel, player) {
    super(sprite, movementRange, initialAmmo, initialFuel, MOVETYPE.FOOT, player);
  }

  isRanged() {
    return false;
  }

  canCapitalize() {
    return true;
  }
}

class LightInfantry extends Infantry {
  constructor(sprite, player) {
    let movementRange = 3;
    let initialAmmo = 40;
    let initialFuel = 50;
    super(sprite, movementRange, initialAmmo, initialFuel, player);
  }

  getName() {
    return "Infantry";
  }

  hasSecondaryWeapon() {
    return true;
  }
}

class Mech extends Infantry {
  constructor(sprite, player) {
    let movementRange = 3;
    let initialAmmo = 50;
    let initialFuel = 50;
    super(sprite, movementRange, initialAmmo, initialFuel, player);
  }

  getName() {
    return "Mech";
  }

  hasSecondaryWeapon() {
    return true;
  }
}

class Vehicle extends Troop {

  canCapitalize() {
    return false;
  }
  isRanged() {
    return false;
  }
}

class Ranged extends Vehicle {
  constructor(sprite, movementRange, initialAmmo, initialFuel, movetype, player, minRange, maxRange) {
    super(sprite, movementRange, initialAmmo, initialFuel, movetype, player);
    this.minRange = minRange;
    this.maxRange = maxRange;
  }

  isRanged() {
    return true;
  }
}

class Artry extends Ranged {
  constructor(sprite, player) {
    let minRange = 2;
    let maxRange = 4;
    let movementRange = 5;
    let initialAmmo = 40;
    let initialFuel = 30;
    let moveType = MOVETYPE.TIRES;
    super(sprite, movementRange, initialAmmo, initialFuel, moveType, player, minRange, maxRange);
  }

  getName() {
    return "Artry";
  }

  hasSecondaryWeapon() {
    return false;
  }
}

class Missile extends Vehicle {
  constructor(sprite, player) {
      let minRange = 3;
      let maxRange = 6;
      let movementRange = 3;
      let initialAmmo = 5;
      let initialFuel = 30;
      let moveType = MOVETYPE.CATER;
      super(sprite, movementRange, initialAmmo, initialFuel, moveType, player, minRange, maxRange);
  }

  getName() {
    return "Missile";
  }

  hasSecondaryWeapon() {
    return true;
  }
}


class APC extends Vehicle {
  constructor(sprite, player) {
    let movementRange = 6;
    let initialAmmo = 0;
    let initialFuel = 70;
    let moveType = MOVETYPE.TIRES;
    super(sprite, movementRange, initialAmmo, initialFuel, moveType, player);
  }

    getName() {
      return "APC";
    }

    hasSecondaryWeapon() {
      return false;
    }

    isRanged() {
      return false;
    }

    canAttack() {
      return false;
    }
}

class Tank extends Vehicle {
  constructor(sprite, player) {
    let movementRange = 4;
    let initialAmmo = 60;
    let initialFuel = 60;
    let moveType = MOVETYPE.TIRES;
    super(sprite, movementRange, initialAmmo, initialFuel, moveType, player);
  }

  getName() {
    return "Tank";
  }
  hasSecondaryWeapon() {
    return true;
  }

  isRanged() {
    return false;
  }

}

class MdTank extends Vehicle {
  constructor(sprite, player) {
    let movementRange = 4;
    let initialAmmo = 80;
    let initialFuel = 50;
    let moveType = MOVETYPE.TIRES;
    super(sprite, movementRange, initialAmmo, initialFuel, moveType, player);
  }
  getName() {
    return "MdTank";
  }
  hasSecondaryWeapon() {
    return true;
  }

  isRanged() {
    return false;
  }
}

class NeoTank extends Vehicle {
  constructor(sprite, player) {
    let movementRange = 5;
    let initialAmmo = 100;
    let initialFuel = 50;
    let moveType = MOVETYPE.TIRES;
    super(sprite, movementRange, initialAmmo, initialFuel, moveType, player);
  }
  getName() {
    return "NeoTank";
  }
  hasSecondaryWeapon() {
    return true;
  }

  isRanged() {
    return false;
  }
}

class Recon extends Vehicle {
  constructor(sprite, player) {
    let movementRange = 8;
    let initialAmmo = 6;
    let initialFuel = 80;
    let moveType = MOVETYPE.TIRES;
    super(sprite, movementRange, initialAmmo, initialFuel, moveType, player);
  }

  getName() {
    return "Recon";
  }
}

class Rocket extends Ranged {
  constructor(sprite, player) {
    let minRange = 3;
    let maxRange = 5;
    let movementRange = 4;
    let initialAmmo = 6;
    let initialFuel = 50;
    let moveType = MOVETYPE.TIRES;
    super(sprite, movementRange, initialAmmo, initialFuel, moveType, player, minRange, maxRange);
  }

  getName() {
    return "Rockets";
  }
}

class AntiAir extends Vehicle {
  constructor(sprite, player) {
    let movementRange = 6;
    let initialAmmo = 0;
    let initialFuel = 50;
    let moveType = MOVETYPE.TIRES;
    super(sprite, movementRange, initialAmmo, initialFuel, moveType, player);
  }

    getName() {
      return "AAir";
    }

    hasSecondaryWeapon() {
      return true;
    }

    isRanged() {
      return false;
    }
}

class AirUnit extends Troop {

}

class Bomber extends AirUnit {

}

class Bcopter extends AirUnit {

}

class Tcopter extends AirUnit {

}
