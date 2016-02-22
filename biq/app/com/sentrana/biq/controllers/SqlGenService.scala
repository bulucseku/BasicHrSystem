package com.sentrana.biq.controllers

import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.usermanagement.controllers.Authentication

/**
 * Created by szhao on 2/9/2015.
 */
object SqlGenService extends SqlGenService with PlayLoggerComponent

trait SqlGenService extends BaseController with Authentication {
  this: LoggerComponent =>

  def execute() = AuthAction(parse.json) { implicit request =>
    Ok("{\"cached\":true,\"cacheid\":\"7afdb32a-a26f-4962-857f-e7413c094e71\",\"colInfos\":[{\"attrValueType\":0,\"colType\":0,\"dataType\":3,\"formatString\":null,\"just\":0,\"oid\":\"FiscalMonthId\",\"sortOrder\":\"A\",\"sortPos\":2,\"title\":\"Fiscal Month\",\"width\":12},{\"attrValueType\":3,\"colType\":1,\"dataType\":3,\"formatString\":\"N0\",\"just\":1,\"oid\":\"CaseCount\",\"sortOrder\":\"D\",\"sortPos\":1,\"title\":\"Cases\",\"width\":11}],\"drillable\":false,\"execTime\":\"2\\/9\\/2015 10:49:43 AM\",\"exptMsg\":null,\"maltypedElems\":null,\"rows\":[{\"cells\":[{\"fmtValue\":\"9\",\"rawValue\":9,\"subttlHdr\":false},{\"fmtValue\":\"166,821,329\",\"rawValue\":166821329.33000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"3\",\"rawValue\":3,\"subttlHdr\":false},{\"fmtValue\":\"159,035,971\",\"rawValue\":159035971.40000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"6\",\"rawValue\":6,\"subttlHdr\":false},{\"fmtValue\":\"146,794,718\",\"rawValue\":146794717.72000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"11\",\"rawValue\":11,\"subttlHdr\":false},{\"fmtValue\":\"135,177,906\",\"rawValue\":135177905.94000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"10\",\"rawValue\":10,\"subttlHdr\":false},{\"fmtValue\":\"134,846,271\",\"rawValue\":134846270.85000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"4\",\"rawValue\":4,\"subttlHdr\":false},{\"fmtValue\":\"133,502,187\",\"rawValue\":133502186.58000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"2\",\"rawValue\":2,\"subttlHdr\":false},{\"fmtValue\":\"132,955,857\",\"rawValue\":132955856.91000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"8\",\"rawValue\":8,\"subttlHdr\":false},{\"fmtValue\":\"130,246,798\",\"rawValue\":130246797.78000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"5\",\"rawValue\":5,\"subttlHdr\":false},{\"fmtValue\":\"125,497,164\",\"rawValue\":125497164.20000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"1\",\"rawValue\":1,\"subttlHdr\":false},{\"fmtValue\":\"124,761,931\",\"rawValue\":124761930.81000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"7\",\"rawValue\":7,\"subttlHdr\":false},{\"fmtValue\":\"120,803,432\",\"rawValue\":120803431.93000,\"subttlHdr\":false}],\"subtotalRow\":false},{\"cells\":[{\"fmtValue\":\"12\",\"rawValue\":12,\"subttlHdr\":false},{\"fmtValue\":\"90,558,491\",\"rawValue\":90558491.37000,\"subttlHdr\":false}],\"subtotalRow\":false}],\"sql\":\"\",\"timing\":{\"query\":19729,\"sqlgen\":52},\"totals\":null}")
  }

}
