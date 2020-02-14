using System;

namespace template.api.wsclient {
    public class Player: Model{
        public string serial { get; set; }
        public ModelRef owner { get; set; }
    }
}