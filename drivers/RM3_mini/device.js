/**
 * 
 * Driver for Broadlink devices
 * 
 * Copyright 2018, Remko Wensveen
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
 * along with com.gruijter.plugwise2py.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const Homey = require('homey');
const Util = require('./../../lib/util.js');
const Communicate = require('./../../lib/Communicate.js');
const BroadlinkDevice = require('./../BroadlinkDevice');


class RM3miniDevice extends BroadlinkDevice {
	
	
	
	/**
	 * Sends the given command to the device and triggers the flows
	 * 
	 * @param  that  = this driver
	 * @param  cmd   = command-name
	 * 
	 * @return [Promise] resolves once command is send
	 */
	executeCommand( that, cmd ) {
		//Util.debugLog('==>executeCommand: ' + JSON.stringify(cmd))
		
		var cmdData = that.dataStore.getCommandData( cmd.name )
		if( cmdData ) {
			// RC_specific_sent: user entered command name
			that.mySpecificTrigger.trigger( that, {}, { 'variable':cmd.name })
			
			// RC_sent_any: set token
			that.myAnyCmdTrigger.trigger(that,{'CommandSent':cmd.name},{})
			
			// send the command
		    return this._communicate.send_data( cmdData )
		}
		else { return Promise.resolve(); }
	}
	
	
	/**
	 * Get a list of all command-names
	 * 
	 * @return  [Promise] resolves with the command-name list
	 */
	onAutoComplete(that) {
		return new Promise( function(resolve, reject ) {
			let lst = []
			let names = that.dataStore.getCommandNameList()
			for(var i = names.length -1; i >= 0; i--) {
				let item =  {
								"name": names[i] 
							};
				lst.push( item )
			}
			resolve( lst )
		});
	}
	
	
	onInit() {
		super.onInit();
		
		// General capability listeners (only for capabilities which can be set on the device)
		if (this.hasCapability('learn')) {
			this.registerCapabilityListener('learn', this.onCapabilityLearn.bind(this));
		}
		
		let that = this;
		// Register a function to fill the action-flowcard 'send_command' (see app.json)
		this.myAction = new Homey.FlowCardAction('send_command');
		this.myAction
			.register()
			.registerRunListener(( args, state ) => { 
					return that.executeCommand( that, args['variable'] )
			 })
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				// @param: query = name of already selected item in flowcard
				//                 or empty string if no selection yet
				// @param: args = other args of flow (i.e. this device)
				// @return: [Promise]->return list of {name,description,anything_programmer_wants}
				
				//Util.debugLog("device.onInit.FlowCardAction:registered = " + JSON.stringify(query))
				
				return that.onAutoComplete(that);
			});
		
		// Register a function to fill the trigger-flowcard 'RC_specific_sent' (see app.json)
		this.mySpecificTrigger = new Homey.FlowCardTriggerDevice('RC_specific_sent');
		this.mySpecificTrigger
			.register()
			.registerRunListener(( args, state,callback ) => { 
				// @param: args = trigger settings from app.json
				// @param: state = data from trigger-event (as given in this.executeCommand function)

				callback(null,( args.variable.name === state.variable ))
			})
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				// @param: query = name of already selected item in flowcard
				//                 or empty string if no selection yet
				// @param: args = other args of flow (i.e. this device)
				// @return: [Promise]->return list of {name,description,anything_programmer_wants}
				
				return that.onAutoComplete(that);
			})

		this.myAnyCmdTrigger = new Homey.FlowCardTriggerDevice('RC_sent_any');
		this.myAnyCmdTrigger.register()
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
		
		this.myAction.unregister()
		this.mySpecificTrigger.unregister()
		this.myAnyCmdTrigger.unregister()
	}


	/**
	 * This method will be called when the learn state needs to be changed.
	 * @param onoff
	 * @returns {Promise}
	 */
	onCapabilityLearn(onoff) {
	    //Util.debugLog('==>RM3miniDevice.onCapabilityLearn');
	    if( this.learn ) { 
	    	return Promise.resolve() 
	    }
	    this.learn = true;
	    
	    var that = this
	    return this._communicate.enter_learning()
			.then( response => {
				//Util.debugLog('entered learning');
				that._communicate.check_data()
					.then( data => {
						that.learn = false;
						if( data ) {
							//Util.debugLog('<==RM3miniDevice.onCapabilityLearn, data = ' + Util.asHex(data));
							this.dataStore.addCommand( 'cmd' + that.dataStore.dataArray.length, data);
						}
						else {
							//Util.debugLog('<==RM3miniDevice.onCapabilityLearn -> no data');
						}
					})
					.catch( err => {
						that.learn = false;
						//Util.debugLog('<==RM3miniDevice.onCapabilityLearn, error checking data: '+err);
					})
			})
			.catch( err => {
				//Util.debugLog('error learning: '+err);
				that.learn = false;
			})
	    
	    //return Promise.resolve();
	}
	
	
}

module.exports = RM3miniDevice;
