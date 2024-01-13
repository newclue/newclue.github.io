function main() {
  var canvas = document.getElementsByTagName('canvas')[0];
  var engine = Filament.Engine.create(canvas);
  var scene = engine.createScene();
  var triangle = Filament.EntityManager.get().create();
  scene.addEntity(triangle);
  
  function resize() {
  }
  function render() {
    window.requestAnimationFrame(render);
  }
  
  window.addEventListener('resize', resize);
  window.requestAnimationFrame(render);
}
Filament.init([ 'triangle.filamat', ], main);
