// ----------------------------------------------------------------------------
// Boom - A tiny audio library 
// v 1.0 beta
// Dual licensed under the MIT and GPL licenses.
// http://vegas.jaysalvat.com/
// ----------------------------------------------------------------------------
// Copyright (C) 2011 Jay Salvat
// http://jaysalvat.com/
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files ( the "Software" ), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------
var boom = {
    defaults: {
        preload: 'metadata', // auto, metadata, none
        autoplay: false, // true, false
        loop: false, // true, false
        volume: 100
    },
    sounds: [],
    el: document.createElement( 'audio' ),
    isSupported: function() {
        return  !!( this.el.canPlayType );
    },
    isOGGSupported: function() {
        return !!this.el.canPlayType && this.el.canPlayType( 'audio/ogg; codecs="vorbis"' );  
    },
    isWAVSupported: function() {
        return !!this.el.canPlayType && this.el.canPlayType( 'audio/wav; codecs="1"' );  
    },
    isMP3Supported: function() {
        return !!this.el.canPlayType && this.el.canPlayType( 'audio/mpeg;' );
    },
    isAACSupported: function() {
        return !!this.el.canPlayType && ( this.el.canPlayType( 'audio/x-m4a;' ) || this.el.canPlayType( 'audio/aac;' ) );
    },
    sound: function( src, settings ) {
        var settings = settings || {},
            options = {},
            events = [],
            ok = boom.isSupported();
        
        if ( ok ) {
            for( var i in boom.defaults ) {
                options[ i ] = settings[ i ] || boom.defaults[ i ];
            }
        
            this.sound = document.createElement( 'audio' );
            if ( src instanceof Array) {
                for( var i in src ) {
                    var source = document.createElement( 'source' );
                    source.src = src[ i ];
                    this.sound.appendChild( source );
                }
            } else {
                this.sound.src = src;                
            }
            if ( options.loop ) {
                this.sound.loop = true;
            }
            if ( options.autoplay ) {
                this.sound.autoplay = true;            
            }
            this.sound.preload = options.preload;
            this.volume = options.volume;

            boom.sounds.push( this );
        }
        this.load = function() {
            if ( !ok ) return this;
            
            this.sound.load();
            return this;
        }                
        this.play = function() {
            if ( !ok ) return this;
            
            this.sound.play();
            return this;
        }
        this.stop = function() {
            if ( !ok ) return this;
            
            this.sound.currentTime = 0;
            this.sound.pause();
            return this;
        }
        this.pause = function() {
            if ( !ok ) return this;
            
            this.sound.pause();
            return this;
        }
        this.jump = function( time ) {
            if ( !ok ) return this;
            
            this.setTime( time );
            return this;
        }
        this.toggle = function() {
            if ( !ok ) return this;
            
            if ( this.sound.paused ) {
                this.sound.play();
            } else {
                this.sound.pause();
            }
            return this;
        }
        this.setVolume = function( volume ) {
            if ( !ok ) return this;
            
            if ( volume > 100 ) {
                volume = 100;
            } 
            if ( volume < 0 ) {
                volume = 0;
            }
            this.volume = volume;
            this.sound.volume = volume / 100;
            return this;
        },
        this.getVolume = function() {
            return this.volume;
        }
        this.increaseVolume = function( value ) {
            this.setVolume( this.volume + ( value || 1 ) );
            return this;
        }
        this.decreaseVolume = function( value ) {
            this.setVolume( this.volume - ( value || 1 ) );
            return this;
        }
        this.setTime = function( time ) {
            if ( !ok ) return this;

            var splits = time.split( ':' );
            if ( splits.length == 3 ) {
                time = ( parseInt( splits[0] ) * 3600 ) + ( parseInt(splits[1] ) * 60 ) + parseInt( splits[2] ); 
            } 
            if ( splits.length == 2 ) {
                time = ( parseInt( splits[0] ) * 60 ) + parseInt( splits[1] );
            }
            this.sound.currentTime = time;
            return this;
        }
        this.getTime = function() {
            if ( !ok ) return null;

            return Math.round( this.sound.currentTime * 100 ) / 100;
        }
        this.getDuration = function() {
            if ( !ok ) return null;
            
            return Math.round( this.sound.duration * 100 ) / 100;
        }
        this.setPercent = function( time ) {
            if ( !ok ) return this;
            
            this.sound.currentTime = this.sound.duration * time / 100;
            return this;
        }
        this.getPercent = function() {
            if ( !ok ) return null;
            
            return Math.round( (this.sound.currentTime / this.sound.duration * 100 ) * 100) / 100;
        }
        this.set = function( key, value ) {
            if ( !ok ) return this;
             
            this.sound[ key ] = value;
            return this;
        }
        this.get = function( key ) {
            if ( !ok ) return null;
            
            if ( key ) {
                return this.sound[ key ];
            }
            return this.sound;
        }
        this.bind = function( type, func ) {
            if ( !ok ) return this;
            
            var idx = type;
            if ( type.indexOf( '.' ) > -1 ) {
				type = type.split( '.' )[1];
			}
			events.push( { idx: idx, func: func } );
            this.sound.addEventListener( type, func, true ); 
            return this;
        }
        this.unbind = function( type ) {
            if ( !ok ) return this;
            
            var idx = type;
            if ( type.indexOf( '.' ) > -1 ) {
                type = type.split( '.' )[1];
			}
			for( var i in events ) {
			    var c = events[ i ].idx.match( /\.(.*)/ );
			 	if ( events[ i ].idx == idx || ( c && c[1] == idx.replace('.', '') ) ) {
                    this.sound.removeEventListener( type, events[ i ].func );
                    delete events[ i ];
			    }   
			}
            return this;
        }
        this.destroy = function() {
            if ( !ok ) return this;
            
            for( var i in boom.sounds ) {
                if ( boom.sounds[ i ] == this ) {
                    delete boom.sounds[ i ];
                    break;
                }
            }
            return this;
        }
    },
    all: function() {
      return new boom.group( boom.sounds );  
    },
    group: function( sounds ) {
        fn = function() {
            var args = Array.prototype.slice.call( arguments ),
                func = args.shift();
                
            for( var i in sounds ) {
                sounds[ i ][ func ]( args );
            }
        }
        this.play = function() {
            fn( 'play' );
        }
        this.stop = function() {
            fn( 'stop' );
        }
        this.jump = function( time ) {
            fn( 'jump', time );
        }
        this.toggle = function( ) {
            fn( 'toggle' );
        }
        this.setVolume = function( volume ) {
            fn( 'setVolume', volume );
        },
        this.increaseVolume = function( value ) {
            fn( 'increaseVolume', value );
        }
        this.decreaseVolume = function( value ) {
            fn( 'decreaseVolume', value );
        }
        this.setTime = function( time ) {
            fn( 'setTime', time );
        }
        this.set = function( key, value ) {
            fn( 'set', key, value );
        }
        this.bind = function( type, func ) {
            fn( 'bind', type, func );
        }
        this.unbind = function( type ) {
            fn( 'unbind', type );
        }
    },
    formatTime: function( seconds, displayHours ) {
        hours = Math.floor( seconds / 3600 );
        hours = ( hours >= 10 ) ? hours : "0" + hours;            
        minutes = displayHours ? Math.floor( seconds / 60 % 60 ) : Math.floor( seconds / 60 );
        minutes = ( minutes >= 10 ) ? minutes : "0" + minutes;
        seconds = Math.floor( seconds % 60 );
        seconds = ( seconds >= 10 ) ? seconds : "0" + seconds;
        if ( displayHours ) {
            return hours + ":" + minutes + ":" + seconds;
        }
        return minutes + ":" + seconds;
    }
}