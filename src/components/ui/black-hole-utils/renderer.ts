// High-performance WebGL Relativistic Gravitational Singularity & Accretion Disk Renderer
export interface RendererOptions {
  canvas: HTMLCanvasElement
  center?: [number, number]
}

export interface BlackHoleRenderer {
  ready: Promise<void>
  dispose: () => void
  setIntensity?: (val: number) => void
  setCenter?: (x: number, y: number) => void
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_intensity;
uniform vec2 u_center;

varying vec2 v_uv;

#define PI 3.14159265359

// Simplex noise utilities
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; ++i) {
    v += a * snoise(p);
    p = rot * p * 2.15 + vec2(12.34);
    a *= 0.5;
  }
  return v;
}

void main() {
  // Coordinate normalized relative to singularity center
  vec2 centerPos = u_center * u_resolution;
  vec2 p = (gl_FragCoord.xy - centerPos) / min(u_resolution.x, u_resolution.y);

  // Very subtle mouse tilt parallax displacement (max 8-12px)
  vec2 mouseOffset = (u_mouse - 0.5) * 0.04;
  p -= mouseOffset * 0.2;

  float r = length(p);
  float phi = atan(p.y, p.x);

  // 1. Schwarzschild Radius (Event Horizon) & Photon Sphere
  // Event horizon radius: 0.115 (approx 26-28% of total visual disk diameter)
  float rs = 0.115;
  float r_photon = rs * 1.54;

  // 2. Gravitational Deflection: light paths bent inward near singularity
  float deflection = rs / max(0.001, r);
  vec2 bentP = p * (1.0 - deflection * 0.36);

  // 3. Flattened Elliptical Accretion Disk (Horizontal Projection)
  // tilt = 0.35 gives horizontal disk width ~2.2x main visible height
  float tilt = 0.35;
  float diskY = bentP.y / tilt;
  float diskR = length(vec2(bentP.x, diskY));
  float diskAngle = atan(diskY, bentP.x);

  // Relativistic Doppler beaming (approaching matter on left side is brighter)
  float doppler = 1.0 - 0.55 * (bentP.x / (diskR + 0.01));

  // Accretion disk radial density falloff (inner edge near photon sphere, outer edge fading into deep space)
  float innerR = rs * 1.38;
  float outerR = rs * 4.6;
  float diskMask = smoothstep(innerR, innerR + 0.06, diskR) * (1.0 - smoothstep(outerR * 0.42, outerR, diskR));

  // Swirling gas texture with differential Keplerian rotation
  float keplerSpeed = 0.95 / sqrt(max(0.08, diskR));
  float rotTime = u_time * keplerSpeed * 0.38;
  vec2 swirlUV = vec2(diskAngle * 2.2 + rotTime, diskR * 7.5 - rotTime * 0.4);
  float gasNoise = fbm(swirlUV);
  gasNoise = 0.45 + 0.55 * gasNoise;

  // Vertical plasma density profile (concentrated on equatorial plane)
  float verticalFalloff = exp(-pow(bentP.y / (tilt * (0.075 + diskR * 0.11)), 2.0));
  float primaryDisk = diskMask * gasNoise * doppler * verticalFalloff * 2.3;

  // 4. Gravitational Lensing (Interstellar Relativistic Arcs)
  // Rear part of the disk is bent ABOVE and BELOW the black hole shadow
  // Upper lensed arc (curves over the top of the event horizon):
  float topLensDist = length(vec2(p.x, (p.y - rs * 0.32) / 0.82));
  float topLensMask = smoothstep(rs * 1.25, rs * 1.55, topLensDist) * (1.0 - smoothstep(rs * 1.9, rs * 2.75, topLensDist));
  float topAngle = atan(p.y, p.x);
  float topNoise = fbm(vec2(topAngle * 3.0 + u_time * 0.25, topLensDist * 10.0));
  float topLensedArc = topLensMask * (0.55 + 0.45 * topNoise) * smoothstep(-0.02, 0.10, p.y) * doppler * 1.65;

  // Lower lensed arc (subtler secondary arc under the horizon):
  float botLensDist = length(vec2(p.x, (p.y + rs * 0.25) / 0.68));
  float botLensMask = smoothstep(rs * 1.15, rs * 1.38, botLensDist) * (1.0 - smoothstep(rs * 1.55, rs * 2.2, botLensDist));
  float botLensedArc = botLensMask * (0.5 + 0.5 * topNoise) * smoothstep(0.02, -0.08, p.y) * doppler * 0.85;

  // Total luminous accretion material
  float totalDisk = primaryDisk + topLensedArc + botLensedArc;

  // 5. Photon Ring (Crisp luminous ring orbiting the horizon)
  float ringAngleMod = 1.0 + 0.35 * abs(cos(phi));
  float photonRing = exp(-pow((r - r_photon) / 0.0075, 2.0)) * 2.4 * ringAngleMod * doppler;
  float innerGlow = exp(-pow((r - rs * 1.06) / 0.018, 2.0)) * 1.15;

  // 6. Color Ramp: Verified Cinematic Blue Palette
  // #020304 deep black
  vec3 deepBlack = vec3(0.008, 0.012, 0.016);
  // #07151c dark blue
  vec3 darkBlue  = vec3(0.027, 0.082, 0.110);
  // #36b7df cyan-blue
  vec3 cyanBlue  = vec3(0.212, 0.718, 0.875);
  // #8edff2 pale blue
  vec3 paleBlue  = vec3(0.557, 0.875, 0.949);
  // #e8fbff near-white highlight
  vec3 hotWhite  = vec3(0.910, 0.984, 1.000);

  // Radial color temperature ramp across the disk
  float tempT = clamp((diskR - innerR) / (outerR - innerR), 0.0, 1.0);
  vec3 diskColor = mix(hotWhite, paleBlue, smoothstep(0.0, 0.25, tempT));
  diskColor = mix(diskColor, cyanBlue, smoothstep(0.25, 0.65, tempT));
  diskColor = mix(diskColor, darkBlue, smoothstep(0.65, 0.95, tempT));
  diskColor = mix(diskColor, deepBlack, smoothstep(0.95, 1.0, tempT));

  vec3 finalColor = diskColor * totalDisk;
  finalColor += hotWhite * photonRing * 0.95;
  finalColor += paleBlue * innerGlow * 0.45;

  // 7. Event Horizon Void: Pure absolute black singularity inside Rs
  // Clean, circular, zero texture, zero stars, zero blue fill
  float eventHorizonMask = smoothstep(rs * 0.995, rs * 1.005, r);
  finalColor *= eventHorizonMask;

  // 8. Modulate with Intensity Uniform (Driven by scroll)
  finalColor *= u_intensity;

  // 9. Tone-Mapping & Natural Edge Fade into #020304
  finalColor = finalColor / (finalColor + vec3(1.0));
  // Natural falloff so wisps die down smoothly before canvas boundary
  float edgeFade = 1.0 - smoothstep(0.48, 0.72, r);
  finalColor *= edgeFade;

  gl_FragColor = vec4(finalColor, 1.0);
}
`

export function createRenderer(options: RendererOptions): BlackHoleRenderer {
  const { canvas, center = [0.70, 0.48] } = options
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

  if (!gl) {
    console.warn('WebGL not supported for BlackHole renderer')
    return {
      ready: Promise.resolve(),
      dispose: () => {},
    }
  }

  let animationFrameId: number | null = null
  let isDisposed = false
  let isVisible = true
  let currentIntensity = 1.0
  let targetIntensity = 1.0
  let currentCenterX = center[0]
  let currentCenterY = center[1]
  let targetCenterX = center[0]
  let targetCenterY = center[1]

  // Compile Shaders
  const compileShader = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
  const fragShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)

  if (!vertShader || !fragShader) {
    return {
      ready: Promise.resolve(),
      dispose: () => {},
    }
  }

  const program = gl.createProgram()
  if (!program) {
    return {
      ready: Promise.resolve(),
      dispose: () => {},
    }
  }

  gl.attachShader(program, vertShader)
  gl.attachShader(program, fragShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    return {
      ready: Promise.resolve(),
      dispose: () => {},
    }
  }

  gl.useProgram(program)

  // Full-screen Quad Geometry Buffer
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]),
    gl.STATIC_DRAW
  )

  const aPositionLocation = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(aPositionLocation)
  gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0)

  // Uniform locations
  const uResolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  const uTimeLocation = gl.getUniformLocation(program, 'u_time')
  const uMouseLocation = gl.getUniformLocation(program, 'u_mouse')
  const uIntensityLocation = gl.getUniformLocation(program, 'u_intensity')
  const uCenterLocation = gl.getUniformLocation(program, 'u_center')

  let mouseX = 0.5
  let mouseY = 0.5
  let targetMouseX = 0.5
  let targetMouseY = 0.5

  const handlePointerMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    targetMouseX = (e.clientX - rect.left) / rect.width
    targetMouseY = 1.0 - (e.clientY - rect.top) / rect.height
  }

  window.addEventListener('mousemove', handlePointerMove, { passive: true })

  // Resize handler with capped DPR
  const resize = () => {
    if (!canvas || isDisposed) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const displayWidth = Math.round(canvas.clientWidth * dpr)
    const displayHeight = Math.round(canvas.clientHeight * dpr)

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth || window.innerWidth
      canvas.height = displayHeight || window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
  }

  const resizeObserver = new ResizeObserver(() => resize())
  resizeObserver.observe(canvas)
  resize()

  // IntersectionObserver to pause rendering when offscreen
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting
    },
    { threshold: 0 }
  )
  intersectionObserver.observe(canvas)

  const handleVisibilityChange = () => {
    isVisible = !document.hidden
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Render loop
  const startTime = performance.now()

  const render = (now: number) => {
    if (isDisposed) return

    if (isVisible) {
      const elapsedSeconds = (now - startTime) / 1000

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      // Smooth intensity interpolation
      currentIntensity += (targetIntensity - currentIntensity) * 0.08

      // Smooth center position interpolation
      currentCenterX += (targetCenterX - currentCenterX) * 0.08
      currentCenterY += (targetCenterY - currentCenterY) * 0.08

      gl.useProgram(program)
      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(uTimeLocation, elapsedSeconds)
      gl.uniform2f(uMouseLocation, mouseX, mouseY)
      gl.uniform1f(uIntensityLocation, currentIntensity)
      gl.uniform2f(uCenterLocation, currentCenterX, currentCenterY)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    animationFrameId = requestAnimationFrame(render)
  }

  animationFrameId = requestAnimationFrame(render)

  const dispose = () => {
    isDisposed = true
    if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
    window.removeEventListener('mousemove', handlePointerMove)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()

    if (gl) {
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertShader)
      gl.deleteShader(fragShader)
    }
  }

  return {
    ready: Promise.resolve(),
    dispose,
    setIntensity: (val: number) => {
      targetIntensity = Math.max(0, Math.min(1, val))
    },
    setCenter: (x: number, y: number) => {
      targetCenterX = x
      targetCenterY = y
    },
  }
}

export default createRenderer
