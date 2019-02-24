# Homey

Use [Homey](https://www.athom.com/) together with [Broadlink devices](http://www.ibroadlink.com/).


# Supported devices

* [A1](http://www.ibroadlink.com/a1/) - Environment Sensor
* [RM3 mini](http://www.ibroadlink.com/rmMini3/)
  The RM3 Mini is a wifi to IR (infrared) device. It can learn IR commands and transmit them.
* [RM Pro](http://www.ibroadlink.com/rmPro)  - IR
* [RM Pro Plus](http://www.ibroadlink.com/rmPro+)   - IR + RF

* SP1  - power socket switch
* SP2  - power socket switch with nightlight and meter
* SP3S - power socket switch with meter
* MP1 - 4 way power socket switch

See compatibility list further on.

# Soon to be supported devices

* HYSEN - Thermostats by Hysen

# Device configuration

The devices need to be configured before they can be paired with Homey.
Configuration is done using the eControl app from Broadlink. See the Broadlink website for more
information on this: [www.ibroadlink.com](http://www.ibroadlink.com/).

# Pairing

You can pair a Broadlink device the same way other devices are added to Homey.
You will need the IP address of your device in order to pair it. This can usually be retrieved from
your WiFi router.
If your device is not directly listed as Broadlink device in the initial pairing window, check the
compatiblity list below.

# Usage

Once a RM3-Mini,RM-Pro or RM-ProPlus is paired, it can start learning commands.
This is done by pressing the 'learn' button (for IR or RF) in the mobile card of the paired device.
On the device, a LED will turn on indicating it is in learning mode, and you can press a button on
a IR/RF Remote control.
The command will be added to the device settings in Homey. In the device settings menu, you can
give the command a more logical name, or delete it by clearing its name.
Currently 20 to 30 commands are supported in the settings page of each device.
It is not possible at this moment to change the order of the commands in the settings page.


# Learning RF commands with RM Pro Plus

Once the RM-Pro-plus device is installed in Homey, it can learn RF commands.
Note that the RF must operate on 433 MHz, as this is the only band the RM-Pro-plus can understand.
Check your RF remote/device if this is the case.

Homey will talk you through the learing process, so be somewhere close to it.
As learing can be rather tricky, it is highly advisable to have the RF-device you want to control
available also.

**Learning Sequence**

Learning is done as follows:
  
1.  make sure the volume of the speaker in Homey is set to a clearly audible level.
    => open the app
    -> more
    -> Settings
    -> Sound
    -> Volume  (set to a level)

2. Open the device page
    => open the app
    -> Devices
    -> RM Pro Plus (or the name you gave it)

3. Get hold of your RF-remote
4. Press the 'Learn RF button'
5. Homey will tell you to continuously press the button on your remote.
   So, press the button, and keep it pressed.
6. Homey will then tell you to press the button repeatedly.
   So, press the button, release it, press it, release it (but not too fast).

   As it is important that the RM-Pro-plus understands the button presses, 
   it is best you verify you are pressing the button at the correct speed.
   You can do this as follows:
    - switch on the device you want to control with your RF-remote
    - press the button on the RF-remote, and observe your device responding to it.
    - release the button.
    - keep on repeating the press/release steps.
    - your device should respond to each button press.
    
7. Homey will tell you to stop pressing the button.
   The RM-Pro-plus now has learned the command.
   
You can now repeat the learning process for another button, or you can give 
the command just learned a meaningfull name

8. Give the command a meaningfull name
   -> Settings (the icon top-right on your screen)
   -> Advanced Settings

   a.  Rename the command (tap on the name, edit it, save it)
   b.  Remove the command (tap on the name, clear the name, save it)


** Using learned commands**

Both InfraRed and RF commands can now be used in an identical way.
All commands the RM-Pro-plus has learned, are available only in flows.
When creating a flow, you can use the command (or any command) as a trigger 
to start the flow.
In the 'then' part, you can select your RM-Pro-plus device, and select the 
command from the list of available commands.

If you like to use a button to send a command, you can create a Virtual Device, 
which will trigger a flow (as described above).

   
# Compatibility

A large number of devices are compatible with eachother.
Also, broadlink devices are sold as OEM products, with a different name.

If you have a device which should be supported, but is not recognized by this Broadlink app,
you can set the '**Compatibility Mode**' in the App settings.
Once set, a discovered device will be added as the type you are trying to install.
This will work if you install the correct device. If you install a wrong device (e.g trying
to install a SP1 switch, but the device is a RM3 Mini), your device will not work. 

The following table lists which devices are already added as compatible to the app:

<table border=1>
<tr><th> Supported Device  </th><th> Compatible Device               </th></tr>
<tr><td> SP1               </td><td> SP1                             </td></tr>

<tr><td> SP2               </td><td> SP2                             <br>
                                     SP3                             <br>
                                     SP Mini                         <br>
                                     SP Mini 2                       <br>
                                     SP Mini Plus                    <br>
                                     Honeywell SP2                   <br>
                                     SP Mini [OEM]                   <br>
                                     SP3 [OEM]                       </td></tr>

<tr><td> SP3 Plus          </td><td> SP3 Plus                        </td></tr>

<tr><td> RM2               </td><td> RM2                             <br>
                                     RM Mini                         <br>
                                     RM3 Mini                        <br>
                                     RM Pro Phicomm                  <br>
                                     RM2 Home Plus                   <br>
                                     RM2 Home Plus GDT               <br>
                                     RM Mini Shate                   <br>
                                     RM2 Pro HYC                     </td></tr>

<tr><td>RM Plus            </td><td> RM Plus                         <br>
                                     RM2 Pro Plus                    <br>
                                     RM2 Pro Plus2                   <br>
                                     RM2 Pro Plus BL                 <br>
                                     RM3 Pro Plus                    <br>
                                     RM2 Pro Plus 300                <br>
                                     RM2 Pro Plus R1                 <br>
                                     RM2 Pro PP                      </td></tr>

<tr><td>A1                 </td><td> A1                              </td></tr>

<tr><td>MP1                </td><td> MP1                             <br>
                                     Hontar MP1                      </td></tr>

<tr><td colspan = 2><i>Future enhancements</i></td></tr>

<tr><td>HYSEN              </td><td> Hysen                           </td></tr>

<tr><td>S1C                </td><td> S1C (SmartOne Alarm Kit)        </td></tr>

<tr><td>DOOYA              </td><td> Dooya DT360E (DOOYA curtain v2) </td></tr>
</table>
