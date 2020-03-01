using System.Windows.Controls;

namespace demo.wsclient
{
    /// <summary>
    /// Interaction logic for RestControl.xaml
    /// </summary>
    public partial class RestControl : UserControl
    {
        public RestDescriptor Rest { get; set; }
        public RestControl(RestDescriptor rest)
        {
            InitializeComponent();
            Rest = rest;
            _uiName.Content = rest.Name;
            _uiTextBoxCredentials.Text = rest.Credentials;
            _uiTextBoxData.Text = rest.Data;
        }
    }
}
