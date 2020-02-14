namespace nex.socketio
{
    public enum SocketIOPacketType
    {
        connect = 0,         
        disconnect = 1,
        eventMessage = 2,
        ack = 3,
        error = 4,
        binary_event = 5,
        binary_ack = 6,
    }
}
