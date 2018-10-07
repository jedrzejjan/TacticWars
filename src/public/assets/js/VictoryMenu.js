class VictoryMenu {
  constructor(game, gameState, winnerPlayer) {
    this.x = 100;
    this.y = 50;
    this.game = game;
    this.victoryMenuSprite = game.add.sprite(this.x, this.y, 'victoryBg');
    this.game.world.bringToTop(this.victoryMenuSprite);
    this.width = this.victoryMenuSprite.width;
    this.height = this.victoryMenuSprite.height;
    this.gameState = gameState;
    this.victoryMenuSprite.fixedToCamera = true;
  }

  enable() {
    this.game.world.bringToTop(this.victoryMenuSprite);
    this.victoryMenuSprite.visible = true;
  }

  isInside(mousePosition) {
    if(mousePosition.x > this.x && mousePosition.x < this.x+this.width && mousePosition.y > this.y && mousePosition.y < this.y+this.height) {
        return true;
    }
    return false;
  }

}