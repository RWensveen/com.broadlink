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
const BroadlinkDevice = require('./../BroadlinkDevice');


class SP1Device  extends BroadlinkDevice {
	


		
    /**
	 * Send a command to the device. The command was previously retrieved 
	 * with check_IR_data() 
	 */
	onCapabilityOnOff( mode ) {
		return this._communicate.sp1_set_power_state(mode)
			.then (response => {

				if( mode != this.getCapabilityValue('onoff') ) {
					let drv = this.getDriver();
					drv.trigger_toggle.trigger(this,{},{})
					if( mode ) {
						drv.trigger_on.trigger(this,{},{})
					}
					else {
						drv.trigger_off.trigger(this,{},{})
					}
				}
			}, rejection => {
			})
			.catch( err => {
				Util.debugLog('**>SP1device.onCapabilityOnOff - catch = ' + err);
				throw err;
			})
	}
	

	check_condition_on(callback) { 
		let onoff = this.getCapabilityValue('onoff')
		callback(null, onoff ) 
	}
	
	do_action_on() {
		this.onCapabilityOnOff( true )
			.then( r => { this.setCapabilityValue('onoff', true);
			})
	}

	do_action_off() {
		this.onCapabilityOnOff( false )
			.then( r => { this.setCapabilityValue('onoff', false);
			})
	}

	
	onInit() {
		super.onInit();
		this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
	}
	

}

module.exports = SP1Device;
