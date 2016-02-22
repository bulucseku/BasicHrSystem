
package views.html

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
object BuildInfo extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template3[String,String,String,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(projectName: String, projectVersion: String, buildDate: String):play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*1.66*/("""

"""),format.raw/*3.1*/("""<html xmlns="http://www.w3.org/1999/xhtml">
<body>
<p>"""),_display_(/*5.5*/projectName),format.raw/*5.16*/(""" """),_display_(/*5.18*/projectVersion),format.raw/*5.32*/(""": """),_display_(/*5.35*/buildDate),format.raw/*5.44*/("""</p>
</body>
</html>
"""))}
  }

  def render(projectName:String,projectVersion:String,buildDate:String): play.twirl.api.HtmlFormat.Appendable = apply(projectName,projectVersion,buildDate)

  def f:((String,String,String) => play.twirl.api.HtmlFormat.Appendable) = (projectName,projectVersion,buildDate) => apply(projectName,projectVersion,buildDate)

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:00 BDT 2015
                  SOURCE: D:/git/biq/app-shell/app/views/BuildInfo.scala.html
                  HASH: d7b1717692b993b879bdebebd365854fae38edb6
                  MATRIX: 523->1|675->65|705->69|787->126|818->137|846->139|880->153|909->156|938->165
                  LINES: 19->1|22->1|24->3|26->5|26->5|26->5|26->5|26->5|26->5
                  -- GENERATED --
              */
          