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
	
	
	
	
	executeCommand( cmd ) {
		//Util.debugLog('==>executeCommand = ' + JSON.stringify(cmd));
		var cmdData = this.dataStore.getCommandData( cmd.name )
		if( cmdData ) {
			return this._communicate.send_data( cmdData )
		}
		else { return Promise.resolve(); }
	}
	
	
	onInit() {
		super.onInit();
		//Util.debugLog('==>RM3miniDevice.onInit');
		
		// General capability listeners (only for capabilities which can be set on the device)
		if (this.hasCapability('learn')) {
			this.registerCapabilityListener('learn', this.onCapabilityLearn.bind(this));
		}
		
		let that = this;
		// Register a function to fill the action-flowcard 'send_command' (see app.json)
		let myAction = new Homey.FlowCardAction('send_command');
		myAction
			.register()
			.registerRunListener(( args, state ) => { 
					//Util.debugLog('action card - run listener' + JSON.stringify(args) + " - " + JSON.stringify(state) )
					return that.executeCommand( args['variable'] )
			 })
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				// @param: query = name of already selected item in flowcard
				//                 or empty string if no selection yet
				// @param: args = other args of flow (i.e. this device)
				// @return: [Promise]->return list of {name,description,anything_programmer_wants}
				
				//Util.debugLog("device.onInit.FlowCardAction:registered = " + JSON.stringify(query))
				
				let that = this
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
			})

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
	onCapabilityLearn(onoff) {
	    //Util.debugLog('==>RM3miniDevice.onCapabilityLearn');
	    var that = this
	    if( this.learn ) { 
	    	return Promise.resolve() 
	    }
	    this.learn = true;
	    
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
