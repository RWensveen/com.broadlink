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


class SP2Device extends BroadlinkDevice {


	generate_trigger_nightlight(mode) {
		if( mode != this.getCapabilityValue('onoff.nightlight') ) {
			let drv = this.getDriver();
			drv.trigger_nightlight_toggle.trigger(this,{},{})
			if(mode) {
				drv.trigger_nightlight_on.trigger(this,{},{})
			}
			else {
				drv.trigger_nightlight_off.trigger(this,{},{})
			}
		}
	}

	generate_trigger_power(mode) {
		if( mode != this.getCapabilityValue('onoff.power') ) {
			let drv = this.getDriver();
			drv.trigger_power_toggle.trigger(this,{},{})
			if(mode) {
				drv.trigger_power_on.trigger(this,{},{})
			}
			else {
				drv.trigger_power_off.trigger(this,{},{})
			}
		}
	}


	async onCheckInterval( interval ) {
		try {
			let energy = await this.get_energy()
			this.setCapabilityValue('measure_power', energy);
			
			let response = await this._communicate.read_status()

			let state = (( response[0] == 2 ) || ( response[0] == 3 ))
			this.setCapabilityValue('onoff.nightlight',state);
			this.generate_trigger_nightlight(state);

			state = (( response[0] == 1 ) || (response[0] == 3 ));
			this.setCapabilityValue('onoff.power',state);
			this.generate_trigger_power(state);
		} catch( e ) { ; }
	}


	/**
	 *
	 */
	async get_energy() {
		try {
			let response = await this._communicate.sp2_get_energy();
			let energy = response[3] * 256 + response[2] + (response[1]/100.0);
			return energy;
		} catch( e ) {
			return 0;
		}
	}


	/**
	 * Returns the night light state of the smart plug.
	 */
	async check_nightlight() {
		try {
			let response = await this._communicate.read_status()
			return  (( response[0] == 2 ) || ( response[0] == 3 ));
		} catch( e ) {
			return false;
		}
	}


	/**
	 *
	 */
	async set_nightlight(state) {
		let onoff = await this.check_power()
    	let level = 0
		if(onoff) {
			level = state ? 3 : 1;
		}
		else {
			level = state ? 2 : 0;
		}
		await this._communicate.setPowerState(level)
		return true;
	}


	/**
	 * Returns the power state of the smart plug.
	 */
	async check_power() {
		try {
			let response = await this._communicate.read_status()
			return (( response[0] == 1 ) || (response[0] == 3 ));
		} catch( e ) {
			return false;
		}
	}


	/**
	 * Sets the power state of the smart plug.
	 */
	async set_power(state) {
		let onoff = await this.check_nightlight()
    	let level = 0;
		if(onoff) {
			level = state ? 3 : 2;
		}
		else {
			level = state ? 1 : 0;
		}
    	await this._communicate.setPowerState(level);
    	return true;
	}

	/**
	 *
	 */
	async onCapabilityPowerOnOff( mode ) {
		try {
			await this.set_power( mode )
			this.generate_trigger_power(mode);
		} catch (e) { ; }
	}


	/**
	 *
	 */
	async onCapabilityNightLightOnOff( mode ) {
		try {
			await this.set_nightlight( mode )
			this.generate_trigger_nightlight( mode );
		} catch(e) { ; }
	}


	async check_condition_power_on(callback) {
		let onoff = await this.check_power();
		callback(null, onoff );
	}

	async check_condition_nightlight_on(callback) {
		let onoff = await this.check_nightlight()
		callback(null, onoff );
	}


	async do_action_power_on() {
		Util.debugLog('SP2Device.do_action_power_on');
		await this.onCapabilityPowerOnOff(true)
		this.setCapabilityValue('onoff.power', true);
	}

	async do_action_power_off() {
		Util.debugLog('SP2Device.do_action_power_off');
		await this.onCapabilityPowerOnOff(false);
		this.setCapabilityValue('onoff.power', false);
	}

	async do_action_nightlight_on() {
		await this.onCapabilityNightLightOnOff(true)
		this.setCapabilityValue('onoff.nightlight', true)
	}

	async do_action_nightlight_off() {
		await this.onCapabilityNightLightOnOff(false)
		this.setCapabilityValue('onoff.nightlight', false)
	}


	onInit() {
		super.onInit();
		this.registerCapabilityListener('onoff.power', this.onCapabilityPowerOnOff.bind(this));
		this.registerCapabilityListener('onoff.nightlight', this.onCapabilityNightLightOnOff.bind(this));
	}

}

module.exports = SP2Device;
