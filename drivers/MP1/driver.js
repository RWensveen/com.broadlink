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
const BroadlinkDriver = require('./../BroadlinkDriver');
const Util = require('./../../lib/util.js');


class BroadlinkMP1Driver extends BroadlinkDriver {
	
	mp1_check_condition_on( args, state,callback ) {
		args.device.check_condition_on( args.switchID, callback );
	}

	mp1_do_action_on(args,state) {
		args.device.do_action_on( args.switchID )
	}

	mp1_do_action_off(args,state) {
		args.device.do_action_off( args.switchID )
	}

	
	onInit() {
		super.onInit({
			CompatibilityID: 0x4EB5  // MP1
		});
		
		this.trigger_toggle = new Homey.FlowCardTriggerDevice('mp1_onoff_change')
			.register()
			.registerRunListener( (args,state,callback) => {
				callback( null, (args.switchID == state.switchID ))
			})
		this.trigger_toggle_on = new Homey.FlowCardTriggerDevice('mp1_onoff_on')
			.register()
			.registerRunListener( (args,state,callback) => {
				callback( null, (args.switchID == state.switchID ))
			})
		this.trigger_toggle_off = new Homey.FlowCardTriggerDevice('mp1_onoff_off')
			.register()
			.registerRunListener( (args,state,callback) => {
				callback( null, (args.switchID == state.switchID ))
			})

		this.mp1_condition_on = new Homey.FlowCardCondition('mp1_onoff');
		this.mp1_condition_on
			.register()
			.registerRunListener(this.mp1_check_condition_on.bind(this) )

		this.mp1_action_on = new Homey.FlowCardAction('mp1_onoff_on');
		this.mp1_action_on
			.register()
			.registerRunListener(this.mp1_do_action_on.bind(this))

		this.mp1_action_off = new Homey.FlowCardAction('mp1_onoff_off');
		this.mp1_action_off
			.register()
			.registerRunListener(this.mp1_do_action_off.bind(this))

	}

}

module.exports = BroadlinkMP1Driver;
