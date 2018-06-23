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
const BroadlinkDriver = require('./../BroadlinkDriver');


class SP3SDriver extends BroadlinkDriver {
	
	sp3s_check_condition_on( args, state, callback ) {
		args.device.check_condition_on( callback);
	}

	sp3s_do_action_on(args,state) {
		args.device.do_action_on()
	}

	sp3s_do_action_off(args,state) {
		args.device.do_action_off()
	}
	
	onInit() {
		super.onInit({
			CompatibilityID: 0x9479  // SP3S
		});

		this.sp3s_condition_on = new Homey.FlowCardCondition('sp3s_onoff');
		this.sp3s_condition_on
			.register()
			.registerRunListener(this.sp3s_check_condition_on.bind(this) )

		this.sp3s_action_on = new Homey.FlowCardAction('sp3s_onoff_on');
		this.sp3s_action_on
			.register()
			.registerRunListener(this.sp3s_do_action_on.bind(this))
			
		this.sp3s_action_off = new Homey.FlowCardAction('sp3s_onoff_off');
		this.sp3s_action_off
			.register()
			.registerRunListener(this.sp3s_do_action_off.bind(this))

		this.trigger_toggle = new Homey.FlowCardTriggerDevice('sp3s_onoff_change').register();
		this.trigger_on = new Homey.FlowCardTriggerDevice('sp3s_onoff_on').register();
		this.trigger_off = new Homey.FlowCardTriggerDevice('sp3s_onoff_off').register();
	}

}

module.exports = SP3SDriver;
