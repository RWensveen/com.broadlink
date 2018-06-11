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
const Communicate = require('./../../lib/Communicate.js');
const BroadlinkDevice = require('./../BroadlinkDevice');


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
		
	
	constructor(t,e,i) {
		super(t,e,i)
		this.air_quality = AirQualityLevel.unknown.value;
		this.light_level = LightLevel.unknown.value;
		this.noise_level = NoiseLevel.unknown.value;
	}
	
	
	start_sensor_check( interval ) {
		
		var that = this
		this.checkTimer = setInterval( function() {
			that.check_sensors();
		},
		interval * 60 * 1000);  // [minutes] to [msec]
	}
	
	
	stop_sensor_check() {
		if( this.checkTimer ) {
			clearInterval( this.checkTimer)
		}
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
		callback(null, args.variable.value > args.device.light_level )
	}

	check_lightlevel_darker( args, state, callback ) { 
		callback(null, args.variable.value < args.device.light_level )
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
		callback(null, args.variable.value == args.device.noise_level )
	}
	
	check_noiselevel_softer( args, state, callback ) { 
		callback(null, args.variable.value > args.device.noise_level )
	}

	check_noiselevel_louder( args, state, callback ) { 
		callback(null, args.variable.value < args.device.noise_level )
	}

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
		
	onInit() {
		super.onInit();
		
		// Register functions to fill the condition-flowcards and check the condition 
		this.condition_air_quality = new Homey.FlowCardCondition('air_quality');
		this.condition_air_quality
			.register()
			.registerRunListener(this.check_airquality_level.bind() )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				return this.getAirQualityList('same');
			})

		this.condition_air_quality_better = new Homey.FlowCardCondition('air_quality_better');
		this.condition_air_quality_better
			.register()
			.registerRunListener(this.check_airquality_level_better.bind() )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				return this.getAirQualityList('better');
			})

		this.condition_air_quality_worse = new Homey.FlowCardCondition('air_quality_worse');
		this.condition_air_quality_worse
			.register()
			.registerRunListener(this.check_airquality_level_worse.bind() )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				return this.getAirQualityList('worse');
			})
			
		this.condition_light_level = new Homey.FlowCardCondition('light_level');
		this.condition_light_level
			.register()
			.registerRunListener(this.check_lightlevel.bind() )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				return this.getLightLevelList('same');
			})

		this.condition_light_level_brighter = new Homey.FlowCardCondition('light_level_brighter');
		this.condition_light_level_brighter
			.register()
			.registerRunListener(this.check_lightlevel_brighter.bind() )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				return this.getLightLevelList('brighter');
			})

		this.condition_light_level_darker = new Homey.FlowCardCondition('light_level_darker');
		this.condition_light_level_darker
			.register()
			.registerRunListener(this.check_lightlevel_darker.bind() )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				return this.getLightLevelList('darker');
			})
			
		this.condition_noise_level = new Homey.FlowCardCondition('noise_level');
		this.condition_noise_level
			.register()
			.registerRunListener(this.check_noiselevel.bind() )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				return this.getNoiseLevelList('same');
			})

		this.condition_noise_level_louder = new Homey.FlowCardCondition('noise_level_louder');
		this.condition_noise_level_louder
			.register()
			.registerRunListener(this.check_noiselevel_louder.bind() )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				return this.getNoiseLevelList('louder');
			})

		this.condition_noise_level_softer = new Homey.FlowCardCondition('noise_level_softer');
		this.condition_noise_level_softer
			.register()
			.registerRunListener(this.check_noiselevel_softer.bind() )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => {
				return this.getNoiseLevelList('softer');
			})
			
		// Register a function to fill the trigger-flowcard 
		this.trigger_air_quality = new Homey.FlowCardTriggerDevice('air_quality');
		this.trigger_air_quality
			.register();

		this.trigger_light_level = new Homey.FlowCardTriggerDevice('light_level');
		this.trigger_light_level
			.register();

		this.trigger_noise_level = new Homey.FlowCardTriggerDevice('noise_level');
		this.trigger_noise_level
			.register();

		this.getDriver()
			.ready( () => {
				this.start_sensor_check( this.getSetting('CheckInterval') )
				//this.check_sensors();
			})
	}

	
	/**
	 * This method is called when the user adds the device, called just after pairing.
	 */
	onAdded() {
		super.onAdded();
		//Util.debugLog('==>A1Device.onAdded');
	}

		
	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		super.onDeleted();
		this.stop_sensor_check();
		
		//Util.debugLog('==>A1Device.onDeleted');
	}

	
	/**
	 * Called when the device settings are changed by the user 
	 * (so NOT called on programmatically changing settings)
	 * 
	 *  @param changedKeysArr   contains an array of keys that have been changed
	 */
	onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
		
		if( changedKeysArr.indexOf('CheckInterval') >= 0 ) {
			this.stop_sensor_check()
			this.start_sensor_check( newSettingsObj['CheckInterval'] )
		}
		callback( null, true );
	}

	
	
	/**
     * 
     *
     */
    check_sensors() 
    {
    	var that = this;
    	this._communicate.read_status()
    		.then( response => {
    			
    			let temperature = (response[0] * 10 + response[1]) / 10.0;
	    		let humidity    = (response[2] * 10 + response[3]) / 10.0;
	    		let str_light       = response[4];
	    		let str_air_quality = response[6];
	    		let str_noise       = response[8];
    			
				switch( str_air_quality )
	    	    {
	    	    	case 0:  that.air_quality = AirQualityLevel.excellent.value; str_air_quality = AirQualityLevel.excellent.name;  break;
	    	    	case 1:  that.air_quality = AirQualityLevel.good.value;      str_air_quality = AirQualityLevel.good.name;       break;
	    	    	case 2:  that.air_quality = AirQualityLevel.normal.value;    str_air_quality = AirQualityLevel.normal.name;     break;
	    	    	case 3:  that.air_quality = AirQualityLevel.bad.value;       str_air_quality = AirQualityLevel.bad.name;        break;
	    	    	default: that.air_quality = AirQualityLevel.unknown.value;   str_air_quality = AirQualityLevel.unknown.name;    break;
	    	    }
				if( that.air_quality != AirQualityLevel.unknown.value ) {
					this.setCapabilityValue('a1_air_quality', str_air_quality, true);
					this.setCapabilityValue('a1_air_quality_number', that.air_quality);
		    	    //Util.debugLog('air_quality = '+ str_air_quality + ' ('+that.air_quality +')' )
				}
				
	    	    switch( str_light )
	    	    {
	    	    	case 0  : that.light_level = LightLevel.dark.value    ; str_light = LightLevel.dark.name;    break;
	    	    	case 1  : that.light_level = LightLevel.dim.value     ; str_light = LightLevel.dim.name;     break;
	    	    	case 2  : that.light_level = LightLevel.normal.value  ; str_light = LightLevel.normal.name;  break;
	    	    	case 3  : that.light_level = LightLevel.bright.value  ; str_light = LightLevel.bright.name;  break;
	    	    	default : that.light_level = LightLevel.unknown.value ; str_light = LightLevel.unknown.name; break;
	    	    }
	    	    if ( that.light_level != LightLevel.unknown.value ) {
	    	    	this.setCapabilityValue('a1_light_level', str_light,       true);
	    	    	this.setCapabilityValue('a1_light_level_number', that.light_level);
		    	    //Util.debugLog('light = '      + str_light       + ' ('+that.light_level + ')'      )
	    	    }
	    	    
	    	    switch( str_noise )
	    	    {
	    	    	case 0:  that.noise_level = NoiseLevel.quiet.value   ; str_noise = NoiseLevel.quiet.name;   break;
	    	    	case 1:  that.noise_level = NoiseLevel.normal.value  ; str_noise = NoiseLevel.normal.name;  break;
	    	    	case 2:  that.noise_level = NoiseLevel.noisy.value   ; str_noise = NoiseLevel.noisy.name;   break;
	    	    	default: that.noise_level = NoiseLevel.unknown.value ; str_noise = NoiseLevel.unknown.name; break;
	    	    }
	    	    if( that.noise_level != NoiseLevel.unknown.value ) {
	    	    	this.setCapabilityValue('a1_noise_level', str_noise,       true);
	    	    	this.setCapabilityValue('a1_noise_level_number', that.noise_level);
		    	    //Util.debugLog('noise = '      + str_noise       + ' ('+that.noise_level + ')'     )
	    	    }
	    	    
	    	    this.setCapabilityValue('measure_temperature', temperature );
    			this.setCapabilityValue('measure_humidity'   , humidity    );

    			//Util.debugLog('temperature = '+ temperature )
	    	    //Util.debugLog('humidity = '   + humidity    )
    			
    		}, rejectReason => {
    			Util.debugLog('**> device.check_sensors: ' + rejectReason)
    		})
    		.catch(err => {
    			Util.debugLog('**> device.check_sensors: catch = ' + err)
    		})
     }
   
     
}

module.exports = A1Device;
