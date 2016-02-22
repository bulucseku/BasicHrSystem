
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
object MailFooter extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template0[play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply():play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*1.1*/("""<p>Thank you, <br>
    Sentrana Team </p>
<p class="footer-text">This email message is for the sole use of the intended recipient and may contain confidential and privileged information. Any unauthorized review, use disclosure or distribution is prohibited. If you are not the intended recipient, please contact Sentrana's System Administrator at sysadmin@sentrana.com and destroy all copies of the original message.</p>
"""))}
  }

  def render(): play.twirl.api.HtmlFormat.Appendable = apply()

  def f:(() => play.twirl.api.HtmlFormat.Appendable) = () => apply()

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:00 BDT 2015
                  SOURCE: D:/git/biq/app-shell/app/views/emails/MailFooter.scala.html
                  HASH: e2a923d2ae8781c9f17e2fa10efba2c53f6a4aae
                  MATRIX: 592->0
                  LINES: 22->1
                  -- GENERATED --
              */
          