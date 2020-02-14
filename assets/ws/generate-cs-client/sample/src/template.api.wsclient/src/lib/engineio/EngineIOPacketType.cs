namespace nex.engineio
{
    public enum EngineIOPacketType
    {
        open = 0,
        close = 1,
        ping = 2,
        pong = 3,
        message = 4,
        upgrade = 5,
        noop = 6
    }
}
