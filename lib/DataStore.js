
'use strict';


const Homey = require('homey');
const Util = require('./../lib/util.js');
const fs = require('fs');



class DataStore {
	
	/**
	 * 
	 * holds an Array with records:
	 *    {
	 *       name     [String]
	 *       cmd      [Uint8Array]
	 *    }
	 * 
	 * 
	 */
	
	
	
	/**
	 * Class constructor, needed to define class-variables
	 */
	constructor( deviceMAC ) {
		this.dataArray = []
		this.deviceMAC = deviceMAC
	}
	
	
	
	_findCommand( cmdName ) {
		
		return this.dataArray.find( function( element ) {
			  return element.name === cmdName;
			});
	}
	
	
	/**
	 * saveOnCloseEvent() is called during init and registeres the unload event. The unload
	 * event is called just before the app is being closes (for instance when the app is updated,
	 * homey is shutting down).
	 */
	//saveOnCloseEvent() {
	//	
	//   Homey.on( 'unload', function() {
	//      Util.debugLog("unload called");
	//      storeCommands();
	//   });
	//}
	
	
	/**
	 * saveUserData() saves the user data into a JSON file on the filesystem
	 */
	storeCommands( ) {
		//Util.debugLog('==>DataStore.storeCommands')
	
		let fileName = '/userdata/' + this.deviceMAC + '.json';
		let data = JSON.stringify( this.dataArray );
		//Util.debugLog( data);
		
		fs.writeFile( fileName,  data, 
				function( err ) {
					if( err ) {
						Util.debugLog("*> Storing dataArray failed: "+ err);
					}
				});
	}
	
	
	/**
	 * 
	 */
	readCommands( ) {
		//Util.debugLog( '==>DataStore.readCommands - ' + this.deviceMAC );
		
		let that = this;
		let fileName = '/userdata/' + this.deviceMAC + '.json';
		
		// Check if the file exists , and if it is readble and writable.
		fs.access(fileName, fs.constants.F_OK | fs.constants.W_OK | fs.constants.R_OK, (err) => {
			if( err ) {
				//Util.debugLog( ' *> file does not exist or no access' );
			}
			else {
				fs.readFile( fileName, 'utf8', 
						function( err, data ) {
							if( err ) {
								//Util.debugLog(" *> read failed: "+ err);
							}
							else {
								try {
									//Util.debugLog(' read = ' + data );
									that.dataArray = JSON.parse(data);
									//Util.debugLog(' dataArray parsed' )
								} catch( err ) {
									Util.debugLog(" *> parse failed: "+ err);
								}
							}
				});
			}
		});
	}
	
	
	/**
	 * 
	 */
	deleteAllCommands() {
		//Util.debugLog('==>DataStore.deleteAllCommands')
		
		this.dataArray = [];
		let fileName = '/userdata/' + this.deviceMAC + '.json';
		fs.unlink( fileName, (err)  => {
			Util.debugLog('*> Cannot remove file ' + fileName );
		})
		
	}
	
	
	/**
	 * @return: true if command stored, false otherwise
	 */
	addCommand( cmdName, data ) {
		//Util.debugLog( '==>DataStore.addCommand' );

		let index = this._findCommand( cmdName );
		if( ! index ) {
			let cmd = { name: cmdName,
					    cmd:  data
			}
			this.dataArray.push( cmd );
			this.storeCommands();
			return true;
		}
		else {
			//Util.debugLog( ' *> command already known')
			return false;
		}
	}
	
	
	/**
	 * 
	 */
	deleteCommand( cmdName ) {
		//Util.debugLog( '==>DataStore.deleteCommand' );
		
		this.dataArray = this.dataArray.filter(item => item.name !== cmdName );
		this.storeCommands();
	}

	
	/**
	 * @return: true if renamed, false otherwise
	 */
	renameCommand( oldName, newName ) {
		//Util.debugLog( '==>DataStore.renameCommand' );
		let index = this._findCommand( newName );
		if( index ) {
			Util.debugLog('*> new name already exists')
			return false;
		}
		index = this._findCommand( oldName );
		if( index ) {
			this.dataArray[ index ].name = newName;
			this.storeCommands();
			return true;
		}
		else {
			Util.debugLog( '*> oldName not found')
			return false;
		}
	}
	

	/**
	 * Get a list of the names of all commands
	 */
	getCommandNameList() {
		let lst = []
		for(var i = 0, len = that.dataStore.dataArray.length; i < len; i++) {
			lst.push( this.dataArray[i].name )
		}
		return lst
	}
}

module.exports = DataStore;
