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

const Homey = require('homey')
const Log = require('homey-log').Log;



/*
 * homey-log sends error reports to Sentry.IO
 * in env.js its DSN is defined.
 * log in to Sentry.IO with your github account to view the events.
 */



exports.debugLog = function (message, data) {
	let s = Homey.ManagerSettings.get('DebugSettings');
	if( ( s ) && ( s['logging']) ) {
		console.log(this.epochToTimeFormatter(), message, data || '')
	}
	if( ( s ) && ( s['errorreport']) ) {
    	Log.captureMessage( message + (data || ''))
	}
}


exports.epochToTimeFormatter = function (epoch) {
	if (epoch == null) epoch = new Date().getTime()
	return (new Date(epoch)).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
}


exports.concatTypedArrays = function (a, b) { // a, b TypedArray of same type
	var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}


const nibble = [ '0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F']

function hexDigit( b ) {
	let l = (b ) & 0x0F;
	let h = (b >> 4 ) & 0x0F;
	return '' + nibble[h]+nibble[l];
}


/**
 *  Convert an Array (might be typed) to a human reabable string,
 *  where each byte is separated by a comma
 */
exports.asHex = function( arr, separator ) {

	if( separator == null ) { separator = "," }
	var s = Array(arr.length);
	for( var i=0 ; i< arr.length;i++ ) {
		s[i] = hexDigit(arr[i])
	}
	return Array.apply([], s).join(separator)
}


/**
 *  Convert an Array (might be typed) to a string,
 *  without any separation characters
 */
exports.arrToHex = function( arr ) {

	var s = Array(arr.length);
	for( var i=0 ; i< arr.length;i++ ) {
		s[i] = hexDigit(arr[i])
	}
	return Array.apply([], s).join("")
}


/**
 * Convert a string with hex-representation to a
 * typed array with bytes.
 * example:  hexToArr( '12A4F0D8' ) -> Uint8Array([ 0x12, 0xA4, 0xF0, 0xD8 ])
 */
exports.hexToArr = function ( str ) {
	if( ! str ) { return null; }

    for (var bytes = [], c = 0; c < str.length; c += 2) {
    	bytes.push(parseInt(str.slice(c, c+2), 16));
    }
    return new Uint8Array(bytes);
}


/**
 * Gets the IP address of this Homey (i.e. our own IP address)
 *
 * return: [Promise]
 *         from Promise, return IP address
 */
exports.getHomeyIp = function () {
  return new Promise(function (resolve, reject) {
    Homey.ManagerCloud.getLocalAddress()
      .then(localAddress => {
        return resolve(localAddress)
      })
      .catch(error => {
        throw new Error(error);
      })
  })
}

