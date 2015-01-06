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

        public static List<SystemModule> CreateSystemModules(XmlNode mdRoot)
        {
            var modules = mdRoot.SelectNodes("module").Cast<XmlNode>()
                .Select(node => CreateModule(node))
                .ToList();

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

        public ModuleMenu(string id, string name, string controller, string method)
        {
            this.Menus = new List<ModuleMenu>();
            this.Id = id;
            this.Name = name;
            this.Controller = controller;
            this.Method = method;
        }

        private static ModuleMenu CreateMenu(XmlNode node)
        {
            var menu= new ModuleMenu(node.Attributes["id"].Value, node.Attributes["name"].Value,
                node.Attributes["controller"].Value, node.Attributes["method"].Value);
            
            if (node.HasChildNodes) {
                menu.Menus = CreateModuleMenus(node);
            }

            return menu;
        }

        public static List<ModuleMenu> CreateModuleMenus(XmlNode mdRoot)
        {
            
            var menues = mdRoot["menus"].SelectNodes("menu").Cast<XmlNode>()
                .Select(node => CreateMenu(node))
                .ToList();

            return menues;
        }

        public List<ModuleMenu> GetMenus(string moduleId) {
             return new XmlManager("SystemModules.xml").LoadMenus(moduleId);            
        }
    }
}