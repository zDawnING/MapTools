function MapPointToPointMeasure() {

    this.enabled = false;

    this.view = null;
    this.selectLayer = null;

    this.measureGroup = null;
    this.startPointObj = null;
    this.endPointObj = null;
    this.lineObj = null;
    this.distanceMsgObj = null;

    this.startVec3 = null;
    this.endVec3 = null;

    this.distance = 0;

    const _handleClickPoint = handleClickPoint.bind(this);

    this.init = function(view, layer) {
        if(this.enabled) return;

        this.view = view;
        this.selectLayer = layer;

        // change scene update 
        this.view.scene.autoUpdate = true;

        this.raycaster = new itowns.THREE.Raycaster();
        this.distanceMsgObj = document.getElementById('distanceResult');

        this.enabled = true;
        this.startVec3 = new itowns.THREE.Vector3();
        this.endVec3 = new itowns.THREE.Vector3();

        this.measureGroup = new itowns.THREE.Group();
        this.measureGroup.position.z = 3;
        this.measureGroup.name = 'mapToolsObj_p2p_mesure';
        this.startPointObj = createPoint();
        this.endPointObj = createPoint();
        this.lineObj = createLine(this.startVec3, this.endVec3);
        this.startPointObj.visible = false;
        this.endPointObj.visible = false;
        this.lineObj.visible = false;
        this.measureGroup.add(this.startPointObj);
        this.measureGroup.add(this.endPointObj);
        this.measureGroup.add(this.lineObj);
    
        this.view.scene.add(this.measureGroup);   

        window.addEventListener('dblclick', _handleClickPoint, false);
    },


    this.dispose = function() {
        this.enabled = false;
        
        this.startPointObj.dispose();
        this.endPointObj.dispose();
        this.startPointObj = null;
        this.endPointObj = null;
        this.lineObj = null;

        this.startVec3 = null;
        this.endVec3 = null;

        this.view.scene.remove(this.measureGroup);

        window.removeEventListener('dblclick', _handleClickPoint, false);
    }
    
}

function handleClickPoint(event) {
    if(!this.enabled) return;

    const mouse = this.view.eventToNormalizedCoords(event);
    this.raycaster.setFromCamera(mouse, this.view.camera.camera3D);
    const result = this.raycaster.intersectObjects(this.view.tileLayer.object3d.children, true);
    
    if(result.length > 0){
        let selectPoint = result[0].point;
        console.log('TCL: handleClickPoint -> selectPoint', selectPoint);
        if(!this.startPointObj.visible){
            this.startPointObj.visible = true;
            this.startVec3.copy(selectPoint);
            this.startPointObj.position.copy(selectPoint);
            // this.startPointObj.updateMatrixWorld(true);
        }else if(!this.endPointObj.visible){
            this.endPointObj.visible = true;
            this.lineObj.visible = true;
            this.endVec3.copy(selectPoint);
            this.endPointObj.position.copy(selectPoint);
            // this.endPointObj.updateMatrixWorld(true);
            // update line position
            let position = this.lineObj.geometry.attributes.position;
            position.setX(0, this.startVec3.x);
            position.setY(0, this.startVec3.y);
            position.setZ(0, this.startVec3.z);
            position.setX(1, this.endVec3.x);
            position.setY(1, this.endVec3.y);
            position.setZ(1, this.endVec3.z);
            position.needsUpdate = true;
            // compute distance
            let distance = computeDistance(this.startVec3, this.endVec3);
            console.log('TCL: handleClickPoint -> distance', distance);
            if(this.distanceMsgObj){
                this.distanceMsgObj.innerHTML = distance;
            }
        }else{
            this.startPointObj.position.copy(selectPoint);
            this.startVec3.copy(selectPoint);
            this.endPointObj.visible = false;
            this.lineObj.visible = false;
        }
        this.view.notifyChange(this.view.camera.camera3D);
    }
}


function computeDistance(vec1, vec2){
    return vec1.distanceTo(vec2);
}


function createPoint (size, color) {
    if(!size) size = 5;
    if(!color) color = 0xFF0000;
    
    let geometry = new itowns.THREE.BufferGeometry();
    let vertices = [];
    for(let i=0; i<1; i++){
        let x = 0;
        let y = 0;
        let z = 0;

        vertices.push(x, y, z);
    }
    geometry.addAttribute('position', new itowns.THREE.Float32BufferAttribute(vertices, 3));

    let material = new itowns.THREE.PointsMaterial({
        color: color,
        size: size,
        sizeAttenuation: false
    })

    return new itowns.THREE.Points(geometry, material);
}

function createLine(startVec3, endVec3) {
    let geometry = new itowns.THREE.BufferGeometry();
    let vertices = [];
    vertices.push(startVec3.x, 1, startVec3.z);
    vertices.push(endVec3.x, 1, endVec3.z);
    geometry.addAttribute('position', new itowns.THREE.Float32BufferAttribute(vertices, 3));
    let material = new itowns.THREE.LineBasicMaterial({color: 0xff0000, linewidth: 10});
    
    return new itowns.THREE.Line(geometry, material);
}