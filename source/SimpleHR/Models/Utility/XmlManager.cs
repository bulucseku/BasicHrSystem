using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Xml;


namespace MvcApplication1.Models.Utility
{
    public class XmlManager
    {
        public FileInfo xmlFile{ get; set; }

        public XmlManager(string fileName)
        {
            var path = Path.Combine(HttpContext.Current.Server.MapPath("/Resources"), fileName);
            this.xmlFile = new FileInfo(path);
            
        }

        private XmlNode OpenDefinition()
        {
            var doc = new XmlDocument();
            using (var fileStream = this.xmlFile.OpenRead())
            {
                doc.Load(fileStream);
            }
            return doc["systemModule"];
        }

        public List<SystemModule> LoadModules()
        {
            var root = OpenDefinition();

            var modulesNode = root["modules"];
            var modules = SystemModule.CreateSystemModules(modulesNode);

            return modules;
        }

        public List<ModuleMenu> LoadMenus(string moduleId)
        {
            var root = OpenDefinition();
            var moduleNode = root.SelectSingleNode("modules").Cast<XmlNode>()
                .Where(node => node.Attributes["id"].Value == moduleId).FirstOrDefault();
            
            return ModuleMenu.CreateModuleMenus(moduleNode);

        }
    }
}