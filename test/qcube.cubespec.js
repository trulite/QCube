describe("Quotient-Cube specs", function() {
	beforeEach(function() {
		this.baseTable =new QC.Table(['store', 'product', 'season', 'sales'], 
		[
          ['S1', 'P1', 's', 6],
          ['S1', 'P2', 's', 12],
          ['S2', 'P1', 'f', 9]
        ]);
		this.dimensions=['store', 'product', 'season'];
		this.measures = ['sales']
	});
	
	
	
	it("should index correctly", function() {
		var baseTable = new QC.Table(['store', 'product'],
						[
							['S1', 'P1'], 
							['S1', 'P2']
						]
					);
		var qcube = new QC.Cube(baseTable,['store', 'product'],[]);
		var indexes = qcube._indexes([0,1]);
		var expectedIndexes = {'store':{'S1':[0,1]},'product':{'P1':[0],'P2':[1]}};
		var indexKeys = Object.keys(indexes);
		var i,indexKey,idx,eidx;
		for(i=0;i<indexKeys.length;i++){
			indexKey = indexKeys[i];
			eidx = expectedIndexes[indexKey];
			idx = indexes[indexKey].data;
			expect(idx).toEqual(eidx);
		}
	
	});

	it("should find upper bounds correctly", function() {
		var qcube = new QC.Cube(this.baseTable,this.dimensions,this.measures);
		var indexes = qcube._indexes([0,1]);
		var upperBounds = qcube._upperBound(indexes,['S1', '*', '*']);
		
		expect(upperBounds).toEqual(['S1', '*', 's']);
	});


	it("should build temporary classes correctly", function() {
		var uppers = [
			['*', '*', '*'], ['*', 'P1', '*'], ['S1', '*', 's'],
			['S1', '*', 's'], ['S1', 'P1', 's'], ['S1', 'P1', 's'],
			['S1', 'P2', 's'], ['S1', 'P2', 's'], ['S2', 'P1', 'f'],
			['S2', 'P1', 'f'], ['S2', 'P1', 'f']
		];

		var lowers = [
			['*', '*', '*'], ['*', 'P1', '*'],['S1', '*', '*'],
			['*', '*', 's'], ['S1', 'P1', 's'], ['*', 'P1', 's'],
			['S1', 'P2', 's'], ['*', 'P2', '*'], ['S2', '*', '*'],
			['*', 'P1', 'f'], ['*', '*', 'f']
		];

		var aggregates = [
			9, 7.5, 9, 9, 6, 6, 12, 12, 9, 9, 9
		];
		
		var ids = [0, 5, 1, 9, 2, 6, 3, 8, 4, 7, 10];
	
		var qcube = new QC.Cube(this.baseTable,this.dimensions,this.measures);
		
		var avg  = function(table,partition){
			//console.log("Calculating avg for partition "+partition);
			var sum =0;
			var i,rowIndex;
			for(i=0;i<partition.length;i++) {
				rowIndex = partition[i];
				//sum of sales
				sum = sum + table.dataValue(rowIndex,'sales');
			}
			return (sum/partition.length)
		};
		
		var data = qcube.build(avg);
		for(i =0;i<data.length;i++){
			var row = data[i];
			var salesAvgIdx = qcube._columnNames.indexOf('sales');
			var idIdx = qcube._columnNames.indexOf('id');
			var upperIdx = qcube._columnNames.indexOf('upper');
			var lowerIdx = qcube._columnNames.indexOf('lower');
			expect(row[salesAvgIdx]).toEqual(aggregates[i]);
			expect(row[idIdx]).toEqual(ids[i]);
			expect(row[upperIdx]).toEqual(uppers[i]);
			expect(row[lowerIdx]).toEqual(lowers[i]);
		}
		
		expect(data.length).toEqual(11);
	});


	it("should build meta data about unique values for each dimension", function() {
		var qcube = new QC.Cube(this.baseTable,this.dimensions,this.measures);
		
		var avg  = function(table,partition){
			//console.log("Calculating avg for partition "+partition);
			var sum =0;
			var i,rowIndex;
			for(i=0;i<partition.length;i++) {
				rowIndex = partition[i];
				//sum of sales
				sum = sum + table.dataValue(rowIndex,'sales');
			}
			return (sum/partition.length)
		};
		var data = qcube.build(avg);
		var values = qcube.values();

		expect(values['store']).toEqual(['S1', 'S2']);
      	expect(values['product']).toEqual(['P1', 'P2']);
		expect(values['season']).toEqual(['f', 's']);
		
	});



});

describe("With the location, product, time data set", function() {
	beforeEach(function() {
		this.baseTable =new QC.Table(['location', 'product', 'time', 'sales'], 
		[
			['Van', 'b', 'd1', 9],
			['Van', 'f', 'd2', 3],
			['Tor', 'b', 'd2', 6]
        ]);
		this.dimensions=['location', 'product', 'time'];
		this.measures = ['sales[sum]','sales[average]']
	});

	it("should build temporary classes correctly", function() {
		var uppers = [
			['*', '*', '*'], ['*', '*', 'd2'], ['*', 'b', '*'],
		    ['Tor', 'b', 'd2'], ['Tor', 'b', 'd2'], ['Van', '*', '*'],
		    ['Van', 'b', 'd1'], ['Van', 'b', 'd1'], ['Van', 'b', 'd1'],
		    ['Van', 'b', 'd1'], ['Van', 'f', 'd2'], ['Van', 'f', 'd2'],
		    ['Van', 'f', 'd2']
        ];

		var lowers = [
			['*', '*', '*'], ['*', '*', 'd2'],['*', 'b', '*'],
		    ['Tor', '*', '*'], ['*', 'b', 'd2'], ['Van', '*', '*'],
		    ['Van', 'b', '*'], ['Van', '*', 'd1'], ['*', 'b', 'd1'],
		    ['*', '*', 'd1'], ['Van', 'f', '*'], ['Van', '*', 'd2'],
		    ['*', 'f', '*']		
        ];

		var sales_sum = [18, 9, 15, 6, 6, 12, 9, 9, 9, 9, 3, 3, 3];
		var sales_average = [6, 4.5, 7.5, 6, 6, 6, 9, 9, 9, 9, 3, 3, 3];
		
		var ids = [0, 12, 7, 6, 9, 1, 2, 4, 8, 11, 3, 5, 10];
	
		var qcube = new QC.Cube(this.baseTable,this.dimensions,this.measures);
		expect(qcube._columnNames).toContain('sales[sum]');
		expect(qcube._columnNames).toContain('sales[average]');
		
		var aggrFn  = function(table,partition){
			var sum =0;
			var i,rowIndex;
			for(i=0;i<partition.length;i++) {
				rowIndex = partition[i];
				//sum of sales
				sum = sum + table.dataValue(rowIndex,'sales');
			}
			return ([sum,sum/partition.length]);
		};
		
		var data = qcube.build(aggrFn);
		expect(data.length).toEqual(13);
		for(i =0;i<data.length;i++){
			var row = data[i];
			//console.log(row);
			var salesSumIdx = qcube._columnNames.indexOf('sales[sum]');
			var salesAvgIdx = qcube._columnNames.indexOf('sales[average]');
			expect(row[salesSumIdx]).toEqual(sales_sum[i]);
			expect(row[salesAvgIdx]).toEqual(sales_average[i]);
		}
		
	});

});
