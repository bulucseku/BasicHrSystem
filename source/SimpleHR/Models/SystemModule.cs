using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MvcApplication1.Models
{
    public class SystemModule
    {
        public string Id{get;set;}
        public string Name { get; set;}
        public List<ModuleMenu> Menus { get; set; }
        public List<SystemModule> GetModules() {
            var modules = new List<SystemModule>();

            var module= new SystemModule();
            module.Id = "organization";
            module.Name = "Organization";
            modules.Add(module);

            module = new SystemModule();
            module.Id = "hr";
            module.Name = "Human Resource";
            modules.Add(module);

            module = new SystemModule();
            module.Id = "pr";
            module.Name = "Payroll";
            modules.Add(module);

            module = new SystemModule();
            module.Id = "accounts";
            module.Name = "Accounts";
            modules.Add(module);

            return modules;
        }
    }

    public class ModuleMenu
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Controller { get; set; }
        public string Method { get; set; }
        public List<ModuleMenu> GetMenus(string moduleId) {
            var menus = new List<ModuleMenu>();
            switch (moduleId)
            {
                case "organization":
                    var menu = new ModuleMenu();
                    menu.Id = "system";
                    menu.Name = "System Settings";
                    menu.Controller = "ThisSystem";
                    menu.Method = "SystemSettings";
                    menus.Add(menu);

                    menu = new ModuleMenu();
                    menu.Id = "empType";
                    menu.Name = "Employee Type";
                    menu.Controller = "ThisSystem";
                    menu.Method = "EmployeeType";
                    menus.Add(menu);
                    break;
                default:
                    break;
            }

            return menus;
        }
    }
}