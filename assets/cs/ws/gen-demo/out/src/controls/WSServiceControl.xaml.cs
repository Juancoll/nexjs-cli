using System.Windows.Controls;

namespace demo.wsclient
{
    /// <summary>
    /// Interaction logic for WSServiceControl.xaml
    /// </summary>
    public partial class WSServiceControl : UserControl
    {
        WSServiceDescriptor Service { get; set; }
        public WSServiceControl(WSServiceDescriptor service)
        {
            InitializeComponent();
            Service = service;

            service.Hubs.ForEach(x => _uiWrapPanelHubs.Children.Add(new HubControl(x)));
            service.Rests.ForEach(x => _uiWrapPanelRests.Children.Add(new RestControl(x)));
        }
    }
}
