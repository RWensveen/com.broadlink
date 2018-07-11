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

'use strict'

const Util = require('./util.js');

/*
	this is the device type list i got from e-control app.
	devtypes makes more sense when they are in decimal.
	-gn0st1c

A1					=	10004	// 0x2714
A1_SR1				=	10147	// 0x27A3

CAMERA				=	10017	// 0x2721

DEYE_HUMIDIFIER		=	   66	// 0x0042
DEYE_HUMIDIFIER_V2	=	20066	// 0x4E62

DOOYA_CURTAIN		=	   45	// 0x002D
DOOYA_CURTAIN_V2	=	20045	// 0x4E4D
DOOYA_CURTAIN_NEW	=	20290	// 0x4F42

HONYAR_MS3			=	10019	// 0x2723
HONYAR_MS4			=	20149	// 0x4EB5
HONYAR_NEW_MS4		=	20186	// 0x4EDA
HONYAR_SL_SCENE_A	=	10020	// 0x2724
HONYAR_SL_SCENE_B	=	10021	// 0x2725
HONYAR_SL_MAIN_D800	=	10022	// 0x2726
HONYAR_SL_MAIN_D480	=	10023	// 0x2727
HONYAR_SP2_10A		=	10009	// 0x2719
HONYAR_SP2_16A		=	10010	// 0x271A
HONYAR_SP2_10A_2	=	31001	// 0x7919
HONYAR_SP2_16A_2	=	31002	// 0x791A
HONYAR_SWITCH1		=	10011	// 0x271B
HONYAR_SWITCH2		=	10012	// 0x271C

LIGHTMATES_A		=	20073	// 0x4E69
M1					=	10015	// 0x271F
MAX_AP_TYPE			=	10100	// 0x2774
MAX_OEM_V2_TYPE		=	30000	// 0x7530
MFRESH_AIR			=	   76	// 0x004C
MFRESH_AIR_V2		=	20076	// 0x4E6C
MIN_AP_TYPE			=	10050	// 0x2742
MIN_OEM_V2_TYPE		=	20000	// 0x4E20
NEW_SWITCH1			=	20198	// 0x4EE6
NEW_SWITCH2			=	20206	// 0x4EEE
NEW_SWITCH3			=	20207	// 0x4EEF
PLC					=	10014	// 0x271E
PLCV2				=	10054	// 0x2746

RM1					=	10000	// 0x2710
RM2					=	10002	// 0x2712
RM2_HOME_PLUS		=	10115	// 0x2783
RM2_HOME_PLUS_GDT	=	10108	// 0x277C
RM2_PRO_PLUS		=	10026	// 0x272A
RM2_PRO_PLUS2		=	10119	// 0x2787
RM2_PRO_PLUS3		=	10141	// 0x279D
RM2_PRO_PLUS_300	=	10153	// 0x27A9
RM2_PRO_PLUS_BL		=	10123	// 0x278B
RM2_PRO_PLUS_HYC	=	10135	// 0x2797
RM2_PRO_PLUS_R1		=	10145	// 0x27A1
RM2_PRO_PP			=	10150	// 0x27A6
RM_315				=	  315	// 0x013B
RM_433				=	  433	// 0x01B1
RM_IR				=	   38	// 0x0026
RM_MINI				=	10039	// 0x2737
RM_MINI_R2			=	10146	// 0x27A2
RM_MINI_SHATE		=	10127	// 0x278F
RM_PRO_PHICOMM		=	10045	// 0x273D

S1					=	10018	// 0x2722
S1_PHICOMM			=	10044	// 0x273C
S2					=	10149	// 0x27A5
SMART_LIGHT			=	   15	// 0x000F

SP1					=	    0	// 0x0000

SP2					=	10001	// 0x2711
SP2_UK				=	30022	// 0x7546
SP3					=	30014	// 0x753E
SP3S_US				=	38009	// 0x9479
SP3S_EU				=	38010	// 0x947A

SP_MINI				=	10016	// 0x2720
SP_MINI_V2			=	10024	// 0x2728
SP_MINI2_CHINA_MOBILE=	30025	// 0x7549
SP_MINI2_OEM_MIN	=	30000	// 0x7530	- SP_MINI2_OEM_MAX	=	31000	// 0x7918
SP_MINI2_WIFI_BOX	=	30023	// 0x7547
SP_MINI_CC			=	10035	// 0x2733
SP_MINI_PHICOMM		=	10046	// 0x273E
SP_MINI_NEO			=	30006	// 0x7536
SP_MINI_HAIBEI		=	30009	// 0x7539
SP_MINI_KPL			=	30013	// 0x753D
SP_MINI_HYC			=	30030	// 0x754E
SP_MINI_PLUS		=	10038	// 0x2736
SP_MINI_PLUS2		=	38012	// 0x947C

TC3_1				=	65573	// 0x10025
TC3_2				=	65574	// 0x10026
TC3_3				=	65575	// 0x10027

TW2_1				=	20276	// 0x4F34
TW2_2				=	20277	// 0x4F35
TW2_3				=	20278	// 0x4F36
TW_ROUTER			=	10014	// 0x271E
V1					=	10000	// 0x2710

XIONG_MAI_CAMERA	=	66666	// 0x1046A
*/

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

	if (( devID >= 0x7530 ) && ( devID <= 0x7918 )) {
		info.type = BroadlinkType.SP2; info.name = 'SPMini2 (OEM)';
	} else {
		switch( devID ) {
			//SP1
			case 0x0000: info.type = BroadlinkType.SP1;		info.name = 'SP1';  break;

			// SP2
			case 0x2711: info.type = BroadlinkType.SP2;		info.name = 'SP2';  break;
			case 0x2719:
			case 0x7919:
			case 0x271a:
			case 0x791a: info.type = BroadlinkType.SP2;		info.name = 'Honeywell SP2';  break;
			case 0x2720: info.type = BroadlinkType.SP2;		info.name = 'SPMini';  break;
			case 0x753e: info.type = BroadlinkType.SP2;		info.name = 'SP3';  break;
			case 0x2728: info.type = BroadlinkType.SP2;		info.name = 'SPMini2';  break;
			case 0x2733:
			case 0x273e: info.type = BroadlinkType.SP2;		info.name = 'OEM branded SPMini';  break;
			case 0x2736: info.type = BroadlinkType.SP2;		info.name = 'SPMiniPlus';  break;
			case 0x7D00: info.type = BroadlinkType.SP2;		info.name = 'OEM branded SP3';  break;

			// SP3S
			case 0x947a:
			case 0x9479: info.type = BroadlinkType.SP3plus;	info.name = 'SP3S';  break;

			// RM3_mini + RM_pro
			case 0x2712: info.type = BroadlinkType.RM;		info.name = 'RM2';  break;
			case 0x2737: info.type = BroadlinkType.RM;		info.name = 'RM Mini';  break;
			case 0x273d: info.type = BroadlinkType.RM;		info.name = 'RM Pro Phicomm';  break;
			case 0x2783: info.type = BroadlinkType.RM;		info.name = 'RM2 Home Plus';  break;
			case 0x277c: info.type = BroadlinkType.RM;		info.name = 'RM2 Home Plus GDT';  break;
			case 0x278f: info.type = BroadlinkType.RM;		info.name = 'RM Mini Shate';  break;
			case 0x2797: info.type = BroadlinkType.RM;		info.name = 'RM2 Pro HYC';  break;

			// RM_plus
			case 0x272a: info.type = BroadlinkType.RMplus;	info.name = 'RM2 Pro Plus';  break;
			case 0x2787: info.type = BroadlinkType.RMplus;	info.name = 'RM2 Pro Plus2';  break;
			case 0x278b: info.type = BroadlinkType.RMplus;	info.name = 'RM2 Pro Plus BL';  break;
			case 0x279d: info.type = BroadlinkType.RMplus;	info.name = 'RM3 Pro Plus';  break;
			case 0x27a9: info.type = BroadlinkType.RMplus;	info.name = 'RM2 Pro Plus_300';  break;
			case 0x27a1: info.type = BroadlinkType.RMplus;	info.name = 'RM2 Pro Plus R1';  break;
			case 0x27a6: info.type = BroadlinkType.RMplus;	info.name = 'RM2 Pro PP';  break;

			// A1
			case 0x2714: info.type = BroadlinkType.A1;		info.name = 'A1';  break;

			// MP1
			case 0x4EB5: info.type = BroadlinkType.MP1;		info.name = 'MP1';  break;
			case 0x4EF7: info.type = BroadlinkType.MP1;		info.name = 'Honyar MP1';  break;

			// Hysen
			case 0x4EAD: info.type = BroadlinkType.HYSEN;	info.name = 'Hysen controller';  break;

			// S1C
			case 0x2722: info.type = BroadlinkType.S1C;		info.name = 'S1 (SmartOne Alarm Kit)';  break;

			// Dooya
			case 0x4E4D: info.type = BroadlinkType.DOOYA;	info.name = 'Dooya DT360E (DOOYA_CURTAIN_V2)';  break;

			default: info.type = BroadlinkType.UNKNOWN;		info.name = 'unknown';
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

	if ( foundInfo.type === expectedInfo.type ) { foundInfo.isCompatible = true; }

	//foundInfo.isCompatible = true; // TODO: DEBUG ONLY
	//Util.debugLog('getDeviceInfo: found = ' + founddevID + '  expected = ' + expecteddevID + '  isComp = ' + foundInfo.isCompatible)

	return foundInfo
}
