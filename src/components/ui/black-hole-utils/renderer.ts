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

  // Subtle interactive parallax tilt (max 8px)
  vec2 mouseOffset = (u_mouse - 0.5) * 0.04;
  p -= mouseOffset * 0.18;

  float r = length(p);
  float phi = atan(p.y, p.x);

  // 1. LAYER 1: EVENT HORIZON & PHOTON SPHERE GEOMETRY
  // Commanding, cinematic event horizon radius (clean circular dark core)
  float rs = 0.170;
  float r_photon = rs * 1.022;

  // Razor-sharp event horizon boundary mask (0 inside the void, 1 outside)
  float voidMask = smoothstep(rs * 0.997, rs * 1.003, r);

  // 2. RELATIVISTIC DOPPLER BEAMING
  // Approaching material on the left orbits at relativistic speeds -> brighter & hotter
  float doppler = 1.0 - 0.72 * (p.x / (r + 0.015));
  doppler = clamp(doppler, 0.28, 2.15);

  // 3. LAYER 2: PHOTON RING (Bent light hugging the event horizon)
  float photonDist = abs(r - r_photon);
  float photonRing = exp(-pow(photonDist / 0.0032, 2.0)) * 4.6 * doppler * smoothstep(rs, rs + 0.002, r);

  // 4. LAYER 3: HORIZONTAL ACCRETION DISK (Equatorial Plane)
  // Tilt = 0.15 gives an authentic, knife-flat ~6.6:1 horizontal aspect ratio
  float tilt = 0.15;
  float diskY = (p.y + rs * 0.06) / tilt;
  float diskR = length(vec2(p.x, diskY));
  float diskAngle = atan(diskY, p.x);

  // Physical disk boundaries (ISCO inner boundary to outer diffuse wing)
  float r_in = rs * 1.25;
  float r_out = rs * 5.20;

  // Radial emission: intense power-law falloff near inner edge, smooth outer fade
  float diskRadialMask = smoothstep(r_in, r_in + 0.04, diskR) *
                         pow(r_in / max(r_in, diskR), 1.35) *
                         (1.0 - smoothstep(r_out * 0.42, r_out, diskR));

  // Concentric Keplerian laminar grooves & striations (fine disk rings, NOT cloudy smoke)
  float keplerSpeed = 1.35 / sqrt(max(0.06, diskR));
  float rotTime = u_time * keplerSpeed * 0.45;
  float grooves = sin(diskR * 95.0 - rotTime * 0.25) * 0.16 + cos(diskR * 190.0) * 0.09;
  vec2 streamUV = vec2(diskAngle * 3.8 + rotTime, diskR * 28.0 - rotTime * 0.35);
  float streamNoise = fbm(streamUV);
  float diskTexture = clamp(0.72 + 0.22 * streamNoise + grooves, 0.0, 1.45);

  // Knife-thin vertical profile concentrated on equatorial plane
  float diskThickness = tilt * (0.024 + 0.038 * (diskR / r_out));
  float diskVerticalFalloff = exp(-pow((p.y + rs * 0.06) / diskThickness, 2.0));
  float diskLuminance = diskRadialMask * diskVerticalFalloff * diskTexture * doppler * 3.4;

  // 5. LAYER 4: GRAVITATIONAL LENSING (Far-side disk bent over the top)
  // Upper Majestic Crown: rays from the rear disk bent over the top of the black hole
  float topLensDist = length(vec2(p.x, (p.y - rs * 0.12) / 0.88));
  float topLensMask = smoothstep(rs * 1.08, rs * 1.22, topLensDist) *
                      (1.0 - smoothstep(rs * 1.80, rs * 2.40, topLensDist));
  float topAngle = atan(p.y, p.x);
  float topGrooves = sin(topLensDist * 85.0) * 0.12;
  float topNoise = fbm(vec2(topAngle * 4.5 + u_time * 0.32, topLensDist * 22.0));
  float topTexture = clamp(0.74 + 0.22 * topNoise + topGrooves, 0.0, 1.4);
  // Strictly gates to upper hemisphere, curving over the top of the void
  float topGate = smoothstep(-rs * 0.15, rs * 0.25, p.y);
  float upperLensedArch = topLensMask * topTexture * topGate * doppler * 2.7;

  // Lower Lensed Arc: secondary underbelly reflection
  float botLensDist = length(vec2(p.x, (p.y + rs * 0.08) / 0.65));
  float botLensMask = smoothstep(rs * 1.04, rs * 1.15, botLensDist) *
                      (1.0 - smoothstep(rs * 1.40, rs * 1.80, botLensDist));
  float botGate = smoothstep(rs * 0.08, -rs * 0.18, p.y);
  float lowerLensedArch = botLensMask * 0.85 * botGate * doppler;

  // 6. TOTAL LUMINOUS EMISSION (Strictly occluded by the Event Horizon Void)
  float totalEmission = (upperLensedArch + lowerLensedArch + diskLuminance + photonRing) * voidMask;

  // 7. COLOR RAMP (Verified GuruKul Cool Cyan/Blue Palette)
  vec3 deepBlack  = vec3(0.0078, 0.0118, 0.0157); // #020304
  vec3 outerSmoky = vec3(0.027, 0.082, 0.110);     // #07151c
  vec3 cyanBlue   = vec3(0.212, 0.718, 0.875);     // #36b7df
  vec3 paleCyan   = vec3(0.557, 0.875, 0.949);     // #8edff2
  vec3 hotWhite   = vec3(0.920, 0.985, 1.000);     // #e8fbff

  // Temperature gradient: high Doppler and inner radii reach hot white; outer wings transition to cyan/smoky blue
  float heat = clamp(totalEmission * 0.42 + (doppler - 0.75) * 0.38, 0.0, 1.0);
  vec3 emissionColor = mix(outerSmoky, cyanBlue, smoothstep(0.04, 0.32, heat));
  emissionColor = mix(emissionColor, paleCyan, smoothstep(0.32, 0.68, heat));
  emissionColor = mix(emissionColor, hotWhite, smoothstep(0.68, 0.94, heat));

  vec3 finalColor = emissionColor * totalEmission;

  // Tone-mapping
  finalColor = finalColor / (finalColor + vec3(1.0));

  // Elliptical edge fade: wide horizontal disk wings, clean natural feather into deep space
  float edgeDist = length(vec2(p.x * 0.68, p.y * 1.35));
  float edgeFade = 1.0 - smoothstep(0.62, 0.90, edgeDist);
  finalColor *= edgeFade;

  // Modulate with Scroll Intensity Uniform
  finalColor *= u_intensity;

  // Alpha Compositing: empty space is transparent for particle layer, glowing gas has alpha
  float gasLuminance = max(finalColor.r, max(finalColor.g, finalColor.b));
  float gasAlpha = clamp(gasLuminance * 2.8, 0.0, 1.0);
  float totalAlpha = gasAlpha;

  // 8. ABSOLUTE VOID INTEGRITY (Zero fog, zero texture, zero blue fill inside r <= rs)
  if (r <= rs) {
    finalColor = deepBlack;
    totalAlpha = 1.0 * u_intensity;
  }

  gl_FragColor = vec4(finalColor, totalAlpha);
}
`

export function createRenderer(options: RendererOptions): BlackHoleRenderer {
  const { canvas, center = [0.70, 0.48] } = options
  const gl = canvas.getContext('webgl2', { alpha: true }) || canvas.getContext('webgl', { alpha: true })

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
