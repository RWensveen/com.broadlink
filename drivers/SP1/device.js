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
const BroadlinkDevice = require('./../../lib/BroadlinkDevice');
const Util = require('./../../lib/util.js');


class SP1Device  extends BroadlinkDevice {


	generate_trigger( mode ) {
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
	}
	
	async set_onoff( mode ) {
		this.generate_trigger(mode)
		try {
			await this._communicate.sp1_set_power_state(mode)
		} catch( e ) { ; }
	}

	check_condition_on() {
		let onoff = this.getCapabilityValue('onoff')
		return Promise.resolve( onoff )
	}

	do_action_on() {
		this.set_onoff( true );
		this.setCapabilityValue('onoff', true);
		return Promise.resolve(true)
	}

	do_action_off() {
		this.set_onoff( false );
		this.setCapabilityValue('onoff', false);
		return Promise.resolve(true)
	}

	onCapabilityOnOff( mode ) {
		this.set_onoff(mode)
		return Promise.resolve(); 
	}
	
	onInit() {
		super.onInit();
		this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
	}
}

module.exports = SP1Device;
