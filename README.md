# com.broadlink - Broadlink support for Homey

Adds support for [Broadlink devices](http://www.ibroadlink.com/) to [Homey](https://www.athom.com/)

## Installation
Use Homey App Store<br>
[https://apps.athom.com/app/com.broadlink](https://apps.athom.com/app/com.broadlink)

## Supported devices

|Device Name|Description|Support|
|---|---|---|
|[A1](http://www.ibroadlink.com/a1/)|Environment Sensor|supported|
|[RM3 mini](http://www.ibroadlink.com/rmMini3/)|wifi to IR (infrared) device|supported|
|[RM Pro](http://www.ibroadlink.com/rmPro)|IR|supported|
|[RM Pro Plus](http://www.ibroadlink.com/rmPro+)|IR + RF|supported|
||||
|SP1|power socket switch|supported|
|SP2|power socket switch with nightlight and meter|supported|
|SP3S|power socket switch with meter|supported|
|MP1|4 way power strip|supported|

## Reference
This app is based on the hard work of other people

* [https://github.com/mjg59/python-broadlink](https://github.com/mjg59/python-broadlink)
* [https://github.com/davorf/BlackBeanControl](https://github.com/davorf/BlackBeanControl)
* [https://github.com/frankjoke/ioBroker.broadlink2](https://github.com/frankjoke/ioBroker.broadlink2)

## NodeJS modules
requires the following NodeJS modules

* dgram
* cryptojs

## TO DO
still some things to do

* add more devices (see com.broadlink/lib/DeviceInfo for list)
