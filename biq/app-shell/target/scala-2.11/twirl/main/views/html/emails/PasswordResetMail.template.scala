
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
object PasswordResetMail extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template4[String,String,String,Int,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(firstName: String, link: String, securityCode: String, timeout: Int):play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*1.71*/("""

"""),format.raw/*3.1*/("""<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    """),_display_(/*5.6*/views/*5.11*/.html.emails.EmailStyle()),format.raw/*5.36*/("""
"""),format.raw/*6.1*/("""</head>
<body>
"""),_display_(/*8.2*/views/*8.7*/.html.emails.MailHeader()),format.raw/*8.32*/("""
"""),format.raw/*9.1*/("""<div class="body-container">
    <p>Hi """),_display_(/*10.12*/firstName),format.raw/*10.21*/(""",</p>
    <p class="less-width">This email confirms that you requested to reset your password. Please click on the following link to create a new password:</p>
    <div class="page-link">"""),_display_(/*12.29*/link),format.raw/*12.33*/("""</div>
    <div><b>Security Code: </b>"""),_display_(/*13.33*/securityCode),format.raw/*13.45*/("""</div>
    <p class="less-width">This password link will expire in """),_display_(/*14.62*/timeout),format.raw/*14.69*/(""" """),format.raw/*14.70*/("""hours. If you have any questions, please contact your administrator.
    </p>
    """),_display_(/*16.6*/views/*16.11*/.html.emails.MailFooter()),format.raw/*16.36*/("""
"""),format.raw/*17.1*/("""</div>
</body>
</html>
"""))}
  }

  def render(firstName:String,link:String,securityCode:String,timeout:Int): play.twirl.api.HtmlFormat.Appendable = apply(firstName,link,securityCode,timeout)

  def f:((String,String,String,Int) => play.twirl.api.HtmlFormat.Appendable) = (firstName,link,securityCode,timeout) => apply(firstName,link,securityCode,timeout)

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:00 BDT 2015
                  SOURCE: D:/git/biq/app-shell/app/views/emails/PasswordResetMail.scala.html
                  HASH: 473cad80b9a4401e1f842bfab8ba8ebf9d7afda4
                  MATRIX: 542->1|699->70|729->74|812->132|825->137|870->162|898->164|941->182|953->187|998->212|1026->214|1094->255|1124->264|1341->454|1366->458|1433->498|1466->510|1562->579|1590->586|1619->587|1730->672|1744->677|1790->702|1819->704
                  LINES: 19->1|22->1|24->3|26->5|26->5|26->5|27->6|29->8|29->8|29->8|30->9|31->10|31->10|33->12|33->12|34->13|34->13|35->14|35->14|35->14|37->16|37->16|37->16|38->17
                  -- GENERATED --
              */
          