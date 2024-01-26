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
    -1, -1,
    -1, 1,
  ]);
  var TRIANGLE_COLORS = new Uint32Array([ 0xffff0000, 0xff00ff00, 0xff0000ff, ]);
  
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
    const radians = Date.now() / 1000;
    const transform = mat4.fromRotation(mat4.create(), radians, [0, 0, 1]);
    const tcm = engine.getTransformManager();
    const inst = tcm.getInstance(triangle);
    tcm.setTransform(inst, transform);
    inst.delete();
    
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
    //setCameraProjectionDiagonalFov(camera, 45, width / height, 1.0, 10.0);
  }

  // Custom Camera$Fov type DIAGONAL, which keeps the area constant rather than the height or width.
  function setCameraProjectionDiagonalFov(camera, fovInDegrees, aspect, near, far) {
    camera.setCustomProjection(projection(fovInDegrees, aspect, near, far), near, far);
    // A transplant of FCamera::projection from 'google/filament/src/details/Camera.cpp' with modifications for area-based frustum dims.
    function projection(fovInDegrees, aspect, near, far) {
      var w, h;
      var s = Math.tan(fovInDegrees * (Math.PI / 180.0) / 2.0) * near;
      var x = Math.sqrt(aspect);
      w = s * x;
      h = s * (1 / x);
      var p = mat4.create();
      mat4.frustum(p, -w, w, -h, h, near, far);
      if (far === Infinity) {
        // 4(row-1)+(column-1) = index
        p[5] = -1.0;         // lim(far->inf) = -1
        p[9] = -2.0 * near;  // lim(far->inf) = -2*near
      }
      return p;
    }
  }

  ////
  /**
   * @param {vec2} out - resulting cartesian coordinate
   * @param {vec3} a - hexagonal coordinate
   */
  var n = Math.sqrt(0.75);
  var m1 = new Float32Array([ 1, 0.5, -0.5, 0, n, n, ]);
  function fromHexagonal(out, a) {
    var b = m1;
    out[0] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    out[1] = a[0] * b[3] + a[1] * b[4] + a[2] * b[5];
    return out;
  }
  /**
   * @param {vec3} out - resulting hexagonal coordinate
   * @param {vec2} a - cartesian coordinate
   */
  var n = 0.5 * Math.sqrt(1 / 0.75);
  var m2 = new Float32Array([ 1, 0, 0, n, 0, n, ]);
  function toHexagonal(out, a) {
    var b = m2;
    out[0] = a[0] * b[0] + a[1] * b[1];
    out[1] = a[0] * b[2] + a[1] * b[3];
    out[2] = a[0] * b[4] + a[1] * b[5];
    return out;
  }

  function generateHexagonalGridPoints(max) {
    var len = max ** 2 ** 2;
    var out = new Float32Array(len);
    var i = 0, j = 0, k = 0;
    var p = 0;
    while (i < max) {
      out[p + 0] = i;
      out[p + 1] = j;
      out[p + 2] = k;
      k++;
      p += 3;
      if (k === max) {
        k = 0; j++;
      }
      if (j == max) {
        j = 0; i++;
      }
    }
    var sequence = out;
    var out = [];
    var buf = new Float32Array(2);
    var p = 0, q;
    while (p + 3 < len) {
      q = sequence.subarray(p, p + 3);
      p += 3;
      fromHexagonal(buf, q);
      out.push(buf[0], buf[1]);
    }
    return new Float32Array(out);
  }
  ////

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

// This is a hack because glMatrix modules are not globally available on load. They are all within `glMatrix`.
// The Filament glMatrix extensions expect global availability.
Object.assign(globalThis, glMatrix);

Filament.init([ 'triangle.filamat', ], function () {
  // Expose app for debugging in the dev console.
  window.app = App();
});
