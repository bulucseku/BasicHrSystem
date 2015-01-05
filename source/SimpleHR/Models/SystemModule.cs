using MvcApplication1.Models.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml;

namespace MvcApplication1.Models
{
    public abstract class BaseViewModel{
        public List<SystemModule> modues { 
            set{}
            get {
               
                return new XmlManager("SystemModules.xml").LoadModules();
            }
        }        
    }

    public class ChildViewModel: BaseViewModel
    {
        public List<ModuleMenu> Menus { set; get; }
        public ChildViewModel(string moduleId)
        {
             this.Menus = new ModuleMenu().GetMenus(moduleId);
        }
    }

    public class SystemModule
    {
        public string Id{get;set;}
        public string Name { get; set;}
        public List<ModuleMenu> Menus { set; get; }
        public SystemModule()
        {
            this.Menus = new List<ModuleMenu>();
        }

        public SystemModule(string id, string name)
        {
            this.Menus = new List<ModuleMenu>();
            this.Id = id;
            this.Name = name;
        }

        private static SystemModule CreateModule(XmlNode node)
        {
            return new SystemModule(node.Attributes["id"].Value, node.Attributes["name"].Value);
        }

        public static List<SystemModule> CreateSystemModule(XmlNode mdRoot)
        {
            var modules = mdRoot.SelectNodes("module").Cast<XmlNode>()
                .Select(node => CreateModule(node))
                .ToList();


            //var facts = mdRoot["facts"].SelectNodes("fact").Cast<XmlNode>()
            //    .Select(node => CreateFact(node))
            //    .ToArray();

            //var metricsNode = mdRoot["metrics"];
            //var simpleMetrics = metricsNode["simpleMetrics"].SelectNodes("simpleMetric").Cast<XmlNode>()
            //    .Select(node => CreateSimpleMetric(node))
            //    .ToArray();

            //var compositeMetrics = metricsNode["compositeMetrics"] == null ? new Metric[0] : metricsNode["compositeMetrics"].ChildNodes.Cast<XmlNode>()
            //    .Select(node => CreateCompositeMetric(node))
            //    .ToArray();

            //var metricGroups = GetMetricGroups(mdRoot, simpleMetrics.Concat(compositeMetrics));

            return modules;
        }
    }

    public class ModuleMenu
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Controller { get; set; }
        public string Method { get; set; }
        public List<ModuleMenu> Menus { set; get; }

        public ModuleMenu() {
            this.Menus = new List<ModuleMenu>();
        }

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

                    var smenu = new ModuleMenu();
                    smenu.Id = "empSType";
                    smenu.Name = "Employee S Type";
                    smenu.Controller = "ThisSystem";
                    smenu.Method = "EmployeeSType";

                    var smenu1 = new ModuleMenu();
                    smenu1.Id = "empS1Type";
                    smenu1.Name = "Employee S1 Type";
                    smenu1.Controller = "ThisSystem";
                    smenu1.Method = "EmployeeS1Type";

                    smenu.Menus.Add(smenu1);

                    menu.Menus.Add(smenu);

                    menus.Add(menu);
                    break;

                case "hr":

                    menu = new ModuleMenu();
                    menu.Id = "Abc";
                    menu.Name = "Abc";
                    menu.Controller = "ThisSystem";
                    menu.Method = "EmployeeType";

                    smenu = new ModuleMenu();
                    smenu.Id = "Abcc";
                    smenu.Name = "Acc";
                    smenu.Controller = "ThisSystem";
                    smenu.Method = "EmployeeSType";

                    smenu1 = new ModuleMenu();
                    smenu1.Id = "BBC";
                    smenu1.Name = "BBC";
                    smenu1.Controller = "ThisSystem";
                    smenu1.Method = "EmployeeS1Type";

                    smenu.Menus.Add(smenu1);

                    menu.Menus.Add(smenu);

                    menus.Add(menu);

                    menu = new ModuleMenu();
                    menu.Id = "hr";
                    menu.Name = "Hr settings";
                    menu.Controller = "ThisSystem";
                    menu.Method = "SystemSettings";
                    menus.Add(menu);
                    
                    break;
                default:
                    break;
            }

            return menus;
        }
    }
}