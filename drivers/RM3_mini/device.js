/**
 * 
 * Driver for Broadlink RM3 Mini
 * 
 * Copyright 2016 - 2018, Remko Wensveen
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
const BroadlinkDevice = require('./../BroadlinkDevice')


class RM3miniDevice extends BroadlinkDevice {
	
	
	
	onInit() {
		super.onInit();
		Util.debugLog('==>RM3miniDevice.onInit');
		
		// General capability listeners (only for capabilities which can be set on the device)
		if (this.hasCapability('learn')) {
			Util.debugLog('   register capability learn');
			this.registerCapabilityListener('learn', this.onCapabilityLearn.bind(this));
		}

	}
	

	/**
	 * This method is called when the user adds the device, called just after pairing.
	 */
	onAdded() {
		super.onAdded();
		Util.debugLog('==>RM3miniDevice.onAdded');
	}

		
	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		super.onDeleted()
		Util.debugLog('==>RM3miniDevice.onDeleted');
	}

	


	/**
	 * This method will be called when the learn state needs to be changed.
	 * @param onoff
	 * @returns {Promise}
	 */
	onCapabilityLearn(onoff) {
	    Util.debugLog('==>RM3miniDevice.onCapabilityLearn');
	    var that = this
	    if( this.learn ) { 
	    	return Promise.resolve() 
	    }
	    this.learn = true;
	    
	    return this._communicate.enter_learning()
			.then( response => {
				Util.debugLog('entered learning');
				that._communicate.check_data()
					.then( data => {
						Util.debugLog('<==RM3miniDevice.onCapabilityLearn, data = ' + Util.asHex(data));
						that.learn = false;
					})
					.catch( err => {
						Util.debugLog('<==RM3miniDevice.onCapabilityLearn, error checking data: '+err);
						that.learn = false;
					})
			})
			.catch( err => {
				Util.debugLog('error learning: '+err);
				that.learn = false;
			})
	    
	    //return Promise.resolve();
	}
	

	
	
}

module.exports = RM3miniDevice;
