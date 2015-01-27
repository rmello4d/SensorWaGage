(function(SensorWaGage) {


    SensorWaGage.setWidth('400'); 

    SensorWaGage.setHeight('320');

	SensorWaGage.customizeProperty('value', { title:'value', display: true, sourceDisplay: false });
	SensorWaGage.customizeProperty('max', { title:'max', display: true, sourceDisplay: false });
	SensorWaGage.customizeProperty('min', { title:'min', display: true, sourceDisplay: false });

	SensorWaGage.customizeProperty('sensorName', { title:'sensor name', display: true, sourceDisplay: false });
	
	SensorWaGage.customizeProperty('deviceProperties', { title:'device.properties', display: false, sourceDisplay: true });
	
	SensorWaGage.customizeProperty('deviceStateFields', { title:'deviceState.fields', display: false, sourceDisplay: true });
	
});

// For more information, refer to http://doc.wakanda.org/Wakanda0.DevBranch/help/Title/en/page3870.html