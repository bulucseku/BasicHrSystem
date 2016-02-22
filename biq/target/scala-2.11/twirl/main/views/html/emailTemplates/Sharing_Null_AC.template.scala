
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
object Sharing_Null_AC extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template8[String,String,String,String,String,String,String,String,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(sharedObject: String, senderFirstName: String, sender: String, receiver: String, reportName: String, repositoryName: String, messageBody: String, applicationUrl: String):play.twirl.api.HtmlFormat.Appendable = {
      _display_ {
def /*3.2*/objectTitle/*3.13*/ = {{
    if(sharedObject == "report") {
        "Report Title"
    } else {
        "Booklet Title"
    }
}};def /*11.2*/sharedObjectPlural/*11.20*/ = {{sharedObject + "s"}};
Seq[Any](format.raw/*1.172*/("""

"""),format.raw/*9.2*/("""

"""),format.raw/*11.42*/("""

"""),format.raw/*13.1*/("""<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        """),_display_(/*15.10*/views/*15.15*/.html.emails.EmailStyle()),format.raw/*15.40*/("""
        """),_display_(/*16.10*/views/*16.15*/.html.emailTemplates.BIQEmailStyle()),format.raw/*16.51*/("""
    """),format.raw/*17.5*/("""</head>
    <body>
        """),_display_(/*19.10*/views/*19.15*/.html.emails.MailHeader()),format.raw/*19.40*/("""
        """),format.raw/*20.9*/("""<div class="body-container">
            <p>Hi """),_display_(/*21.20*/receiver),format.raw/*21.28*/(""",</p>
            <p>"""),_display_(/*22.17*/sender),format.raw/*22.23*/(""" """),format.raw/*22.24*/("""has shared the following BIQ """),_display_(/*22.54*/sharedObject),format.raw/*22.66*/(""" """),format.raw/*22.67*/("""with you:</p>
            <table>
                <tr>
                    <td> <span class="title"> """),_display_(/*25.48*/objectTitle),format.raw/*25.59*/(""" """),format.raw/*25.60*/("""</span></td>
                    <td>:</td>
                    <td><span> """),_display_(/*27.33*/reportName),format.raw/*27.43*/(""" """),format.raw/*27.44*/("""</span></td>
                </tr>
                <tr>
                    <td><span class="title"> Repository</span></td>
                    <td>:</td>
                    <td><span>"""),_display_(/*32.32*/repositoryName),format.raw/*32.46*/("""</span></td>
                </tr>
                <tr>
                    <td><span class="title"> Notes</span></td>
                    <td>:</td>
                    <td><span><p class="message">"""),_display_(/*37.51*/messageBody),format.raw/*37.62*/("""</p></span></td>
                </tr>
            </table>

            <p>
            This """),_display_(/*42.19*/sharedObject),format.raw/*42.31*/(""" """),format.raw/*42.32*/("""will appear in your Saved Reports and Booklets page when you login next.
            It will be listed alongside other """),_display_(/*43.48*/sharedObjectPlural),format.raw/*43.66*/(""" """),format.raw/*43.67*/("""you've created.
            """),_display_(/*44.14*/if(sharedObject == "report")/*44.42*/ {_display_(Seq[Any](format.raw/*44.44*/(""" """),format.raw/*44.45*/("""Comments you make on this """),_display_(/*44.72*/sharedObject),format.raw/*44.84*/(""" """),format.raw/*44.85*/("""are visible to """),_display_(/*44.101*/senderFirstName),format.raw/*44.116*/(""" """),format.raw/*44.117*/("""and all other """),_display_(/*44.132*/sharedObject),format.raw/*44.144*/(""" """),format.raw/*44.145*/("""recipients.""")))}),format.raw/*44.157*/("""
            """),format.raw/*45.13*/("""If """),_display_(/*45.17*/senderFirstName),format.raw/*45.32*/(""" """),format.raw/*45.33*/("""makes any changes to the """),_display_(/*45.59*/sharedObject),format.raw/*45.71*/(""", you will see them instantly. If you are no longer interested in viewing this report, you may delete it. This action does not remove the original version that """),_display_(/*45.232*/senderFirstName),format.raw/*45.247*/(""" """),format.raw/*45.248*/("""created—it merely removes your access to it.
            </p>

            <p>To view the """),_display_(/*48.29*/sharedObject),format.raw/*48.41*/(""" """),format.raw/*48.42*/("""please click: <span> <a href=""""),_display_(/*48.73*/applicationUrl),format.raw/*48.87*/("""">here</a> </span></p>

            """),_display_(/*50.14*/views/*50.19*/.html.emails.MailFooter()),format.raw/*50.44*/("""
        """),format.raw/*51.9*/("""</div>
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
                  SOURCE: D:/git/biq/app/views/emailTemplates/Sharing_Null_AC.scala.html
                  HASH: 643d70ed27e250d75a71c91785f7079bbe75f22e
                  MATRIX: 579->1|820->176|839->187|967->306|994->324|1049->171|1079->301|1111->346|1142->350|1235->416|1249->421|1295->446|1333->457|1347->462|1404->498|1437->504|1494->534|1508->539|1554->564|1591->574|1667->623|1696->631|1746->654|1773->660|1802->661|1859->691|1892->703|1921->704|2053->809|2085->820|2114->821|2219->899|2250->909|2279->910|2497->1101|2532->1115|2764->1320|2796->1331|2923->1431|2956->1443|2985->1444|3133->1565|3172->1583|3201->1584|3258->1614|3295->1642|3335->1644|3364->1645|3418->1672|3451->1684|3480->1685|3524->1701|3561->1716|3591->1717|3634->1732|3668->1744|3698->1745|3742->1757|3784->1771|3815->1775|3851->1790|3880->1791|3933->1817|3966->1829|4155->1990|4192->2005|4222->2006|4343->2100|4376->2112|4405->2113|4463->2144|4498->2158|4564->2197|4578->2202|4624->2227|4661->2237
                  LINES: 19->1|21->3|21->3|27->11|27->11|28->1|30->9|32->11|34->13|36->15|36->15|36->15|37->16|37->16|37->16|38->17|40->19|40->19|40->19|41->20|42->21|42->21|43->22|43->22|43->22|43->22|43->22|43->22|46->25|46->25|46->25|48->27|48->27|48->27|53->32|53->32|58->37|58->37|63->42|63->42|63->42|64->43|64->43|64->43|65->44|65->44|65->44|65->44|65->44|65->44|65->44|65->44|65->44|65->44|65->44|65->44|65->44|65->44|66->45|66->45|66->45|66->45|66->45|66->45|66->45|66->45|66->45|69->48|69->48|69->48|69->48|69->48|71->50|71->50|71->50|72->51
                  -- GENERATED --
              */
          