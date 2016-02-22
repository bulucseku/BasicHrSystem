
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
object Sharing_RV_AC extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template8[String,String,String,String,String,String,String,String,play.twirl.api.HtmlFormat.Appendable] {

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
        <p>"""),_display_(/*20.13*/sender),format.raw/*20.19*/(""" """),format.raw/*20.20*/("""has re-granted access the following BIQ """),_display_(/*20.61*/sharedObject),format.raw/*20.73*/(""" """),format.raw/*20.74*/("""with you:</p>
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

        <p>
            This """),_display_(/*35.19*/sharedObject),format.raw/*35.31*/(""" """),format.raw/*35.32*/("""will appear in your Saved Reports and Booklets page when you login next.
            As before, you can view this """),_display_(/*36.43*/sharedObject),format.raw/*36.55*/(""" """),format.raw/*36.56*/("""directly in the Saved Reports and Booklets page
            """),_display_(/*37.14*/if(sharedObject == "report")/*37.42*/ {_display_(Seq[Any](format.raw/*37.44*/(""" """),format.raw/*37.45*/(""", leave comments """)))}),format.raw/*37.63*/("""
            """),format.raw/*38.13*/("""or delete it.
        </p>

        <p>To view the """),_display_(/*41.25*/sharedObject),format.raw/*41.37*/(""" """),format.raw/*41.38*/("""please click: <span> <a href=""""),_display_(/*41.69*/applicationUrl),format.raw/*41.83*/("""">here</a> </span></p>

        """),_display_(/*43.10*/views/*43.15*/.html.emails.MailFooter()),format.raw/*43.40*/("""
    """),format.raw/*44.5*/("""</div>
    </body>
</html>

"""))}
  }

  def render(sharedObject:String,senderFirstName:String,sender:String,receiver:String,reportName:String,repositoryName:String,messageBody:String,applicationUrl:String): play.twirl.api.HtmlFormat.Appendable = apply(sharedObject,senderFirstName,sender,receiver,reportName,repositoryName,messageBody,applicationUrl)

  def f:((String,String,String,String,String,String,String,String) => play.twirl.api.HtmlFormat.Appendable) = (sharedObject,senderFirstName,sender,receiver,reportName,repositoryName,messageBody,applicationUrl) => apply(sharedObject,senderFirstName,sender,receiver,reportName,repositoryName,messageBody,applicationUrl)

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:39 BDT 2015
                  SOURCE: D:/git/biq/app/views/emailTemplates/Sharing_RV_AC.scala.html
                  HASH: 88e3813c545157c80cc5edf5ccf8daa0f16f7346
                  MATRIX: 577->1|818->176|837->187|982->171|1012->301|1043->305|1136->371|1150->376|1196->401|1234->412|1248->417|1305->453|1338->459|1395->489|1409->494|1455->519|1488->525|1560->570|1589->578|1635->597|1662->603|1691->604|1759->645|1792->657|1821->658|1941->751|1973->762|2002->763|2099->833|2130->843|2159->844|2357->1015|2392->1029|2503->1113|2536->1125|2565->1126|2708->1242|2741->1254|2770->1255|2859->1317|2896->1345|2936->1347|2965->1348|3014->1366|3056->1380|3138->1435|3171->1447|3200->1448|3258->1479|3293->1493|3355->1528|3369->1533|3415->1558|3448->1564
                  LINES: 19->1|21->3|21->3|28->1|30->9|32->11|34->13|34->13|34->13|35->14|35->14|35->14|36->15|38->17|38->17|38->17|39->18|40->19|40->19|41->20|41->20|41->20|41->20|41->20|41->20|44->23|44->23|44->23|46->25|46->25|46->25|51->30|51->30|56->35|56->35|56->35|57->36|57->36|57->36|58->37|58->37|58->37|58->37|58->37|59->38|62->41|62->41|62->41|62->41|62->41|64->43|64->43|64->43|65->44
                  -- GENERATED --
              */
          