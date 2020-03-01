using System;
using System.Collections.Generic;
using Newtonsoft;
using Newtonsoft.Json.Linq;

namespace template.api.wsclient 
{
    public class Player: Model 
    {
        public string serial { get; set; }
        public ModelRef owner { get; set; }
    }
}