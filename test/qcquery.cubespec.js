describe("With the regular data set", function() {
	beforeEach(function() {
		var avg  = function(table,partition){
			//console.log("Calculating avg for partition "+partition);
			var sum =0;
			var i,rowIndex;
			for(i=0;i<partition.length;i++) {
				rowIndex = partition[i];
				//sum of sales
				sum = sum + table.dataValue(rowIndex,'sales');
			}
			return [(sum/partition.length)];
		};

		this.baseTable =new QC.Table(['store', 'product', 'season', 'sales'], 
		[
          ['S1', 'P1', 's', 6],
          ['S1', 'P2', 's', 12],
          ['S2', 'P1', 'f', 9]
        ]);
		this.dimensions=['store', 'product', 'season'];
		this.measures = ['sales'];
		this.qcube = new QC.Cube(this.baseTable,this.dimensions,this.measures);
		this.qcube.build(avg);
		this.cubeTable = {};
		this.treeBuilder = new QC.TreeBuilder(this.qcube,this.cubeTable);
		this.qctree = this.treeBuilder.build();
		console.log(this.qctree);
		this.query = new QC.Query(this.qctree,{'store':'S1', 'product': 'P1', 'season' : 's'}, ['sales']);

	});

	it("should get last specified position", function() {
		expect(this.query._lastSpecifiedPosition()).toEqual(2);					
	});

	it("should return null if a value doesnt exist for a dimension", function() {
		var node = this.query._search(this.qctree.root(), 'store', 'S3', 0);
		expect(node).toBeNull();					
	});
	
	it("should search a shallow route", function() {
		var node = this.query._search(this.qctree.root(), 'product', 'P1', 0);
		expect(node).toEqual(2);
	});

	it("should search a deep route", function() {
		var root = this.qctree.root();
		var node = this.qctree.nodes.child(root, 'store', 'S2');
		node = this.query._search(node, 'season', 'f', 2);
		expect(node).toEqual(11);		
	});
	
	it("should return shallow measures", function() {
		var root = this.qctree.root();
		var measure = this.query._searchMeasures(root, ['sales']);
		expect(measure).toEqual({'sales':9});		
		
	});
	
	it("should return more shallow measures", function() {
		var root = this.qctree.root();
		var node = this.qctree.nodes.child(root, 'season', 's');
		var measure = this.query._searchMeasures(node, ['sales']);
		expect(measure).toEqual({'sales':9});		
		
	});
	
	it("should return more deep measures", function() {
		var root = this.qctree.root();
		var node = this.qctree.nodes.child(root, 'store', 'S2');
		var measure = this.query._searchMeasures(node, ['sales']);
		expect(measure).toEqual({'sales':9});		
		
	});	

/////////////////Point queries ///////////////////
	it("should answer empty conditions", function() {
		var pointQuery = new QC.Query(this.qctree,{}, ['sales']);
		var answer = pointQuery.point();
		expect(answer).toEqual({'sales':9});		
	});	

	it("should answer condition", function() {
		var pointQuery = new QC.Query(this.qctree,{'store':'S2', 'season':'s'}, ['sales']);
		var answer = pointQuery.point();
		expect(answer).toBeNull();		
	});	

	it("should answer condition", function() {
		var pointQuery = new QC.Query(this.qctree,{'store':'S2', 'season':'f'}, ['sales']);
		var answer = pointQuery.point();
		expect(answer).toEqual({'sales':9});		
	});	

	it("should answer condition", function() {
		var pointQuery = new QC.Query(this.qctree,{'product':'P1'}, ['sales']);
		var answer = pointQuery.point();
		expect(answer).toEqual({'sales':7.5});		
	});	

	it("should answer condition", function() {
		var pointQuery = new QC.Query(this.qctree,{'product':'P2'}, ['sales']);
		var answer = pointQuery.point();
		expect(answer).toEqual({'sales':12});		
	});	

	it("should answer condition", function() {
		var pointQuery = new QC.Query(this.qctree,{'store':'S2'}, ['sales']);
		var answer = pointQuery.point();
		expect(answer).toEqual({'sales':9});		
	});	

	it("should answer condition", function() {
		var pointQuery = new QC.Query(this.qctree,{'store':'S1', 'product':'P1'}, ['sales']);
		var answer = pointQuery.point();
		expect(answer).toEqual({'sales':6});		
	});	

/////////////////Range queries ///////////////////
	it("should answer empty conditions", function() {
		var rangeQuery = new QC.Query(this.qctree,{'store':'*', 'product':'*', 'season':'*'}, ['sales']);
		var answer = rangeQuery.range();
		expect(answer).toEqual([{'sales':9}]);		
	});	
	
	it("should answer condition", function() {
		var rangeQuery = new QC.Query(this.qctree,{
        'store':['S1', 'S2', 'S3'],
        'product':['P1', 'P3'], 'season': 'f'
      	}, ['sales']);
		var answer = rangeQuery.range();
		expect(answer).toEqual([{
        'store':'S2', 'product':'P1', 'season':'f', 'sales':9
      	}]);		
	});	

	it("should answer condition", function() {
		var rangeQuery = new QC.Query(this.qctree,{
        'store' : ['S1', 'S2', 'S3'],
        'product' : ['P1', 'P2'], 'season' : '*'
      	}, ['sales']);
		var answer = rangeQuery.range();
		expect(answer).toEqual([
        {'store' : 'S1', 'product' : 'P1', 'sales' : 6},
        {'store' : 'S1', 'product' : 'P2', 'sales' : 12},
        {'store' : 'S2', 'product' : 'P1', 'sales' : 9}
      	]);		
	});	

	it("should answer condition", function() {
		var rangeQuery = new QC.Query(this.qctree,{
        'store' : '*', 'product' : '*', 'season' : ['f', 's']
      	}, ['sales']);
		var answer = rangeQuery.range();
		expect(answer).toEqual([
        {'season' : 'f', 'sales' : 9},
        {'season' : 's', 'sales' : 9}
      	]);		
	});	

	it("should answer condition", function() {
		var rangeQuery = new QC.Query(this.qctree,{
        'store' : '*', 'product' : ['P1', 'P2'], 'season' : '*'
     	}, ['sales']);
		var answer = rangeQuery.range();
		expect(answer).toEqual([
        {'product' : 'P1', 'sales' : 7.5},
        {'product' : 'P2', 'sales' : 12}
      	]);		
	});	

	it("should answer condition", function() {
		var rangeQuery = new QC.Query(this.qctree,{
        'store' : ['S1', 'S2'], 'product' : ['P1', 'P2'], 'season' : ['s', 'f']
      	}, ['sales']);
		var answer = rangeQuery.range();
		expect(answer).toEqual([
        {"sales" : 6.0, "store" : "S1", "season" : "s", "product" : "P1"},
        {"sales" : 12.0, "store" : "S1", "season" : "s", "product" : "P2"},
        {"sales" : 9.0, "store" : "S2", "season" : "f", "product" : "P1"}
      	]);		
	});	

});


