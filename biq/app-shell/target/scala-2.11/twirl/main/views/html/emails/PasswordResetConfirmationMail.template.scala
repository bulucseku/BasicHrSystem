
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
object PasswordResetConfirmationMail extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template2[String,String,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(firstName: String, changedDateTime: String):play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*1.46*/("""

"""),format.raw/*3.1*/("""<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    """),_display_(/*5.6*/views/*5.11*/.html.emails.EmailStyle()),format.raw/*5.36*/("""
"""),format.raw/*6.1*/("""</head>
<body>
"""),_display_(/*8.2*/views/*8.7*/.html.emails.MailHeader()),format.raw/*8.32*/("""
"""),format.raw/*9.1*/("""<div class="body-container">
    <p>Hi """),_display_(/*10.12*/firstName),format.raw/*10.21*/(""",</p>
    <p class="less-width">This email confirms that your password was changed on """),_display_(/*11.82*/changedDateTime),format.raw/*11.97*/(""". If you did not change your password please contact your administrator immediately. </p>
    """),_display_(/*12.6*/views/*12.11*/.html.emails.MailFooter()),format.raw/*12.36*/("""
"""),format.raw/*13.1*/("""</div>
</body>
</html>
"""))}
  }

  def render(firstName:String,changedDateTime:String): play.twirl.api.HtmlFormat.Appendable = apply(firstName,changedDateTime)

  def f:((String,String) => play.twirl.api.HtmlFormat.Appendable) = (firstName,changedDateTime) => apply(firstName,changedDateTime)

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:00 BDT 2015
                  SOURCE: D:/git/biq/app-shell/app/views/emails/PasswordResetConfirmationMail.scala.html
                  HASH: ede8f63c8b52874167c8a668d813b72240ab30eb
                  MATRIX: 543->1|675->45|705->49|788->107|801->112|846->137|874->139|917->157|929->162|974->187|1002->189|1070->230|1100->239|1215->327|1251->342|1373->438|1387->443|1433->468|1462->470
                  LINES: 19->1|22->1|24->3|26->5|26->5|26->5|27->6|29->8|29->8|29->8|30->9|31->10|31->10|32->11|32->11|33->12|33->12|33->12|34->13
                  -- GENERATED --
              */
          