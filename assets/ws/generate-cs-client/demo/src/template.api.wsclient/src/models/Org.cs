using System;

namespace template.api.wsclient {
    public class Org: Model{
        public string name { get; set; }
        public ModelRef owner { get; set; }
        public DataModelRef<Permissions> users { get; set; }
        public ModelRef players { get; set; }
    }
}