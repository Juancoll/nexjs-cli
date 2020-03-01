using Newtonsoft.Json;
using System;
using System.Windows.Controls;

namespace demo.wsclient
{
    public partial class HubControl : UserControl
    {
        #region[ properties ]
        public HubDescriptor Hub { get; set; }
        #endregion

        #region [ fields ]
        private bool isOn = false;
        #endregion

        #region [ constructor ]
        public HubControl(HubDescriptor hub)
        {
            InitializeComponent();

            Hub = hub;
            _uiName.Content = hub.Name;
            _uiCredentials.Text = hub.Credentials;
        }
        #endregion

        #region [ ui events ]
        private async void Hub_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            var name = (sender as Button).Name;
            try
            {
                Console.WriteLine("[ui] {0}", name);
                switch(name)
                {
                    case "Subscribe":
                        var credentials = JsonConvert.DeserializeObject(_uiCredentials.Text);
                        await Context.Instance.wsapi.Hub.Subscribe(Hub.Service, Hub.Name, credentials);
                        break;
                    case "Unsubscribe":
                        await Context.Instance.wsapi.Hub.Unsubscribe(Hub.Service, Hub.Name);
                        break;
                    case "On":
                        if (!isOn)
                        {
                            isOn = true;
                            Context.Instance.wsapi.Hub.EventReceive += Hub_EventReceive;
                        }
                        break;
                    case "Off":
                        if (isOn)
                        {
                            isOn = false;
                            Context.Instance.wsapi.Hub.EventReceive -= Hub_EventReceive;
                        }
                        break;

                }
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        #endregion

        #region [ handles ]
        private void Hub_EventReceive(object sender, nex.types.EventArgs<nex.ws.HubEventMessage> e)
        {
            Console.WriteLine("[ui] {0}.{1}.on ... ", Hub.Service, Hub.Name);
        }
        #endregion
    }
}
