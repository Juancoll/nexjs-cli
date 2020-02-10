using System;

namespace template.api.wsclient {
    public class Model{
        public string _type { get; set; }
        public string _id { get; set; }
        public bool enabled { get; set; }
        public uint createdAt { get; set; }
        public uint updatedAt { get; set; }
        public ModelComponent[] components { get; set; }
    }
}