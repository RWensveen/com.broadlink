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
const Util = require('./../../lib/util.js');
const BroadlinkDevice = require('./../BroadlinkDevice');
//const ManualInsights = require('./../../lib/ManualInsights.js');


/*
 * NOTE: these values should match the enums in app.json
 */
var AirQualityLevel = Object.freeze( {
	excellent : { value: 1, name: 'excellent'},
	good      : { value: 2, name: 'good'     },
	normal    : { value: 3, name: 'normal'   },
	bad       : { value: 4, name: 'bad'      },
	unknown   : { value: 11, name: 'unknown'  }
})
var LightLevel = Object.freeze( {
	dark      : { value:1, name: 'dark'    },
	dim       : { value:2, name: 'dim'     },
	normal    : { value:3, name: 'normal'  },
	bright    : { value:4, name: 'bright'  },
	unknown   : { value:11, name: 'unknown' }
})
var NoiseLevel = Object.freeze( {
	quiet     : { value:1, name: 'quiet'  },
	normal    : { value:2, name: 'normal' },
	noisy     : { value:3, name: 'noisy'  },
	unknown   : { value:11, name: 'unknown'}
})


class A1Device extends BroadlinkDevice {
	
	
	onInit() {
		super.onInit();
		this.registerCapabilityListener('updateSensor', this.onCapabilityUpdateSensor.bind(this));
		this.air_quality = AirQualityLevel.unknown.value;
		this.light_level = LightLevel.unknown.value;
		this.noise_level = NoiseLevel.unknown.value;
		
//		this.insights = new ManualInsights();
//		this.insights.onInit();
//		this.insights.getInsightsLog( this, 'a1_air_quality_number', "air quality");
//		this.insights.getInsightsLog( this, 'a1_light_level_number', "light level");
//		this.insights.getInsightsLog( this, 'a1_noise_level_number', "noise level");
	}
	
	
//	onRenamed() {
//		this.insights.replaceInsightsLog( 'a1_air_quality_number', "air quality");
//		this.insights.replaceInsightsLog( 'a1_light_level_number', "light level");
//		this.insights.replaceInsightsLog( 'a1_noise_level_number', "noise level");
//	}	

	
//	onDeleted() {
//		super.onDeleted();
//		//Util.debugLog('delete insightsLogs');
//		this.insights.deleteInsightsLog('a1_air_quality_number');
//		this.insights.deleteInsightsLog('a1_light_level_number');
//		this.insights.deleteInsightsLog('a1_noise_level_number');
//	}

	
	onCapabilityUpdateSensor(onoff) {
		//Util.debugLog('updateSensor')
		this.onCheckInterval();
	}

	
	getAirQualityList(mode) {
		if(mode == 'better') {
			return [
				{name:Homey.__('air_quality.good'),   value:AirQualityLevel.good.value},
				{name:Homey.__('air_quality.normal'), value:AirQualityLevel.normal.value},
				{name:Homey.__('air_quality.bad'),    value:AirQualityLevel.bad.value}
		   ];
		}
		if(mode == 'worse') {
			return [
				{name:Homey.__('air_quality.excellent'), value:AirQualityLevel.excellent.value},
				{name:Homey.__('air_quality.good'),      value:AirQualityLevel.good.value},
			    {name:Homey.__('air_quality.normal'),    value:AirQualityLevel.normal.value}
			   ];
		}
		return [
				{name:Homey.__('air_quality.excellent'), value:AirQualityLevel.excellent.value},
				{name:Homey.__('air_quality.good'),      value:AirQualityLevel.good.value},
				{name:Homey.__('air_quality.normal'),    value:AirQualityLevel.normal.value},
				{name:Homey.__('air_quality.bad'),       value:AirQualityLevel.bad.value}
			   ];
	}

	check_airquality_level( args, state, callback )  {
		callback(null, args.variable.value == args.device.air_quality )
	}

	check_airquality_level_better( args, state, callback ) {
		callback(null, args.variable.value > args.device.air_quality )
	}

	check_airquality_level_worse( args, state, callback ) {
		callback(null, args.variable.value < args.device.air_quality )
	}


	getLightLevelList(mode) {
		if(mode == 'brighter') {
			return [
				{name:Homey.__('light_level.dark'),   value:LightLevel.dark.value},
				{name:Homey.__('light_level.dim'),    value:LightLevel.dim.value},
				{name:Homey.__('light_level.normal'), value:LightLevel.normal.value}
		   ];
		}
		if(mode == 'darker') {
			return [
				{name:Homey.__('light_level.dim'),     value:LightLevel.dim.value},
				{name:Homey.__('light_level.normal'),  value:LightLevel.normal.value},
			    {name:Homey.__('light_level.bright'),  value:LightLevel.bright.value}
			   ];
		}
		return [
				{name:Homey.__('light_level.dark'),    value:LightLevel.dark.value},
				{name:Homey.__('light_level.dim'),     value:LightLevel.dim.value},
				{name:Homey.__('light_level.normal'),  value:LightLevel.normal.value},
				{name:Homey.__('light_level.bright'),  value:LightLevel.bright.value}
			   ];
	}

	check_lightlevel( args, state, callback )  {
		callback(null, args.variable.value == args.device.light_level )
	}

	check_lightlevel_brighter( args, state, callback ) {
		callback(null, args.variable.value < args.device.light_level )
	}

	check_lightlevel_darker( args, state, callback ) {
		callback(null, args.variable.value > args.device.light_level )
	}


	getNoiseLevelList(mode) {
		if(mode == 'louder') {
			return [
				{name:Homey.__('noise_level.quiet'),   value:NoiseLevel.quiet.value},
				{name:Homey.__('noise_level.normal'),  value:NoiseLevel.normal.value}
		   ];
		}
		if(mode == 'softer') {
			return [
				{name:Homey.__('noise_level.normal'),  value:NoiseLevel.normal.value},
			    {name:Homey.__('noise_level.noisy'),   value:NoiseLevel.noisy.value}
			   ];
		}
		return [
				{name:Homey.__('noise_level.quiet'),   value:NoiseLevel.quiet.value},
				{name:Homey.__('noise_level.normal'),  value:NoiseLevel.normal.value},
				{name:Homey.__('noise_level.noisy'),   value:NoiseLevel.noisy.value}
			   ];
	}

	check_noiselevel( args, state, callback )  {
		callback(null, args.variable.value == args.device.noise_level );
	}

	check_noiselevel_softer( args, state, callback ) {
		callback(null, args.variable.value > args.device.noise_level );
	}

	check_noiselevel_louder( args, state, callback ) {
		callback(null, args.variable.value < args.device.noise_level );
	}


	/**
     * Called when the periodic timer expires
     */
	async onCheckInterval()
    {
		try {
			let response = await this._communicate.read_status();
    
   			let temperature = (response[0] * 10 + response[1]) / 10.0;
	    	let humidity    = (response[2] * 10 + response[3]) / 10.0;
	    	let str_light       = response[4];
	    	let str_air_quality = response[6];
	    	let str_noise       = response[8];

	    	let curr_air_quality = this.air_quality;
	    	let curr_light       = this.light_level;
	    	let curr_noise       = this.noise_level;
	    	let curr_temperature = this.temperature;
	    	let curr_humidity    = this.humidity;
	    
			switch( str_air_quality )
			{
	    	   	case 0:  this.air_quality = AirQualityLevel.excellent.value; str_air_quality = AirQualityLevel.excellent.name;  break;
	    	   	case 1:  this.air_quality = AirQualityLevel.good.value;      str_air_quality = AirQualityLevel.good.name;       break;
	    	   	case 2:  this.air_quality = AirQualityLevel.normal.value;    str_air_quality = AirQualityLevel.normal.name;     break;
	    	   	case 3:  this.air_quality = AirQualityLevel.bad.value;       str_air_quality = AirQualityLevel.bad.name;        break;
	    	   	default: this.air_quality = AirQualityLevel.unknown.value;   str_air_quality = AirQualityLevel.unknown.name;    break;
	    	}
			if( this.air_quality != AirQualityLevel.unknown.value ) {
				this.setCapabilityValue('a1_air_quality', str_air_quality, true);
				this.setCapabilityValue('a1_air_quality_number', this.air_quality);
//				this.insights.addEntry('a1_air_quality_number', this.air_quality );
			}

			switch( str_light )
			{
				case 0  : this.light_level = LightLevel.dark.value    ; str_light = LightLevel.dark.name;    break;
				case 1  : this.light_level = LightLevel.dim.value     ; str_light = LightLevel.dim.name;     break;
				case 2  : this.light_level = LightLevel.normal.value  ; str_light = LightLevel.normal.name;  break;
				case 3  : this.light_level = LightLevel.bright.value  ; str_light = LightLevel.bright.name;  break;
				default : this.light_level = LightLevel.unknown.value ; str_light = LightLevel.unknown.name; break;
			}
	    	if ( this.light_level != LightLevel.unknown.value ) {
	    		this.setCapabilityValue('a1_light_level', str_light, true);
    	    	this.setCapabilityValue('a1_light_level_number', this.light_level);
//    	    	this.insights.addEntry('a1_light_level_number', this.light_level );
	    	}
	    
	    	switch( str_noise )
	    	{
	    	   	case 0:  this.noise_level = NoiseLevel.quiet.value   ; str_noise = NoiseLevel.quiet.name;   break;
	    	   	case 1:  this.noise_level = NoiseLevel.normal.value  ; str_noise = NoiseLevel.normal.name;  break;
	    	   	case 2:  this.noise_level = NoiseLevel.noisy.value   ; str_noise = NoiseLevel.noisy.name;   break;
	    	   	default: this.noise_level = NoiseLevel.unknown.value ; str_noise = NoiseLevel.unknown.name; break;
	    	}
	    	if( this.noise_level != NoiseLevel.unknown.value ) {
	    	   	this.setCapabilityValue('a1_noise_level', str_noise, true);
    	    	this.setCapabilityValue('a1_noise_level_number', this.noise_level);
//    	    	this.insights.addEntry('a1_noise_level_number', this.noise_level );
	    	}
	    
	    	this.setCapabilityValue('measure_temperature', temperature );
    		this.setCapabilityValue('measure_humidity'   , humidity    );

	    	let drv = this.getDriver();
			if( curr_air_quality != this.air_quality ) { drv.a1_trigger_air_quality.trigger(this,{'airquality':str_air_quality},{}) }
			if( curr_light       != this.light_level ) { drv.a1_trigger_light_level.trigger(this,{'lightlevel':str_light},{}) }
			if( curr_noise       != this.noise_level ) { drv.a1_trigger_noise_level.trigger(this,{'noiselevel':str_noise},{}) }
    	
		} catch( e ) {
    		Util.debugLog('**> A1.onCheckInterval: ' + e );
    	}
    
     }


}

module.exports = A1Device;
