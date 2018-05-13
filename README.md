# Homey

Use [Homey](https://www.athom.com/) together with [Broadlink devices](http://www.ibroadlink.com/).


# Supported devices

[RM3 mini](http://www.ibroadlink.com/rmMini3/)
Others will follow...


# Reference

This app is based on the hard work of other people.

See:
- https://github.com/mjg59/python-broadlink
- https://github.com/davorf/BlackBeanControl


# NodeJS modules

requires the following NodeJS modules
- dgram
- cryptjs


# To Do

quite a lot of things
- add supported devices (see /lib/DeviceInfo for list)
- get valid icons 
   + currently, a default 'lamp' is used.
- find a way to manage commands on RM3
   + enter RM3 in learn mode, retrieve data, store data
   + excute commands learned
   + delete commands learned
  The functions to learn/retrieve/execute already work
  (see /driver/RM3_mini/driver.js). There just is no way for
  Homey to use those functions.


