window.mat4 = glMatrix.mat4
window.vec3 = glMatrix.vec3

function createSphere(meridians = 10, parallels = 10) {
  let vertices = [], points = [];

  vertices.push([0, 1, 0])
  let lat, lon, x, y, z;
  for (let i = 1; i < parallels; ++i) {
    lat = i * Math.PI / parallels
    for (let j = 0; j < meridians; ++j) {
      lon = j * 2 * Math.PI / meridians
      x = Math.sin(lat) * Math.cos(lon)
      y = Math.sin(lat) * Math.sin(lon)
      z = Math.cos(lat)
      vertices.push([y, z, x])
    }
  }
  vertices.push([0, -1, 0])

  function tri(a, b, c) {
    points.push(...vertices[a], ...vertices[b], ...vertices[c])
  }
  function quad(a, b, c, d) {
    tri(b, a, c)
    tri(b, c, d)
  }

  for (let i = meridians; i > 0; --i) {
    tri(0, i, i - 1 || meridians)
  }
  let aStart, bStart
  for (let i = 0; i < parallels - 2; ++i) {
    aStart = i * meridians + 1
    bStart = (i + 1) * meridians + 1
    for (let j = 0; j < meridians; ++j) {
      quad(aStart + j, aStart + (j + 1) % meridians, bStart + j, bStart + (j + 1) % meridians)
    }
  }
  for (let l = vertices.length - 1, i = l - meridians; i < l; ++i) {
    tri(l, i, i + 1 === l ? l - meridians : i + 1)
  }

  return new Float32Array(points)
}

function createNormalizedCubeSphere(divisions = 5) {
  const vertices = [], points = []

  const origins = [
    [-1, -1, -1], [1, -1, -1], [1, -1, 1],
    [-1, -1, 1], [-1, 1, -1], [-1, -1, 1]
  ]

  const rights = [
    [2, 0, 0], [0, 0, 2], [-2, 0, 0],
    [0, 0, -2], [2, 0, 0], [2, 0, 0]
  ]

  const ups = [
    [0, 2, 0], [0, 2, 0], [0, 2, 0],
    [0, 2, 0], [0, 0, 2], [0, 0, -2]
  ]

  const step = 1 / divisions
  let origin, right, up
  for (let i = 0 ; i < 6; ++i) {
    origin = origins[i]
    right = rights[i]
    up = ups[i]
    for (let j = 0; j <= divisions; ++j) {
      for (let k = 0; k <= divisions; ++ k) {
        const ur = vec3.add([], vec3.scale([], up, j * step), vec3.scale([], right, k * step))
        vertices.push(
          vec3.normalize([], vec3.add([], origin, ur))
        )
      }
    }
  }

  function tri(a, b, c) {
    points.push(...vertices[a], ...vertices[b], ...vertices[c])
  }
  function quad(a, b, c, d) {
    tri(b, a, c)
    tri(b, c, d)
  }

  const row = divisions + 1
  let a, c
  for (let i = 0; i < 6; ++i) {
    for (let j = 0; j < divisions; ++j) {
      for (let k = 0; k < divisions; ++k) {
        a = (i * row + j) * row + k
        c = (i * row + j + 1) * row + k
         quad(a, a + 1, c, c + 1)
      }
    }
  }

  return new Float32Array(points)
}

function createTetrahedronSphere(count = 0) {
  const points = []

  const ta = [0, 0, -1]
  const tb = [Math.sqrt(8 / 9), 0, 1 / 3]
  const tc = [-1 * Math.sqrt(2 / 9), Math.sqrt(2/ 3), 1 / 3]
  const td = [-1 * Math.sqrt(2 / 9), -1 * Math.sqrt(2/ 3), 1 / 3]

  function tri(a, b, c) {
    points.push(...a, ...b, ...c)
  }
  function divide(a, b, c, count) {
    if (count > 0) {
      const ab = vec3.normalize([], vec3.scale([], vec3.add([], a, b), 0.5))
      const ac = vec3.normalize([], vec3.scale([], vec3.add([], a, c), 0.5))
      const bc = vec3.normalize([], vec3.scale([], vec3.add([], b, c), 0.5))

      divide(a, ab, ac, count - 1)
      divide(ab, b, bc, count - 1)
      divide(bc, c, ac, count - 1)
      divide(ab, bc, ac, count - 1)
    } else {
      tri(a, b, c)
    }
  }

  divide(ta, tc, tb, count)
  divide(ta, td, tc, count)
  divide(ta, tb, td, count)
  divide(tb, tc, td, count)

  return new Float32Array(points)
}

function createIcosahedronSphere(count = 0) {
  const points = []

  const t = (1 + Math.sqrt(5)) / 2
  const v1 = vec3.normalize([], [-1, t, 0])
  const v2 = vec3.normalize([], [1, t, 0])
  const v3 = vec3.normalize([], [-1, -t, 0])
  const v4 = vec3.normalize([], [1, -t, 0])
  const v5 = vec3.normalize([], [0, -1, t])
  const v6 = vec3.normalize([], [0, 1, t])
  const v7 = vec3.normalize([], [0, -1, -t])
  const v8 = vec3.normalize([], [0, 1, -t])
  const v9 = vec3.normalize([], [t, 0, -1])
  const v10 = vec3.normalize([], [t, 0, 1])
  const v11 = vec3.normalize([], [-t, 0, -1])
  const v12 = vec3.normalize([], [-t, 0, 1])

  function tri(a, b, c) {
    points.push(...a, ...b, ...c)
  }
  function divide(a, b, c, count) {
    if (count > 0) {
      const ab = vec3.normalize([], vec3.scale([], vec3.add([], a, b), 0.5))
      const ac = vec3.normalize([], vec3.scale([], vec3.add([], a, c), 0.5))
      const bc = vec3.normalize([], vec3.scale([], vec3.add([], b, c), 0.5))

      divide(a, ab, ac, count - 1)
      divide(ab, b, bc, count - 1)
      divide(bc, c, ac, count - 1)
      divide(ab, bc, ac, count - 1)
    } else {
      tri(a, b, c)
    }
  }

  divide(v1, v12, v6, count)
  divide(v1, v6, v2, count)
  divide(v1, v2, v8, count)
  divide(v1, v8, v11, count)
  divide(v1, v11, v12, count)
  divide(v2, v6, v10, count)
  divide(v6, v12, v5, count)
  divide(v12, v11, v3, count)
  divide(v11, v8, v7, count)
  divide(v8, v2, v9, count)
  divide(v4, v10, v5, count)
  divide(v4, v5, v3, count)
  divide(v4, v3, v7, count)
  divide(v4, v7, v9, count)
  divide(v4, v9, v10, count)
  divide(v5, v10, v6, count)
  divide(v3, v5, v12, count)
  divide(v7, v3, v11, count)
  divide(v9, v7, v8, count)
  divide(v10, v9, v2, count)

  return new Float32Array(points)
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    throw 'could not compile shader -> ' + source + gl.getShaderInfoLog(shader)
  }
  return shader;
}

function createProgram(gl, vertex, fragment) {
  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    throw ('program failed to link -> ' + gl.getProgramInfoLog(program));
  }
  return program
}


const canvas = document.createElement('canvas')
canvas.width = 800
canvas.height = 800
document.body.appendChild(canvas)
const gl = canvas.getContext('webgl')
gl.viewport(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight)

const vs = `
  attribute vec4 aPosition;

  void main() {
    gl_Position = aPosition;
  }
`
const fs = `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(0., 0., 0., 1.);
  }
`

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs)
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs)
const program = createProgram(gl, vertexShader, fragmentShader)
gl.useProgram(program)
gl.deleteShader(vertexShader)
gl.deleteShader(fragmentShader)
gl.enable(gl.CULL_FACE)
gl.enable(gl.DEPTH_TEST)
gl.clearColor(1,1,1,1)

const uvSphere = createSphere()
const ncSphere = createNormalizedCubeSphere()
const tSphere = createTetrahedronSphere()
const iSphere = createIcosahedronSphere()


