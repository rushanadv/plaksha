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

  // Subtle interactive parallax tilt (max 10px)
  vec2 mouseOffset = (u_mouse - 0.5) * 0.04;
  p -= mouseOffset * 0.2;

  float r = length(p);
  float phi = atan(p.y, p.x);

  // 1. Schwarzschild Shadow Radius (Prominent, cinematic event horizon)
  float rs = 0.165;
  float r_photon = rs * 1.028;

  // 2. Relativistic Doppler Beaming (left side rotates toward observer -> brighter & hotter)
  float doppler = 1.0 - 0.70 * (p.x / (r + 0.015));
  doppler = clamp(doppler, 0.32, 1.95);

  // 3. HORIZONTAL ACCRETION DISK (Equatorial Plane Projection)
  // Tilt = 0.17 gives an authentic, sleek ~5.8:1 horizontal aspect ratio
  float tilt = 0.17;
  float diskY = (p.y + rs * 0.04) / tilt;
  float diskR = length(vec2(p.x, diskY));
  float diskAngle = atan(diskY, p.x);

  // Radial extent of the physical accretion disk
  float r_in = rs * 1.22;
  float r_out = rs * 4.85;
  float diskRadialMask = smoothstep(r_in, r_in + 0.05, diskR) * (1.0 - smoothstep(r_out * 0.45, r_out, diskR));

  // Keplerian differential gas rotation
  float keplerSpeed = 1.15 / sqrt(max(0.06, diskR));
  float rotTime = u_time * keplerSpeed * 0.40;
  vec2 diskUV = vec2(diskAngle * 3.2 + rotTime, diskR * 14.0 - rotTime * 0.3);
  float diskNoise = 0.52 + 0.48 * fbm(diskUV);

  // Vertical thickness profile of the flat horizontal disk
  float diskThickness = tilt * (0.038 + 0.055 * (diskR / r_out));
  float diskVerticalFalloff = exp(-pow((p.y + rs * 0.04) / diskThickness, 2.0));

  // Front vs Back Disk split:
  // p.y < -rs * 0.02 is in FRONT of the black hole (slices across the lower half)
  // p.y > -rs * 0.02 is BEHIND the black hole
  float isFront = smoothstep(0.04, -0.06, p.y + rs * 0.04);
  float isBack = 1.0 - isFront;

  // Front horizontal disk (cuts directly across the lower front of the void!)
  float frontDisk = diskRadialMask * diskVerticalFalloff * diskNoise * doppler * 2.8;

  // 4. GRAVITATIONAL LENSING: Upper Crown Arch (The iconic Interstellar feature!)
  // Rays from the rear of the disk bending over the top of the black hole
  // The arch wraps around the top half (p.y > -rs * 0.15)
  float topLensDist = length(vec2(p.x, (p.y - rs * 0.14) / 0.86));
  float topLensMask = smoothstep(rs * 1.08, rs * 1.24, topLensDist) * (1.0 - smoothstep(rs * 1.85, rs * 2.50, topLensDist));
  float topAngle = atan(p.y, p.x);
  float topNoise = 0.55 + 0.45 * fbm(vec2(topAngle * 4.0 + u_time * 0.28, topLensDist * 16.0));
  // Gate strictly to upper hemisphere with smooth transition to the horizontal disk wings
  float topGate = smoothstep(-rs * 0.18, rs * 0.25, p.y);
  float upperLensedArch = topLensMask * topNoise * topGate * doppler * 2.2;

  // 5. Lower Lensing Arc (Subtle underbelly lens)
  float botLensDist = length(vec2(p.x, (p.y + rs * 0.10) / 0.62));
  float botLensMask = smoothstep(rs * 1.04, rs * 1.16, botLensDist) * (1.0 - smoothstep(rs * 1.45, rs * 1.95, botLensDist));
  float botGate = smoothstep(rs * 0.08, -rs * 0.18, p.y);
  float lowerLensedArch = botLensMask * (0.6 + 0.4 * topNoise) * botGate * doppler * 0.85;

  // Combine Rear Lensed Energy
  float lensedEnergy = upperLensedArch + lowerLensedArch;

  // 6. Photon Ring (High-energy, razor-sharp photon sphere boundary)
  float photonDist = abs(r - r_photon);
  float photonRing = exp(-pow(photonDist / 0.0042, 2.0)) * 3.4 * doppler;

  // 7. Total Plasma Emission
  // Notice: The rear lensed arch sits BEHIND the event horizon, so it is occluded by the black hole void
  // But the front horizontal disk passes IN FRONT of the black hole void!
  float voidMask = smoothstep(rs * 0.993, rs * 1.007, r);

  // Background light (rear disk & lensed arcs + photon ring): occluded by event horizon
  float rearLight = (lensedEnergy + diskRadialMask * isBack * diskVerticalFalloff * diskNoise * doppler * 1.4 + photonRing) * voidMask;

  // Foreground light (front disk crossing in front): NOT occluded by event horizon!
  float frontLight = frontDisk * isFront;

  // Total luminous material
  float totalLuminance = rearLight + frontLight;

  // 8. Color Ramp: Authentic GuruKul Cinematic Cyan/Blue
  vec3 deepBlack  = vec3(0.0078, 0.0118, 0.0157); // #020304
  vec3 outerSmoky = vec3(0.027, 0.082, 0.110);     // #07151c
  vec3 cyanBlue   = vec3(0.212, 0.718, 0.875);     // #36b7df
  vec3 paleCyan   = vec3(0.557, 0.875, 0.949);     // #8edff2
  vec3 hotWhite   = vec3(0.920, 0.985, 1.000);     // #e8fbff

  // Temperature gradient: high Doppler and inner radii reach hot white; outer edges reach deep cyan/smoky blue
  float heat = clamp(totalLuminance * 0.45 + (doppler - 0.8) * 0.35, 0.0, 1.0);
  vec3 emissionColor = mix(outerSmoky, cyanBlue, smoothstep(0.05, 0.35, heat));
  emissionColor = mix(emissionColor, paleCyan, smoothstep(0.35, 0.70, heat));
  emissionColor = mix(emissionColor, hotWhite, smoothstep(0.70, 0.95, heat));

  vec3 finalColor = emissionColor * totalLuminance;

  // Tone-mapping
  finalColor = finalColor / (finalColor + vec3(1.0));

  // Elliptical Edge Fade to prevent ANY rectangular box clipping while letting disk wings sweep wide
  float edgeDist = length(vec2(p.x * 0.70, p.y * 1.35));
  float edgeFade = 1.0 - smoothstep(0.60, 0.88, edgeDist);
  finalColor *= edgeFade;

  // 9. Modulate with Scroll Intensity Uniform
  finalColor *= u_intensity;

  // 10. Alpha Compositing (Event horizon void is pure opaque black, empty space is transparent)
  // Inside the event horizon void:
  // If r < rs and frontLight is low: it is a pure pitch-black void!
  float isPureVoid = (1.0 - voidMask) * (1.0 - clamp(frontLight * 1.5, 0.0, 1.0)) * u_intensity;
  float gasLuminance = max(finalColor.r, max(finalColor.g, finalColor.b));
  float gasAlpha = clamp(gasLuminance * 2.8, 0.0, 1.0);
  float totalAlpha = clamp(isPureVoid + gasAlpha, 0.0, 1.0);

  // Strict Void Color: inside the void without front disk, enforce exact pure #020304 black
  if (r < rs && frontLight < 0.05) {
    finalColor = deepBlack;
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
