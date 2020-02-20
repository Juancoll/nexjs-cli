using Newtonsoft.Json;

namespace nex.engineio
{
    //  - messages [type][data]
    //       · type is: 
    //              open = 0,
    //              close = 1,
    //              ping = 2,
    //              pong = 3,
    //              message = 4,
    //              upgrade = 5,
    //              noop = 6
    //        · data is any string with diferent format depending on type 
    //  
    //  - open  
    //       · Receive: after engineio is opened:    '0'                 type: 0, data: Session json 
    //
    //  - ping 
    //       . Send:    '2' or '2anytext'
    //  - pong 
    //       · Receive: '3'
    //  - message (transport socketio protocol)
    //       · Send:    '4[socketIO package]'  
    //                  sample: 
    //                      '40/my-namespace'                           message connect to namespace
    //                      '42["my-event", { ... }]'                   message event   
    //                      '42/my-namespace,["my-event", { ... }]'     message event   to namespace
    //
    //       · Receive: '4[socketIO package]'
    //                  sample:
    //                      '40'                                        message connect
    //                      '40/my-namespace,'                          message connected to namespace
    //                      '42["my-event", { ... }]'                   message receive event 
    //                      '42/my-namespace,["my-event", { ... }]'     message receive event from namespace
    //         

    public class EngineIOPacket
    {
        EngineIOPacketType _type;
        string _data;

        public EngineIOPacketType Type { get { return _type; }  }
        public string Data { get { return _data; } }
        
        public EngineIOPacket(string input)
        {
            _type = (EngineIOPacketType)int.Parse(new string(input[0], 1));
            _data = input.Substring(1);
        }
        public EngineIOPacket(EngineIOPacketType type, string data)
        {
            _type = type;
            _data = data;
        }
        public string Serialize()
        {
            return ((int)Type).ToString() + Data;
        }
    }
    public static class EngineIOPacketEx
    {
        public static EngineIOSession GetSession(this EngineIOPacket packet)
        {
            if (packet.Type != EngineIOPacketType.open)
            {
                throw new System.Exception("session only exists in 'open' message type");
            }
            return JsonConvert.DeserializeObject<EngineIOSession>(packet.Data);
        }
    }
}
