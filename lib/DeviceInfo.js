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

'use strict'

const Util = require('./util.js');
const Homey = require('homey');

var BroadlinkType = { 'UNKNOWN' : 0,
                      'SP1'     : 1,
                      'SP2'     : 2,
                      'SP3plus' : 3,
                      'RM'      : 4,
                      'RMplus'  : 5,
                      'A1'      : 6,
                      'MP1'     : 7,
                      'HYSEN'   : 8,
                      'S1C'     : 9,
                      'DOOYA'   : 10 }


var devType2Info = function( devID ) {

	var info = { deviceId: devID,
			type: '',
			isCompatible: false,
			name: ''
		};


	if(( devID >= 0x7530 ) && ( devID <= 0x7918 )) {
		info.type = BroadlinkType.SP2; info.name = 'SPMini2 (OEM)';
	}
	else {
		switch( devID )
		{
		//SP1
		case 0x0000: info.type = BroadlinkType.SP1;      info.name = 'SP1';  break;

		// SP2
		case 0x2711: info.type = BroadlinkType.SP2;      info.name = 'SP2';  break;
		case 0x2719:
		case 0x7919:
		case 0x271a:
		case 0x791a: info.type = BroadlinkType.SP2;      info.name = 'Honeywell SP2';  break;
		case 0x2720: info.type = BroadlinkType.SP2;      info.name = 'SPMini';  break;
		case 0x753e: info.type = BroadlinkType.SP2;      info.name = 'SP3';  break;
		case 0x2728: info.type = BroadlinkType.SP2;      info.name = 'SPMini2';  break;
		case 0x2733:
		case 0x273e: info.type = BroadlinkType.SP2;      info.name = 'OEM branded SPMini';  break;
		case 0x2736: info.type = BroadlinkType.SP2;      info.name = 'SPMiniPlus';  break;
		case 0x7D00: info.type = BroadlinkType.SP2;      info.name = 'OEM branded SP3';  break;

		// SP3S
		case 0x947a:
		case 0x9479: info.type = BroadlinkType.SP3plus;  info.name = 'SP3S';  break;

		// RM3_mini + RM_pro
		case 0x2712: info.type = BroadlinkType.RM;       info.name = 'RM2';  break;
		case 0x2737: info.type = BroadlinkType.RM;       info.name = 'RM Mini';  break;
		case 0x273d: info.type = BroadlinkType.RM;       info.name = 'RM Pro Phicomm';  break;
		case 0x2783: info.type = BroadlinkType.RM;       info.name = 'RM2 Home Plus';  break;
		case 0x277c: info.type = BroadlinkType.RM;       info.name = 'RM2 Home Plus GDT';  break;
		case 0x278f: info.type = BroadlinkType.RM;       info.name = 'RM Mini Shate';  break;
		case 0x2797: info.type = BroadlinkType.RM;       info.name = 'RM2 Pro HYC';  break;

		// RM_plus
		case 0x272a: info.type = BroadlinkType.RMplus;   info.name = 'RM2 Pro Plus';  break;
		case 0x2787: info.type = BroadlinkType.RMplus;   info.name = 'RM2 Pro Plus2';  break;
		case 0x278b: info.type = BroadlinkType.RMplus;   info.name = 'RM2 Pro Plus BL';  break;
		case 0x279d: info.type = BroadlinkType.RMplus;   info.name = 'RM3 Pro Plus';  break;
		case 0x27a9: info.type = BroadlinkType.RMplus;   info.name = 'RM2 Pro Plus_300';  break;
		case 0x27a1: info.type = BroadlinkType.RMplus;   info.name = 'RM2 Pro Plus R1';  break;
		case 0x27a6: info.type = BroadlinkType.RMplus;   info.name = 'RM2 Pro PP';  break;

		// A1
		case 0x2714: info.type = BroadlinkType.A1;       info.name = 'A1';  break;

		// MP1
		case 0x4EB5: info.type = BroadlinkType.MP1;      info.name = 'MP1';  break;
		case 0x4EF7: info.type = BroadlinkType.MP1;      info.name = 'Hontar MP1';  break;

		case 0x4EAD: info.type = BroadlinkType.HYSEN;    info.name = 'Hysen controller';  break;

		case 0x2722: info.type = BroadlinkType.S1C;      info.name = 'S1 (SmartOne Alarm Kit)';  break;

		case 0x4E4D: info.type = BroadlinkType.DOOYA;    info.name = 'Dooya DT360E (DOOYA_CURTAIN_V2)';  break;

		default: info.type = BroadlinkType.UNKNOWN; info.name = 'unknown';
		}
	}
	return info;
}


/**
 *
 */
exports.getDeviceInfo = function( founddevID, expecteddevID ) {

	var foundInfo = devType2Info( founddevID );
	var expectedInfo = devType2Info( expecteddevID );

	if( foundInfo.type == expectedInfo.type ) { foundInfo.isCompatible = true; }

	let s = Homey.ManagerSettings.get('DebugSettings');
	if(( s ) && ( s['compat']) ) {
		foundInfo.isCompatible = true;
	}
	//Util.debugLog('getDeviceInfo: found = 0x' + founddevID.toString(16) + '  expected = 0x' + expecteddevID.toString(16) + '  isComp = ' + foundInfo.isCompatible)

	return foundInfo
}


