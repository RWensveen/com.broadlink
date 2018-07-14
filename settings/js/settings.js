
/* global $, __ */
var HomeyObj;

function onHomeyReady (Homey) {
  HomeyObj = Homey;
  
  $('#debuglog').change(function () { saveDebugSettings() })
  $('#compatmode').change(function () { saveDebugSettings() })

  HomeyObj.get('DebugSettings', function (error, currentSettings) {
    if (error)  return console.log(error)
    
    $('#compatmode').prop('checked', currentSettings['compat'] || false )
    $('#debuglog').prop('checked', currentSettings['logging'] || false )
  })
  
  HomeyObj.ready()
}

function saveDebugSettings () {
	  var currentSettings = {
			  'compat'  : $('#compatmode').prop('checked'),
			  'logging' : $('#debuglog').prop('checked')
	  }
	  HomeyObj.set('DebugSettings', currentSettings )
	}

