using MvcApplication1.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication1.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Message = "Modify this template to jump-start your ASP.NET MVC application.";

            return View();
        }

        [ChildActionOnly]
        public ActionResult RenderModules()
        {
            return PartialView();
        }

        [ChildActionOnly]
        public ActionResult Modules()
        {

            var modules = new SystemModule().GetModules();
            return PartialView(modules);
        }
               
    }
}
