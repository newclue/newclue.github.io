/**
Tutorial: https://github.com/google/filament/blob/main/web/docs/tutorial_triangle.md
*/

function App() {
  // Convenient aliases
  var VertexAttribute = Filament.VertexAttribute;
  var AttributeType = Filament.VertexBuffer$AttributeType;
  var PrimitiveType = Filament.RenderableManager$PrimitiveType;
  var IndexType = Filament.IndexBuffer$IndexType;
  var Fov = Filament.Camera$Fov;
  var LightType = Filament.LightManager$Type;
  var Projection = Filament.Camera$Projection;
  
  var canvas = document.getElementsByTagName('canvas')[0];
  
  var engine = Filament.Engine.create(canvas);
  var scene = engine.createScene();
  
  ////
  var triangle = Filament.EntityManager.get().create();
  scene.addEntity(triangle);

  var TRIANGLE_POSITIONS = new Float32Array([
    1, 0,
    Math.cos(Math.PI * 2 / 3), Math.sin(Math.PI * 2 / 3),
    Math.cos(Math.PI * 4 / 3), Math.sin(Math.PI * 4 / 3),
  ]);
  var TRIANGLE_COLORS = new Uint32Array([0xffff0000, 0xff00ff00, 0xff0000ff]);
  
  var vb = Filament.VertexBuffer.Builder()
    .vertexCount(3)
    .bufferCount(2)
    .attribute(VertexAttribute.POSITION, 0, AttributeType.FLOAT2, 0, 8)
    .attribute(VertexAttribute.COLOR, 1, AttributeType.UBYTE4, 0, 4)
    .normalized(VertexAttribute.COLOR)
    .build(engine);
  vb.setBufferAt(engine, 0, TRIANGLE_POSITIONS);
  vb.setBufferAt(engine, 1, TRIANGLE_COLORS);
  
  var ib = Filament.IndexBuffer.Builder()
    .indexCount(3)
    .bufferType(IndexType.USHORT)
    .build(engine);
  ib.setBuffer(engine, new Uint16Array([0, 1, 2]));

  var mat = engine.createMaterial('triangle.filamat');
  var matinst = mat.getDefaultInstance();
  Filament.RenderableManager.Builder(1)
    .boundingBox({ center: [ -1, -1, -1, ], halfExtent: [ 1, 1, 1, ] })
    .material(0, matinst)
    .geometry(0, PrimitiveType.TRIANGLES, vb, ib)
    .build(engine, triangle);
  ////
  
  var swapChain = engine.createSwapChain();
  var renderer = engine.createRenderer();
  var camera = engine.createCamera(Filament.EntityManager.get().create());
  var view = engine.createView();
  view.setCamera(camera);
  view.setScene(scene);
  renderer.setClearOptions({ clear: true, });
  resize();
  window.addEventListener('resize', resize);
  window.requestAnimationFrame(render);

  function render() {
    var eye = [0, 0, 4], center = [0, 0, 0], up = [0, 1, 0];
    var radians = Date.now() / 10000;
    vec3.rotateY(eye, eye, center, radians);
    camera.lookAt(eye, center, up);
    
    renderer.render(swapChain, view);
    window.requestAnimationFrame(render);
  }

  function resize() {
    var dpr = window.devicePixelRatio;
    var width = canvas.width = canvas.clientWidth * dpr;
    var height = canvas.height = canvas.clientHeight * dpr;
    view.setViewport([0, 0, width, height]);
    var aspect = width / height;
    camera.setProjection(Projection.ORTHO, -aspect, aspect, -1, 1, 0, 1);
    //camera.setProjectionFov(45, width / height, 1.0, 10.0, Fov.VERTICAL);
  }

  var out = {
    canvas,
    engine,
    scene,
    swapChain,
    renderer,
    camera,
    view,
  };
  return out;
}

if (typeof glMatrix !== 'undefined') {
  // This is a hack because glMatrix modules are not globally available on load. They are all within `glMatrix`.
  // The Filament glMatrix extensions expect global availability.
  Object.assign(globalThis, glMatrix);
  
  loadBufferExtensions();
}
function loadBufferExtensions() {
  // Work buffers to reduce calls to `create()`.
  mat2.buffer = mat2.create();
  mat2d.buffer = mat2d.create();
  mat3.buffer = mat3.create();
  mat4.buffer = mat4.create();
  quat.buffer = quat.create();
  quat2.buffer = quat2.create();
  vec2.buffer = vec2.create();
  vec3.buffer = vec3.create();
  vec4.buffer = vec4.create();
}

Filament.init([ 'triangle.filamat', ], function () {
  // Expose app for debugging in the dev console.
  window.app = App();
});
