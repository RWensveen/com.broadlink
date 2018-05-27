/**
 * Driver for Broadlink devices
 * 
 * Copyright 2018, R Wensveen
 * 
 * This file is part of com.broadlink
 * com.broadlink is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * com.broadlink is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with com.broadlink.  If not, see <http://www.gnu.org/licenses/>.
 */

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
	 * Note: the 'name' is also stored in the device settings. 
	 * the Array and the Settings may have a different order of names.
	 */
	
	
	
	/**
	 * Class constructor, needed to define class-variables
	 */
	constructor( deviceMAC ) {
		this.dataArray = []
		this.deviceMAC = deviceMAC
	}
	
	
	/**
	 * @returns: -1 if not found, index-in-array otherwise
	 */
	findCommand( cmdName ) {
		
		for(var i = 0, len = this.dataArray.length; i < len; i++) {
			if( this.dataArray[i].name === cmdName ) {
				return i;
			}
		}
		return -1;
	}
	
	
	/**
	 * saveOnCloseEvent() is called during init and registeres the unload event. The unload
	 * event is called just before the app is being closed (for instance when the app is updated,
	 * homey is shutting down).
	 */
	//saveOnCloseEvent() {
	//	
	//   Homey.on( 'unload', function() {
	//      Util.debugLog("unload called");
	//      this.storeCommands();
	//   });
	//}
	
	
	/**
	 * saveUserData() saves the user data into a JSON file on the filesystem
	 */
	storeCommands( ) {
		//Util.debugLog('==>DataStore.storeCommands')
	
		let fileName = '/userdata/' + this.deviceMAC + '.json';
		let data = JSON.stringify( this.dataArray );
		//Util.debugLog( 'storing ' + data);
		
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
				Util.debugLog( ' *> file does not exist or no access: '+err );
			}
			else {
				fs.readFile( fileName, 'utf8', 
						function( err, data ) {
							if( err ) {
								//Util.debugLog(" *> read failed: "+ err);
							}
							else {
								try {
									that.dataArray = [];
									let arr = JSON.parse(data);
									
									for( var i =0; i < arr.length; i++ ) {
										let elem = {
												name: arr[i].name,
												cmd : new Uint8Array( Object.values(arr[i].cmd) )
										}
										that.dataArray.push( elem )
									}
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
		this.storeCommands();
		
/*		
		let fileName = '/userdata/' + this.deviceMAC + '.json';
		fs.unlink( fileName, (err)  => {
			if(err) {
				Util.debugLog('*> Cannot remove file ' + fileName + ', err = ' + err );
			}
		})
*/
	}
	
	
	/**
	 * @return: true if command stored, false otherwise
	 */
	addCommand( cmdName, data ) {
		//Util.debugLog( '==>DataStore.addCommand = ' + JSON.stringify(data));

		let element = this.findCommand( cmdName );
		if( element < 0 ) {
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
		let element = this.findCommand( newName );
		if( element >= 0 ) {
			//Util.debugLog('*> new name already exists')
			return false;
		}
		element = this.findCommand( oldName );
		if( element >= 0 ) {
			//Util.debugLog('*> found cmd at position'+element)
			this.dataArray[element].name = newName;
			this.storeCommands();
			return true;
		}
		else {
			//Util.debugLog( '*> oldName not found')
			return false;
		}
	}
	
	
	/**
	 * 
	 */
	getCommandData( cmdName ) {
		
		let element = this.findCommand( cmdName );
		if( element >= 0 ) {
			//Util.debugLog( '==>DataStore.getCommand: found' );
			return this.dataArray[element].cmd;
		}
		return null;
	}


	/**
	 * Get a list of the names of all commands
	 */
	getCommandNameList() {
		let lst = []
		for(var i = 0, len = this.dataArray.length; i < len; i++) {
			lst.push( this.dataArray[i].name )
		}
		//Util.debugLog('getCommandName: ' + lst)
		return lst
	}
}

module.exports = DataStore;
