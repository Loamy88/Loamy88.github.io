/**
 * @author Don McCurdy / https://www.donmccurdy.com
 * @author mrdoob / http://mrdoob.com/
 */
 
THREE.GLTFLoader = (function () {

	'use strict';

	var _keyframeTrackTypes = {};

	function registerKeyframeTrackType( type, trackConstructor ) {

		_keyframeTrackTypes[ type ] = trackConstructor;

	}

	function GLTFLoader( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	}

	GLTFLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: GLTFLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var resourcePath;

			if ( this.resourcePath !== undefined ) {

				resourcePath = this.resourcePath;

			} else if ( this.path !== undefined ) {

				resourcePath = this.path;

			} else {

				resourcePath = THREE.LoaderUtils.extractUrlBase( url );

			}

			this.fileLoader.setPath( this.path );
			this.fileLoader.setResponseType( 'arraybuffer' );
			this.fileLoader.setRequestHeader( this.requestHeader );
			this.fileLoader.setWithCredentials( this.withCredentials );
			this.fileLoader.load( url, function ( data ) {

				try {

					scope.parse( data, resourcePath, onLoad, onError );

				} catch ( e ) {

					if ( onError ) {

						onError( e );

					} else {

						throw e;

					}

					scope.manager.itemError( url );

				}

			}, onProgress, onError );

		},

		setResourcePath: function ( value ) {

			this.resourcePath = value;

			return this;

		},

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;

			return this;

		},

		setPath: function ( value ) {

			this.path = value;

			return this;

		},

		setRequestHeader: function ( value ) {

			this.requestHeader = value;

			return this;

		},

		setWithCredentials: function ( value ) {

			this.withCredentials = value;

			return this;

		},

		parse: function ( data, path, onLoad, onError ) {

			var content;
			var extensions = {};

			if ( typeof data === 'string' ) {

				content = data;

			} else {

				var magic = THREE.LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

				if ( magic === 'glTF' ) {

					// Binary glTF (.glb)
					var glb = THREE.GLTFLoaderUtils.parseGLB( data );

					content = glb.json;
					extensions = glb.extensions;

				} else {

					// Text glTF (.gltf)
					content = THREE.LoaderUtils.decodeText( new Uint8Array( data ) );

				}

			}

			var json;

			try {

				json = ( typeof content === 'string' ) ? JSON.parse( content ) : content;

			} catch ( e ) {

				if ( onError ) onError( e );
				return;

			}

			var parser = new THREE.GLTFParser( json, {
				path: path || this.resourcePath || '',
				manager: this.manager,
				extensions: extensions,
				keyframeTrackTypes: _keyframeTrackTypes,
				pluginCallbacks: []
			} );

			parser.parse( function ( scene, scenes, cameras, animations ) {

				onLoad( {
					scene: scene,
					scenes: scenes,
					cameras: cameras,
					animations: animations
				} );

			}, onError );

		},

		fileLoader: new THREE.FileLoader(),

	});

	return GLTFLoader;

})();
