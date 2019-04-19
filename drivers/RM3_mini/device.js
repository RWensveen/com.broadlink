/**
 * Driver for Broadlink devices
 *
 * Copyright 2018-2019, R Wensveen
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
const BroadlinkDevice = require('./../../lib/BroadlinkDevice');
const DataStore = require('./../../lib/DataStore.js')


class RM3miniDevice extends BroadlinkDevice {


	/**
	 * Store the given name at the first available place in settings.
	 * i.e. look for an entry 'RcCmd.' (where . is integer >= 0)
	 */
	async storeCmdSetting( cmdname ) {

		let settings = this.getSettings()

		var idx = 0;
		let settingName = 'RcCmd' + idx;
		while( settingName in settings) {
			//Util.debugLog( settingName );
			if( settings[ settingName ].length == 0 ) {
				//Util.debugLog(this.getName()+' - storeCmdSettings - setting = '+settingName+', name = ' + cmdname );
				let s = {
						[settingName] : cmdname
						}
				await this.setSettings( s );
				break;
			}
			idx++;
			settingName = 'RcCmd' + idx;
		}
	}


	/**
	 * During device initialisation, make sure the commands
	 * in the datastore are identical to the device settings.
	 */
	updateSettings() {
		
		let settings = this.getSettings()

		// clear all settings
		var idx = 0;
		let settingName = 'RcCmd' + idx;
		while( settingName in settings) {
			this.setSettings( { [settingName] : "" } );
			idx++;
			settingName = 'RcCmd' + idx;
		}

		// set all settings to dataStore names
		idx = 0;
		settingName = 'RcCmd' + idx;
		this.dataStore.getCommandNameList().forEach( s => { 
			this.setSettings( { [settingName] : s } );  
			idx++;
			settingName = 'RcCmd' + idx;
		});
	}
	
	/**
	 * Sends the given command to the device and triggers the flows
	 *
	 * @param  args['variable'] = command with name
	 */
	async executeCommand( args ) {

		try {
			let cmd = args['variable'];

			//Util.debugLog('executeCommand '+cmd.name);

			// send the command
			let cmdData = this.dataStore.getCommandData( cmd.name )
			await this._communicate.send_IR_RF_data( cmdData )
			cmdData = null;

			let drv = this.getDriver();
			// RC_specific_sent: user entered command name
			drv.rm3mini_specific_cmd_trigger.trigger( this, {}, { 'variable':cmd.name })

			// RC_sent_any: set token
			drv.rm3mini_any_cmd_trigger.trigger( this, {'CommandSent':cmd.name}, {})

		} catch( e ) { ; }
		
		return Promise.resolve(true)
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
	check_condition_specific_cmd_sent( args, state ) {
		return Promise.resolve( args.variable.name === state.variable )
	}


	
	/**
	 *
	 */
	onInit() {
		super.onInit();
		this.registerCapabilityListener('learnIRcmd', this.onCapabilityLearnIR.bind(this));
		
		this.dataStore = new DataStore( this.getData().mac )
		this.dataStore.readCommands( this.updateSettings.bind(this) );
	}


	/**
	 * This method will be called when the learn state needs to be changed.
	 * @param onoff
	 */
	async onCapabilityLearnIR(onoff) {
	    if( this.learn ) {
	    	return true;
	    }
	    this.learn = true;

	    try {
		    await this._communicate.enter_learning()
	    	let data = await this._communicate.check_IR_data()
	    	if( data ) {
	    		let idx = this.dataStore.dataArray.length + 1;
	    		let cmdname = 'cmd' + idx;
	    		this.dataStore.addCommand( cmdname, data);

	    		await this.storeCmdSetting( cmdname )
	    	}
	    } catch( e ) { 
			Util.debugLog('**> RM3miniDevice.onCapabilityLearnIR, rejected: ' +e);
	    }
	    this.learn = false;
	}


	/**
	 * Called when the device settings are changed by the user
	 * (so NOT called on programmatically changing settings)
	 *
	 *  @param changedKeysArr   contains an array of keys that have been changed
	 */
	onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {

		super.onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, null );

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
						callback( Homey.__('errors.save_settings_exist', { 'cmd': newName } ), false);
						return;
					}
				}
				else {
					callback( Homey.__('errors.save_settings_nocmd', {'cmd': newName }), null);
					return;
				}
			}
		}

		// All settings OK, process them
		for( i=0; i < changedKeysArr.length; i++ ) {
			oldName = oldSettingsObj[changedKeysArr[i]] || ''
			newName = newSettingsObj[changedKeysArr[i]] || ''

			if( newName.length > 0) {
				this.dataStore.renameCommand( oldName, newName );
			}
			else {
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
		this.dataStore.deleteAllCommands();
	}


}

module.exports = RM3miniDevice;
