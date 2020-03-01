
using System.Collections.Generic;
using System.Linq;

namespace nex.types
{
    public static class QueryEx
    {
        public static string Serialise(this Dictionary<string,string> value)
        {
            if (value == null || value.Count == 0)
                return "";
            return value.Aggregate("", (str, item) => string.Format("{0}&{1}={2}", str, item.Key, item.Value));
        }
    }
}
