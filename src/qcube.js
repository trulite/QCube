var QC = {};

QC.Star = '*';
QC.All = '___all';
QC.QueryTypes = {point:"point",range:"range"};

// Function to merge all of the properties from one object into another
QC.mergeObjects = function (a, b) {
	var prop; 
	for (prop in a) {
		if (a.hasOwnProperty(prop)) {
			if (b.hasOwnProperty(prop)) {
				continue;			
			}
			b[prop] = a[prop];
		}
	}
	return b;
};

QC.subtract = function(arrOne,arrOther) {
	if(!(arrOther instanceof Array)){
		return [];
	}
	var j, i, difference = [], arrOtherFound = [];
	for(i = 0; i < arrOne.length; i++) {
		for(j = 0; j < arrOther.length; j++) {
			if(arrOtherFound[j] !== true && arrOther[j] === arrOne[i]) {
				arrOtherFound[j] = true;
				break;
			}
		}
		if(j === arrOther.length){
			difference.push(arrOne[i]);
		}
	}
	return difference;
};

QC.intersectArrays = function(arrOne, arrOther) {
	if(!(arrOther instanceof Array)){
		return [];
	}
	return QC.subtract(arrOne,QC.subtract(arrOne,arrOther));
};

QC.arrayContains = function(src,target) {
    var i = src.length;
    while (i--) {
        if (src[i] === target) {
            return true;
        }
    }
    return false;
};

QC.isArray = function(obj) {
	return Object.prototype.toString.call(obj) === "[object Array]";
};

QC.objectKeys = function(obj) {
	var keys = [], key;
	for(key in obj){
		if(obj.hasOwnProperty(key)){
			keys.push(key);
		}
	}
	return keys;
};


QC.cloneObject = function (obj) {
    var clone = {},i;
    for(i in obj) {
		if (obj.hasOwnProperty(i)) {
			if(typeof(obj[i]) === "object"){
				clone[i] = QC.clone (obj[i]);
			}
			else{
				clone[i] = obj[i];
			}
		}
    }
    return clone;
};

QC.compactArray = function(arr) {
	var i;
    for (i = arr.length; i >= 0; i--) {
        if (!arr[i])  {
            arr.splice(i, 1);
        }       
    }
    return arr;
};

QC.cloneArray = function (obj) {
	return obj.slice(0);
};

QC.arrayToString = function(arr){
	var i, row, str = '';
	for(i = 0; i < arr.length; i++){
		row = arr[i];
		str = str + row;
	}
	return str;
};

QC.uniqArray = function(array) {
	var arr, j, i, jLen, iLen;
	for(arr = array.slice(0), i = 0, jLen = arr.length, iLen = jLen - 1; i < iLen; i++){
		for(j = i + 1; j < jLen; j++){
			if(arr[i] === arr[j]) {
				arr.splice(j--, 1);
				jLen = iLen--;
			}
		}
	}
	return arr;
};

QC.arrayForEach = function(fn, arr, objThis) {
	var l = arr.length, i;
	if(typeof fn !== "function"){
		throw new TypeError();
	}
	for(i = 0; i < l; i++) {
		if(arr[i]){
			fn.call(objThis, arr[i], i, arr);
		}
	}
};


QC.Table = function (columnNames, data, isArrayOfArrays) {
	this.columnNames = columnNames;
	this._data = data;
	this._isAA = isArrayOfArrays || true;
};

QC.Table.prototype.dataValue = function (rowIndex, columnName) {
	if(this._isAA){
		var colIndex = this.columnNames.indexOf(columnName);
		return this._data[rowIndex][colIndex];
	}else{
		return this._data[rowIndex][columnName];
	}
};

QC.Table.prototype.dataValueByRowAndColIndex = function (rowIndex, colIndex) {
	if(this._isAA){
		return this._data[rowIndex][colIndex];
	}else{
		return this._data[rowIndex][this.columnNames[colIndex]];
	}

};

QC.Table.prototype.row = function (rowIndex) {
	return this._data[rowIndex];
};

QC.Table.prototype.getLength = function () {
	return this._data.length;
};

QC.OrderedHash = function () {
    this.data = {};
    this.order_keys = [];
};

QC.OrderedHash.prototype._binarySearch = function (a, value, low, high) {
	var mid = parseInt(low + (high - low) / 2, 10);
	if (high < low) {
		return -1; // not found
	}
	if (a[mid] > value) {
		return this._binarySearch(a, value, low, mid-1);
	}else if (a[mid] < value) {
		return this._binarySearch(a, value, mid+1, high);
	}else {
		return mid; // found
	}
};
     
QC.OrderedHash.prototype.del = function(key) {
    delete this.data[key];
    var index = this._binarySearch(this.order_keys, key, 0, this.order_keys.length);
    if (index > -1) {
		this.order_keys.splice(index,1);       
    }
};

QC.OrderedHash.prototype.set = function(key, value) {
    this.data[key] = value;
    this.order_keys.push(key);
};

QC.OrderedHash.prototype.get = function(key) {
    return this.data[key];
};

QC.OrderedHash.prototype.foreach = function(callback) {
    var len = this.order_keys.length,i;
    for (i = 0; i < len; i++) {
        if (callback(this.order_keys[i], this.data[this.order_keys[i]]) === false){
			break;
        } 
    }
};

////NodeManager//////////////////////////////////
QC.NodeManager = function(cubeTable){
	this._cubeTable = cubeTable;
	this._cubeTable._lastId = 0;
	this._cubeTable.root = null;
};

QC.NodeManager.prototype.table = function () {
	return this._cubeTable;
};

QC.NodeManager.prototype._create = function(){
	this._cubeTable._lastId +=1;
	return this._cubeTable._lastId;
};

QC.NodeManager.prototype.createRoot = function(){
	var rootId;
	if(!this._cubeTable.root){
		rootId = this._create();
		this._cubeTable.root = rootId;
	}
	return rootId;
};

QC.NodeManager.prototype.root = function(nodeId){
	return this._cubeTable.root;
};


QC.NodeManager.prototype.dimensions = function(nodeId){
	var dims = this._cubeTable[nodeId+":dimensions"];
	if(!dims){
		this._cubeTable[nodeId+":dimensions"] = [];
	}
	return this._cubeTable[nodeId+":dimensions"];
};

QC.NodeManager.prototype.dimension = function(nodeId,name){
	var dimensions = this.dimensions(nodeId);
	if(QC.arrayContains(dimensions,name)){
		return name;
	}
	return null;
};

QC.NodeManager.prototype.addDimension = function(nodeId,name){
	var dimensions = this.dimensions(nodeId);
	if(QC.arrayContains(dimensions,name)){
		return name;
	}else{
		dimensions.push(name);
		return name;
	}
};

QC.NodeManager.prototype.children = function(nodeId,dimension){
	var children = this._cubeTable[nodeId+":["+dimension+"]"];
	if(!children){
		this._cubeTable[nodeId+":["+dimension+"]"] = [];
	}
	return this._cubeTable[nodeId+":["+dimension+"]"];
};

QC.NodeManager.prototype.child = function(nodeId,dimension,name){
	return this._cubeTable[nodeId+":["+dimension+"]"+":"+name];
};

QC.NodeManager.prototype.addChild = function(nodeId,dimension,name,id){
	var children = this.children(nodeId,dimension);
	var childId;
	if(QC.arrayContains(children,name)){
		return this.child(nodeId, dimension, name);
	}else{
		childId = id ||	this._create();
		children.push(name);
		this._cubeTable[nodeId+":["+dimension+"]"+":"+name] = childId;
		return childId;
	}
};

QC.NodeManager.prototype.measures = function(nodeId){
	var measures = this._cubeTable[nodeId+":measures"];
	if(!measures){
		this._cubeTable[nodeId+":measures"] = [];
	}
	return this._cubeTable[nodeId+":measures"];
};

QC.NodeManager.prototype.measure = function(nodeId,name){
	return this._cubeTable[nodeId+":{"+name+"}"];
};

QC.NodeManager.prototype.addMeasure = function(nodeId,name,value){
	var measures = this.measures(nodeId);
	if(QC.arrayContains(measures,name)){
		return this.measure(nodeId,name);
	}else{
		measures.push(name);
		this._cubeTable[nodeId+":{"+name+"}"] = value;
	}
	return value;
};

////////////////////Tree/////////////////////

QC.Tree = function(cubeTable,options){
	this._options = options || {};
	this._cubeTable = cubeTable;
	this.nodes = new QC.NodeManager(this._cubeTable);
};

QC.Tree.prototype.find = function(measures,conditions, options){
	var queryType = QC.QueryTypes.point;
	var keys = QC.objectKeys(conditions), keysLength = keys.length;
	var dimensions = this._dimensions();
	var k, key, value, query, i, dimension, selected;
	
	conditions = (options && options.conditions) || {};
	selected = QC.cloneObject(conditions);
	
	for(k = 0; k < keysLength; k++ ) {
		key = keys[k];
		value = conditions[key];
		if(QC.isArray(value)){
			queryType = QC.QueryTypes.range;
		}else if(value === QC.All){
			conditions[key] = this.dimValues(key);
			queryType = QC.QueryTypes.range;
		}
	}
	measures = (measures === QC.All) ? this.measures() : measures;
	
	query  = new QC.Query(this,conditions,measures);
	
	if(queryType === QC.QueryTypes.point){
		
		return query.point(selected);
		
	}else if(queryType===QC.QueryTypes.range){

		for(i=0; i < dimensions.length; i++){
			dimension = dimensions[i];
			if(!conditions[dimension]){
				conditions[dimension] = QC.Star;
			}
		}
		return query.range();
	}

};


QC.Tree.prototype.dimensions = function(){
	return this._cubeTable.meta.dimensions;
};

QC.Tree.prototype.measures = function(){
	return this._cubeTable.meta.measures;
};

QC.Tree.prototype.values = function(dimensionName){
	return this._cubeTable.meta[dimensionName];
};

QC.Tree.prototype.root = function(dimensionName){
	return this._cubeTable.root;
};

////Tree Builder//////////////////////////////////
QC.TreeBuilder = function(cube, cubeTable, options) {
	this._options = options || {};
	this._cubeTable = cubeTable ||{};
	this._cubeTable.meta = {};
	this._cube = cube;
	this._cubeData = cube.data();
	this._cubeDimensions = cube.dimensions();
	this._cdlength = this._cubeDimensions.length;
	this._clength = this._cubeData.length;
	this._nodeIndex = new QC.OrderedHash();
	this._tree = new QC.Tree(this._cubeTable, options);
};

QC.TreeBuilder.prototype.build = function() {
	var last, lastBuilt, i, current, lower, child, j, dimension, cnodes;
	var idIdx = 0, upperIdx = 1, lowerIdx = 2, childIdIdx = 3;
	if(!this._cubeData || this._cubeData.length === 0){
		return;
	}
	this._buildMeta();
	this._buildRoot();
	
	last = QC.cloneArray(this._cubeData[0]);
	lastBuilt = this._buildNodes(last[upperIdx], last);
	if(QC.compactArray(lastBuilt).length === 0){
		lastBuilt =  [this._tree.nodes.root()];
	}
	this._nodeIndex[0] = {'nodes':lastBuilt, 'upper':last[upperIdx]};
	
	for(i = 0; i < (this._clength -1); i++){
		current = this._cubeData[i + 1];
		
		if(QC.arrayToString(current[upperIdx]) !== QC.arrayToString(last[upperIdx])){
			//New upper bound
			lastBuilt = this._buildNodes(current[upperIdx], current);
			last = QC.cloneArray(current);
			this._nodeIndex[current[idIdx]] = {'nodes':lastBuilt, 'upper':last[upperIdx]};
			
		}else{
            //# If we've found a new
            //# upper bound we need to compare the current lower bound
            //# to the child upper bound, and find out which dimension
            //# we need to create a link on, once we've done that
            //# we create a link from the child node to the current
            //# upper bound node on that dimension
			lower = current[lowerIdx];
			child = this._nodeIndex[current[childIdIdx]];

			for(j = 0; j < this._cdlength; j++){
				dimension = this._cubeDimensions[j];
				if(child.upper[j] === QC.Star && lower[j] !== QC.Star){
					cnodes = QC.compactArray(child.nodes);
					this._buildLink(cnodes[cnodes.length - 1], lastBuilt[j], lower[j], dimension);
					break;
				}
				
			}
		}
	}
	return this._tree;
};

QC.TreeBuilder.prototype._buildRoot = function(current) {
	var root = this._tree.nodes.createRoot(), self = this, addMeasures;
	current = current || this._cubeData[0];
	addMeasures = function(measure){
		var colIndex = self._cube.indexOfColumnName(measure);
		self._tree.nodes.addMeasure(root, measure, this._cubeData[0][colIndex]);
	};
	QC.arrayForEach(addMeasures,this._cube.measures(),this);

};

QC.TreeBuilder.prototype._buildNodes = function(bound, row) {
	var nodes = [], self = this, addMeasures, addDimensions;
	
	var lastNode = this._tree.nodes.root();
	
	addDimensions = function(dimension, index){
		if(bound[index] !== QC.Star){
			dimension = self._tree.nodes.addDimension(lastNode, dimension);
			lastNode = self._tree.nodes.addChild(lastNode, dimension, bound[index]);
			nodes.push(lastNode);
		}else{
			nodes.push(null);
		}
	};
	QC.arrayForEach(addDimensions,this._cube.dimensions(),this);
	
	addMeasures = function(measure){
		var colIndex = self._cube.indexOfColumnName(measure);	
		self._tree.nodes.addMeasure(lastNode, measure, row[colIndex]);
	};
	QC.arrayForEach(addMeasures,this._cube.measures(),this);
	return nodes;
};


QC.TreeBuilder.prototype._buildLink = function(source, destination, name, dimension) {
	dimension = this._tree.nodes.addDimension(source,dimension);
	this._tree.nodes.addChild(source,dimension, name, destination);
};

QC.TreeBuilder.prototype._buildMeta = function() {
	var self = this, addValues;
	var dims = this._cube.dimensions();
	var mes = this._cube.measures();

	this._cubeTable.meta.dimensions =dims; 
	this._cubeTable.meta.measures = mes;
	
	addValues = function(dimension){
		var values = self._cube.values()[dimension];
		self._cubeTable.meta[dimension] = values;
	};
	
	QC.arrayForEach(addValues, QC.objectKeys(this._cube.values()),this);
};

////////////////////Cube/////////////////////
QC.Cols = ['id', 'upper', 'lower', 'child_id'];

QC.Cube = function (baseTable, dimensions, measures) {
	this._dimensions = dimensions;
	this._measures = measures;
	this._baseTable = baseTable;
	this._btlength = this._baseTable.getLength();
	this._dlength = this._dimensions.length;
	this._columnNames = QC.Cols.concat(measures);
	this._tempClasses = [];
	this._values = null;
};
QC.Cube.prototype.indexOfColumnName = function (columnName) {
	return this._columnNames.indexOf(columnName);
};

QC.Cube.prototype.dimensions = function (aggrCallback) {
	return this._dimensions;
};
QC.Cube.prototype.measures = function (aggrCallback) {
	return this._measures;
};

QC.Cube.prototype.data = function (aggrCallback) {
	return this._tempClasses;
};

QC.Cube.prototype.build = function (aggrCallback) {
	var cell = [], partition = [], i;

	for (i = 0; i < this._dlength; i++) {
		cell.push(QC.Star);
	}
	
	for (i = 0; i < this._btlength; i++) {
		partition.push(i);
	}
	
	this._dfs(cell, partition, 0, -1, aggrCallback,0);
	this._sortTempClasses();
	return this._tempClasses;
};

QC.Cube.prototype.values = function () {
	var values, i, j, row, dimension, valueKeys, vklength, k, valueKey;
	if(!this._values){
		values = {};

		for(i = 0; i < this._btlength; i++) {
			row = this._baseTable.row(i);
			for(j = 0;j < this._dlength; j++) {
				dimension = this._dimensions[j];
				values[dimension] = values[dimension] || [];
				values[dimension].push(row[j]);
			}
		}
		
		valueKeys = QC.objectKeys(values);
		vklength = valueKeys.length;
		for(k = 0;k < vklength; k++) {
			valueKey = valueKeys[k];
			values[valueKey] = QC.uniqArray(values[valueKey]);
			values[valueKey] = values[valueKey].sort();
		}
		
		this._values = values;	
	}
	return this._values;
	
};



QC.Cube.prototype._sortTempClasses = function () {
	//console.log("Before sort "+this._tempClasses);
	//sort by upper;
	this._tempClasses = this._tempClasses.sort(function(a, b) {
		var upperA = QC.arrayToString(a[1]).toLowerCase(), upperB = QC.arrayToString(b[1]).toLowerCase();
		//sort string ascending
		if (upperA < upperB){
			return -1;
		}
		if (upperA > upperB){
			return 1;
		}
		 return 0; //default return value (no sorting)
	});
	//console.log("After sort upper "+this._tempClasses);
};

QC.Cube.prototype._indexes = function (partition) {
     var indexes = {}, i, j, index, dimension, rowi, columni, value;
     var alength = partition.length;
    //for each of the dimensions
     for (i = 0; i < this._dlength; i++) {
        dimension = this._dimensions[i];
        index = new QC.OrderedHash();
	     //for each of the rows in the partition
        for(j=0; j < alength; j++){
			rowi = partition[j];
			columni = this._baseTable.columnNames.indexOf(dimension);
			value = this._baseTable.dataValueByRowAndColIndex(rowi,columni);
			if(!index.get(value)){
				index.set(value,[]);
			}
			index.get(value).push(rowi);
        }
        indexes[dimension] = index;
	}
	return indexes;

};

QC.Cube.prototype._upperBound = function (indexed, lower) {
	var i, value, dimension;
	var upper = QC.cloneArray(lower);
	var llength = lower.length;

	for (i = 0; i < llength; i++) {
		value = lower[i];
		dimension = this._dimensions[i];
		
		if(value===QC.Star){
			if(indexed[dimension].order_keys.length ===1){
				upper[i] = indexed[dimension].order_keys[0];
			}
		}else{
			upper[i] = value;
		}
	}
	return upper;
};


QC.Cube.prototype._dfs = function (cell, partition, k, child, aggrCallback) {
	var self = this, j, d, n, dimension,partitions, tempClass, aggrIdx;
	
	//calculate aggregate for the range of indexes.
	var aggregate = aggrCallback.call(this, this._baseTable, partition);
	
	var indexed = this._indexes(partition);
	
	//jump tp upper bound

	var upper = this._upperBound(indexed,cell);
	
	//latest temp class index.
	var classId = this._tempClasses.length;

	d = QC.cloneArray(upper);
	
	//pushing/recording a temp class 
	if(Array.isArray(aggregate)){
		tempClass = [classId,d,QC.cloneArray(cell),child];
		for(aggrIdx = 0; aggrIdx < aggregate.length; aggrIdx++){
			tempClass.push(aggregate[aggrIdx]);
		}
	}else{
		tempClass = [classId,d,QC.cloneArray(cell),child,aggregate];
	}
	
	this._tempClasses.push(tempClass);

	for(j=0;j< (k -1);j++){
		if((cell[j] === QC.Star ) && (d[j] !== QC.Star)){
			return;
		}
	}
	
	var childDfs = function (x, records) {
		//for each value of x in dim j of base table
		//if the partition is not empty do dfs on that
		if(partition.length>0){
			d[j] = x;
			self._dfs(d,records,j,classId,aggrCallback);
			d[j] = QC.Star;
		}
		return true;
	};
	
	//number of dimensions
	n = this._dlength;
	//for each k<j<n and d[j] is *
	for (j = k; j < n; j++){
		dimension = this._dimensions[j];
		if(d[j] === QC.Star){
			//dimension j
			//the partitions are retrieved using the index we calculated
			partitions = indexed[dimension];
			//dim j's values
			partitions.foreach(childDfs);
		}
	}
};

//queries 
QC.Query = function(tree, conditions, measures){
	this._tree = tree;
	this._conditions = conditions;
	this._measures = measures;
};

QC.Query.prototype._search = function(nodeId, dimension, value, position){
	var nodeDims = this._tree.nodes.dimensions(nodeId);
	var dimensions = QC.intersectArrays(this._tree.dimensions(), nodeDims);
	var dimLast = dimensions[dimensions.length -1];
	var child, lastName, lastNode, dimChildren;
	if(QC.arrayContains(dimensions, dimension)){
		child = this._tree.nodes.child(nodeId, dimension, value);
		if(child){
			return child;
		}
	}
	if(dimensions.length === 0){
		return null;
	}

	dimChildren = this._tree.nodes.children(nodeId, dimLast);
	lastName = dimChildren[dimChildren.length - 1];	
	lastNode = this._tree.nodes.child(nodeId, dimLast, lastName);
	
	if(lastNode){
		return this._search(lastNode, dimension, value, position);
	}else{
		return null;
	}
	
};

QC.Query.prototype._searchMeasures = function(nodeId, measures){
	var availMeasures = this._tree.nodes.measures(nodeId);
	var values, withMeasures, dimensions, nodeDims, nextName, nextNode, dimLast, dimChildren;
	
	if(availMeasures.length >0){
		values = {};
		withMeasures = function(selected){
			values[selected] = this._tree.nodes.measure(nodeId, selected);
		};
	
		QC.arrayForEach(withMeasures, measures, this);
		return values;
	}else{
		nodeDims = this._tree.nodes.dimensions(nodeId);
		dimensions = QC.intersectArrays(this._tree.dimensions(), nodeDims);
		if(!dimensions){
			return null;
		}else{
			dimLast = dimensions[dimensions.length -1];
			dimChildren = this._tree.nodes.children(nodeId, dimLast);
			nextName = dimChildren[dimChildren.length - 1];	
			nextNode = this._tree.nodes.child(nodeId, dimLast, nextName);
		}
		if(!nextNode){
			return nextNode;
		}else{
			return this._searchMeasures(nextNode, measures);
		}
	}
	
};

QC.Query.prototype._lastSpecifiedPosition = function() {
	var i = this._tree.dimensions().length, cond;
	var dimensions = this._tree.dimensions();
	while(i > 1){
		cond = this._conditions[dimensions[i -1]];
		if( cond !== QC.Star){
			return i - 1;
		}
		i--;
	}
	return -1;
};

QC.Query.prototype.range = function(node, position, cell, results){
	var i, v, searchedMeasures, values, dimension, savedNode, value, tempCell, merged;
	var dimLength =  this._tree.dimensions().length;
	var dimensions =  this._tree.dimensions();
	
	node = node || this._tree.nodes.root();
	position = position || 0;
	cell = cell || {};
	results = results || [];
	
	if(position > this._lastSpecifiedPosition()){
		if(node){
			searchedMeasures = this._searchMeasures(node, this._measures);
			searchedMeasures = QC.mergeObjects(searchedMeasures, cell);
			results.push(searchedMeasures);
		}
		return results;
	}
	
	for(i = position; i < dimLength; i++){
		dimension = dimensions[i];
		values = this._conditions[dimension];
		if(values !== QC.Star){
			position = i;
			break;	
		}else if(i === dimLength -1){
			this.range(node, i, cell, results);
			return results;
		}
	}
	
	savedNode = node;
	if(!QC.isArray(values)){
		//searching for a point
		node = this._search(node, dimension, values, position);
		if(node){
			tempCell = {};
			tempCell[dimension] = values;
			merged = QC.mergeObjects(cell, tempCell);		
			this.range(node, (position +1), merged, results );
		}
	}else{
		for(v = 0; v < values.length; v++){
			value = values[v];
			node = this._search(savedNode, dimension, value, position);
			if(node && node !== null ){
				tempCell = {};
				tempCell[dimension] = value;
				merged = QC.mergeObjects(cell, tempCell);		
				this.range(node, (position + 1), merged, results);
			}
		}
	}
	return results;	
	
};

QC.Query.prototype.point = function(selected) {
	var self = this;
	var nodeId = this._tree.root(), withDimensions, value, searchedMeasures;
	selected = selected || {};
	
	withDimensions = function(dimension, index){
		value = this._conditions[dimension];
		if(value && value !== QC.Star){
			nodeId = self._search(nodeId, dimension, value, index);
		}
		if(nodeId){
			//break loop
			return false;
		}
	};
	
	QC.arrayForEach(withDimensions, this._tree.dimensions(), this);
	
	if(!nodeId){
		return nodeId;
	}else{
		searchedMeasures = this._searchMeasures(nodeId, this._measures);
		return QC.mergeObjects(selected, searchedMeasures);
	}
		
};

