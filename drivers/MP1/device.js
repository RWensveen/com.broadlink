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
const BroadlinkDevice = require('./../BroadlinkDevice');


class MP1Device  extends BroadlinkDevice {


	generate_trigger( sid, mode ) {
		let capa = 'onoff.s' + sid
		if( mode != this.getCapabilityValue( capa ) ) {

			let drv = this.getDriver();
			drv.trigger_toggle.trigger(this,{},{"switchID":sid})
			if( mode ) {
				drv.trigger_toggle_on.trigger(this,{},{"switchID":sid})
			}
			else {
				drv.trigger_toggle_off.trigger(this,{},{"switchID":sid})
			}
		}
	}


    /**
	 * Send 'on/off' command to the device.
	 *
	 * @param sid  [string] "1".."4"
	 * @param mode [boolean] true, false
	 */
	async set_onoff( sid, mode ) {
		try {
			Util.debugLog("==>MP1.set_onoff: sid=" + sid + " mode="+mode)
			await this._communicate.mp1_set_power_state( sid, mode )
			this.generate_trigger( sid, mode );
		} catch(e) { ; }
	}


	/**
	 * Returns the power state of the smart power strip.
	 */
	async onCheckInterval() {
		try {
			let state = await this._communicate.mp1_check_power()
    		let s1,s2,s3,s4;
    		s1 = ( state & 0x01 );
    		s2 = ( state & 0x02 );
    		s3 = ( state & 0x04 );
    		s4 = ( state & 0x08 );
    
    		this.generate_trigger(1,s1)
    		this.generate_trigger(2,s2)
    		this.generate_trigger(3,s3)
    		this.generate_trigger(4,s4)
    		this.setCapabilityValue('onoff.s1', s1 );
   			this.setCapabilityValue('onoff.s2', s2 );
   			this.setCapabilityValue('onoff.s3', s3 );
   			this.setCapabilityValue('onoff.s4', s4 );
		} catch( e ) { ; }
	}

	check_condition_on( sid, callback ) {
		let capa = 'onoff.s' + sid
		let onoff = this.getCapabilityValue( capa )
		callback(null,onoff)
	}

	async do_action_on(sid) {
		let capa = 'onoff.s' + sid
		await this.set_onoff(sid, true)
		this.setCapabilityValue(capa, true);
	}

	async do_action_off(sid) {
		let capa = 'onoff.s' + sid
		await this.set_onoff(sid,false)
		this.setCapabilityValue(capa, false);
	}

	onCapabilityOnOff_1(mode) { this.set_onoff( "1", mode ); }
	onCapabilityOnOff_2(mode) { this.set_onoff( "2", mode ); }
	onCapabilityOnOff_3(mode) { this.set_onoff( "3", mode ); }
	onCapabilityOnOff_4(mode) { this.set_onoff( "4", mode ); }


	onInit() {
		super.onInit();
		this.registerCapabilityListener('onoff.s1', this.onCapabilityOnOff_1.bind(this) )
		this.registerCapabilityListener('onoff.s2', this.onCapabilityOnOff_2.bind(this) )
		this.registerCapabilityListener('onoff.s3', this.onCapabilityOnOff_3.bind(this) )
		this.registerCapabilityListener('onoff.s4', this.onCapabilityOnOff_4.bind(this) )
	}

}

module.exports = MP1Device;
