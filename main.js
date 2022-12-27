//import './style.css';

import * as THREE from 'three';
import * as dat from 'dat.gui';
import gsap from 'gsap';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { color } from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GUI } from 'dat.gui';
import { gui } from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module';


//Event Listeners 

window.addEventListener('resize', (event) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener('dblclick', () => {
    const fullscreenElement =
        document.fullscreenElement || document.webkitFullscreenElement;
    if (!fullscreenElement) {
        if (renderer.domElement.requestFullscreen) {
            renderer.domElement.requestFullscreen();
        } else if (renderer.domElement.webkitRequestFullScreen) {
            renderer.domElement.webkitRequestFullScreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
});


//BASIC JS

let link1 = document.querySelector('#link1');
//console.log(link1);

let link2 = document.querySelector('#link2');

link1.addEventListener('click', playAudio);
//link2.addEventListener('click', pauseAudio);

let src = './static/inTheClub_Sound.mp3';
let audio = document.querySelector('#audio');
audio.src = src;

let soundIcon = document.querySelector('#soundIcon');

function playAudio() {    
    if(!audio.paused) {
        audio.pause();
        soundIcon.src = "./static/volume.png";
    }
    else {
        audio.play();
        soundIcon.src = "./static/volume-mute-regular-24.png";
    }
}



//Initialize Scene

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGL1Renderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

camera.position.setZ(15);
camera.position.setY(35);

//Render Settings

renderer.setPixelRatio(Math.min(window.devicePixelRatio), 2);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//Adding Helpers - TEMP!!

//const gridHelper = new THREE.GridHelper(200, 50);
//const axisHelper = new THREE.AxesHelper(20);
//scene.add(axisHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
//controls.enableZoom = false;
controls.maxPolarAngle = 1.5;
controls.minPolarAngle = 0.8;
//controls.dampingFactor = 0.1;
//controls.rotateSpeed = 1;
controls.minDistance = 20;
controls.maxDistance = 75;

//Adding Lights

const light1 = new THREE.PointLight(0xffffff, 1);
light1.position.set(25, 35, 25);
light1.castShadow = true;
//scene.add(light1);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
dirLight1.castShadow = true;
dirLight1.position.set(25, 55, 40);
dirLight1.shadow.camera.top = 40;
dirLight1.shadow.camera.bottom = -40;
dirLight1.shadow.camera.left = -40;
dirLight1.shadow.camera.right = 40;
dirLight1.shadow.camera.near = 0.1;
dirLight1.shadow.camera.far = 1000;
scene.add(dirLight1);

//scene.add(new THREE.CameraHelper(dirLight1.shadow.camera));

const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambientLight);

const lHelper1 = new THREE.PointLightHelper(light1, 2);
//scene.add(lHelper1);

const skyColor = 0xb1e1ff; // light blue
const groundColor = 0xb97a20; // brownish orange
const intensity = 0.8;
const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);

//Adding GLTF Model

//const stats = new Stats();
//document.body.appendChild(stats.dom);

const loader = new GLTFLoader();

let mixer;
let animationClip = 1;

const func = {
    makeTwerk: () => {
        animationClip = 0;
    },
    makeModel: () => {
        animationClip = 1;
    }
};

const panel = new dat.GUI({ width: 110 });
panel.closed = true;
panel.add(func, 'makeTwerk').name('Party Mode');
panel.add(func, 'makeModel').name('Normal Mode');
panel.hide();

const parameters = {
    id: 1
};

panel.add(parameters, 'id', 0, 1, 1);

let twerkAction, modelAction;
let actions;
let animations, anim;

loader.load(
    'static/ARS_test03.glb',
    function (gltf) {
        scene.add(gltf.scene);

        mixer = new THREE.AnimationMixer(gltf.scene);

        animations = gltf.animations;
        anim = animations[animationClip];

        twerkAction = mixer.clipAction(animations[0]);
        modelAction = mixer.clipAction(animations[1]);

        actions = [twerkAction, modelAction];

        //activateAllActions();

        tick();

        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        //gltf.animations; // Array<THREE.AnimationClip>
        //gltf.scene; // THREE.Group
        //gltf.scenes; // Array<THREE.Group>
        //gltf.cameras; // Array<THREE.Camera>
        //gltf.asset; // Object
    },
    // called while loading is progressing
    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
        console.log('An error happened');
    }
);

const objLoader = new OBJLoader();
let bgPlane;
objLoader.load(
    'static/ground_plane02.obj',
    function (object) {
        //scene.add(object);
        object.traverse(function (child) {
            if (child.isMesh) {
                bgPlane = child;
                //console.log(bgPlane);
                child.rotation.y = Math.PI;
                const planeScale = 800;
                child.scale.set(planeScale, planeScale, planeScale);
                //child.position.z = -80;
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = new THREE.MeshPhongMaterial({
                    color: 0x4d4d4d,
                    depthWrite: false
                });
                scene.add(child);
                return child;
            }
        });
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    function (error) {
        console.log('An error happened');
    }
);

/*const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x4d4d4d, depthWrite: false })
);
mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);*/

scene.fog = new THREE.Fog(0xa0a0a0, 10, 100);

//Tick Function

const clock = new THREE.Clock();

function tick() {
    //camera.updateProjectionMatrix();
    requestAnimationFrame(tick);

    controls.update();
    updateAnimationClip();
    //stats.update();
    mixer.clipAction(animations[0]).play();
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);
}

tick();



function updateAnimationClip() {
    animationClip = parseInt(parameters.id);
    anim = animations[animationClip];
}

function partyMode() {}
