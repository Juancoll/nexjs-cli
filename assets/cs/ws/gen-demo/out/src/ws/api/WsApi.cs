using nex.ws;

namespace template.api.wsclient
{
    public class WSApi<TUser, TToken> : WSApiBase<TUser, TToken>
    {
        #region [ private ]
        private DemoWSService<TUser, TToken> _demo;
        private CustomWSService<TUser, TToken> _custom;
        private DbWSService<TUser, TToken> _db;
        private JobsWSService<TUser, TToken> _jobs;
        private OrgsWSService<TUser, TToken> _orgs;
        private UsersWSService<TUser, TToken> _users;
        #endregion

        #region [ services ]
        public DemoWSService<TUser, TToken> demo { get { return _demo; } }
        public CustomWSService<TUser, TToken> custom { get { return _custom; } }
        public DbWSService<TUser, TToken> db { get { return _db; } }
        public JobsWSService<TUser, TToken> jobs { get { return _jobs; } }
        public OrgsWSService<TUser, TToken> orgs { get { return _orgs; } }
        public UsersWSService<TUser, TToken> users { get { return _users; } }
        #endregion

        #region [ constructor ]
        public WSApi()
        {
            _demo = new DemoWSService<TUser, TToken>(Rest, Hub);
            _custom = new CustomWSService<TUser, TToken>(Rest, Hub);
            _db = new DbWSService<TUser, TToken>(Rest, Hub);
            _jobs = new JobsWSService<TUser, TToken>(Rest, Hub);
            _orgs = new OrgsWSService<TUser, TToken>(Rest, Hub);
            _users = new UsersWSService<TUser, TToken>(Rest, Hub);
        }
        #endregion
    }
}