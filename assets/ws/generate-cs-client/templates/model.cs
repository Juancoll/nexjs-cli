using Newtonsoft.Json.Linq;
using Newtonsoft;
using System;

namespace {{namespace}} 
{
    public class {{declaration}} 
    {
        {{#properties}}
        public {{type}} {{name}} { get; set; }
        {{/properties}}
    }
}