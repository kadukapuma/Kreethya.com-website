/**
 * RobotMascot — animated 3D robot for React.
 *
 * Usage:   <RobotMascot size={360} accent="#22e06b" />
 *
 * Props
 *   size         width in px (height follows automatically). Use style/className to size it yourself instead.
 *   accent       glow colour for eyes, visor rim and antenna (any CSS hex colour)
 *   interactive  follow the mouse, wave on hover, jump on click (default true)
 *   shadow       soft shadow under the wheels (default true)
 *   autoWave     wave by itself every few seconds (default true)
 *   control      optional ref to an object the page writes to every frame:
 *                  pose     'idle' | 'hi' (both hands up) | 'bye' (waving)
 *                  move     -1..1, leans and spins the wheels (e.g. scroll speed)
 *                  face     -1..1, turns the body left / right
 *                  jumpReq  set true to make it do a happy jump with a spin
 *
 * The background is transparent, so it sits on top of any section of your site.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function RobotMascot({
  size = 360,
  accent = "#22e06b",
  interactive = true,
  shadow = true,
  autoWave = true,
  control,
  className,
  style,
}) {
  const holder = useRef(null);

  useEffect(() => {
    if (!holder.current) return undefined;
    const robot = mountRobot(THREE, holder.current, {
      accent, interactive, shadow, autoWave, control: control && control.current,
    });
    return () => robot.dispose();
  }, [accent, interactive, shadow, autoWave, control]);

  return (
    <div
      ref={holder}
      className={className}
      role="img"
      aria-label="Animated robot mascot"
      style={{ width: size, maxWidth: "100%", aspectRatio: "1 / 1.08", ...style }}
    />
  );
}

/* ------------------------------------------------------------------ *
 * mountRobot(THREE, container, options)
 * Builds the robot from basic shapes (no model file to download),
 * animates it, and returns { dispose } for cleanup.
 * ------------------------------------------------------------------ */
function mountRobot(THREE, container, options) {
  const opts = Object.assign(
    { accent: "#22e06b", interactive: true, shadow: true, autoWave: true, control: null },
    options || {}
  );
  const ctl = opts.control || {};
  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- renderer ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = "display:block;width:100%;height:100%;outline:none";
  if (opts.interactive) canvas.style.cursor = "pointer";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const disposables = [];
  const track = (x) => (disposables.push(x), x);

  /* ---------- colours ---------- */
  const accent = new THREE.Color(opts.accent);
  const accentBright = accent.clone().lerp(new THREE.Color("#ffffff"), 0.35);

  /* ---------- studio reflections (gives the glossy toy look) ---------- */
  const envTarget = (function makeEnv() {
    const s = new THREE.Scene();
    const geos = [];
    const mats = [];
    const add = (geo, color, intensity, pos) => {
      const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      mat.color.multiplyScalar(intensity);
      const m = new THREE.Mesh(geo, mat);
      if (pos) { m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); }
      geos.push(geo); mats.push(mat); s.add(m);
    };
    add(new THREE.BoxGeometry(24, 24, 24), 0x3a4040, 1);
    add(new THREE.PlaneGeometry(10, 10), 0xffffff, 7, [0, 11, 2]);
    add(new THREE.PlaneGeometry(5, 9), 0xffffff, 5, [-11, 4, 5]);
    add(new THREE.PlaneGeometry(3, 7), 0xffffff, 3.5, [11, 3, 4]);
    add(new THREE.PlaneGeometry(7, 3), 0xffffff, 2, [0, 5, 11]);
    add(new THREE.PlaneGeometry(9, 9), accent.getHex(), 1.6, [0, -11, 0]);
    add(new THREE.PlaneGeometry(6, 8), accent.getHex(), 0.9, [4, 3, -11]);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const rt = pmrem.fromScene(s, 0.03);
    pmrem.dispose();
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    return rt;
  })();
  scene.environment = envTarget.texture;

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1b2a22, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-3, 7, 6);
  scene.add(key);
  const rim = new THREE.PointLight(accent.getHex(), 40, 14);
  rim.position.set(3, 4, -4);
  scene.add(rim);

  /* ---------- materials ---------- */
  const white = track(new THREE.MeshPhysicalMaterial({
    color: 0xf3f6f4, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.14,
  }));
  const black = track(new THREE.MeshPhysicalMaterial({
    color: 0x0c0f0d, roughness: 0.3, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12,
  }));
  const glass = track(new THREE.MeshPhysicalMaterial({
    color: 0x040706, roughness: 0.06, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.03,
  }));
  const glowMat = track(new THREE.MeshBasicMaterial({ color: accentBright, toneMapped: false }));
  const bulbMat = track(new THREE.MeshBasicMaterial({ color: accent.clone().lerp(new THREE.Color("#ffffff"), 0.18), toneMapped: false }));
  const rimMat = track(new THREE.MeshBasicMaterial({ color: accent, toneMapped: false }));

  /* ---------- textures made on the fly ---------- */
  function radialTexture(stops) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach((s) => grad.addColorStop(s[0], s[1]));
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = track(new THREE.CanvasTexture(c));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const haloTex = radialTexture([
    [0, "rgba(255,255,255,0.9)"], [0.25, "rgba(255,255,255,0.35)"],
    [0.6, "rgba(255,255,255,0.08)"], [1, "rgba(255,255,255,0)"],
  ]);
  const eyeTex = radialTexture([
    [0, "#ffffff"], [0.35, "#" + accentBright.getHexString()],
    [0.8, "#" + accent.getHexString()], [1, "#" + accent.getHexString()],
  ]);
  const eyeMat = track(new THREE.MeshBasicMaterial({ map: eyeTex, toneMapped: false }));

  function halo(size, opacity) {
    const m = track(new THREE.SpriteMaterial({
      map: haloTex, color: accent, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const s = new THREE.Sprite(m);
    s.scale.setScalar(size);
    return s;
  }

  /* ---------- small helpers ---------- */
  const geo = (g) => track(g);
  const mesh = (g, m, x, y, z) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x || 0, y || 0, z || 0);
    return o;
  };
  const sphereGeo = geo(new THREE.SphereGeometry(1, 48, 32));
  const ball = (m, r, x, y, z, sx, sy, sz) => {
    const o = mesh(sphereGeo, m, x, y, z);
    o.scale.set(r * (sx || 1), r * (sy || 1), r * (sz || 1));
    return o;
  };

  /* A rounded-rectangle patch wrapped onto a sphere: the visor. */
  function visorGeometry(R, halfYaw, halfPitch, pitch0, seg) {
    const g = new THREE.PlaneGeometry(2, 2, seg, seg);
    const p = g.attributes.position;
    const n = 4.2; // higher = squarer corners
    for (let i = 0; i < p.count; i++) {
      let u = p.getX(i), v = p.getY(i);
      const m = Math.max(Math.abs(u), Math.abs(v));
      if (m > 1e-6) {
        const s = m / Math.pow(Math.pow(Math.abs(u), n) + Math.pow(Math.abs(v), n), 1 / n);
        u *= s; v *= s;
      }
      const yaw = u * halfYaw, pitch = pitch0 + v * halfPitch;
      p.setXYZ(i,
        R * Math.sin(yaw) * Math.cos(pitch),
        R * Math.sin(pitch),
        R * Math.cos(yaw) * Math.cos(pitch));
    }
    g.computeVertexNormals();
    return geo(g);
  }
  function placeOnSphere(o, R, yaw, pitch) {
    o.position.set(
      R * Math.sin(yaw) * Math.cos(pitch),
      R * Math.sin(pitch),
      R * Math.cos(yaw) * Math.cos(pitch));
    o.rotation.set(-pitch, yaw, 0, "YXZ");
  }

  /* ================== BUILD THE ROBOT ================== */
  const root = new THREE.Group();
  scene.add(root);

  /* ---- wheels + lower body ---- */
  const WHEEL_R = 0.5;
  const tyreGeo = geo(new THREE.TorusGeometry(0.3, 0.2, 24, 48));
  const hubGeo = geo(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 32));
  const dotGeo = geo(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12));
  const wheels = [-1, 1].map((side) => {
    const w = new THREE.Group();
    w.position.set(side * 0.7, WHEEL_R, 0);
    const tyre = mesh(tyreGeo, black);
    tyre.rotation.y = Math.PI / 2;
    tyre.scale.z = 1.25;
    const hub = mesh(hubGeo, black);
    hub.rotation.z = Math.PI / 2;
    w.add(tyre, hub);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const d = mesh(dotGeo, rimMat, side * 0.16, Math.cos(a) * 0.13, Math.sin(a) * 0.13);
      d.rotation.z = Math.PI / 2;
      w.add(d);
    }
    root.add(w);
    return w;
  });
  root.add(ball(white, 0.6, 0, 0.63, 0, 1, 0.95, 0.98));
  root.add(ball(black, 0.4, 0, 1.2, 0, 1, 0.55, 1));

  /* ---- upper body (sways from the waist) ---- */
  const upper = new THREE.Group();
  upper.position.y = 1.2;
  root.add(upper);
  upper.add(ball(white, 0.74, 0, 0.62, 0, 1, 1.02, 0.9));
  upper.add(mesh(geo(new THREE.CylinderGeometry(0.3, 0.34, 0.3, 32)), black, 0, 1.36, 0));

  const chest = mesh(geo(new THREE.CircleGeometry(0.055, 24)), glowMat);
  chest.position.set(0, 0.78, 0.655);
  chest.rotation.x = -0.22;
  upper.add(chest);

  /* ---- arms ---- */
  const fingerGeo = sphereGeo;
  const arms = [-1, 1].map((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.82, 0.96, 0);
    arm.add(ball(black, 0.25, 0, 0, 0));
    arm.add(ball(white, 0.27, 0, -0.52, 0, 1, 1.45, 1));
    arm.add(ball(black, 0.13, 0, -0.93, 0, 1, 0.6, 1));
    arm.add(ball(black, 0.19, 0, -1.11, 0, 0.95, 1.2, 0.8));
    const thumb = mesh(fingerGeo, black, -side * 0.15, -1.08, 0.04);
    thumb.scale.set(0.06, 0.13, 0.07);
    thumb.rotation.z = -side * 0.7;
    arm.add(thumb);
    upper.add(arm);
    return arm;
  });

  /* ---- head ---- */
  const HEAD_R = 1.05;
  const head = new THREE.Group();
  head.position.y = 1.45;
  upper.add(head);
  const skull = new THREE.Group();          // squashed a little, like the reference
  skull.position.y = 0.9;
  skull.scale.set(1, 0.92, 0.96);
  head.add(skull);
  skull.add(ball(white, HEAD_R, 0, 0, 0));
  skull.add(mesh(visorGeometry(HEAD_R * 1.004, 0.86, 0.56, -0.06, 56), rimMat));
  skull.add(mesh(visorGeometry(HEAD_R * 1.012, 0.80, 0.50, -0.06, 56), glass));

  const eyeGeo = geo(new THREE.CircleGeometry(0.185, 40));
  const eyeHaloGeo = geo(new THREE.CircleGeometry(0.46, 40));
  const EYE_YAW = 0.3, EYE_PITCH = -0.08;
  const eyes = [-1, 1].map((side) => {
    const e = new THREE.Group();
    e.add(mesh(eyeGeo, eyeMat));
    const h = mesh(eyeHaloGeo, track(new THREE.MeshBasicMaterial({
      map: haloTex, color: accent, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    })));
    h.position.z = 0.012;
    e.add(h);
    skull.add(e);
    return { group: e, side, halo: h };
  });

  const earGeo = geo(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 36));
  [-1, 1].forEach((side) => {
    const ear = mesh(earGeo, black, side * HEAD_R * 0.98, 0.9, 0);
    ear.rotation.z = Math.PI / 2;
    head.add(ear);
  });

  /* ---- antenna ---- */
  const antenna = new THREE.Group();
  antenna.position.y = 0.9 + HEAD_R * 0.92 - 0.03;
  head.add(antenna);
  antenna.add(ball(black, 0.16, 0, 0, 0, 1, 0.45, 1));
  antenna.add(mesh(geo(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 16)), black, 0, 0.27, 0));
  const bulb = ball(bulbMat, 0.16, 0, 0.6, 0);
  const bulbHalo = halo(1.5, 0.8);
  bulbHalo.position.y = 0.6;
  antenna.add(bulb, bulbHalo);

  /* ---- soft contact shadow ---- */
  let shadow = null;
  if (opts.shadow) {
    const tex = radialTexture([
      [0, "rgba(0,0,0,0.42)"], [0.45, "rgba(0,0,0,0.18)"], [1, "rgba(0,0,0,0)"],
    ]);
    shadow = mesh(geo(new THREE.PlaneGeometry(3.6, 2.4)),
      track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.005;
    scene.add(shadow);
  }

  /* ---------- sizing ---------- */
  // HALF_H leaves head-room for the arms when both hands go up.
  const CENTER_Y = 2.75, HALF_H = 3.15, HALF_W = 2.15;
  function resize() {
    const w = container.clientWidth || 300, h = container.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan((camera.fov * Math.PI) / 360);
    const dist = Math.max(HALF_H / t, HALF_W / (t * camera.aspect));
    camera.position.set(0, CENTER_Y + dist * 0.07, dist);
    camera.lookAt(0, CENTER_Y, 0);
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(container);

  /* ---------- interaction ---------- */
  const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
  let waveUntil = 0, jumpStart = -10, now = 0;
  function onMove(e) {
    const r = container.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.35;
    pointer.tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.5)));
    pointer.ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.5)));
  }
  const onEnter = () => { waveUntil = now + 1.8; };
  const onClick = () => { if (now - jumpStart > 0.9) jumpStart = now; };
  if (opts.interactive) {
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("click", onClick);
  }

  let visible = true;
  const io = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver((en) => { visible = en[0].isIntersecting; })
    : null;
  if (io) io.observe(container);

  /* ---------- animation loop ---------- */
  const clock = new THREE.Clock();
  let raf = 0, nextBlink = 2, blinkStart = -10, nextWave = 5;
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const mix = (a, b, k) => a + (b - a) * k;
  let armWave = 0;
  let hiAmt = 0, byeAmt = 0, lean = 0, face = 0, roll = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    now += dt;
    const idle = reduceMotion ? 0 : 1;
    const t = now;

    /* what the page wants right now */
    const pose = ctl.pose || "idle";
    hiAmt = damp(hiAmt, pose === "hi" ? 1 : 0, 6, dt);
    byeAmt = damp(byeAmt, pose === "bye" ? 1 : 0, 6, dt);
    lean = damp(lean, Math.max(-1, Math.min(1, ctl.move || 0)), 6, dt);
    face = damp(face, ctl.face || 0, 4, dt);
    roll += lean * dt * 9 * idle;
    if (ctl.jumpReq) { ctl.jumpReq = false; if (now - jumpStart > 0.9 && !reduceMotion) jumpStart = now; }

    pointer.x = damp(pointer.x, pointer.tx, 5, dt);
    pointer.y = damp(pointer.y, pointer.ty, 5, dt);

    /* roll gently back and forth on the wheels */
    const rollX = Math.sin(t * 0.7) * 0.14 * idle;
    root.position.x = rollX;
    wheels.forEach((w) => { w.rotation.x = rollX / WHEEL_R + roll; });

    /* click = happy jump with a spin */
    const j = (now - jumpStart) / 0.75;
    let jumpY = 0, spin = 0, happy = 0;
    if (j >= 0 && j < 1 && !reduceMotion) {
      jumpY = Math.sin(j * Math.PI) * 0.42;
      const e = j < 0.5 ? 2 * j * j : 1 - Math.pow(-2 * j + 2, 2) / 2;
      spin = e * Math.PI * 2;
      happy = Math.sin(j * Math.PI);
    }
    happy = Math.max(happy, hiAmt * 0.6, byeAmt * 0.35);
    root.position.y = jumpY;
    root.rotation.y = pointer.x * 0.14 + spin + face * 0.45;
    // lean into the scroll like it is riding along, with a little wobble
    root.rotation.x = Math.abs(lean) * 0.12;
    root.rotation.z = -lean * 0.16 + Math.sin(t * 9) * Math.abs(lean) * 0.05 * idle;

    /* body + head */
    upper.rotation.z = Math.sin(t * 1.1) * 0.025 * idle - pointer.x * 0.03;
    upper.rotation.x = Math.sin(t * 0.9 + 1) * 0.02 * idle;
    upper.position.y = 1.2 + Math.sin(t * 2.2) * 0.025 * idle;
    head.rotation.y = pointer.x * 0.36;
    head.rotation.x = pointer.y * 0.28 + Math.sin(t * 1.3) * 0.02 * idle;
    head.rotation.z = Math.sin(t * 0.8) * 0.045 * idle - pointer.x * 0.05 + byeAmt * 0.16;
    head.position.y = 1.45 + Math.sin(t * 2.2 - 0.6) * 0.03 * idle;

    /* antenna wobble + pulse */
    antenna.rotation.z = Math.sin(t * 2.6) * 0.07 * idle - head.rotation.z * 1.5 + lean * 0.3;
    const pulse = 0.85 + Math.sin(t * 3) * 0.15 * idle + happy * 0.4;
    bulbHalo.scale.setScalar(1.5 * pulse);
    bulb.scale.setScalar(0.16 * (0.95 + 0.08 * pulse));
    chest.scale.setScalar(0.8 + 0.3 * pulse);

    /* eyes: follow, blink, squint when happy */
    if (now > nextBlink && !reduceMotion) { blinkStart = now; nextBlink = now + 2.2 + Math.random() * 3.5; }
    const b = (now - blinkStart) / 0.16;
    let lid = b >= 0 && b < 1 ? 1 - Math.sin(b * Math.PI) * 0.92 : 1;
    lid *= 1 - happy * 0.5;
    eyes.forEach((e) => {
      placeOnSphere(e.group, HEAD_R * 1.022,
        e.side * EYE_YAW + pointer.x * 0.1, EYE_PITCH - pointer.y * 0.07);
      e.group.scale.set(1 + happy * 0.12, lid, 1);
      e.halo.material.opacity = 0.75 * lid;
    });

    /* arms: idle swing, wave on hover / every so often */
    if (opts.autoWave && pose === "idle" && now > nextWave && !reduceMotion) { waveUntil = now + 1.8; nextWave = now + 9 + Math.random() * 5; }
    armWave = damp(armWave, now < waveUntil || happy > 0.05 || pose === "bye" ? 1 : 0, 7, dt);
    const swing = Math.sin(t * 2.2) * 0.07 * idle;
    arms[0].rotation.z = -0.24 - swing * 0.5 - happy * 1.2;
    arms[0].rotation.x = swing;
    arms[1].rotation.z = 0.24 + swing * 0.5 + armWave * (2.25 + Math.sin(t * 11) * 0.3);
    arms[1].rotation.x = -swing * (1 - armWave);
    /* "hi": both hands up, waving */
    const cheer = Math.sin(t * 10) * 0.22 * idle;
    arms[0].rotation.z = mix(arms[0].rotation.z, -2.55 - cheer, hiAmt);
    arms[1].rotation.z = mix(arms[1].rotation.z, 2.55 + cheer, hiAmt);
    arms[0].rotation.x = mix(arms[0].rotation.x, 0, hiAmt);
    arms[1].rotation.x = mix(arms[1].rotation.x, 0, hiAmt);

    if (shadow) {
      shadow.position.x = rollX;
      const s = 1 - jumpY * 0.35;
      shadow.scale.set(s, s, 1);
      shadow.material.opacity = 1 - jumpY * 0.6;
    }
    renderer.render(scene, camera);
  }
  frame();

  /* ---------- cleanup ---------- */
  return {
    dispose() {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("click", onClick);
      disposables.forEach((d) => d.dispose && d.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    },
  };
}
