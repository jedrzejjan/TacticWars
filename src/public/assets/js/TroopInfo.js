class VictoryMenu {
  constructor(game, gameState, winnerPlayer, selectedTroop) {
    this.x = 100;
    this.y = 100;
    this.game = game;
    this.background = game.add.sprite(this.x, this.y, 'troopInfoBg');
    this.game.world.bringToTop(this.background);

    this.width = this.victoryMenuSprite.width;
    this.height = this.victoryMenuSprite.height;
    this.gameState = gameState;
    this.victoryMenuSprite.fixedToCamera = true;

    let description = this.game.cache.getJSON('troopsInfo')[selectedTroop.getText()];
    this.descriptionText = this.game.add.text(this.x+50, this.y+50, description);
  }

  disable() {
    this.background.destroy();
  }

}
