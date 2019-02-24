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
const Util = require('./../../lib/util.js');


class SP1Device  extends BroadlinkDevice {


    /**
	 * Send a command to the device. The command was previously retrieved
	 * with check_IR_data()
	 */
	async onCapabilityOnOff( mode ) {
		try {
			//Util.debugLog('SP1.onCapabilityOnOff');
			let response = await this._communicate.sp1_set_power_state(mode)
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
		} catch( e ) {
				Util.debugLog('**>SP1device.onCapabilityOnOff - catch = ' + err);
		}
	}


	check_condition_on(callback) {
		let onoff = this.getCapabilityValue('onoff')
		callback(null, onoff )
	}

	async do_action_on() {
		await this.onCapabilityOnOff( true );
		this.setCapabilityValue('onoff', true);
	}

	async do_action_off() {
		await this.onCapabilityOnOff( false );
		this.setCapabilityValue('onoff', false);
	}


	onInit() {
		super.onInit();
		this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
	}


}

module.exports = SP1Device;
