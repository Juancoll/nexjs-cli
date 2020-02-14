using System;

namespace template.api.wsclient {
    public class DataModelRef<TData>{
        public string info { get; set; }
        public string modelId { get; set; }
        public TData data { get; set; }
    }
}