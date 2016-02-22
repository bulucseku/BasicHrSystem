
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
object BIQEmailStyle extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template0[play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply():play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*1.1*/("""<style>
.title"""),format.raw/*2.7*/("""{"""),format.raw/*2.8*/("""
    """),format.raw/*3.5*/("""text-transform: capitalize;
    font-weight: bold;
"""),format.raw/*5.1*/("""}"""),format.raw/*5.2*/("""
"""),format.raw/*6.1*/("""</style>"""))}
  }

  def render(): play.twirl.api.HtmlFormat.Appendable = apply()

  def f:(() => play.twirl.api.HtmlFormat.Appendable) = () => apply()

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:38 BDT 2015
                  SOURCE: D:/git/biq/app/views/emailTemplates/BIQEmailStyle.scala.html
                  HASH: fd2434d815f5fef2b0b55ec45a63e86fe3d3ae6b
                  MATRIX: 603->0|644->15|671->16|703->22|782->75|809->76|837->78
                  LINES: 22->1|23->2|23->2|24->3|26->5|26->5|27->6
                  -- GENERATED --
              */
          