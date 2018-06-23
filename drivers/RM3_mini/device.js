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
const Util = require('./../../lib/util.js');
const Communicate = require('./../../lib/Communicate.js');
const BroadlinkDevice = require('./../BroadlinkDevice');
const DataStore = require('./../lib/DataStore.js')


class RM3miniDevice extends BroadlinkDevice {
	

	/**
	 * Store the given name at the first available place in settings.
	 * i.e. look for an entry 'RcCmd.' (where . is integer >= 0)
	 */
	storeCmdSetting( cmdname ) {

		let settings = this.getSettings()
		
		var idx = 0;
		let settingName = 'RcCmd' + idx;
		while( settingName in settings) {
			if( settings[ settingName ].length == 0 ) {
		
				let s = { 
						[settingName] : cmdname 
						} 
				this.setSettings( s );
				break;
			}
			idx++;
			settingName = 'RcCmd' + idx;
		}
	}

	
	/**
	 * Sends the given command to the device and triggers the flows
	 * 
	 * @param  that  = this driver
	 * @param  cmd   = command-name
	 * 
	 * @return [Promise] resolves once command is send
	 */
	executeCommand( args ) {
		let cmd = args['variable'];

		var cmdData = this.dataStore.getCommandData( cmd.name )
		if( cmdData ) {
			let drv = this.getDriver();
			// RC_specific_sent: user entered command name
			drv.rm3mini_specific_cmd_trigger.trigger( this, {}, { 'variable':cmd.name })
			
			// RC_sent_any: set token
			drv.rm3mini_any_cmd_trigger.trigger( this, {'CommandSent':cmd.name}, {})
			
			// send the command
			return this._communicate.send_IR_RF_data( cmdData )
		}
		else { return Promise.resolve(); }
	}
	
	
	/**
	 * Get a list of all command-names
	 * 
	 * @return  the command-name list
	 */
	onAutoComplete() {
		let lst = []
		let names = this.dataStore.getCommandNameList()
		for(var i = names.length -1; i >= 0; i--) {
			let item =  {
							"name": names[i] 
						};
			lst.push( item )
		}
		return lst;
	}
	
	
	/**
	 * 
	 */
	check_condition_specific_cmd_sent( args, state, callback ) {
		callback(null,( args.variable.name === state.variable )) 
	}
	
	
	/**
	 * 
	 */
	onInit() {
		super.onInit();
		this.registerCapabilityListener('learnIRcmd', this.onCapabilityLearnIR.bind(this));
		
		this.dataStore = new DataStore( deviceData.mac )
		this.dataStore.readCommands();
	}


	/**
	 * This method is called when the user adds the device, called just after pairing.
	 */
	onAdded() {
		super.onAdded();
		//Util.debugLog('==>RM3miniDevice.onAdded');
	}

		
	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		super.onDeleted()
		//Util.debugLog('==>RM3miniDevice.onDeleted');
	}


	/**
	 * This method will be called when the learn state needs to be changed.
	 * @param onoff
	 * @returns {Promise}
	 */
	onCapabilityLearnIR(onoff) {
	    //Util.debugLog('==>RM3miniDevice.onCapabilityLearnIR');
	    if( this.learn ) { 
	    	return Promise.resolve() 
	    }
	    this.learn = true;
	    
	    var that = this
	    return this._communicate.enter_learning()
			.then( response => {
				//Util.debugLog('entered learning');
				that._communicate.check_IR_data()
					.then( data => {
						that.learn = false;
						if( data ) {
							//Util.debugLog('<==RM3miniDevice.onCapabilityLearnIR, data = ' + Util.asHex(data));
							let idx = that.dataStore.dataArray.length + 1;
							let cmdname = 'cmd' + idx;
							this.dataStore.addCommand( cmdname, data);
							
							this.storeCmdSetting( cmdname )
						}
								
					})
					.catch( err => {
						that.learn = false;
						Util.debugLog('**> RM3miniDevice.onCapabilityLearnIR, error checking data: '+err);
					})
			})
			.catch( err => {
				that.learn = false;
				Util.debugLog('**> RM3miniDevice.onCapabilityLearnIR, catch: '+err);
			})
	}
	
	
	/**
	 * Called when the device settings are changed by the user 
	 * (so NOT called on programmatically changing settings)
	 * 
	 *  @param changedKeysArr   contains an array of keys that have been changed
	 */
	onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
		
		//Util.debugLog('oldSettingsObj ' + JSON.stringify(oldSettingsObj));
		//Util.debugLog('newSettingsObj ' + JSON.stringify(newSettingsObj));
		//Util.debugLog('changedKeysArr ' + JSON.stringify(changedKeysArr));
		
		let i = 0;
		let oldName = '';
		let newName = '';

		// Verify all settings
		for(i=0; i < changedKeysArr.length; i++ ) {
			oldName = oldSettingsObj[changedKeysArr[i]] || '';
			newName = newSettingsObj[changedKeysArr[i]] || '';

			// has old + has new: rename
			// has old + no new: delete
			// no old + has new: error
			// no old + no new: unused
			if(newName.length > 0) {
				if(oldName.length > 0) {
					if( this.dataStore.findCommand( newName ) >= 0 ) {
						callback( Homey.__('errors.save_settings') + newName + Homey.__('errors.save_settings_exist'), false);
						return;
					}	
				}
				else {
					callback( Homey.__('errors.save_settings') + newName + Homey.__('errors.save_settings_nocmd'), null);
					return;
				}
			}
		}

		// All settings OK, process them
		for(i=0; i < changedKeysArr.length; i++ ) {
			oldName = oldSettingsObj[changedKeysArr[i]] || ''
			newName = newSettingsObj[changedKeysArr[i]] || ''

			if(newName.length > 0) {
				//Util.debugLog(' rename ' + oldName + ' to ' + newName)
				this.dataStore.renameCommand( oldName, newName );
			}
			else {
				//Util.debugLog(' delete ' + oldName)
				this.dataStore.deleteCommand( oldName);
			}
		}

		callback( null, true );
		
	    // always fire the callback, or the settings won't change!
	    // if the settings must not be saved for whatever reason:
	    //    callback( "Your error message", null );
	    // else
		//    callback("Your success message", true )
	}

	
	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		//Util.debugLog('==>BroadlinkDevice.onDeleted');
		this.dataStore.deleteAllCommands();
	}


}

module.exports = RM3miniDevice;
