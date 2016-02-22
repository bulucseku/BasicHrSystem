
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
object MailHeader extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template0[play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply():play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*1.1*/("""<table class="header-container">
    <tr>
        <td><div class="header-text">This is an automated email, please don't reply.</div> </td>
        <td align="right"><img src="http://sentrana.com/sites/default/files/sentrana_logo.png"></td>
    </tr>
</table>
"""))}
  }

  def render(): play.twirl.api.HtmlFormat.Appendable = apply()

  def f:(() => play.twirl.api.HtmlFormat.Appendable) = () => apply()

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:00 BDT 2015
                  SOURCE: D:/git/biq/app-shell/app/views/emails/MailHeader.scala.html
                  HASH: d183765a8ecf16e5062d4834a9c735554279b248
                  MATRIX: 592->0
                  LINES: 22->1
                  -- GENERATED --
              */
          