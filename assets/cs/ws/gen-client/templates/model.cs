using System;
using System.Collections.Generic;
using Newtonsoft;
using Newtonsoft.Json.Linq;

namespace {{&namespace}} 
{
    public class {{&declaration}} 
    {
        {{#properties}}
        public {{&type}} {{&name}} { get; set; }
        {{/properties}}
    }
}