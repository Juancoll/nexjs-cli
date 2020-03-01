using Newtonsoft.Json;
using System;
using System.Windows.Controls;

namespace demo.wsclient
{
    /// <summary>
    /// Interaction logic for RestControl.xaml
    /// </summary>
    public partial class RestControl : UserControl
    {
        #region [ properties ]
        public RestDescriptor Rest { get; set; }
        #endregion

        #region [ constructor ]
        public RestControl(RestDescriptor rest)
        {
            InitializeComponent();
            Rest = rest;
            _uiName.Content = rest.Name;
            _uiTextBoxCredentials.Text = rest.Credentials;
            _uiTextBoxData.Text = rest.Data;
        }
        #endregion

        #region [ ui events ]
        private void Button_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui][rest] execute '{0}'", Rest.Name);
                var data = JsonConvert.DeserializeObject(_uiTextBoxData.Text);
                var credentials = JsonConvert.DeserializeObject(_uiTextBoxCredentials.Text);
                Context.Instance.wsapi.Rest.RequestAsync(new nex.ws.RestRequest { service = Rest.Service, method = Rest.Name, data = data, credentials = credentials });
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        #endregion
    }
}
