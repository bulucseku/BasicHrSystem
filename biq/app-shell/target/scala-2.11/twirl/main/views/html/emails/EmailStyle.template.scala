
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
object EmailStyle extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template0[play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply():play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*1.1*/("""<style>
body """),format.raw/*2.6*/("""{"""),format.raw/*2.7*/("""
"""),format.raw/*3.1*/("""font-family: "Tahoma", "Verdana", "Arial", sans-serif;
font-size: 0.9em;
padding:2px;
color: #666666;
"""),format.raw/*7.1*/("""}"""),format.raw/*7.2*/("""

"""),format.raw/*9.1*/("""p"""),format.raw/*9.2*/("""{"""),format.raw/*9.3*/("""
"""),format.raw/*10.1*/("""text-align:justify;
"""),format.raw/*11.1*/("""}"""),format.raw/*11.2*/("""

"""),format.raw/*13.1*/(""".less-width"""),format.raw/*13.12*/("""{"""),format.raw/*13.13*/("""
"""),format.raw/*14.1*/("""padding-right:50px;
"""),format.raw/*15.1*/("""}"""),format.raw/*15.2*/("""

"""),format.raw/*17.1*/(""".header-container"""),format.raw/*17.18*/("""{"""),format.raw/*17.19*/("""
"""),format.raw/*18.1*/("""width:100%;
border-spacing:0px;
"""),format.raw/*20.1*/("""}"""),format.raw/*20.2*/("""

"""),format.raw/*22.1*/(""".header-text """),format.raw/*22.14*/("""{"""),format.raw/*22.15*/("""
"""),format.raw/*23.1*/("""color: #999999;
font-style: italic;
text-align:left;
"""),format.raw/*26.1*/("""}"""),format.raw/*26.2*/("""

"""),format.raw/*28.1*/(""".header-logo"""),format.raw/*28.13*/("""{"""),format.raw/*28.14*/("""
"""),format.raw/*29.1*/("""float:right;
background-image:url(sentrana-logo.png);
background-repeat:no-repeat;
width:125px;
height:32px;
"""),format.raw/*34.1*/("""}"""),format.raw/*34.2*/("""

"""),format.raw/*36.1*/(""".body-container"""),format.raw/*36.16*/("""{"""),format.raw/*36.17*/("""
"""),format.raw/*37.1*/("""float:left;
"""),format.raw/*38.1*/("""}"""),format.raw/*38.2*/("""
"""),format.raw/*39.1*/(""".page-link"""),format.raw/*39.11*/("""{"""),format.raw/*39.12*/("""
"""),format.raw/*40.1*/("""font-size: 0.82em;
width:100%;
"""),format.raw/*42.1*/("""}"""),format.raw/*42.2*/("""

"""),format.raw/*44.1*/(""".footer-text """),format.raw/*44.14*/("""{"""),format.raw/*44.15*/("""
"""),format.raw/*45.1*/("""font-size: 0.79em;
color: #666666;
"""),format.raw/*47.1*/("""}"""),format.raw/*47.2*/("""

"""),format.raw/*49.1*/(""".footer """),format.raw/*49.9*/("""{"""),format.raw/*49.10*/("""
"""),format.raw/*50.1*/("""font-family: "Courier New";
font-size: 0.9em;
color: #006;
margin: 1em 0 0 0;
padding-top: 0.5em;
border-top: 1px dotted #006;
"""),format.raw/*56.1*/("""}"""),format.raw/*56.2*/("""
"""),format.raw/*57.1*/("""</style>
"""))}
  }

  def render(): play.twirl.api.HtmlFormat.Appendable = apply()

  def f:(() => play.twirl.api.HtmlFormat.Appendable) = () => apply()

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Tue Nov 24 18:02:00 BDT 2015
                  SOURCE: D:/git/biq/app-shell/app/views/emails/EmailStyle.scala.html
                  HASH: e0b8edc2e3e0b44bb8fb0966c8dc1eae5e3f7dc0
                  MATRIX: 592->0|632->14|659->15|687->17|819->123|846->124|876->128|903->129|930->130|959->132|1007->153|1035->154|1066->158|1105->169|1134->170|1163->172|1211->193|1239->194|1270->198|1315->215|1344->216|1373->218|1434->252|1462->253|1493->257|1534->270|1563->271|1592->273|1675->329|1703->330|1734->334|1774->346|1803->347|1832->349|1973->463|2001->464|2032->468|2075->483|2104->484|2133->486|2173->499|2201->500|2230->502|2268->512|2297->513|2326->515|2386->548|2414->549|2445->553|2486->566|2515->567|2544->569|2608->606|2636->607|2667->611|2702->619|2731->620|2760->622|2920->755|2948->756|2977->758
                  LINES: 22->1|23->2|23->2|24->3|28->7|28->7|30->9|30->9|30->9|31->10|32->11|32->11|34->13|34->13|34->13|35->14|36->15|36->15|38->17|38->17|38->17|39->18|41->20|41->20|43->22|43->22|43->22|44->23|47->26|47->26|49->28|49->28|49->28|50->29|55->34|55->34|57->36|57->36|57->36|58->37|59->38|59->38|60->39|60->39|60->39|61->40|63->42|63->42|65->44|65->44|65->44|66->45|68->47|68->47|70->49|70->49|70->49|71->50|77->56|77->56|78->57
                  -- GENERATED --
              */
          