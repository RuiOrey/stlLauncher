document.getElementById( "loadLink" ).addEventListener( "click", viewSTL );

var currentContext;

function viewSTL( event )
    {
        var fileUrl = "./STL.stl";
        var canvasID = "stlViewer";
        var stlColor = 0xff5533;

        event.preventDefault();
        if ( currentContext === undefined )
            {
                currentContext = new STLViewer( fileUrl, canvasID, stlColor );
            }
        else
            {
                currentContext.destroy();
                currentContext = new STLViewer( fileUrl, canvasID, stlColor );

            }
    }

function STLViewer( fileUrl, canvasID, modelColor )
    {
        var context;
        var newCanvas = document.getElementById( canvasID );
        this.active = true;
        this.init = () => {
            context = this;
            this.file = fileUrl;
            this.container = document.getElementById( canvasID );
            this.renderer = new THREE.WebGLRenderer( { canvas: this.container } );
            this.camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 20000 );
            this.camera.position.set( 5, 0.15, 5 );
            //this.cameraTarget = new THREE.Vector3( 0, -0.25, 0 );
            this.scene = new THREE.Scene();

            this.scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
            window.scene = this.scene;

            this.onWindowResize();

            this.light = this.createLight( 0.5, 1, -1, 0xffaa00, 1 );
            this.scene.add( this.createLight( 1, 1, 1, 0xffffff, 1.35 ) );
            this.scene.add( this.light );

            var loader = new THREE.STLLoader();
            loader.load( fileUrl, ( geometry ) => {

                var material = new THREE.MeshPhongMaterial( { color: modelColor, specular: 0x111111, shininess: 200 } );
                //var material = new THREE.MeshBasicMaterial();
                this.mesh = new THREE.Mesh( geometry, material );

                this.mesh.geometry.center();
                this.mesh.geometry.computeBoundingSphere();
                var radius = this.mesh.geometry.boundingSphere.radius;
                this.camera.position.set( radius * 2, radius * 2, radius * 2 );

                this.controls.update();

                this.scene.add( this.mesh );
                this.controls.target = this.mesh.position;
                this.animate();

            } );

            this.controls = new THREE.OrbitControls( this.camera );
            this.controls.enablePan = false;

            this.resizeEventListener = window.addEventListener( 'resize', this.onWindowResize, false );

        };

        this.animate = () => {
            if ( !this.active )
                {
                    return;
                }
            requestAnimationFrame( () => {
                this.animate();
            } );
            this.render();
        }

        this.render = () => {

            var timer = Date.now() * 0.0005;
            var distance = 5;
            this.light.position.copy( this.camera.position );
            //this.controls.update();
            this.renderer.render( this.scene, this.camera );

        }

        this.createLight = ( x, y, z, color, intensity ) => {

            var directionalLight = new THREE.DirectionalLight( color, intensity );
            directionalLight.position.set( x, y, z );

            directionalLight.castShadow = true;

            var d = 1;
            directionalLight.shadow.camera.left = -d;
            directionalLight.shadow.camera.right = d;
            directionalLight.shadow.camera.top = d;
            directionalLight.shadow.camera.bottom = -d;

            directionalLight.shadow.camera.near = 1;
            directionalLight.shadow.camera.far = 4;

            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;

            directionalLight.shadow.bias = -0.005;
            return directionalLight;

        }

        this.destroy = () => {
            this.scene.remove( this.mesh );
            this.mesh.geometry.dispose();
            //this.mesh.dispose();
            //this.renderer.deallocateObject( this.mesh );
            this.mesh = null;
            var sceneChildren = this.scene.children.map( ( child ) => {
                return child;
            } );
            sceneChildren.forEach( ( child ) => {
                this.scene.remove( child );
            } );
            this.controls.dispose();

            window.removeEventListener( 'resize', this.resizeEventListener );
        };

        this.onWindowResize = () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
        }

        this.init();
        return this;
    }


