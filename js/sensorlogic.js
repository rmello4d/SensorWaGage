var SensorLogic = SensorLogic || {};

SensorLogic.Parser = function(){

    //define patterns.
    var GripPatterns = {
        key : 'key',
        proxyName : 'proxyName',
        reportKey : 'reportKey',
        isActive : 'isActive',
        featureId : 'featureId',
        isVisible : 'isVisible',
        tabVisible : 'tabVisible',
        seperator : '.',
        grip : 'grip',
        nativeGrip : 'nativeGrip',
        True: 'true',
        False : 'false',
        name: 'name',
        type: 'type',

        //proxy names
        analogSensor: 'analogSensor',
        booleanSensor: 'booleanSensor'
    };

    //define models.
    var Service= function(data){
        this.key = data[GripPatterns.key];
        this.proxyName = data[GripPatterns.proxyName];
        this.reportKey = data[GripPatterns.reportKey];
        this.isActive = data[GripPatterns.isActive];
        this.featureId = data[GripPatterns.featureId];
        this.isVisible = data[GripPatterns.isVisible];
        this.nativeGrip = data[GripPatterns.nativeGrip];
    };

    var AnalogicDescriptor = function(data){
        Service.call(this, data);
        this.name = data[GripPatterns.name];
        this.type = data[GripPatterns.type];
        this.maxThresholdFieldKey = this.reportKey + GripPatterns.seperator + 'reportWhenMore';
        this.minThresholdFieldKey = this.reportKey + GripPatterns.seperator + 'reportWhenLess';
        this.reportingFrequencyFieldKey = this.reportKey + GripPatterns.seperator + 'reportingFrequency';
        this.maxThresholdSettingFieldKey = 'setting'+ GripPatterns.seperator  + this.reportKey + GripPatterns.seperator + 'reportWhenMore';
        this.minThresholdSettingFieldKey = 'setting'+ GripPatterns.seperator +this.reportKey + GripPatterns.seperator + 'reportWhenLess';
        this.reportingFrequencySettingFieldKey = 'setting'+ GripPatterns.seperator +this.reportKey + GripPatterns.seperator + 'reportingFrequency';
        if (!this.nativeGrip || this.nativeGrip === GripPatterns.True ) {
            this.currentValueFieldKey = this.reportKey + GripPatterns.seperator + 'measure' + GripPatterns.seperator + 'value';
        }else{
            this.currentValueFieldKey = this.reportKey;
        }
    };
    AnalogicDescriptor.prototype= Object.create(Service.prototype);


    var DescriptorFactory = (function() {

        var parse = function (properties, proxy){
            try{
                console.log('start building key map:');
                var map = toPropertyMap(properties),
                keyMap = parseRequiredProperties(map, proxy);
                parsePropertyByKeyvalue(properties, keyMap);
                console.log('key map:' + JSON.stringify(keyMap, null, 4));
                return keyMap;
            }catch(err){
                console.log(err);
                throw 'failed to build key map';
            }finally{
                console.log('end building key map:');
            }
        };

        var toPropertyMap = function (properties) {
            var map = {};
            for (var i in properties) {
                var obj = properties[i];
                if (!obj.name) {
                    continue;
                }
                map[obj.name] = obj.value;
            };
            return map;
        };

        var parseRequiredProperties = function (map, proxy) {
            var keyMap = {};
            var pattern = /(.+)(\.)(isActive)/g;
            for (var name in map) {
                var result = name.match(pattern);
                if (result) {
                    var propertyName = result[0],
                        prefix = propertyName.substring(0, propertyName.indexOf(GripPatterns.seperator + GripPatterns.isActive)),
                        key = map[prefix + GripPatterns.seperator + GripPatterns.key ],
                        proxyValue = getProxyLastName( map[prefix + GripPatterns.seperator + GripPatterns.proxyName ] ),
                        keyCollection = {};
                    if (proxyValue!==proxy) {
                        continue;
                    }
                    if (key) {
                        keyCollection[GripPatterns.featureId] = propertyName.substring(propertyName.indexOf(GripPatterns.grip + GripPatterns.seperator) + 5, propertyName.length);
                        keyCollection[GripPatterns.isActive] = map[prefix + GripPatterns.seperator + GripPatterns.isActive];
                        keyCollection[GripPatterns.isVisible] = map[prefix + GripPatterns.seperator + GripPatterns.tabVisible];
                        keyCollection[GripPatterns.proxyName] = map[prefix + GripPatterns.seperator + GripPatterns.proxyName];
                        keyCollection[GripPatterns.reportKey] = map[prefix + GripPatterns.seperator + GripPatterns.reportKey];
                        keyMap[key] = keyCollection;
                    }
                }
            }
            return keyMap;
        };

        var getProxyLastName = function (proxyPackageName){
                var proxyName = '',
                pattern = /_\d.*/g;
                try {
                    console.log('start get proxy last name from: ' + proxyPackageName);
                    var proxyNameStrArr = proxyPackageName.split ('.'),
                    result = proxyNameStrArr[proxyNameStrArr.length - 1].match(pattern);
                    if (result) {
                        proxyName = proxyNameStrArr[proxyNameStrArr.length - 2];
                    } else {
                        proxyName = proxyNameStrArr[proxyNameStrArr.length - 1];
                    }
                    return proxyName;
                } catch (err) {
                    console.log ("ERROR Proxy name parsing error:"+ err);
                    throw 'failed to get proxy last name';
                } finally{
                    console.log('end get proxy last name: ' + proxyName);
                }
        };

        var parsePropertyByKeyvalue = function (properties, keyMap){
            var NONNATIVE_GRIP_PATTERN = /(grip)(.*)(\.)(isNonNative)/g,
            TRUE_PATTERN = /true/ig;
            for(var keyvalue in keyMap){
                var keyCollection = keyMap[keyvalue];
                keyCollection[GripPatterns.key] = keyvalue;
                for(var i in properties ){
                    var property = properties[i];
                    //work around issue Native grip device.
                    if( property.name.match(NONNATIVE_GRIP_PATTERN)){
                        if( property.value && property.value.match(TRUE_PATTERN)){
                            keyCollection[GripPatterns.nativeGrip] = GripPatterns.False;
                        }else{
                            keyCollection[GripPatterns.nativeGrip] = GripPatterns.True;
                        }
                    }else{
                            keyCollection[GripPatterns.nativeGrip] =  GripPatterns.True;
                    }
                    if( property.name.indexOf( keyvalue+ GripPatterns.seperator )!==-1){
                        var name = property.name.replace(keyvalue+GripPatterns.seperator,'');
                        if(!keyCollection[name]){
                            keyCollection[name] = property.value;
                        }
                    }
                }
            }
        };

        /**
        * return an array of analogic descriptors
        */
       var createAnalogicDescriptors = function (properties) {
            try{
                console.log('start create analogic descriptor:');
                var keyMap = parse( properties, GripPatterns.analogSensor );
                if (typeof(keyMap) === 'object') {
                    var analogiclist = [];
                    for(var keyvalue in keyMap){
                        var analogic = new AnalogicDescriptor( keyMap[keyvalue] );
                        analogiclist.push( analogic );
                    }
                    console.log('analogic descriptor list:' + JSON.stringify(analogiclist,null,4));
                    return analogiclist;
                }else{
                    throw 'type error: data should be an object.';
                }
            }catch(err){
                console.log(err);
                throw 'failed to create analogic descriptor!';
            }finally{
                console.log('end create analogic descriptor:');
            }
        };

        var createDescriptors = function(proxy, properties) {
            console.log('start create descriptors:');
            var descriptors;
            switch (proxy) {
            case GripPatterns.analogSensor:
                descriptors = createAnalogicDescriptors(properties);
                break;
            case GripPatterns.booleanSensor:
                // descriptors = createBooleanDescriptor(properties);
                break;
            }
            console.log('end create descriptors:' + JSON.stringify(descriptors,null,4));
            return descriptors;
        };

        return {
            createDescriptors: createDescriptors
        };
    }());



    //device state module
    var StateUtils = (function() {

        var _map = {};

        var _toStateMap = function(stateFields) {
                if ( stateFields instanceof Array ) {
                    var map = {};
                    for (var i in stateFields) {
                        var field = stateFields[i];
                        map[field.name] = field;
                    }
                    return map;
                }
                else {
                    throw 'type error: stateFields should be an Array.';
                }
            };

        return {

            updateStateFields: function(fields) {
                try{
//                    console.log('start building map from state fields:' + JSON.stringify(fields,null,4));
                    _map = _toStateMap(fields);
                }catch(err){
                    console.log('error: failed to build map from state fields:' + err );

                }finally{
//                    console.log('end building map from state fields:' + JSON.stringify(_map, null, 4));
                }

            },

            parseStateField: function(name) {
                try{
                    console.log('start parsing field ' + name);
                    if(_map[name]){
                        console.log('get parsing field ' + (+_map[name].value) + ' from ' + JSON.stringify(_map[name], null, 4) );
                        return +(_map[name].value);
                    }else{
                        console.log('get parsing field ' + 0);
                        return 0;
                    }
                }catch(err){
                    console.log('error: failed parsing field ' + name + ';' + err);
                }finally{
                    console.log('end parsing field ' + name);
                }
            },

            getLatestUpdatedField: function(fieldName, settingFieldName) {
                try{
                    console.log('start to get latest updated from: ' + fieldName + ',' + settingFieldName);


                        var field = _map[fieldName], settingField = _map[settingFieldName];

                        if(field && settingField){
                            var format = 'yyyyMMddHHmmss',
                                result = compareDates(field.updated, format, settingField.updated, format);

                            if (result === 1) {
                                console.log( 'get latest updated:' + field.value );
                                return +( field.value );
                            }else {
                                console.log( 'get latest updated:' + settingField.value );
                                return +( settingField.value );
                            }
                        }else if(field){
                            console.log( 'get latest updated:' + field.value );
                            return +( field.value );
                        }else if(settingField){
                            console.log( 'get latest updated:' + settingField.value );
                            return +( settingField.value );
                        }else{
                            throw 'mapping error: not found';

                        }
                }catch(err){
                        console.log(err);
                }finally{
                    console.log('end to get latest updated from: ' + fieldName + ',' + settingFieldName);
                }
            }
        };
    }());



    return {
        createDescriptors: DescriptorFactory.createDescriptors,
        updateStateFields: StateUtils.updateStateFields,
        getLatestUpdatedField: StateUtils.getLatestUpdatedField,
        parseStateField: StateUtils.parseStateField,
        GripPatterns:GripPatterns
    };

}();

