/**
Tutorial: https://github.com/google/filament/blob/main/web/docs/tutorial_triangle.md
*/

Filament.init([ 'triangle.filamat', ], main);

function main() {
  var canvas = document.getElementsByTagName('canvas')[0];
  var engine = Filament.Engine.create(canvas);
  var scene = engine.createScene();
  var triangle = Filament.EntityManager.get().create();
  scene.addEntity(triangle);

  var TRIANGLE_POSITIONS = new Float32Array([
    1, 0,
    Math.cos(Math.PI * 2 / 3), Math.sin(Math.PI * 2 / 3),
    Math.cos(Math.PI * 4 / 3), Math.sin(Math.PI * 4 / 3),
  ]);
  var TRIANGLE_COLORS = new Uint32Array([0xffff0000, 0xff00ff00, 0xff0000ff]);
  
  var VertexAttribute = Filament.VertexAttribute;
  var AttributeType = Filament.VertexBuffer$AttributeType;
  
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
    .bufferType(Filament.IndexBuffer$IndexType.USHORT)
    .build(engine);
  ib.setBuffer(engine, new Uint16Array([0, 1, 2]));

  var mat = engine.createMaterial('triangle.filamat');
  var matinst = mat.getDefaultInstance();
  Filament.RenderableManager.Builder(1)
    .boundingBox({ center: [-1, -1, -1], halfExtent: [1, 1, 1] })
    .material(0, matinst)
    .geometry(0, Filament.RenderableManager$PrimitiveType.TRIANGLES, vb, ib)
    .build(engine, triangle);

  var swapChain = engine.createSwapChain();
  var renderer = engine.createRenderer();
  var camera = engine.createCamera(Filament.EntityManager.get().create());
  var view = engine.createView();
  view.setCamera(camera);
  view.setScene(scene);
  
  renderer.setClearOptions({clearColor: [0.0, 0.1, 0.2, 1.0], clear: true});

  resize();

  function resize() {
    var dpr = window.devicePixelRatio;
    var width = canvas.clientWidth * dpr;
    var height = canvas.clientHeight * dpr;
    view.setViewport([0, 0, width, height]);
    var aspect = width / height;
    var Projection = Filament.Camera$Projection;
    camera.setProjection(Projection.ORTHO, -aspect, aspect, -1, 1, 0, 1);
  }
  function render() {
    var radians = Date.now() / 1000;
    var transform = mat4.fromRotation(mat4.create(), radians, [0, 0, 1]);
    var tcm = engine.getTransformManager();
    var inst = tcm.getInstance(triangle);
    tcm.setTransform(inst, transform);
    inst.delete();

    renderer.render(swapChain, view);
    window.requestAnimationFrame(render);
  }

  window.addEventListener('resize', resize);
  window.requestAnimationFrame(render);
}
