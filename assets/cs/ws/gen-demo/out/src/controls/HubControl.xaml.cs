using System.Windows.Controls;

namespace demo.wsclient
{
    /// <summary>
    /// Interaction logic for HubControl.xaml
    /// </summary>
    public partial class HubControl : UserControl
    {
        public HubDescriptor Hub { get; set; }
        public HubControl(HubDescriptor hub)
        {
            InitializeComponent();

            Hub = hub;
            _uiName.Content = hub.Name;
        }
    }
}
