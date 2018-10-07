var game;

class Game extends Phaser.Game {
  constructor() {
    super("89%", "100%", Phaser.AUTO, 'phaser-example');

    this.state.add('BootState', BootState, false);

    this.state.start('BootState');
  }
}
$( document ).ready(function() {
    console.log( "ready!" );
    game = new Game();
});
