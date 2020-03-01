using System;
using System.Collections.Generic;
using Newtonsoft;
using Newtonsoft.Json.Linq;

namespace template.api.wsclient 
{
    public class User: Model 
    {
        public string email { get; set; }
        public string password { get; set; }
        public List<string> roles { get; set; }
        public string name { get; set; }
        public string surname { get; set; }
    }
}