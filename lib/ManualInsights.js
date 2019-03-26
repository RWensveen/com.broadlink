/**
 * 
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
const Util = require('./../../lib/util.js');
//const { ManagerInsights } = require('homey');



class ManualInsights {
	
	
	
	onInit( ) {
		this.insightsLog = {};
	}
	
	
	/*
	 * Get the name of the insights log. This is not the title, 
	 * but the name ManagerInsights uses for the log.
	 * 
	 * @return   name with only lowercase.
	 */
	_getInsightsName( device, myCapability ) {
		
		let devData = device.getData();
		let name = devData.name + '_' + devData.mac + '_' + devData.devtype + '_' + myCapability;
		return name.toLowerCase().replace( /[^a-z0-9_]/g,'');
	}


	/*
	 * Get the insights log for the given capability. If the log does not exist, it will be created.
	 * 
	 * The log will be available in  <this.insightsLog[myCapability]>
	 */
	getInsightsLog( device, myCapability, logTitle ) {
		
		let name = this._getInsightsName( device, myCapability );
		
		Homey.ManagerInsights.getLog( name, function(err,log) {
			if( err ) {
				//Util.debugLog('no insightsLog named '+ name);
				let title = this.getName() + ' - ' + logTitle;
				Homey.ManagerInsights.createLog( name, { "title": title, "type":"number"},
						function( err, log ) { 
							if( err ) {
								//Util.debugLog('insightsLog error: '+err); 
							}
							else {
								this.insightsLog[myCapability] = log; 
								//Util.debugLog('created insightsLog: '+log.name)
							}
						}.bind(this));
			}
			else {
				this.insightsLog[myCapability] = log;
				//Util.debugLog('have insightsLog: '+ log.name)
			}
		}.bind(this));
	}
	
	
	/**
	 * Remove the insights log, and create a new one.
	 * This is the only way to set the title of the insights log.
	 * 
	 */
	async replaceInsightsLog( myCapability, logTitle ) {
		try {
			await Homey.ManagerInsights.deleteLog( this.insightsLog[myCapability] );
			this._getInsightsLog( myCapability, logTitle );
		}
		catch( err ) { ; }
	}
	
	
	async deleteInsightsLog( myCapability ) {
		await Homey.ManagerInsights.deleteLog( this.insightsLog[myCapability] );
		this.insightsLog[myCapability] = null;
	}
	
	
	addEntry( myCapability, value ) {
		this.insightsLog[myCapability].createEntry( value );
	}


}

module.exports = ManualInsights;
