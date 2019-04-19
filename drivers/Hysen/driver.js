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

const BroadlinkDriver = require('./../../lib/BroadlinkDriver');
const Homey = require('homey');
const Util = require('./../../lib/util.js');


class HysenDriver extends BroadlinkDriver {

	check_condition_parentalmode_on( args, state ) {
		return args.device.check_parentalmode_on()
	}

	do_action_parentalmode_on(args,state) {
		return args.device.do_action_parentalmode_on()
	}

	do_action_parentalmode_off(args,state) {
		return args.device.do_action_parentalmode_off()
	}

	onInit() {
		super.onInit({
			CompatibilityID: 0x4EAD   // HYSEN
		});
		
		// temperature FlowCards are added automatically
		
		this.trigger_parentalmode_on = new Homey.FlowCardTriggerDevice('hysen_parentalmode_on').register()
		this.trigger_parentalmode_off = new Homey.FlowCardTriggerDevice('hysen_parentalmode_off').register()
		this.trigger_parentalmode_toggle = new Homey.FlowCardTriggerDevice('hysen_parentalmode_toggle').register()
		
		this.condition_parentalmode_on = new Homey.FlowCardCondition('hysen_parentalmode')
			.register()
			.registerRunListener(this.check_condition_parentalmode_on.bind(this) )

		this.action_parentalmode_on = new Homey.FlowCardAction('hysen_parentalmode_set_on')
			.register()
			.registerRunListener(this.do_action_parentalmode_on.bind(this))

		this.action_parentalmode_off = new Homey.FlowCardAction('hysen_parentalmode_set_off')
			.register()
			.registerRunListener(this.do_action_parentalmode_off.bind(this))
	}

	/**
	 * Handles the backend of the pairing sequence.
	 * Communication to the frontend is done via events => socket.emit('x')
	 *
	 */
	onPair(socket) {
		super.onPair(socket);
		
		socket.on('properties_set', function( data, callback ) {
			// data = { 'externalSensor': val, 'deviceList': deviceData }
			
			if( ! data[ 'externalSensor' ] ) {
				// override capabilities in app.json
				data['deviceList'][0]['capabilities'] = [
					"measure_temperature",
					"target_temperature",
					"parental_mode"
					]
				data['deviceList'][0]['capabilitiesOptions' ] = {
					"target_temperature": {
						"min": 5,
						"max": 30,
						"step": 0.5
					}
				}
			}
			return callback(null,data['deviceList']);
		}.bind(this));
	}
}

module.exports = HysenDriver;
