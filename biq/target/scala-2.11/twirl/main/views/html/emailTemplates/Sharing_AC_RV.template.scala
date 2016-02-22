
package views.html.emailTemplates

import play.twirl.api._
import play.twirl.api.TemplateMagic._

import play.api.templates.PlayMagic._
import models._
import controllers._
import play.api.i18n._
import play.api.mvc._
import play.api.data._
import views.html._

/**/
object Sharing_AC_RV extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template8[String,String,String,String,String,String,String,String,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(sharedObject: String, senderFirstName: String, sender: String, receiver: String, reportName: String, repositoryName: String, messageBody: String, applicationUrl: String):play.twirl.api.HtmlFormat.Appendable = {
      _display_ {
def /*3.2*/objectTitle/*3.13*/ = {{
    if(sharedObject == "report") {
        "Report Title"
    } else {
        "Booklet Title"
    }
}};
Seq[Any](format.raw/*1.172*/("""

"""),format.raw/*9.2*/("""

"""),format.raw/*11.1*/("""<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        """),_display_(/*13.10*/views/*13.15*/.html.emails.EmailStyle()),format.raw/*13.40*/("""
        """),_display_(/*14.10*/views/*14.15*/.html.emailTemplates.BIQEmailStyle()),format.raw/*14.51*/("""
    """),format.raw/*15.5*/("""</head>
    <body>
        """),_display_(/*17.10*/views/*17.15*/.html.emails.MailHeader()),format.raw/*17.40*/("""
    """),format.raw/*18.5*/("""<div class="body-container">
        <p>Hi """),_display_(/*19.16*/receiver),format.raw/*19.24*/(""",</p>
        <p>"""),_display_(/*20.13*/sender),format.raw/*20.19*/(""" """),format.raw/*20.20*/("""has revoked the following BIQ """),_display_(/*20.51*/sharedObject),format.raw/*20.63*/(""" """),format.raw/*20.64*/("""from you:</p>
        <table>
            <tr>
                <td> <span class="title"> """),_display_(/*23.44*/objectTitle),format.raw/*23.55*/(""" """),format.raw/*23.56*/("""</span></td>
                <td>:</td>
                <td><span> """),_display_(/*25.29*/reportName),format.raw/*25.39*/(""" """),format.raw/*25.40*/("""</span></td>
            </tr>
            <tr>
                <td><span class="title"> Repository</span></td>
                <td>:</td>
                <td><span>"""),_display_(/*30.28*/repositoryName),format.raw/*30.42*/("""</span></td>
            </tr>
        </table>

        <p>This """),_display_(/*34.18*/sharedObject),format.raw/*34.30*/(""" """),format.raw/*34.31*/("""will no longer appear in your Saved Reports and Booklets page.
           Please reach out to """),_display_(/*35.33*/senderFirstName),format.raw/*35.48*/(""" """),format.raw/*35.49*/("""if you would like to access the """),_display_(/*35.82*/sharedObject),format.raw/*35.94*/(""" """),format.raw/*35.95*/("""again.</p>

        <p>You can log into the system at: <span> """),_display_(/*37.52*/applicationUrl),format.raw/*37.66*/(""" """),format.raw/*37.67*/("""</span></p>

        """),_display_(/*39.10*/views/*39.15*/.html.emails.MailFooter()),format.raw/*39.40*/("""
    """),format.raw/*40.5*/("""</div>
    </body>
</html>"""))}
  }

  def render(sharedObject:String,senderFirstName:String,sender:String,receiver:String,reportName:String,repositoryName:String,messageBody:String,applicationUrl:String): play.twirl.api.HtmlFormat.Appendable = apply(sharedObject,senderFirstName,sender,receiver,reportName,repositoryName,messageBody,applicationUrl)

  def f:((String,String,String,String,String,String,String,String) => play.twirl.api.HtmlFormat.Appendable) = (sharedObject,senderFirstName,sender,receiver,reportName,repositoryName,messageBody,applicationUrl) => apply(sharedObject,senderFirstName,sender,receiver,reportName,repositoryName,messageBody,applicationUrl)

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:39 BDT 2015
                  SOURCE: D:/git/biq/app/views/emailTemplates/Sharing_AC_RV.scala.html
                  HASH: d5654d91aaed6dd93d7b4d0ff68ca3edd3c20ac9
                  MATRIX: 577->1|818->176|837->187|982->171|1012->301|1043->305|1136->371|1150->376|1196->401|1234->412|1248->417|1305->453|1338->459|1395->489|1409->494|1455->519|1488->525|1560->570|1589->578|1635->597|1662->603|1691->604|1749->635|1782->647|1811->648|1931->741|1963->752|1992->753|2089->823|2120->833|2149->834|2347->1005|2382->1019|2479->1089|2512->1101|2541->1102|2664->1198|2700->1213|2729->1214|2789->1247|2822->1259|2851->1260|2943->1325|2978->1339|3007->1340|3058->1364|3072->1369|3118->1394|3151->1400
                  LINES: 19->1|21->3|21->3|28->1|30->9|32->11|34->13|34->13|34->13|35->14|35->14|35->14|36->15|38->17|38->17|38->17|39->18|40->19|40->19|41->20|41->20|41->20|41->20|41->20|41->20|44->23|44->23|44->23|46->25|46->25|46->25|51->30|51->30|55->34|55->34|55->34|56->35|56->35|56->35|56->35|56->35|56->35|58->37|58->37|58->37|60->39|60->39|60->39|61->40
                  -- GENERATED --
              */
          