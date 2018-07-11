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
const Util = require('./../lib/util.js');

/*
.registerRunListener(( args, state, callback ) => {
		// @param: args = trigger settings from app.json
		// @param: state = data from trigger-event

.registerAutocompleteListener(( query, args ) => {
				// @param: query = name of already selected item in flowcard
				//                 or empty string if no selection yet
				// @param: args = other args of flow (i.e. this device)
				// @return: [Promise]->return list of {name,description,anything_programmer_wants}
*/

/**
 * Main entry point for app.
 */
class BroadlinkApp extends Homey.App {

	onInit() {

	}

}

module.exports = BroadlinkApp;
