using System;

namespace template.api.wsclient {
    public class Permissions{
        public string all { get; set; }
        public DataModelRef<string>[] players { get; set; }
    }
}