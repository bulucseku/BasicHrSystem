
exports.migrate = function(client, done) {
	var db = client.db;
    var repo = db.collection('dataFilterMapping');
    repo.insertOne(
        {
            "mapping" : "<?xml version=\"1.0\" encoding=\"utf-8\" ?><dataFilterMapping>  <repository id=\"CatMan\">  </repository>  <repository id=\"CatManDual\">  </repository>  <repository id=\"RichsPilot\">    <attributeForm id=\"unit_city_generic\">      <dataFilter id=\"City\"/>    </attributeForm>    <attributeForm id=\"unit_state_generic\">      <dataFilter id=\"State\"/>    </attributeForm>    <attributeForm id=\"product_focus_group\">      <dataFilter id=\"Product_focus_group\"/>    </attributeForm>    <attributeForm id=\"reseller_district_id\">      <dataFilter id=\"DISTRICT_ID\"/>    </attributeForm>    <attributeForm id=\"reseller_region_id\">      <dataFilter id=\"REGION_ID\"/>    </attributeForm>    <attributeForm id=\"reseller_zone_id\">      <dataFilter id=\"ZONE_ID\"/>    </attributeForm>  </repository>  <repository id=\"MMIB\">    <attributeForm id=\"FiscalQuarterId\">        <dataFilter id=\"City\"/>    </attributeForm>  </repository></dataFilterMapping>"
        },
        done
    );
};

exports.rollback = function(client, done) {
	var db = client.db;
    var repo = db.collection('dataFilterMapping');
	repo.drop(done);
};
