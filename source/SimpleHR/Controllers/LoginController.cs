using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication1.Controllers
{
    public class LoginController : Controller
    {
       public ActionResult Index()
        {
            return View();
        }

       [HttpPost]
       public ActionResult LogOn()
       {
           if (ModelState.IsValid)
           {
               return RedirectToAction("Index", "Home");               
           }

           // If we got this far, something failed, redisplay form
           return View();
       }

    }
}
