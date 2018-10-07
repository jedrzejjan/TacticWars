class FactoryMenu {
  constructor(game, gameState) {
    this.x = 100;
    this.y = 50;
    this.game = game;
    this.factorySprite = game.add.sprite(this.x, this.y, 'factoryMenu');
    this.game.world.bringToTop(this.factorySprite);
    this.factorySprite.visible = false;
    this.width = this.factorySprite.width;
    this.height = this.factorySprite.height;
    this.gameState = gameState;
    this.factorySprite.fixedToCamera = true;
  }

  enable() {
    this.game.world.bringToTop(this.factorySprite);
    this.factorySprite.visible = true;
  }

  disable() {
    this.factorySprite.visible = false;
  }

  isInside(mousePosition) {
    if(mousePosition.x > this.x && mousePosition.x < this.x+this.width && mousePosition.y > this.y && mousePosition.y < this.y+this.height) {
        return true;
    }
    return false;
  }

  click(mousePosition) {
    if(!this.isInside(mousePosition)) {
      return;
    }
    let posX = Math.floor((mousePosition.x - this.x) / 200);
    let posY = Math.floor((mousePosition.y - this.y) / 100);
    if(posX == 0 && posY == 0) {
      this.gameState.createTroop("Infantry");
    }else if(posX == 1 && posY == 0) {
      this.gameState.createTroop("Mech");
    }else if(posX == 2 && posY == 0) {
      this.gameState.createTroop("Recon");
    }else if(posX == 0 && posY == 1) {
      this.gameState.createTroop("Tank");
    }else if(posX == 1 && posY == 1) {
      this.gameState.createTroop("MdTank");
    }else if(posX == 2 && posY == 1) {
      this.gameState.createTroop("NeoTank");
    }else if(posX == 0 && posY == 2) {
      this.gameState.createTroop("APC");
    }else if(posX == 1 && posY == 2) {
      this.gameState.createTroop("Artry");
    }else if(posX == 2 && posY == 2) {
      this.gameState.createTroop("Rockets");
    }else if(posX == 0 && posY == 3) {
      this.gameState.createTroop("AAir");
    }
    return;
  }
}
