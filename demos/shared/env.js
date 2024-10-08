import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export default class World {
  resizeObserver;
  renderer;
  scene;
  stats;
  gui;
  rotate;
  tmpCameraVector = new THREE.Vector3();

  constructor(rotate = true, gui = true) {
    this.rotate = rotate;

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true
    });
    this.renderer.setClearColor(0xffffff, 1.0);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = new Scene(rotate);
    this.stats = new Stats();

    if (gui)
      this.gui = new GUI();

    this.resizeObserver = new ResizeObserver(this.windowResized.bind(this));
    this.resizeObserver.observe(document.documentElement.querySelector("body"));
    this.windowResized();

    document.documentElement.querySelector("body").appendChild(this.renderer.domElement);
    document.documentElement.querySelector("body").appendChild(this.stats.domElement);

    this.tick();
  }

  tick(ms) {
    if (this.rotate) {
      this.scene.camera.position.set(-60 * Math.sin(ms * 0.0001), 30, -60 * Math.cos(ms * 0.0001));
      this.tmpCameraVector.copy(this.scene.floor.position).setY(10);
      this.scene.camera.lookAt(this.tmpCameraVector);
    }
    this.renderer.render(this.scene, this.scene.camera);
    this.stats.update();
    requestAnimationFrame(this.tick.bind(this));
  }

  windowResized() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene.camera.aspect = window.innerWidth / window.innerHeight;
    this.scene.camera.updateProjectionMatrix();
  }
}

class Scene extends THREE.Scene {
  camera;
  pointer;
  floor;
  rc;

  constructor(rotate = true) {
    super();

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 300);
    this.camera.position.set(0, 30, 60);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.add(this.camera);

    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: 0xcccccc }));
    this.floor.rotateX(-Math.PI / 2);
    this.add(this.floor);

    if (rotate) {
      const marking = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ color: 0x555555 }));
      marking.rotateX(-Math.PI / 2);
      marking.position.y = 0.1;
      this.add(marking);
    }

    this.pointer = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0xcc5555, transparent: true, opacity: 0.5 }));
    this.pointer.rotateX(-Math.PI / 2);
    this.pointer.position.y = 0.11;
    this.add(this.pointer);

    this.fog = new THREE.Fog(0xffffff, 50, 100);
  }
}
