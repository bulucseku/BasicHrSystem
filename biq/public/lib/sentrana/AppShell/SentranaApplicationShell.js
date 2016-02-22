// This class contains those global observerable application states.
// These states could be share across all the controllers we have in the application.
can.Construct("Sentrana.ApplicationShell", {
    /* Initial Global State */
    AppState: new can.Map({
        "sessionOpen": null,
        "closeSessionReason": null,
        "currentNotification": null,
        "sessionTimeOut": null,
        // Following process state will be different for different applications.
        "processState": {
            "schema": "reinhart_b2bdist_1",
            "dataUpload": {
                "state": "READY",
                "entities": [
                    {
                        "name": "customer",
                        "displayName": "Customer",
                        "state": "FILE_NOT_UPLOADED",
                        "loadedRowsCount": 0,
                        "errorRowsCount": 10
                    },
                    {
                        "name": "product",
                        "displayName": "Product",
                        "state": "FILE_NOT_UPLOADED",
                        "loadedRowsCount": 0,
                        "errorRowsCount": 10
                    },
                    {
                        "name": "transaction",
                        "displayName": "Transaction",
                        "state": "FILE_NOT_UPLOADED",
                        "loadedRowsCount": 0,
                        "errorRowsCount": 10
                    }
                ]
            },
            "dataMapping": {
                "state": "DISABLED",//not ready to start. TODO
                "entities": [
                    {
                        "name": "customer",
                        "displayName": "Customer",
                        "state": {
                            "attrState": {
                                "code": "INCOMPLETE",
                                "mapped": 0,
                                "unmapped": 3
                            },
                            "tableState": {
                                "code": "NOT_EXIST",
                                "msg": "Not Exist",
                                "rowLoaded": 0,
                                "errorRowCount": 10
                            }
                        }
                    },
                    {
                        "name": "product",
                        "displayName": "Product",
                        "state": {
                            "attrState": {
                                "code": "INCOMPLETE",
                                "mapped": 0,
                                "unmapped": 3
                            },
                            "tableState": {
                                "code": "NOT_EXIST",
                                "msg": "Not Exist",
                                "rowLoaded": 0,
                                "errorRowCount": 10
                            }
                        }
                    },
                    {
                        "name": "transaction",
                        "displayName": "Transaction",
                        "state": {
                            "attrState": {
                                "code": "INCOMPLETE",
                                "mapped": 0,
                                "unmapped": 3
                            },
                            "tableState": {
                                "code": "NOT_EXIST",//FAILED, WARNING
                                "msg": "Not Exist",
                                "rowLoaded": 0,
                                "errorRowCount": 10
                            }
                        }
                    }
                ]
            },
            "dataEngineering": {
                "state": "DISABLED",
                "derivedAttribute": [
                    {
                        "name": "PriceRankScore",
                        "state": "WORKING",
                        "rowLoaded": 0
                    },
                    {
                        "name": "PurchaseInterval",
                        "state": "COMPLETED",
                        "rowLoaded": 0
                    },
                    {
                        "name": "XXX",
                        "state": "WORKING",
                        "rowLoaded": 0
                    },
                    {
                        "name": "XXX",
                        "state": "COMPLETED",
                        "rowLoaded": 0
                    }
                ]
            },
            "modelExecution" : [
                {
                    "name" : "Cross Sell Model",
                    "state" : "DISABLED",
                    "process" : [
                        {
                            "name" : "ModelPreProcessing",
                            "state" : "WORKING"
                        },
                        {
                            "name" : "ModelTest",
                            "state" : "COMPLETED"
                        }
                    ]
                }
            ],
            "exploreResult" : {
                "state" : "DISABLED"
            }//DISABLED which means it is not ready to explore result.
        }
    })
}, {
});
