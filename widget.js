WAF.define('SensorWaGage', ['waf-core/widget'], function(widget) {

    var WaGage = widget.create('SensorWaGage', {
        init: function() {
        	
            var self = this;	        
            this.node.innerHTML = '';
            
			console.info('INIT LOAD WIDGET WaGage', this.node.id);
            
            var waGage = new JustGage({
                id: this.id,
                value: 0,
                min: 0,
                max: 100,
                title: this.sensorName(),
                showMinMax: true,
                label : "%",
                levelColorsGradient: true  
            });
            
            this.value.onChange(function() {
                var newValue = this.value();
                var myMin = this.min();
                var myMax = this.max();
                var calculatedValue = 0;
                if (newValue >= myMin && newValue <= myMax) {
                    newValue -= myMin;
                    calculatedValue = Math.round(100 * newValue / (myMax - myMin));
                    waGage.refresh(calculatedValue);
                }
            });
            
            this.min.onChange(function() {
                var min = waGage.txtMin[0];
                if((this.min() + "") == "" )
                	min.textContent = 0;
                else
                	min.textContent = this.min();
                var newValue = this.value();
                var myMin = this.min();
                var myMax = this.max();
                var calculatedValue = 0;
                if (newValue >= myMin && newValue <= myMax) {
                    newValue -= myMin;
                    calculatedValue = Math.round(100 * newValue / (myMax - myMin));
                    waGage.refresh(calculatedValue);
                }
            });

            this.max.onChange(function() {
                var max = waGage.txtMax[0];
                if((this.max() + "") == "" )
                	max.textContent = 100;
                else
                	max.textContent = this.max();
                var newValue = this.value();
                var myMin = this.min();
                var myMax = this.max();
                var calculatedValue = 0;
                if (newValue >= myMin && newValue <= myMax) {
                    newValue -= myMin;
                    calculatedValue = Math.round(100 * newValue / (myMax - myMin));
                    waGage.refresh(calculatedValue);
                }
            });

            this.sensorName.onChange(function() {
                var title = waGage.txtTitle[0];
                title.textContent = this.sensorName();
            });
            
            this.deviceProperties.onChange(function(value){
				self.updateData(waGage);
            });
            this.deviceStateFields.onChange(function(value){            	
            	self.updateData(waGage);
            });
            
            if(sources.device && sources.sensorstate){
            	this.deviceProperties.bindDatasource('device.properties');
            	this.deviceStateFields.bindDatasource('sensorstate.fields');
            }
            
            var $node = $(this.node);
            
            if (!window.Designer) {
                $node.on('click', function(event) {
                    var myMin = this.min();
                    var myMax = this.max();
                    
                    var x = event.offsetX === undefined ? event.originalEvent.layerX : event.offsetX;
                    var y = event.offsetY === undefined ? event.originalEvent.layerY : event.offsetY;
                    
                    if (y >= 95 && y <= 255) {
                        var r1 = 100;
                        var r2 = 160;
                        var cos1 = (x - r2 - 40) / r1;
                        var cos2 = (x - r2 - 40) / r2;
                        if (cos1 < 0) cos1 *= -1;
                        if (cos2 < 0) cos2 *= -1;
                        var y1;
                        if (cos1 >= 1) y1 = 0;
                        else y1 = r1 * (Math.sqrt(1 - Math.pow(cos1, 2)));
                        var y2;
                        if (cos2 >= 1) y2 = 0;
                        else y2 = r2 * (Math.sqrt(1 - Math.pow(cos2, 2)));
                        if (255 - y >= y1 && 255 - y <= y2) {
                            var r = Math.sqrt(Math.pow(x - 40 - r2, 2) + Math.pow(255 - y, 2));
                            var angle = Math.atan((255 - y) / (x - 40 - r2));
                            var ratio = 100 * (angle) / (1.565 * 2);
                            if (ratio < 0) ratio *= -1;
                            if (x >= r2 + 40) ratio = 100 - ratio;
                            //var ratio = (event.offsetX) / $node.width() * 100;
                            ratio = myMin + ratio * (myMax - myMin) / 100;
                            this.value(Math.round(ratio));
                           // waGage.txtValue[0].textContent += " %";
                            
                        }
                    }
                }.bind(this));
            }
            
        },
		updateDescriptor : function() {
	        //creating analogic descriptor.		
	        var analogicDescriptors = SensorLogic.Parser.createDescriptors(SensorLogic.Parser.GripPatterns.analogSensor, JSON.parse(this.deviceProperties()));
	        for (var i in analogicDescriptors) {
	            var descriptor = analogicDescriptors[i];
	            // filter the specific analogic sensor by name.
	            if (descriptor.name === this.sensorName()) {
	                return descriptor;
	            }
	        }
	        return {};
	    },
	    updateData: function(waGage) {
	        try {
	            var descriptor = this.updateDescriptor();
	            SensorLogic.Parser.updateStateFields(JSON.parse(this.deviceStateFields()));
	            var maxField = descriptor.maxThresholdFieldKey,
	                maxSettingField = descriptor.maxThresholdSettingFieldKey,
	                minField = descriptor.minThresholdFieldKey,
	                minSettingField = descriptor.minThresholdSettingFieldKey;
	            this.max ( SensorLogic.Parser.getLatestUpdatedField(maxField, maxSettingField) || 100 );
	            this.min ( SensorLogic.Parser.getLatestUpdatedField(minField, minSettingField) || 0 );
	            this.value ( Number(SensorLogic.Parser.parseStateField(descriptor.currentValueFieldKey)) || 0 );
	            
	            var min = waGage.txtMin[0];
                if((this.min() + "") == "" ){
                	min.textContent = 0;
                } else{
                	min.textContent = this.min();
                }
	            var max = waGage.txtMax[0];
                if((this.max() + "") == "" ){
                	max.textContent = 100;
            	}else{
                	max.textContent = this.max();
                }
                var newValue = this.value();
                var myMin = this.min();
                var myMax = this.max();
                var calculatedValue = 0;
                if (newValue >= myMin && newValue <= myMax) {
                    newValue -= myMin;
                    calculatedValue = Math.round(100 * newValue / (myMax - myMin));
                    waGage.refresh(calculatedValue);
                }
	        }
	        catch (err) {
	            console.log('failed to update data' + err);
	        }
	    },

        /* Create a property */
        
		value: widget.property({
            type: 'number',
            defaultValue: 0,
            bindable: false
        }),
        min: widget.property({
            type: 'number',
            defaultValue: 0,
            bindable: false
        }),
        max: widget.property({
            type: 'number',
            defaultValue: 100,
            bindable: false
        }),
      
        sensorName: widget.property({
            type: 'string',
            defaultValue: "Battery"
        }),
        
        deviceProperties: widget.property({
            type: 'string',
            defaultValue: "[]"
        }),
        
        deviceStateFields: widget.property({
            type: 'string',
            defaultValue: "[]"
        })

    });

    return WaGage;

});
