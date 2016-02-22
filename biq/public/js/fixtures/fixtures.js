(function () {
    var derivedColumns = [{
        id: "1",
        oid: "f[1]",
        name: "Derived Column over GP",
        dataSource: "CatMan",
        formula: "3*5-8-9+[GrossProfit]-88",
        outputType: "NUMBER",
        precision: 2
    }, {
        id: "2",
        oid: "f[2]",
        name: "CasesPlusTwo",
        dataSource: "CatMan",
        formula: "[CaseCount]+2",
        outputType: "CURRENCY",
        precision: 3
    }];

    // Fixtures...
    $.fixture("GET /DerivedColumns", function (orig) {
        return {
            derivedColumns: derivedColumns
        };
    });
    $.fixture("GET /DerivedColumn/{id}", function (orig) {
        // Get the Derived Column with the specified ID...
        var derivedColumn = derivedColumns.filter(function (x) {
            return x.id == orig.data.id;
        });

        return ((derivedColumn.length) ? [200, "success"] : [401, "not found"]).concat(derivedColumn);
    });
    $.fixture("POST /DerivedColumn", function (orig) {
        var org = $.extend({
            id: derivedColumns.length + 1,
            oid: "f[" + (derivedColumns.length + 1) + "]"
        }, orig.data);
        derivedColumns.push(org);
        return org;
    });
    $.fixture("PUT /DerivedColumn/{id}", function (orig) {
        derivedColumns[orig.data.id - 1] = orig.data;
        return orig.data;
    });
    $.fixture("DELETE /DerivedColumn/{id}", function (orig) {
        var index = parseInt(orig.data.id, 10);
        derivedColumns.splice(index - 1, 1);
    });

    // Settings...
    $.fixture.delay = 0; /* ms */
})();
