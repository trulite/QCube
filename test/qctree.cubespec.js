describe("QC tree specs", function() {
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

	});

	it("should get a list of dimensions", function() {
		this.qctree = this.treeBuilder.build();
		expect(this.qctree.dimensions()).toEqual(['store', 'product', 'season']);					
	});

	it("should get a list of measures", function() {
		this.qctree = this.treeBuilder.build();	
		expect(this.qctree.measures()).toEqual(['sales']);					
	});
	
	it("should get a list of values", function() {
		this.qctree = this.treeBuilder.build();
		expect(this.qctree.values('store')).toEqual(['S1','S2']);					
		expect(this.qctree.values('product')).toEqual(['P1','P2']);
		expect(this.qctree.values('season')).toEqual(['f','s']);
	});

	it("should build root", function() {
		this.treeBuilder._buildRoot();
		expect(this.cubeTable.root).toEqual(1);					
	});
	
	it("should build nodes", function() {
		this.treeBuilder._buildRoot();
		this.treeBuilder._buildNodes(['S1', 'P1', 's'], [0,1,2,3,6.0]);
		expect(this.cubeTable['1:dimensions']).toEqual(['store']);
		expect(this.cubeTable['2:dimensions']).toEqual(['product']);
		expect(this.cubeTable['3:dimensions']).toEqual(['season']);
		expect(this.cubeTable['1:[store]']).toEqual(['S1']);
		expect(this.cubeTable['1:[store]:S1']).toEqual(2);
		
		expect(this.cubeTable['4:measures']).toEqual(['sales']);
		expect(this.cubeTable['4:{sales}']).toEqual(6.0);
		
	});
	
	it("should build link", function() {
		this.treeBuilder._buildRoot();
		var destination = this.treeBuilder._buildNodes(['S1', 'P1', 's'], [0,1,2,3,6.0]);
		var source = this.treeBuilder._buildNodes(['*', 'P1', '*'], [0,1,2,3,7.5]);
		var src = QC.compactArray(source);
		this.treeBuilder._buildLink(src[src.length-1],destination[destination.length-1],'s','season');

		expect(this.cubeTable['5:dimensions']).toEqual(['season']);
		expect(this.cubeTable['5:[season]']).toEqual(['s']);
		expect(this.cubeTable['5:[season]:s']).toEqual(4);
		
	});

	it("should build QC tree", function() {
		this.qctree = this.treeBuilder.build();
		console.log(this.qctree);	
		expect(this.qctree.dimensions()).toEqual(['store', 'product', 'season']);	
		expect(this.qctree.measures()).toEqual(['sales']);
		expect(this.cubeTable.root).toEqual(1);
		expect(this.qctree.values('store')).toEqual(['S1','S2']);					
		expect(this.qctree.values('product')).toEqual(['P1','P2']);
		expect(this.qctree.values('season')).toEqual(['f','s']);

		expect(this.cubeTable['1:dimensions']).toEqual(["product", "store", "season"]);
		expect(this.cubeTable['1:measures']).toEqual(["sales"]);
		expect(this.cubeTable['1:{sales}']).toEqual(9);
		expect(this.cubeTable['1:[store]']).toEqual(["S1", "S2"]);
		expect(this.cubeTable['1:[store]:S1']).toEqual(3);
		expect(this.cubeTable['1:[store]:S2']).toEqual(9);
		expect(this.cubeTable['1:[product]']).toEqual(["P1", "P2"]);
		expect(this.cubeTable['1:[product]:P1']).toEqual(2);
		expect(this.cubeTable['1:[product]:P2']).toEqual(7);
		expect(this.cubeTable['1:[season]']).toEqual(["s", "f"]);
		expect(this.cubeTable['1:[season]:s']).toEqual(4);
		expect(this.cubeTable['1:[season]:f']).toEqual(11);

		expect(this.cubeTable['2:dimensions']).toEqual(["season"]);
		expect(this.cubeTable['2:measures']).toEqual(["sales"]);
		expect(this.cubeTable['2:{sales}']).toEqual(7.5);
		expect(this.cubeTable['2:[season]']).toEqual(["s", "f"]);
		expect(this.cubeTable['2:[season]:s']).toEqual(6);
		expect(this.cubeTable['2:[season]:f']).toEqual(11);

		expect(this.cubeTable['3:dimensions']).toEqual(["season", "product"]);
		expect(this.cubeTable['3:[season]']).toEqual(["s"]);
		expect(this.cubeTable['3:[season]:s']).toEqual(4);
		expect(this.cubeTable['3:[product]']).toEqual(["P1", "P2"]);
		expect(this.cubeTable['3:[product]:P1']).toEqual(5);
		expect(this.cubeTable['3:[product]:P2']).toEqual(7);

		expect(this.cubeTable['4:measures']).toEqual(["sales"]);
		expect(this.cubeTable['4:{sales}']).toEqual(9);

		expect(this.cubeTable['5:dimensions']).toEqual(["season"]);
		expect(this.cubeTable['5:[season]']).toEqual(["s"]);
		expect(this.cubeTable['5:[season]:s']).toEqual(6);

		expect(this.cubeTable['6:measures']).toEqual(["sales"]);
		expect(this.cubeTable['6:{sales}']).toEqual(6);

		expect(this.cubeTable['7:dimensions']).toEqual(["season"]);
		expect(this.cubeTable['7:[season]']).toEqual(["s"]);
		expect(this.cubeTable['7:[season]:s']).toEqual(8);

		expect(this.cubeTable['8:measures']).toEqual(["sales"]);
		expect(this.cubeTable['8:{sales}']).toEqual(12);

		expect(this.cubeTable['9:dimensions']).toEqual(["product"]);
		expect(this.cubeTable['9:[product]']).toEqual(["P1"]);
		expect(this.cubeTable['9:[product]:P1']).toEqual(10);

		expect(this.cubeTable['10:dimensions']).toEqual(["season"]);
		expect(this.cubeTable['10:[season]']).toEqual(["f"]);
		expect(this.cubeTable['10:[season]:f']).toEqual(11);

		expect(this.cubeTable['11:measures']).toEqual(["sales"]);
		expect(this.cubeTable['11:{sales}']).toEqual(9);

					
	});

});
