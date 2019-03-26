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

const BroadlinkDriver = require('./../BroadlinkDriver');
const Homey = require('homey');


class BroadlinkSP1Driver extends BroadlinkDriver {


	sp1_check_condition_on( args, state, callback ) {
		return args.device.check_condition_on( callback )
	}

	sp1_do_action_on(args,state) {
		return args.device.do_action_on()
	}

	sp1_do_action_off(args,state) {
		return args.device.do_action_off()
	}


	onInit() {
		super.onInit({
			CompatibilityID: 0x0000  // SP1
		});

		this.trigger_toggle = new Homey.FlowCardTriggerDevice('sp1_onoff_change').register()
		this.trigger_on = new Homey.FlowCardTriggerDevice('sp1_onoff_on').register()
		this.trigger_off = new Homey.FlowCardTriggerDevice('sp1_onoff_off').register()

		this.sp1_condition_on = new Homey.FlowCardCondition('sp1_onoff')
			.register()
			.registerRunListener(this.sp1_check_condition_on.bind(this) )

		this.sp1_action_on = new Homey.FlowCardAction('sp1_onoff_on')
			.register()
			.registerRunListener(this.sp1_do_action_on.bind(this))

		this.sp1_action_off = new Homey.FlowCardAction('sp1_onoff_off')
			.register()
			.registerRunListener(this.sp1_do_action_off.bind(this))

	}

}

module.exports = BroadlinkSP1Driver;
