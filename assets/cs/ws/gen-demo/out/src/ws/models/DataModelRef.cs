using System;
using System.Collections.Generic;
using Newtonsoft;
using Newtonsoft.Json.Linq;

namespace template.api.wsclient 
{
    public class DataModelRef<TData> 
    {
        public string modelId { get; set; }
        public string info { get; set; }
        public TData data { get; set; }
    }
}