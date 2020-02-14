using System;

namespace template.api.wsclient {
    public class Model{
        public string _type { get; set; }
        public string _id { get; set; }
        public bool enabled { get; set; }
        public long createdAt { get; set; }
        public long updatedAt { get; set; }
        public ModelComponent[] components { get; set; }
    }
}