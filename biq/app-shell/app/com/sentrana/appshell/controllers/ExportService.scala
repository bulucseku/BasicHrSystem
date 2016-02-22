package com.sentrana.appshell.controllers

import java.io.ByteArrayOutputStream

import play.api.http.ContentTypes

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Success, Failure }

import play.api.Play.current
import play.api.libs.Files.TemporaryFile
import play.api.libs.ws.{ WS, WSRequestHolder, WSResponse }
import play.api.mvc._

import org.apache.http.{ HttpStatus, HttpEntity }
import org.apache.http.entity.ContentType
import org.apache.http.entity.mime.MultipartEntityBuilder
import org.json4s.native.Serialization._

import com.ning.http.client.Response
import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.data.DatasetResult
import com.sentrana.appshell.exceptions.{ ExternalServiceError, InvalidInputException }
import com.sentrana.appshell.logging.{ LogLevel, LoggerComponent, Logging, PlayLoggerComponent }
import com.sentrana.appshell.metadata
import com.sentrana.appshell.serialization._
import com.sentrana.appshell.utils.ConfigurationUtil
import com.sentrana.usermanagement.controllers.{ ApplicationMessages, Authentication }
import com.sentrana.usermanagement.datacontract.{ ResponseMessage, ResponseMessageCode, ServiceErrorCode }

/**
 * Created by williamhogben on 6/23/15.
 */
trait ExportService extends BaseController with Authentication with Logging {
  this: LoggerComponent =>

  val loggerForCache = Logger("loggerForCache")

  val PivotExportInputFormSizeLimit = play.api.Play.current.configuration.getInt("pivot.export.inputFormSizeLimitInMB").getOrElse(10) * 1024 * 1024

  def exportToCsv(cacheId: String, includeSubtotals: Boolean, fileName: String, datasetResult: Option[DatasetResult]): Result = {
    // Getting report data using cache id
    logger.debug(s"Getting report data from cache for export. The cache key is: $cacheId")
    datasetResult match {
      case Some(dataset) =>
        try {
          // Preparing all rows
          val headerRow = dataset.colInfos.map { _.title }
          val dataRows = dataset.totals.map {
            dataset.rows :+ _
          }.getOrElse(dataset.rows)
            .filter { !_.subtotalRow || includeSubtotals }
            .map { _.cells.map { c => if (c.fmtValue.isEmpty) c.rawValue.toString else c.fmtValue } }
          val allRows = headerRow +: dataRows

          // Serializing all rows
          val csvData = new TototoshiCsvSerializer().serialize(allRows, identity[String] _)
          Ok(csvData).as("txt/csv; charset=utf-8").withHeaders(
            CONTENT_DISPOSITION -> s"attachment; filename=$fileName",
            CONTENT_LENGTH -> csvData.length.toString
          )
        }
        catch {
          case e: Exception =>
            val msgCode = ResponseMessageCode.FAILURE.toString
            val message = ApplicationMessages.ExportCSVFailed(cacheId)
            val responseJson = write(ResponseMessage(msgCode, message))
            InternalServerError(responseJson)
        }
      case None =>
        loggerForCache.warn(s"EXPORTMISS,$cacheId")
        val msgCode = ResponseMessageCode.FAILURE.toString
        val message = ApplicationMessages.NoDatasetToExport(cacheId)
        val responseJson = write(ResponseMessage(msgCode, message))
        NotFound(responseJson)
    }
  }

  def exportChart: Action[MultipartFormData[TemporaryFile]] = AuthAction.async(parse.multipartFormData) { implicit request =>
    validateRequest(request)

    val exportServiceURL = getExportServiceURL
    val exportServiceRequest = buildExportServiceRequest(exportServiceURL)

    exportServiceRequest.execute() map { serviceResponse =>
      validateResponse(serviceResponse)
      buildResult(serviceResponse)
    }
  }

  def exportPivotTable: Action[Map[String, Seq[String]]] = AuthAction.async(parse.urlFormEncoded(maxLength = PivotExportInputFormSizeLimit)) { implicit request =>
    val exportServiceRequest = WS.url(getPivotExportServiceURL)
      .withHeaders((CONTENT_TYPE, ContentTypes.FORM)) //"application/x-www-form-urlencoded"  It seems we only need content type here.
      .withBody(buildUrlFormEncodedBody(request.request.body))
      .withMethod("POST")
    exportServiceRequest.execute() map { serviceResponse =>
      if (serviceResponse.status != HttpStatus.SC_OK) // There is no easy way to reuse current implemented function validateResponse. Keep it like this for now.
        throw new InvalidRequestedContentTypeException("Excel file")
      else
        buildResult(serviceResponse)
    }
  }

  def buildUrlFormEncodedBody(body: Map[String, Seq[String]]) = {
    val outputStream = new ByteArrayOutputStream
    for ((name, values) <- body) {
      outputStream.write(s"$name=${values.mkString}".getBytes)
    }
    outputStream.toByteArray
  }

  private def validateRequest[A](implicit request: Request[MultipartFormData[A]]): Unit = {
    val expectedResponseType = getRequestDataPart("type")
    validateExpectedResponseType(expectedResponseType)

    val xmlContent = getRequestDataPart("svg")
    validateRequestXMLContent(xmlContent)
  }

  private def getRequestDataPart[A](name: String)(implicit request: Request[MultipartFormData[A]]): String =
    request.body.dataParts get name flatMap { _.headOption } getOrElse ""

  private def validateExpectedResponseType(expectedResponseType: String): Unit = {
    val acceptedTypes = ConfigurationUtil.getAppSettingList("exportChart.contentTypes")
    if (!acceptedTypes.contains(expectedResponseType)) {
      throw new InvalidRequestedContentTypeException(expectedResponseType)
    }
  }

  private def validateRequestXMLContent(xml: String): Unit = {
    metadata.loadXMLString(xml) match {
      case Success(_)  => ()
      case Failure(ex) => throw new InvalidRequestXMLException(ex)
    }
  }

  private def getExportServiceURL: String =
    ConfigurationUtil.getAppSettingValue("ChartExportServiceURL")

  private def getPivotExportServiceURL: String =
    ConfigurationUtil.getAppSettingValue("PivotExportServiceURL")

  private def buildExportServiceRequest[A](url: String)(implicit request: Request[MultipartFormData[A]]): WSRequestHolder = {
    val requestEntity = buildRequestEntity(request)
    val requestHeaders = buildRequestHeaders(requestEntity)
    val requestBody = buildRequestBody(requestEntity)
    WS.url(url)
      .withHeaders(requestHeaders: _*)
      .withBody(requestBody)
      .withMethod("POST")
  }

  private def buildRequestEntity[A](request: Request[MultipartFormData[A]]): HttpEntity = {
    val entityBuilder = MultipartEntityBuilder.create()
    for ((name, values) <- request.body.dataParts) {
      entityBuilder.addTextBody(name, values.head, ContentType.DEFAULT_TEXT)
    }
    entityBuilder.build
  }

  private def buildRequestHeaders(entity: HttpEntity): Seq[(String, String)] =
    Seq(
      (CONTENT_TYPE, entity.getContentType.getValue),
      (CONTENT_LENGTH, entity.getContentLength.toString)
    )

  private def buildRequestBody(entity: HttpEntity): Array[Byte] = {
    val outputStream = new ByteArrayOutputStream
    entity.writeTo(outputStream)
    outputStream.toByteArray
  }

  private def validateResponse[A](wsResponse: WSResponse)(implicit request: Request[MultipartFormData[A]]): Unit = {
    val responseType = wsResponse header CONTENT_TYPE getOrElse ""
    val expectedResponseType = getRequestDataPart("type")
    validateResponseType(responseType, expectedResponseType)
  }

  private def validateResponseType(responseType: String, expectedResponseType: String): Unit = {
    if (!responseType.contains(expectedResponseType)) {
      throw new UnexpectedResponseContentTypeException(expectedResponseType, responseType)
    }
  }

  private def buildResult(wsResponse: WSResponse): Result = {
    val headerNames = Seq(CONTENT_TYPE, CONTENT_DISPOSITION)
    val responseHeaders = getResponseHeaders(wsResponse, headerNames)
    val responseBody = wsResponse.underlying[Response].getResponseBodyAsBytes
    Ok(responseBody).withHeaders(responseHeaders: _*)
  }

  private def getResponseHeaders(wsResponse: WSResponse, headerNames: Seq[String]): Seq[(String, String)] = {
    val headerValues = headerNames map { wsResponse header _ getOrElse "" }
    headerNames zip headerValues
  }
}

object ExportService extends ExportService with PlayLoggerComponent

class InvalidRequestXMLException(cause: Throwable) extends InvalidInputException {
  override val logLevel = LogLevel.WARN
  override def getCause = cause
  val resultMessage = ApplicationMessages.InvalidRequestXML
  val logMessage = s"Invalid XML in request: ${cause.getMessage}"
}

class InvalidRequestedContentTypeException(contentType: String) extends InvalidInputException {
  override val logLevel = LogLevel.WARN
  override val errorCode = Some(ServiceErrorCode.INVALID_REQUESTED_CONTENT_TYPE)
  val resultMessage = ApplicationMessages.InvalidRequestedContentType(contentType)
  val logMessage = s"Invalid content type requested: $contentType"
}

class UnexpectedResponseContentTypeException(expectedType: String, actualType: String) extends ExternalServiceError(
  logMessage = s"Unexpected external response type; expected: $expectedType, actual: $actualType",
  cause      = None
)
