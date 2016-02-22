
package views.html.emails

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
object ForgotUsernameMail extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template3[String,String,String,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(userName: String, firstName: String, link: String):play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*1.53*/("""

"""),format.raw/*3.1*/("""<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    """),_display_(/*5.6*/views/*5.11*/.html.emails.EmailStyle()),format.raw/*5.36*/("""
"""),format.raw/*6.1*/("""</head>
<body>
"""),_display_(/*8.2*/views/*8.7*/.html.emails.MailHeader()),format.raw/*8.32*/("""
"""),format.raw/*9.1*/("""<div class="body-container">
    <p>Hi """),_display_(/*10.12*/firstName),format.raw/*10.21*/(""",</p>
    <p class="less-width">This email confirms that you requested your username. Please use the username and link below to login:</p>
    <div><b>Username: </b>"""),_display_(/*12.28*/userName),format.raw/*12.36*/("""</div>
    <div class="page-link">"""),_display_(/*13.29*/link),format.raw/*13.33*/("""</div>
    <p class="less-width">If you have any questions, please contact your administrator.
    </p>
    """),_display_(/*16.6*/views/*16.11*/.html.emails.MailFooter()),format.raw/*16.36*/("""
"""),format.raw/*17.1*/("""</div>
</body>
</html>
"""))}
  }

  def render(userName:String,firstName:String,link:String): play.twirl.api.HtmlFormat.Appendable = apply(userName,firstName,link)

  def f:((String,String,String) => play.twirl.api.HtmlFormat.Appendable) = (userName,firstName,link) => apply(userName,firstName,link)

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:00 BDT 2015
                  SOURCE: D:/git/biq/app-shell/app/views/emails/ForgotUsernameMail.scala.html
                  HASH: 5ca981b9daee99ed902ded9f4ca08128624c81c2
                  MATRIX: 539->1|678->52|708->56|791->114|804->119|849->144|877->146|920->164|932->169|977->194|1005->196|1073->237|1103->246|1298->414|1327->422|1390->458|1415->462|1553->574|1567->579|1613->604|1642->606
                  LINES: 19->1|22->1|24->3|26->5|26->5|26->5|27->6|29->8|29->8|29->8|30->9|31->10|31->10|33->12|33->12|34->13|34->13|37->16|37->16|37->16|38->17
                  -- GENERATED --
              */
          