class BootState extends Phaser.State {
  preload() {
    this.game.load.image('SplashScreenBG', 'assets/Images/SplashScreen.png');
    this.state.add('PreloadState', PreloadState, false);
    this.state.add('MenuState', MenuState, false);
    this.state.add('GameState', GameState, false);
    this.state.add('GameMenuState', GameMenuState, false);
    this.state.add('LobbiesState', LobbiesState, false);
    this.game.stage.disableVisibilityChange = true;
  }

  create() {
    this.game.state.start("PreloadState");
  }
}
