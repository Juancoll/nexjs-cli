using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using nex.types;
using System;

namespace nex.socketio
{
    //  - messages [type][data]
    //       · type is: 
    //               '0' connect
    //               '1' disconnect
    //               '2' event
    //               '3' ack
    //               '4' error
    //               '5' binary_event
    //               '6' binary_ack
    //        · data is any string with diferent format depending on type 
    //  
    //  - connect  
    //       · Receive after engineio is opened:    '0'                 type: 0, data: null
    //       . Send to connect to a namespace:      '0/my-namespace'    type: 0, data: '/my-namespace'
    //       . Receive after namespace connection:  '0/my-namespace,'   type: 0, data: '/my-namespace,'
    //
    //  - event 
    //       . Send/Receive from server default namepsace "/":      
    //             · without data     '2["event-name"]'  
    //             · with data        '2["event-name", data]' where data is any json
    //       . Send/Receive from server namepsace "/my-namespace":  
    //             · without data     '2/my-namespace,["event-name"]'  
    //             · with data        '2/my-namespace,["event-name", data]' where data is any json
    //                         

    public class SocketIOPacket
    {
        SocketIOPacketType _type;
        string _nsp = "/";
        string _data;
        int _id;

        public SocketIOPacketType Type { get { return _type; } }
        public string Data { get { return _data; } }
        public string nsp { get { return _nsp; } }
        public int id { get { return _id; } }

        public SocketIOPacket(string input)
        {
            _type = (SocketIOPacketType)int.Parse(new string(input[0], 1));
            var str = input.Substring(1);
            
            if (str.StartsWith("/"))
            {
                // is NameSapce
                _nsp = str.Split(',')[0];
                str = str.Split(',')[1];
            }
            if (str[0] != '[' && str[0] != '{')
            {
                var strId = "";
                for(var i = 0; i < str.Length; i++)
                {
                    if (char.IsNumber(str[i]))
                    {
                        strId += str[i];
                    }
                    else
                    {
                        _id = int.Parse(strId);
                        str = str.Substring(i);
                        break;
                    }
                }                
            }
            _data = str;           
        }
        public SocketIOPacket(SocketIOPacketType type,  string data)
        {
            _type = type;
            _data = data;
        }
        public string Serialize()
        {
            return ((int)Type).ToString() + Data;
        }
    }
    public static class SocketIOPacketEx
    {
        public static SocketIOEvent ExtractEvent(this SocketIOPacket packet)
        {
            if (packet.Type != SocketIOPacketType.eventMessage)
                throw new Exception("invalid packet type");

            var idx = packet.Data.IndexOf("[");
            var strEvent = packet.Data.Substring(idx);
            var array = JArray.Parse(strEvent);

            return new SocketIOEvent(
                array[0].Value<string>(),
                array.Count > 1
                    ? array[1]
                    : null
            );
        }
        public static SocketIOPacket CreateEvent(this string nsp, string eventName, object data = null)
        {
            if (string.IsNullOrEmpty(nsp)) 
                throw new Exception("namespace can't be null or empty");
            if (string.IsNullOrEmpty(eventName))
                throw new Exception("eventName can't be null or empty");

            JArray array = data != null
                ? new JArray(eventName, JObject.FromObject(data))
                : new JArray(eventName);

            var strData = nsp == "/"
                ? array.ToString(Formatting.None)
                : string.Format("{0},{1}", nsp, array.ToString(Formatting.None));

            return new SocketIOPacket(SocketIOPacketType.eventMessage, strData);
        }
        public static SocketIOPacket CreateNspConnection(this string nsp)
        {
            if (string.IsNullOrEmpty(nsp))
                throw new Exception("namespace can't be null or empty");
            if (nsp == "/")
                throw new Exception("namespace is default");

            return new SocketIOPacket(SocketIOPacketType.connect, nsp);
        }

        public static string ExtractSid(this string str)
        {
            return JToken.Parse(str)["sid"].Value<string>();
        }
    }
}
